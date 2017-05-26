
'use strict';

const _  = require('lodash');


// Submit button handler
//
N.wire.on(module.apiPath + ':submit', function update_user(form) {
  let data = _.assign({ user_hid: form.$this.data('user-hid') }, form.fields);

  return N.io.rpc('admin.users.members.edit.update', data)
    .then(() => N.wire.emit('notify.info', t('saved')));
});
