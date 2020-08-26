const cookie = require('cookie')
const path = require('path')
const fs = require('fs')

const { loadPage, loadView, loadAsset, getArticles, addArticle, updateArticle, removeArticle, addImage, removeImage, loadImage, authenticate, isLogged } = require('./utils');

let articles = getArticles()
const listingLimit = 5;

function index() {
    let articlesContent = ''

    let showPagination = false;

    let counter = 0;
    Object.keys(articles).forEach((key) => {
        if (counter >= listingLimit) {
            showPagination = true;
            return;
        }
        counter++;

        articlesContent += loadView('partials/article', articles[key]);
    })

    let pagination = '';

    if (showPagination) {
        pagination += `<a href="/page/2" class="btn btn-primary mt-3">Next page</a>`;
    }

    const pageData = { title: 'Listing', listing: articlesContent, pagination };
    const pageContent = loadPage('listing', pageData);

    return pageContent;
}

function page(routeParts) {
    if (routeParts[2] == undefined) {
        return 'not_found';
    }

    const current = parseInt(routeParts[2]);
    const articleList = Object.keys(articles);
    const pages = Math.ceil(articleList.length / listingLimit);

    if (!current || current < 1 || current > pages) {
        return 'not_found';
    }

    const start = listingLimit * (current - 1);
    const end = start + listingLimit;

    let articlesContent = '';
    let counter = 0;

    articleList.forEach((key) => {
        if (counter >= start && counter < end) {
            articlesContent += loadView('partials/article', articles[key]);
        }
        counter++;
    })

    let pagination = '';

    if (current > 1) {
        pagination += `<a href="/page/${current-1}" class="btn btn-primary mt-3 mr-3">Previous page</a>`;
    }

    if (current < pages) {
        pagination += `<a href="/page/${current+1}" class="btn btn-primary mt-3">Next page</a>`;
    }

    const pageData = { title: 'Listing', listing: articlesContent, pagination };
    const pageContent = loadPage('listing', pageData);

    return pageContent;
}

function article(routeParts) {
    if (routeParts[2] == undefined) {
        return 'not_found';
    }

    let id = routeParts[2];

    if (articles[id] == undefined) {
        return 'not_found';
    }

    let { image, title, content } = articles[id];

    const pageData = { title: 'Article', articleId: id, articleImage: image, articleTitle: title, articleContent: content };
    const pageContent = loadPage('article', pageData);
    return pageContent;
}

function login(routeParts, form, request, response) {
    if (isLogged(request)) {
        return 'is_logged';
    }

    const pageData = { title: 'Login', result: '' };

    if (form) {
        const { user, pass } = form.fields;

        const validUser = user && user != '';
        const validPass = pass && pass != '';
        const validForm = validUser && validPass && authenticate(user, pass)

        if (validForm) {
            const auth = `${user}:${pass}`;
            const data = Buffer.from(auth).toString('base64');

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
    if (!isLogged(request)) {
        return 'not_logged';
    }

    const pageData = { title: 'Logout', result: '' };

    if (form) {
        response.setHeader('Set-Cookie', cookie.serialize('auth', ''));
        pageData['result'] = '<div class="alert alert-success">Logged out</div>';
    }

    const pageContent = loadPage('logout', pageData);
    return pageContent;
}

const imageTypes = ['image/jpeg', 'image/png']

function create(routeParts, form, request) {
    if (!isLogged(request)) {
        return 'not_logged';
    }

    const pageData = { title: 'New', result: '' };

    if (form) {
        const { fields, files } = form;
        const { title, content } = fields;
        const { image } = files;

        const validTitle = title && title != '';
        const validContent = content && content != '';
        const validImage = image && image.size > 0 && imageTypes.indexOf(image.type) != -1

        const validForm = validTitle && validContent && validImage

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
    if (!isLogged(request)) {
        return 'not_logged';
    }

    if (routeParts[2] == undefined) {
        return 'not_found';
    }

    let id = routeParts[2];

    if (articles[id] == undefined) {
        return 'not_found';
    }

    const article = articles[id];

    const pageData = { title: 'Article', result: '', articleImage: article.image, articleTitle: article.title, articleContent: article.content };

    if (form) {
        const { fields, files } = form;
        const { title, content } = fields;
        const { image } = files;

        const validTitle = title && title != '';
        const validContent = content && content != '';
        const validImage = image && image.size > 0 && imageTypes.indexOf(image.type) != -1

        const validForm = validTitle && validContent

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
    if (!isLogged(request)) {
        return 'not_logged';
    }

    if (routeParts[2] == undefined) {
        return 'not_found';
    }

    let id = routeParts[2];

    if (articles[id] == undefined) {
        return 'not_found';
    }

    const article = articles[id];

    const pageData = { title: 'Remove', result: '' };

    if (form) {
        removeImage(article.image);
        articles = removeArticle(id);
        pageData['result'] = '<div class="alert alert-success">Article removed</div>';
    }

    const pageContent = loadPage('remove', pageData);
    return pageContent;
}

function assets(routeParts) {
    if (routeParts[2] == undefined) {
        return 'not_found';
    }

    const filename = routeParts[2];
    const assetData = loadAsset(filename);

    if (assetData == undefined) {
        return 'not_found';
    }

    return assetData;
}

function images(routeParts) {
    if (routeParts[2] == undefined) {
        return 'not_found';
    }

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