"use strict";

var _ = require('lodash');
var u = require('url');
var request = require('request');

console.log("loading varnish");

var method = Varnish.prototype;

function Varnish(config) {
//    console.log("Varnish for ", config);

    this._secret = config.varnish.secret;
    this.host = config.varnish.host;
    this.domains = config.varnish.domains;
    this.name = config.name;
    this.orbit = config.orbit;
}

method.hasDomain = function(domain) {
//    console.log(this.domains, domain);
    return _.includes(this.domains, domain);
}


method.purge = function(url) {
    // ask the varnish server directly
    // then pass along relevant headers
    var self = this;

    // request can take a parsed url object as well as a full url 
    var up = u.parse(url);
    if (!self.hasDomain(up.hostname)) {
	return;
	//		cb('not found');
    }
	
    var headers = {};
    // set the host header
    headers['host'] = up.hostname;
    up.host = self.host;
    delete up.hostname;
    delete up.href;
    
    // because we only use fake https via cloudflare
    if (up.protocol === 'https:') {
	headers['X-Forwarded-Proto'] = 'https';
	up.protocol = 'http';
    }
    
    console.log("Varnish purge url, up, header", url, up, headers, u.format(up));
    request({url: u.format(up), headers: headers, method: 'PURGE'}, function(err, res, body) {
	if (!err) {
	    console.log("Varnish purge headers", res.headers);
	}
    });
};

method.purge_all = function(domain) {
	// see http://twigstechtips.blogspot.com/2014/04/varnish-enabling-wildcard-purging-of.html
	// since the vcl is setup for wildcard, we just pass a wildcard as the url
	this.purge('http://' + domain + '/.*');  // both variants to be sure!
	this.purge('https://' + domain + '/.*');
}

method.status = function(url, cb) {
	// ask the varnish server directly
	// then pass along relevant headers
	var self = this;
	
	
	var status = {
		name : self.name,
		orbit : self.orbit,
	}
	
	// request can take a parsed url object as well as a full url 
	var up = u.parse(url);
	
	// see if we manage this domain, if not send that
	if (!self.hasDomain(up.hostname)) {
		status.cache_status = "domain not under management";
		status.http_code = 404;
		console.log("not in cache: ", up.host, status);
		return cb('', status)
	}

	// setup the headers for the request
	var headers = {};
	headers['host'] = up.hostname;
	up.host = self.host;
	delete up.hostname;
	delete up.href;
	
	// because we only use fake https via cloudflare
	if (up.protocol === 'https:') {
		headers['X-Forwarded-Proto'] = 'https';
		up.protocol = 'http';
	}
	
	console.log("Varnish status url, up, header", url, up, headers, u.format(up));
	request({url: u.format(up), headers: headers}, function(err, res, body) {
		if (!err) {
			console.log("Varnish status headers", res.headers);
			
			if (res.headers) {
				_.merge(status, {
						cache_status: res.headers['x-cache'],
						etag: res.headers['etag'],
						last_modified: res.headers['last-modified'],
						age: res.headers['age'],
						http_code: res.statusCode,
						cache_control: res.headers['cache-control']
				});	
			}
			cb(null, status);
		}
	});
};

module.exports = Varnish;
