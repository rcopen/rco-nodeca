// Freeze users who didn't visit the forum for 180 days
//
'use strict';


module.exports = function (N) {
  N.wire.on('init:jobs', function users_freeze() {
    const task_name = 'users_freeze';

    if (!N.config.cron || !N.config.cron[task_name]) {
      return new Error(`No config defined for cron task "${task_name}"`);
    }

    N.queue.registerTask({
      name: task_name,
      pool: 'hard',
      cron: N.config.cron[task_name],
      async process() {
        try {
          let groups = [
            await N.models.users.UserGroup.findIdByName('vb_imported'),
            await N.models.users.UserGroup.findIdByName('incomplete_profile'),
            await N.models.users.UserGroup.findIdByName('just_registered'),
            await N.models.users.UserGroup.findIdByName('novices'),
            await N.models.users.UserGroup.findIdByName('members')
          ];

          let users = await N.models.users.User.find()
                                .where('usergroups').in(groups)
                                .where('last_active_ts').lt(new Date(Date.now() - 180 * 86400 * 1000))
                                .lean(true);

          for (let user of users) {
            let usergroups = user.usergroups;
            let grp_frozen = await N.models.users.UserGroup.findIdByName('frozen');
            let groups_to_remove = groups.concat([ grp_frozen ]).map(String);

            // remove old groups, and make sure new group isn't already present
            usergroups = user.usergroups.filter(group =>
                             !groups_to_remove.includes(String(group)));

            usergroups.push(grp_frozen);

            await N.models.users.User.updateOne({ _id: user._id }, { $set: { usergroups } });
          }

        } catch (err) {
          // don't propagate errors because we don't need automatic reloading
          N.logger.error('"%s" job error: %s', task_name, err.message || err);
        }
      }
    });
  });
};
