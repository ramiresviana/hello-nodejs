const http = require('http');
const formidable = require('formidable');
const routes = require('./routes');

const server = http.createServer();

server.on('request', (request, response) => {
    const { method, url } = request;

    console.log(new Date(), request.connection.remoteAddress, method, url);

    let route = '/';

    const routeParts = url.split('/');
    if (routeParts[1] && routeParts[1] != '') {
        route = routeParts[1];
    }

    if (routes[route] == undefined) {
        response.write('not_found');
        return response.end();
    }

    const routeFunction = (form = null) => {
        const pageData = routes[route](routeParts, form);

        response.write(pageData);
        response.end();
    };

    if (method != 'POST') {
        return routeFunction();
    }

    const form = formidable();
    form.parse(request, (err, fields, files) => {
        routeFunction({ fields, files });
    });
});

server.listen(8080);

console.log('Server is running');