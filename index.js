const http = require('http');
const path = require('path');
const formidable = require('formidable');
const { getAssets, loadAsset } = require('./utils');
const routes = require('./routes');

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

    let route = '/';

    const routeParts = url.split('/');
    if (routeParts[1] && routeParts[1] != '') {
        route = routeParts[1];
    }

    if (routes[route] == undefined) {
        return response.end();
    }

    if (method == 'POST') {
        const form = formidable();

        form.parse(request, (err, fields, files) => {
            const pageData = routes[route](routeParts, { fields, files });

            response.write(pageData);
            response.end();
        });

        return
    }

    const pageData = routes[route](routeParts);

    response.write(pageData);
    response.end();
});

server.listen(8080);