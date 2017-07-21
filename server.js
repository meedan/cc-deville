var config = require('./config/config.js');
var pkg = require('./package.json');

console.log("starting " + pkg.name + ":" + pkg.version +  " server on port " + (config.net.port));
console.log("config.debug is " + config.debug);
console.log("config.development is " + config.development);

var cc = require ('./lib/cc.js');
cc.init(config.caches);

var _ = require('lodash');
var async = require('async');

// *********************** //
// setup the rest services //
// *********************** //
var restify = require('restify');
var server = restify.createServer({
    name: pkg.name,
    version: config.api.semver
});
// server.use(restify.CORS());
server.use(restify.bodyParser({
    mapParams : true
}));
server.use(restify.queryParser());

// API Methods
var apibase = '/' ;

server.get(apibase, function(req, res) {
    shipping(res, 'hello', 'API is running');
});

// ping
server.get(apibase + 'ping', function(req, res) {
    console.log('es ping ');		
    shipping(res, 'pong', 'ping');		
});

server.get(apibase + 'healthcheck', function(req, res) {
    console.log('es ping ');		
    shipping(res, 'pong', 'ping');		
});

server.del(apibase + 'purge', function rm(req, res) {
    if (!isAuthenticated(req)) {
	    return errAndShip(res, "not authorized");
    }
    console.log("purge", req.query.url);
    cc.purge(req.query.url)
    ship201ACK(res);
});

server.del(apibase + 'purgeall', function rm(req, res) {
	if (!isAuthenticated(req)) {
		return errAndShip(res, "not authorized");
	}
	console.log("purge", req.query.domain);
	cc.purge_all(req.query.domain)
	ship201ACK(res);
});

server.get(apibase + 'status', function rm(req, res) {
    if (!isAuthenticated(req)) {
    	return errAndShip(res, "not authorized");
    }
    var url = req.query.url;
    console.log("status", url);
    cc.status(url, function(err, ret) {    	
    	shipping(res, 'cache_status', {url: url, caches: ret });		
    });
});


// see if you can contact the backend services
// healthcheck
server.get(apibase + 'healthcheck', function(req, res) {

//    es.ping({}).then(function(body) {
//		console.log('es ping ');		
    shipping(res, 'ping', 'ping');		
//  
//	}, function(error) {
//	    res.status(500);
//		errAndShip(res, "healthcheck failed: " + error.message);		
//	});
});



// API Utility functions
var errAndShip = function(res, err) {
    // res.status(500);
	console.log('errAndShip', err);
    shipping(res, 'error', err);
};

var shipping = function(res, type, data) {
    setHeaders(res, function() {
        console.log('shipping', type);
        var now = new Date().getTime();
        res.send({
            type : type,
            apiVersion : config.api.semver,
            time : now,
            data : data
        });
    });
};

var ship201ACK = function(res) {
	setHeaders(res, function() {
		res.send(201);
	});
}

// biggest bunch of bs
// https://github.com/mcavage/node-restify/issues/284
var allowHeaders = [ 'Accept', 'Accept-Version', 'Content-Type', 'Api-Version',
        config.auth.header ];
function unknownMethodHandler(req, res) {
    if (req.method.toLowerCase() === 'options') {
        if (res.methods.indexOf('OPTIONS') === -1)
            res.methods.push('OPTIONS');
        setHeaders(res, function() {
            return res.send(204);
        });
    } else {
        return res.send(new restify.MethodNotAllowedError());
    }
}
server.on('MethodNotAllowed', unknownMethodHandler);

// make a small change


function setHeaders(res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
    res.header('Access-Control-Allow-Methods', res.methods.join(', '));
    res.header('Access-Control-Allow-Origin', '*');
    res.header('X-CC-DEVILLE-VERSION', config.api.semver);

    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
}

server.listen(config.net.port, function() {
    console.log('%s listening at %s', server.name, server.url);
});

function isAuthenticated (req) {
    if (req.headers[config.auth.header] && 
    	_.includes(config.auth.active, req.headers[config.auth.header])) {
    	
    	console.log('authenticated!', req.headers[config.auth.header]);
        return true;
    } else {
        return false;
    }
}

