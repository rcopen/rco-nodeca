'use strict';

exports.root = __dirname;
exports.name = 'rco_restrict_images';
exports.init = function (N) { require('./lib/autoload.js')(N); };
