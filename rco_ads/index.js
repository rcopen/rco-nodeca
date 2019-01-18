'use strict';

exports.root = __dirname;
exports.name = 'rco_ads';
exports.init = function (N) { require('./lib/autoload.js')(N); };
