
'use strict';


module.exports = function (N, apiPath) {

  // Trigger group upgrade in case user in `incomplete_profile` usergroup
  // submits location when name and birthday are already filled out.
  //
  N.wire.after(apiPath, { priority: 30 }, async function group_upgrade(env) {
    await N.wire.emit('internal:users.group_upgrade', { user_id: env.data.user._id });
  });
};
