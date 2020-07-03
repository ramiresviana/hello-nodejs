const { loadPage } = require('./utils');

function index() {
    const pageData = { title: 'Listing' };
    const pageContent = loadPage('listing', pageData);
    return pageContent;
}

function article() {
    const pageData = { title: 'Article' };
    const pageContent = loadPage('article', pageData);
    return pageContent;
}

function login() {
    const pageData = { title: 'Login' };
    const pageContent = loadPage('login', pageData);
    return pageContent;
}

function create() {
    const pageData = { title: 'New' };
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