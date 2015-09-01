"use strict";

var _ = require('lodash');
var async = require('async');

var Cloudflare = require('./cloudflare.js');

console.log("loading cc init");


var cc = {
    cache_configs: [],
    caches: [],
    caches_by_name: {},
    init: function(configs) {
	// sort the configs by orbit
	cc.cache_configs =_.sortBy(configs, function(config) {
//	    console.log(config);
	    return config.orbit;
	});

	// turn them into config objects
	_(cc.cache_configs).forEach(function(config) {
//	    console.log(config);
	    if (config.type === "cloudflare") {
		var cache_obj = new Cloudflare(config);
		cc.caches.push(cache_obj);
		cc.caches_by_name[config.name] = cache_obj;
	    }
//	    else if (cache.type === "varnish3") {
//		cache.C = new Varnish3(cache.varnish3);
//	    } else if (cache.type === "varnish4") {
//		cache.C = new Varnish4(cache.varnish4);
//	    } 
	}).value();
    },

    purge: function(url) {
	console.log("cc purge", url);
	_(cc.caches).forEach(function(cache) {
//	    console.log("cc purge cache", cache);
	    cache.purge(url);
	}).value();
    },
    status: function(url, cb) {
	console.log("cc status", url);
	// this will need to be async
	_(cc.caches).forEach(function(cache) {
	    cache.status(url, cb);
	}).value();
    }
}


module.exports = cc;
