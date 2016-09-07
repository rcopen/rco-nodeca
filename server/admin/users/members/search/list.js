
'use strict';


const _ = require('lodash');

const validate = require('is-my-json-valid')({
  properties: {
    firstname: { type: 'string' },
    lastname:  { type: 'string' }
  },
  additionalProperties: true
});


module.exports = function (N, apiPath) {
  N.wire.before(apiPath, function create_search_query(env) {
    if (!validate(env.params)) throw N.io.BAD_REQUEST;

    let search_query = env.data.search_query = env.data.search_query || {};

    if (env.params.first_name) {
      search_query.first_name = new RegExp('^' + _.escapeRegExp(env.params.first_name), 'i');
    }

    if (env.params.last_name) {
      search_query.last_name = new RegExp('^' + _.escapeRegExp(env.params.last_name), 'i');
    }
  });
};
