var Hapi = require('hapi');
var server = new Hapi.Server();
var req = require('request');
server.connection({ host: 'localhost' });

var options = {
    opsInterval: 3000,
    reporters: [{
        reporter: require('good-console'),
        events: { log: '*', response: '*', ops: '*'}
    }, {
        reporter: require('good-file'),
        events: { ops: '*' },
        config: './test/fixtures/my_log'
    }, {
        reporter: 'good-http',
        events: { error: '*' },
        config: {
            endpoint: 'http://localhost:3100'
        }
    }]
};
server.connection({
    host: '0.0.0.0',
    port: 3001,
    labels: ['api']
});

server.route({
    method: 'POST',
    path: '/data',
    handler: getData
});

function getData(request, reply){

    if(!request.payload){
        return reply("Sorry, I need a github username")
    }

    req.get({url:'https://api.github.com/users/'+request.payload.userName,
        headers: {Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'josep2'},
        json: true}, function(err, res, body){

        reply(body);
    })
}


server.register({
    register: require('good'),
    options: options
}, function (err) {

    if (err) {
        console.error(err);
    }
    else {
        server.start(function () {

            console.info('Server started at ' + server.info.uri);
        });
    }
});