"use strict";

var _ = require('lodash');
var async = require('async');
var https = require('https');
var u = require('url');
var request = require('request');

console.log("loading cloudflare");

var method = CloudFlare.prototype;

function CloudFlare(config) {
//    console.log("CloudFlare for ", config);

//    this._domains = config.domains;
    this._email = config.cloudflare.email;
    this.name = config.name;
    this.orbit = config.orbit;
    this._key = config.cloudflare.key;
    this._get_domains();
}

method.hasDomain = function(domain) {
//    console.log(this.domains, domain);
    return _.includes(this.domains, domain);
}

method.purge = function(url) {
    var up = u.parse(url);
    var id = this._get_id(up.host);
//    console.log("CF purge", url, up, id);
    var r = this._req_options('/zones/' + id + '/purge_cache');
    r.json = true;
    r.body = { files : [ url ] };
    
//    console.log('purge options ', r);
    
    request.del(r, function(err, res, body) {
	if (!err) {
    	    res.setEncoding('utf8');
//	    console.log(res);
	    console.log("result: ", body.success);
	} else {
	    console.log(err);
	}
    });

    // https://www.cloudflare.com/docs/next/#zone-purge-individual-files-by-url-and-cache-tags
    //    curl -X DELETE "https://api.cloudflare.com/client/v4/zones/023e105f4ecef8ad9ca31a8372d0c353/purge_cache"
    // --data '{"files":["http://www.example.com/css/styles.css"],"tags":["some-tag","another-tag"]}'
};

method.status = function(url, cb) {

    // https://support.cloudflare.com/hc/en-us/articles/200168266-What-do-the-various-CloudFlare-cache-responses-HIT-Expired-etc-mean-
    // Note: CloudFlare's static content caching is dependent on both (a) where most of your visitors
    // are coming from and which CloudFlare datacenter they are hitting, and (b) how may times those
    // resources are requested at the specific datacenter. As such, CloudFlare does not cache the same
    // resources for your site globally at every datacenter location.

    // so instead, we just analyze the response headers from a standard request
    // eventually, it might be worthwhile to send a request to each of the IP addresses specified by CloudFlare
    // https://www.cloudflare.com/ips

	var self = this;
	var self = this;
	
    request(url, function(err, res, body) {
		if (!err) {
		    console.log("CF status headers", res.headers);
		    var status;
		    if (res.headers) {
				status = {
					name : self.name,
					orbit : self.orbit,
					cache_status: res.headers['cf-cache-status'],
					last_modified: res.headers['last-modified'],
					etag: res.headers['etag'],
					expires: res.headers['expires'],
					http_code: res.statusCode,
					cache_control: res.headers['cache-control']
				};	
		    }
		    cb(null, status);
		} else {
			console.log("error", err);
			cb(err);
		}
    });
    
};

method._get_domains = function() {
    var self = this;
    
    // lookup and store domains for this account and the associated id, which is used in cache clearing
    // https://www.cloudflare.com/docs/next/#zone-list-zones
    var options = self._req_options("/zones");

    var domains = [];
    var domain_ids = [];
    
    request(options, function(err, res, body) {
//	console.log('STATUS: ' + res.statusCode);
//	console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');

	if (!err && res.statusCode == 200) {
	    var bodyj = JSON.parse(body);
//	    console.log("_get_domains body: ", bodyj.result);
	    _(bodyj.result).forEach(function(d) {
			domains.push(d.name);
			domain_ids.push({id: d.id, name: d.name});
//			console.log(d.id,d.name);
	    }).value();
//	    console.log(domains, domain_ids);
	    self.domains = domains;
	    self.domain_ids = domain_ids;
	} else {
	    console.log(err);
	}
    });
    
}

method._get_id = function(domain) {
    var self = this;
    var did = _.result(_.find(self.domain_ids, { 'name': domain }), 'id');
//    console.log(did);
    return did;
}

method._req_options = function(path) {
    // https://www.cloudflare.com/docs/next/#zone-list-zones
    var options = {
	method: 'GET',
	port: 443,
	url: 'https://api.cloudflare.com/client/v4' + path,
	headers: {
	    'Content-Type': 'application/json',
	    'X-Auth-Email': this._email,
	    'X-Auth-Key': this._key
	}
    };
    
    return options;
}

module.exports = CloudFlare;
