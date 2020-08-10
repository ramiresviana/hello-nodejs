const fs = require('fs');
const path = require('path');

function loadView(viewName, viewData = {}) {
    const viewFilename = viewName + '.html';
    const viewPath = path.join(__dirname, 'views', viewFilename);
    let viewContent = fs.readFileSync(viewPath, 'utf-8');

    viewContent = replaceDataTags(viewContent, viewData);

    return viewContent;
}

function loadPage(pageName, pageData = {}) {
    const header = loadView('partials/header');
    const content = loadView(pageName);
    const footer = loadView('partials/footer');

    let pageContent = header + content + footer;
    pageContent = replaceDataTags(pageContent, pageData);

    return pageContent;
}

function loadAsset(assetFilename) {
    const assetPath = path.join(__dirname, 'assets', assetFilename);

    const exists = fs.existsSync(assetPath);
    if (!exists) {
        return;
    }

    const assetData = fs.readFileSync(assetPath);
    return assetData;
}

function replaceDataTags(content, contentData) {
    let resultContent = content;

    for (var key of Object.keys(contentData)) {
        const data = contentData[key];

        resultContent = resultContent.replace(`[[${key}]]`, data);
    }

    return resultContent;
}

function getArticles() {
    const articlesData = fs.readFileSync(path.join(__dirname, 'data', 'articles.json'), 'utf-8');
    const articles = JSON.parse(articlesData);

    return articles
}

function addArticle(data) {
    const articles = getArticles();
    const id = articles.length;

    const { title, content, image } = data;
    const article = { image, id, title, content };

    articles.push(article);
    fs.writeFileSync(path.join(__dirname, 'data', 'articles.json'), JSON.stringify(articles, null, 4));

    return articles;
}

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

function addImage(image) {
    const extension = path.extname(image.name)
    const filename = new Date().getTime() + extension;
    const destination = path.join(__dirname, 'data', 'images', filename)

    fs.renameSync(image.path, destination);

    return filename;
}

function removeImage(filename) {
    fs.unlinkSync(path.join(__dirname, 'data', 'images', filename));
}

function loadImage(imgFilename) {
    const imgPath = path.join(__dirname, 'data', 'images', imgFilename);

    const exists = fs.existsSync(imgPath);
    if (!exists) {
        return null;
    }

    const imgData = fs.readFileSync(imgPath);
    return imgData;
}

module.exports = { loadView, loadPage, loadAsset, getArticles, addArticle, updateArticle, addImage, removeImage, loadImage };