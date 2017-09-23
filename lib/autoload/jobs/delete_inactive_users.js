// Remove users who didn't post anything
//

'use strict';

const _       = require('lodash');


module.exports = function (N) {
  N.wire.on('init:jobs', function delete_inactive_users() {
    const task_name = 'delete_inactive_users';

    if (!N.config.cron || !N.config.cron[task_name]) {
      return new Error(`No config defined for cron task "${task_name}"`);
    }

    N.queue.registerTask({
      name: task_name,
      pool: 'hard',
      cron: N.config.cron[task_name],
      async process() {
        try {
          let users = [];

          for (let usergroup of Object.keys(N.config.delete_inactive_users)) {
            let usergroup_id = await N.models.users.UserGroup.findIdByName(usergroup);
            let period = N.config.delete_inactive_users[usergroup];

            users = users.concat(
              await N.models.users.User.find()
                        .where('usergroups').equals(usergroup_id)
                        .where('last_active_ts').lt(new Date(Date.now() - period * 86400 * 1000))
                        .where('active').equals(false)
                        .lean(true)
            );
          }

          // don't delete users if they are members of those usergroups
          // (shouldn't happen, but just in case)
          let important_usergroups = {};

          important_usergroups[await N.models.users.UserGroup.findIdByName('administrators')] = true;
          important_usergroups[await N.models.users.UserGroup.findIdByName('moderators')] = true;

          for (let user of _.uniqBy(users, u => String(u._id))) {
            if (user.usergroups.some(group => important_usergroups[group])) continue;

            await N.models.users.User.findById(user._id).remove();
          }

        } catch (err) {
          // don't propagate errors because we don't need automatic reloading
          N.logger.error('"%s" job error: %s', task_name, err.message || err);
        }
      }
    });
  });
};
