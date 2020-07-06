const { loadPage, loadView } = require('./utils');

function index() {
    const articles = [
        {
            url: '#',
            image: 'img.jpg',
            title: 'Vivamus euismod a tellus eget interdum. Aenean ac.',
            content: 'Aliquam vulputate mi in vulputate aliquam. Mauris ultrices vel felis eget tempus. Morbi a est at lacus malesuada ultrices ac quis turpis. Curabitur ante metus, malesuada eget neque eu, ornare suscipit ligula. Aliquam suscipit cursus eros, ut tincidunt nulla laoreet a. Donec aliquam urna vel pellentesque sodales.'
        },
        {
            url: '#',
            image: 'img.jpg',
            title: 'Vivamus euismod a tellus eget interdum. Aenean ac.',
            content: 'Aliquam vulputate mi in vulputate aliquam. Mauris ultrices vel felis eget tempus. Morbi a est at lacus malesuada ultrices ac quis turpis. Curabitur ante metus, malesuada eget neque eu, ornare suscipit ligula. Aliquam suscipit cursus eros, ut tincidunt nulla laoreet a. Donec aliquam urna vel pellentesque sodales.'
        },
        {
            url: '#',
            image: 'img.jpg',
            title: 'Vivamus euismod a tellus eget interdum. Aenean ac.',
            content: 'Aliquam vulputate mi in vulputate aliquam. Mauris ultrices vel felis eget tempus. Morbi a est at lacus malesuada ultrices ac quis turpis. Curabitur ante metus, malesuada eget neque eu, ornare suscipit ligula. Aliquam suscipit cursus eros, ut tincidunt nulla laoreet a. Donec aliquam urna vel pellentesque sodales.'
        }
    ]

    let articlesContent = ''

    articles.forEach((element) => {
        articlesContent += loadView('partials/article', element);
    })

    const pageData = { title: 'Listing', listing: articlesContent };
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