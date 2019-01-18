
'use strict';


module.exports = function (N, apiPath) {

  N.wire.after(apiPath, { priority: 5 }, function add_fields(env) {

    env.res.fields.push({
      name:     'first_name',
      value:    env.data.user.first_name,
      priority: 14
    });

    env.res.fields.push({
      name:     'last_name',
      value:    env.data.user.last_name,
      priority: 15
    });

  });
};
