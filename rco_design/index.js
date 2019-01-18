'use strict';

exports.root = __dirname;
exports.name = 'rco_design';
exports.init = function (N) { require('./lib/autoload.js')(N); };
