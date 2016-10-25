// Remove avatar on `bad_profile_image` infraction
//
'use strict';


module.exports = function (N) {

  N.wire.on('internal:users.infraction.add', function* delete_avatar_after_infraction(infraction) {
    if (infraction.type !== 'bad_profile_image') return;

    let user = yield N.models.users.User.findById(infraction.for);

    if (!user || !user.avatar_id) return;

    yield N.models.users.User.update({ _id: user._id }, { $unset: { avatar_id: null } });

    yield N.models.core.File.remove(user.avatar_id, true);
  });
};
