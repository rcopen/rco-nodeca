'use strict';

exports.root = __dirname;
exports.name = 'rco_permissions_workflow';
exports.init = function (N) { require('./lib/autoload.js')(N); };
