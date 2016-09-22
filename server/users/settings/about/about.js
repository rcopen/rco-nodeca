
'use strict';


module.exports = function (N, apiPath) {

  N.wire.after(apiPath, { priority: 5 }, function add_fields(env) {

    env.res.about.push({
      name:     'first_name',
      value:    env.data.user.first_name,
      priority: 4
    });

    env.res.about.push({
      name:     'last_name',
      value:    env.data.user.last_name,
      priority: 5
    });

  });
};
