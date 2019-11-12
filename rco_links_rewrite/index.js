'use strict';

exports.root = __dirname;
exports.name = 'rco_links_rewrite';
exports.init = function (N) { require('./lib/autoload.js')(N); };
