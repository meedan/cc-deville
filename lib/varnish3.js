"use strict";

var _ = require('lodash');
var u = require('url');
var request = require('request');

console.log("loading varnish3");

var method = Varnish3.prototype;

function Varnish3(config) {
//    console.log("Varnish3 for ", config);

    this._secret = config.varnish3.secret;
    this.host = config.varnish3.host;
    this.domains = config.varnish3.domains;
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
	
	console.log("Varnish3 purge url, up, header", url, up, headers, u.format(up));
    request({url: u.format(up), headers: headers, method: 'PURGE'}, function(err, res, body) {
		if (!err) {
		    console.log("Varnish3 purge headers", res.headers);
		}
    });
};

method.status = function(url, cb) {
	// ask the varnish server directly
	// then pass along relevant headers
	var self = this;
	
	// request can take a parsed url object as well as a full url 
	var up = u.parse(url);
	if (!self.hasDomain(up.hostname)) {
		cb('not found');
	}
	
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
	
	console.log("Varnish3 status url, up, header", url, up, headers, u.format(up));
	request({url: u.format(up), headers: headers}, function(err, res, body) {
		if (!err) {
			console.log("Varnish3 status headers", res.headers);
			
			var status;
			if (res.headers) {
				status = {
						name : self.name,
						orbit : self.orbit,
						cache_status: res.headers['x-cache'],
						etag: res.headers['etag'],
						last_modified: res.headers['last-modified'],
						age: res.headers['age'],
						http_code: res.statusCode,
						cache_control: res.headers['cache-control']
				};	
			}
			cb(null, status);
		}
	});
};

module.exports = Varnish3;