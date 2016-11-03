// Add confirmation dialog with rules regarding the avatar/photo
//

'use strict';


N.wire.before('users.avatar.change', function add_photo_rules() {
  return N.wire.emit('common.blocks.confirm', t('confirm_text'));
});
