const fs = require('fs');
const path = require('path');

function loadView(viewName) {
    const viewFilename = viewName + '.html';
    const viewPath = path.join(__dirname, 'views', viewFilename);
    const viewData = fs.readFileSync(viewPath);

    return viewData;
}

function loadPage(pageName) {
    const header = loadView('header');
    const content = loadView(pageName);
    const footer = loadView('footer');

    const pageData = header + content + footer;

    return pageData;
}

module.exports = { loadView, loadPage };