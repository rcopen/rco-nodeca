// Unfreeze user on login
//

'use strict';


module.exports = function (N) {

  N.wire.after('internal:users.login', { priority: 5 }, async function unfreeze_user(env) {
    let usergroups = env.data.user.usergroups;
    let grp_frozen = await N.models.users.UserGroup.findIdByName('frozen');

    if (env.data.user.usergroups.some(group => String(group) === String(grp_frozen))) {
      let new_group  = await N.settings.get('registered_user_group');

      // remove old groups, and make sure new group isn't already present
      usergroups = env.data.user.usergroups.filter(group =>
                       ![ String(grp_frozen), String(new_group) ].includes(String(group)));

      usergroups.push(new_group);

      await N.models.users.User.updateOne({ _id: env.data.user._id }, { $set: { usergroups } });
    }
  });
};
