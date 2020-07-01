const http = require('http');
const path = require('path');
const { loadPage, getAssets, loadAsset } = require('./utils');

const server = http.createServer();
const assets = getAssets();

server.on('request', (request, response) => {
    const { method, url } = request;

    const filename = path.basename(url);

    if (assets.includes(filename)) {
        const assetData = loadAsset(filename);

        response.write(assetData);
        return response.end();
    }

    console.log('request', url);
    const pageData = loadPage('listing');

    response.write(pageData);
    response.end();
});

server.listen(8080);