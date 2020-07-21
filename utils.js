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

function getAssets() {
    const assetsPath = path.join(__dirname, 'assets');
    const assetsFiles = fs.readdirSync(assetsPath);

    return assetsFiles;
}

function loadAsset(assetFilename) {
    const assetPath = path.join(__dirname, 'assets', assetFilename);
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

module.exports = { loadView, loadPage, getAssets, loadAsset, getArticles };