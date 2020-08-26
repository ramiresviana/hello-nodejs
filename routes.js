const cookie = require('cookie')
const path = require('path')
const fs = require('fs')

const { loadPage, loadView, loadAsset, getArticles, addArticle, updateArticle, removeArticle, addImage, removeImage, loadImage, authenticate, isLogged } = require('./utils');

let articles = getArticles()
const listingLimit = 5;

function index(routeParts, form, request) {
    let articlesContent = ''

    const articlesList = Object.keys(articles);
    let showPagination = false;

    let counter = 0;
    // iterate on all articles
    articlesList.forEach((key) => {
        // stop add articles when arriving the limit
        if (counter >= listingLimit) {
            showPagination = true;
            return;
        }
        counter++;

        articlesContent += loadView('partials/article', articles[key]);
    })

    let pagination = '';

    // shows pagination when number of articles is more than the limit
    if (showPagination) {
        pagination += `<a href="/page/2" class="btn btn-primary mt-3">Next page</a>`;
    }

    let dropdown = '';

    // shows admin actions when logged
    if (isLogged(request)) {
        dropdown = loadView('partials/dropdown', { counter: articlesList.length });
    }

    const pageData = { title: 'Listing', listing: articlesContent, pagination, dropdown };
    const pageContent = loadPage('listing', pageData);

    return pageContent;
}

function page(routeParts) {
    if (routeParts[2] == undefined) {
        return 'not_found';
    }

    // the 3º route part is the page number
    const current = parseInt(routeParts[2]);
    // converts object into array of articles
    const articleList = Object.keys(articles);
    const pages = Math.ceil(articleList.length / listingLimit);

    if (!current || current < 1 || current > pages) {
        return 'not_found';
    }

    // index of starting articles to show
    const start = listingLimit * (current - 1);
    // index of ending articles to show
    const end = start + listingLimit;

    let articlesContent = '';
    let counter = 0;

    articleList.forEach((key) => {
        // shows only articles in the range
        if (counter >= start && counter < end) {
            articlesContent += loadView('partials/article', articles[key]);
        }
        counter++;
    })

    let pagination = '';

    // shows pagination before button
    if (current > 1) {
        pagination += `<a href="/page/${current-1}" class="btn btn-primary mt-3 mr-3">Previous page</a>`;
    }

    // shows pagination next button
    if (current < pages) {
        pagination += `<a href="/page/${current+1}" class="btn btn-primary mt-3">Next page</a>`;
    }

    const pageData = { title: 'Listing', listing: articlesContent, pagination };
    const pageContent = loadPage('listing', pageData);

    return pageContent;
}

function article(routeParts, form, request) {
    if (routeParts[2] == undefined) {
        return 'not_found';
    }

    // the 3º route part is id of the article
    let id = routeParts[2];

    if (articles[id] == undefined) {
        return 'not_found';
    }

    let { image, title, content } = articles[id];


    // shows article actions when logged
    let actions = '';

    if (isLogged(request)) {
        actions = loadView('partials/actions', { articleId: id });
    }

    const pageData = { title: 'Article', articleId: id, articleImage: image, articleTitle: title, articleContent: content, actions };
    const pageContent = loadPage('article', pageData);
    return pageContent;
}

function login(routeParts, form, request, response) {
    if (isLogged(request)) {
        return 'is_logged';
    }

    const pageData = { title: 'Login', result: '' };

    // form is submitted
    if (form) {
        const { user, pass } = form.fields;

        const validUser = user && user != '';
        const validPass = pass && pass != '';
        const validForm = validUser && validPass && authenticate(user, pass)

        // valid fields and crendetials
        if (validForm) {
            // string format user:pass
            const auth = `${user}:${pass}`;
            // transform string into base64
            const data = Buffer.from(auth).toString('base64');

            // set cookie on the browser
            response.setHeader('Set-Cookie', cookie.serialize('auth', data));

            pageData['result'] = '<div class="alert alert-success">Authenticated</div>';
        } else {
            pageData['result'] = '<div class="alert alert-danger">Invalid credentials</div>';
        }
    }

    const pageContent = loadPage('login', pageData);
    return pageContent;
}

function logout(routeParts, form, request, response) {
    // requires login
    if (!isLogged(request)) {
        return 'not_logged';
    }

    const pageData = { title: 'Logout', result: '' };

    // form is submitted
    if (form) {
        // set empty cookie on the browser
        response.setHeader('Set-Cookie', cookie.serialize('auth', ''));
        pageData['result'] = '<div class="alert alert-success">Logged out</div>';
    }

    const pageContent = loadPage('logout', pageData);
    return pageContent;
}

// allowed image types for article form
const imageTypes = ['image/jpeg', 'image/png']

function create(routeParts, form, request) {
    // requires login
    if (!isLogged(request)) {
        return 'not_logged';
    }

    const pageData = { title: 'New', result: '' };

    // form is submitted
    if (form) {
        const { fields, files } = form;
        const { title, content } = fields;
        const { image } = files;

        const validTitle = title && title != '';
        const validContent = content && content != '';
        // check file type
        const validImage = image && image.size > 0 && imageTypes.indexOf(image.type) != -1

        const validForm = validTitle && validContent && validImage

        // valid fields and files
        if (validForm) {
            const imageName = addImage(image);

            const article = { title, content, image: imageName }
            articles = addArticle(article);

            pageData['result'] = '<div class="alert alert-success">Article created</div>';
        } else {
            pageData['result'] = '<div class="alert alert-danger">An error ocurred</div>';
        }
    }

    const pageContent = loadPage('new', pageData);
    return pageContent;
}

function update(routeParts, form, request) {
    // requires login
    if (!isLogged(request)) {
        return 'not_logged';
    }

    // requires 3º route part
    if (routeParts[2] == undefined) {
        return 'not_found';
    }

    // the 3º route part is id of the article
    let id = routeParts[2];

    // requires existing article id
    if (articles[id] == undefined) {
        return 'not_found';
    }

    const article = articles[id];

    const pageData = { title: 'Article', result: '', articleImage: article.image, articleTitle: article.title, articleContent: article.content };

    // form is submitted
    if (form) {
        const { fields, files } = form;
        const { title, content } = fields;
        const { image } = files;

        const validTitle = title && title != '';
        const validContent = content && content != '';
        // check file type
        const validImage = image && image.size > 0 && imageTypes.indexOf(image.type) != -1

        const validForm = validTitle && validContent

        // valid fields and files
        if (validForm) {
            const newData = { title, content, image: article.image }

            if (validImage) {
                removeImage(article.image);
                const imageName = addImage(image);

                newData.image = imageName;
            }

            articles = updateArticle(id, newData);

            pageData['articleImage'] = newData.image;
            pageData['articleTitle'] = newData.title;
            pageData['articleContent'] = newData.content;
            pageData['result'] = '<div class="alert alert-success">Article updated</div>';
        } else {
            pageData['result'] = '<div class="alert alert-danger">An error ocurred</div>';
        }
    }

    const pageContent = loadPage('edit', pageData);
    return pageContent;
}

function destroy(routeParts, form, request) {
    // requires login
    if (!isLogged(request)) {
        return 'not_logged';
    }

    // requires 3º route part
    if (routeParts[2] == undefined) {
        return 'not_found';
    }

    // the 3º route part is id of the article
    let id = routeParts[2];

    // requires existing article id
    if (articles[id] == undefined) {
        return 'not_found';
    }

    const article = articles[id];

    const pageData = { title: 'Remove', result: '' };

    // form is submitted
    if (form) {
        removeImage(article.image);
        articles = removeArticle(id);
        pageData['result'] = '<div class="alert alert-success">Article removed</div>';
    }

    const pageContent = loadPage('remove', pageData);
    return pageContent;
}

function assets(routeParts) {
    // requires 3º route part
    if (routeParts[2] == undefined) {
        return 'not_found';
    }

    // the 3º route part is the asset filename
    const filename = routeParts[2];
    const assetData = loadAsset(filename);

    if (assetData == undefined) {
        return 'not_found';
    }

    return assetData;
}

function images(routeParts) {
    // requires 3º route part
    if (routeParts[2] == undefined) {
        return 'not_found';
    }

    // the 3º route part is the image filename
    const filename = routeParts[2];
    const imageData = loadImage(filename);

    if (imageData == undefined) {
        return 'not_found';
    }

    return imageData;
}

const routes = {
    '/' : index,
    'page' : page,
    'article' : article,
    'login' : login,
    'logout': logout,
    'new' : create,
    'edit' : update,
    'remove' : destroy,
    'assets' : assets,
    'images' : images,
};

module.exports = routes;