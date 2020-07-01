const { loadPage } = require('./utils');

function index() {
    const pageData = loadPage('listing');
    return pageData;
}

function article() {
    const pageData = loadPage('article');
    return pageData;
}

function login() {
    const pageData = loadPage('login');
    return pageData;
}

function create() {
    const pageData = loadPage('new');
    return pageData;
}

const routes = {
    '/' : index,
    'article' : article,
    'login' : login,
    'new' : create
};

module.exports = routes;