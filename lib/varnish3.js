"use strict";


var _ = require('lodash');
var async = require('async');

console.log("loading cloudflare");

var method = CloudFlare.prototype;

function CloudFlare(config) {
//    console.log("CloudFlare for ", config);

    this._domains = config.domains;
    this.init(config);
}


method.init = function(config) {
    console.log("CF", config.cloudflare.email, config.cloudflare.key, this._domains);
};

method.purge = function(url) {

};

method.status = function(url, cb) {

};







module.exports = CloudFlare;
