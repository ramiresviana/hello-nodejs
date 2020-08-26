const http = require('http');
const formidable = require('formidable');
const routes = require('./routes');

const server = http.createServer();

server.on('request', (request, response) => {
    const { method, url } = request;

    // logs timestamp, ipaddress, method and url
    console.log(new Date(), request.connection.remoteAddress, method, url);

    // index route
    let route = '/';

    // split url parts
    const routeParts = url.split('/');
    if (routeParts[1] && routeParts[1] != '') {
        // first part of the url is route
        route = routeParts[1];
    }

    // invalid route response
    if (routes[route] == undefined) {
        response.write('not_found');
        return response.end();
    }

    // prepare the route method
    const routeFunction = (form = null) => {
        const pageData = routes[route](routeParts, form, request, response);

        response.write(pageData);
        response.end();
    };

    // call route method without form
    if (method != 'POST') {
        return routeFunction();
    }

    // parse request form
    const form = formidable();
    form.parse(request, (err, fields, files) => {
        routeFunction({ fields, files });
    });
});

server.listen(8080);

console.log('Server is running');