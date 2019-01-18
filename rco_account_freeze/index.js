'use strict';

exports.root = __dirname;
exports.name = 'rco_account_freeze';
exports.init = function (N) { require('./lib/autoload.js')(N); };
