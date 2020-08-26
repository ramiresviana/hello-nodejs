const cookie = require('cookie')
const fs = require('fs');
const path = require('path');

// get contents of views folder and replace data tags
function loadView(viewName, viewData = {}) {
    const viewFilename = viewName + '.html';
    const viewPath = path.join(__dirname, 'views', viewFilename);
    let viewContent = fs.readFileSync(viewPath, 'utf-8');

    viewContent = replaceDataTags(viewContent, viewData);

    return viewContent;
}

// create page structure with head, content and footer replacing data tags
function loadPage(pageName, pageData = {}) {
    const header = loadView('partials/header');
    const content = loadView(pageName);
    const footer = loadView('partials/footer');

    let pageContent = header + content + footer;
    pageContent = replaceDataTags(pageContent, pageData);

    return pageContent;
}

// get content of assets folder
function loadAsset(assetFilename) {
    const assetPath = path.join(__dirname, 'assets', assetFilename);

    const exists = fs.existsSync(assetPath);
    if (!exists) {
        return;
    }

    const assetData = fs.readFileSync(assetPath);
    return assetData;
}

// replace tags from a string
function replaceDataTags(content, contentData) {
    let resultContent = content;

    for (var key of Object.keys(contentData)) {
        const data = contentData[key];

        resultContent = resultContent.replace(new RegExp(`\\[\\[${key}\\]\\]`, 'g'), data);
    }

    return resultContent;
}

// get articles from data file contents
function getArticles() {
    const articlesData = fs.readFileSync(path.join(__dirname, 'data', 'articles.json'), 'utf-8');
    const articles = JSON.parse(articlesData);

    return articles
}

// inserts article into data file
function addArticle(data) {
    const articles = getArticles();

    const articleList = Object.keys(articles);
    const id = parseInt(articleList[articleList.length - 1]) + 1;

    const { title, content, image } = data;
    const article = { id, image, title, content };

    articles[id] = article;
    fs.writeFileSync(path.join(__dirname, 'data', 'articles.json'), JSON.stringify(articles, null, 4));

    return articles;
}

// overrides an article on data file
function updateArticle(id, data) {
    const articles = getArticles();

    if (articles[id] == undefined) {
        return;
    }

    const { title, content, image } = data;
    const newArticle = { id: parseInt(id), image, title, content };

    articles[id] = newArticle;
    fs.writeFileSync(path.join(__dirname, 'data', 'articles.json'), JSON.stringify(articles, null, 4));

    return articles;
}

// remove article from data file
function removeArticle(id) {
    const articles = getArticles();

    if (articles[id] == undefined) {
        return;
    }

    delete articles[id];
    fs.writeFileSync(path.join(__dirname, 'data', 'articles.json'), JSON.stringify(articles, null, 4));

    return articles;
}

// adds image to data folder
function addImage(image) {
    const extension = path.extname(image.name)
    const filename = new Date().getTime() + extension;
    const destination = path.join(__dirname, 'data', 'images', filename)

    fs.renameSync(image.path, destination);

    return filename;
}

// removes image from data folder
function removeImage(filename) {
    try {
        fs.unlinkSync(path.join(__dirname, 'data', 'images', filename));
    } catch (error) {
        console.error(error);
    }
}

// get contents of data images folder
function loadImage(imgFilename) {
    const imgPath = path.join(__dirname, 'data', 'images', imgFilename);

    const exists = fs.existsSync(imgPath);
    if (!exists) {
        return null;
    }

    const imgData = fs.readFileSync(imgPath);
    return imgData;
}

// static credentials for authentication
const credentials = { user: 'admin', pass: 'admin' };

// checks for valid credentials
function authenticate(user, pass) {
    const validUser = user == credentials.user;
    const validPass = pass == credentials.pass;
    const valid = validUser && validPass;

    return valid;
}

// checks for valid cookie credentials
function isLogged(request) {
    if (!request || !request.headers || !request.headers.cookie) {
        return false;
    }

    const data = cookie.parse(request.headers.cookie).auth;
    const auth = Buffer.from(data, 'base64').toString('ascii');
    const parts = auth.split(':');

    return authenticate(parts[0], parts[1]);
}

module.exports = { loadView, loadPage, loadAsset, getArticles, addArticle, updateArticle, removeArticle, addImage, removeImage, loadImage, authenticate, isLogged };