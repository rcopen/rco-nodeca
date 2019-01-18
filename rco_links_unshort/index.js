'use strict';

exports.root = __dirname;
exports.name = 'rco_links_unshort';
exports.init = function (N) { require('./lib/autoload.js')(N); };
