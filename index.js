const http = require('http');
const { loadPage } = require('./utils');

const server = http.createServer();

server.on('request', (request, response) => {
    console.log('request');
    const pageData = loadPage('listing');

    response.write(pageData);
    response.end();
});

server.listen(8080);