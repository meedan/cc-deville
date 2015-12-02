"use strict";

var _ = require('lodash');
var async = require('async');

console.log("loading cc init");

var Cloudflare = require('./cloudflare.js');
var Varnish3 = require('./varnish.js');
var Varnish4 = require('./varnish.js');

var cc = {
	cache_configs : [],
	caches : [],
	caches_by_name : {},
	init : function(configs) {
		// sort the configs by orbit
		cc.cache_configs = _.sortBy(configs, function(config) {
			// console.log(config);
			return config.orbit;
		});

		// turn them into config objects
		_(cc.cache_configs).forEach(function(config) {
			var cache_obj;
//			console.log(config);
			if (config.type === "cloudflare") {
				cache_obj = new Cloudflare(config);
			} else if (config.type === "varnish3") {
				cache_obj = new Varnish3(config);
			} else if (config.type === "varnish4") {
				cache_obj = new Varnish4(config);
			}
			// store it if it worked
			if (cache_obj !== undefined) {
				cc.caches.push(cache_obj);
				cc.caches_by_name[config.name] = cache_obj;
			}
		}).value();		
	},

	purge : function(url) {
//		console.log("cc purge", url);
		async.eachSeries(cc.caches, function(cache, next) {
			cache.purge(url);
			next();
		});
	},

	purge_all : function(domain) {
//		console.log("cc purge", url);
		async.eachSeries(cc.caches, function(cache, next) {
			cache.purge_all(domain);
			next();
		});
	},
	status : function(url, cb) {
//		console.log("cc status", url);
		async.map(cc.caches, function(cache, next) {
			cache.status(url, next);			
		}, cb);
	}
}

module.exports = cc;
