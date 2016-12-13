
'use strict';


module.exports = function (N) {

  N.wire.after('server:forum.topic', function append_ads(env) {
    env.res.posts_list_after_post = env.res.posts_list_after_post || [];

    env.res.posts_list_after_post.push('ads');
  });
};
