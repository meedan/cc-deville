"use strict";

var _ = require('lodash');
var async = require('async');

console.log("loading cc init");

var Cloudflare = require('./cloudflare.js');
var Varnish3 = require('./varnish3.js');

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
			}
			// else if (cache.type === "varnish4") {
			// cache.C = new Varnish4(cache.varnish4);
			// }
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
	status : function(url, cb) {
//		console.log("cc status", url);
		async.map(cc.caches, function(cache, next) {
			cache.status(url, next);			
		}, cb);
	}
}

module.exports = cc;