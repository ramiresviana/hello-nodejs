const { loadPage, loadView, getArticles } = require('./utils');

const articles = getArticles()

function index() {
    let articlesContent = ''

    articles.forEach((element) => {
        articlesContent += loadView('partials/article', element);
    })

    const pageData = { title: 'Listing', listing: articlesContent };
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

    const pageData = { title: 'Article', articleImage: image, articleTitle: title, articleContent: content };
    const pageContent = loadPage('article', pageData);
    return pageContent;
}

function login() {
    const pageData = { title: 'Login' };
    const pageContent = loadPage('login', pageData);
    return pageContent;
}

const imageTypes = ['image/jpeg', 'image/png']

function create(routeParts, form) {
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
            pageData['result'] = '<div class="alert alert-success">Article created</div>';
        } else {
            pageData['result'] = '<div class="alert alert-danger">An error ocurred</div>';
        }
    }

    const pageContent = loadPage('new', pageData);
    return pageContent;
}

const routes = {
    '/' : index,
    'article' : article,
    'login' : login,
    'new' : create
};

module.exports = routes;