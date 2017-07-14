"use strict";

var _ = require('lodash');
var u = require('url');
var request = require('request');

console.log("loading nginx");

var method = Nginx.prototype;

var _default_headers = {
	'Accept-Encoding': 'gzip'		
};

function Nginx(config) {
//    console.log("Nginx for ", config);

	this.host = config.nginx.host;
	// TODO: gather from rootURLs
    this.domains = _URLsToDomains(config.nginx.rootURLs);
    this.name = config.name;
    this.orbit = config.orbit;
}

var _URLsToDomains = function(urls) {
	var domains = [];
	urls.forEach(function(url) {
		var ud = u.parse(url);
		domains.push(ud.hostname);
	});
	return domains;
}

method.hasDomain = function(domain) {
//    console.log(this.domains, domain);
    return _.includes(this.domains, domain);
}


method.purge = function(url) {
    // ask the nginx server directly
    // then pass along relevant headers
    var self = this;

    // request can take a parsed url object as well as a full url 
    var up = u.parse(url);
    if (!self.hasDomain(up.hostname)) {
		return;
	//		cb('not found');
    }
	
    var headers = _default_headers;
    // set the host header
    headers['host'] = up.hostname;
    up.host = self.host;
    delete up.hostname;
        
    console.log("Nginx purge url, up, header", url, up, headers, u.format(up));
    request({url: u.format(up), headers: headers, method: 'PURGE'}, function(err, res, body) {
		if (!err) {
		    console.log("Nginx purge headers", res.headers);
		}
    });
};

method.purge_all = function(domain) {
	// purge all is not possible with the open source ngx_cache_purge with our setup
	// https://github.com/FRiCKLE/ngx_cache_purge/blob/master/TODO.md
	this.purge('http://' + domain + '/.*');  // both variants to be sure!
	this.purge('https://' + domain + '/.*');
}

method.status = function(url, cb) {
	// ask the nginx server directly
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
	var headers = _default_headers;
	headers['host'] = up.hostname;
	up.host = self.host;
	delete up.hostname;
	delete up.href;
		
	console.log("Nginx status url, up, header", url, up, headers, u.format(up));
	request({url: u.format(up), headers: headers}, function(err, res, body) {
		if (!err) {
			console.log("Nginx status headers", res.headers);
			
			if (res.headers) {
				_.merge(status, {
						cache_status: res.headers['x-nginx-cache-status'],
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

module.exports = Nginx;
