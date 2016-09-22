
'use strict';


const validate = require('is-my-json-valid')({
  properties: {
    first_name: { type: 'string' },
    last_name:  { type: 'string' }
  },
  additionalProperties: true
});


module.exports = function (N, apiPath) {

  N.wire.before(apiPath, { priority: -5 }, function update_user(env) {
    if (!validate(env.params)) throw N.io.BAD_REQUEST;

    if (env.data.user.first_name !== env.params.first_name) {
      env.data.user.first_name = env.params.first_name;
    }

    if (env.data.user.last_name !== env.params.last_name) {
      env.data.user.last_name = env.params.last_name;
    }
  });


  // Model implements firstname/lastname normalization on save,
  // so we need to fetch normalized values after that happens
  //
  N.wire.after(apiPath, { priority: 20 }, function fill_normalized_values(env) {
    env.res.fields.first_name = env.data.user.first_name;
    env.res.fields.last_name  = env.data.user.last_name;
  });
};
