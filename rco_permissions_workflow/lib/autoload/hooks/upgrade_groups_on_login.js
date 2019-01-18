// When user is logging in, launch group upgrade
//

'use strict';


module.exports = function (N) {

  N.wire.after('internal:users.login', async function unfreeze_and_group_upgrade(env) {
    await N.wire.emit('internal:users.group_upgrade', { user_id: env.data.user._id });
  });
};
