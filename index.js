const http = require('http');

const server = http.createServer();

server.on('request', (request, response) => {
    console.log('request');
    response.write('hello-nodejs');
    response.end();
});

server.listen(8080);