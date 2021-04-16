
'use strict';


const $ = require('nodeca.core/lib/parser/cheequery');


module.exports = function (N) {

  async function check(env) {
    if (env.data.topic.hid === 205897) {
      let ast         = $.parse(env.data.parse_result.html);
      let attachments = ast.find('.attach').length;

      if (attachments > 0) {
        throw {
          code: N.io.CLIENT_ERROR,
          message: env.t('@users.rco_restrict_images.err_attachments_forbidden')
        };
      }
    }
  }


  N.wire.after('server:forum.topic.post.reply', { priority: 5 }, async function forbid_attachments_in_topic(env) {
    await check(env);
  });

  N.wire.after('server:forum.topic.post.edit.update', { priority: 5 }, async function forbid_attachments_in_topic(env) {
    await check(env);
  });
};
