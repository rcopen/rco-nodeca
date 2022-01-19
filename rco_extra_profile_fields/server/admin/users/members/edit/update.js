
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

    if (typeof env.params.first_name !== 'undefined' && env.params.first_name !== env.data.user.first_name) {
      env.data.user.first_name = env.params.first_name;
    }

    if (typeof env.params.last_name !== 'undefined' && env.params.last_name !== env.data.user.last_name) {
      env.data.user.last_name = env.params.last_name;
    }

    // If name is set to '', reset `incomplete_profile` flag
    //
    let complete = true;

    if (!env.params.first_name && !env.params.last_name) complete = false;

    env.data.user.incomplete_profile = !complete;
  });


  // If first_name or last_name are edited, and user is in che group,
  // remove that group.
  //
  N.wire.before(apiPath, { priority: -5 }, async function remove_che_group(env) {
    // don't change usergroups if they're already changed manually
    if (env.data.user.isModified('usergroups')) return;

    // Always run group upgrade even if nothing is changed.
    // Old users may've been put in `che` group because of missing birthday when it was required.
    //if (!env.data.user.isModified('first_name') &&
    //    !env.data.user.isModified('last_name')) return;

    let grp_che = await N.models.users.UserGroup.findIdByName('che');

    if (!env.data.user.usergroups.some(group => String(group) === String(grp_che))) return;

    let new_group = await N.settings.get('registered_user_group');

    // remove old groups, and make sure new group isn't already present
    env.data.user.usergroups = env.data.user.usergroups.filter(group =>
                               ![ String(grp_che), String(new_group) ].includes(String(group)));

    env.data.user.usergroups.push(new_group);
    env.data.need_group_upgrade = true;
  });


  N.wire.after(apiPath, async function group_upgrade(env) {
    if (env.data.need_group_upgrade) {
      await N.wire.emit('internal:users.group_upgrade', { user_id: env.data.user._id });
    }
  });
};
