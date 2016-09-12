
'use strict';


module.exports = function (N, apiPath) {

  // Add first_name/last_name to search form
  //
  N.wire.after(apiPath, { priority: 5 }, function create_search_form(env) {
    env.res.fields = env.res.fields || [];

    env.res.fields.push({
      name:     'first_name',
      value:    env.params.first_name,
      priority: 60
    });

    env.res.fields.push({
      name:     'last_name',
      value:    env.params.last_name,
      priority: 70
    });
  });
};
