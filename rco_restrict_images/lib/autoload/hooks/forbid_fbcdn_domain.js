
'use strict';


const $ = require('nodeca.core/lib/parser/cheequery');


module.exports = function (N) {

  async function check(env) {
    if (!env.data.parse_result.html.includes('fbcdn.net')) return;

    let ast = $.parse(env.data.parse_result.html);

    ast.find('.image').each((__, img) => {
      let url = new URL($(img).attr('src'));

      if (url.hostname.endsWith('.fbcdn.net') &&
          url.searchParams.has('oh') /* oh - signed hash */ &&
          url.searchParams.has('oe') /* oe - expiry date */) {

        throw {
          code: N.io.CLIENT_ERROR,
          message: env.t('@users.rco_restrict_images.err_fbcdn_image_forbidden')
        };
      }
    });

    ast.find('.link-ext').each((__, link) => {
      let url = new URL($(link).attr('href'));

      if (url.hostname.endsWith('.fbcdn.net') &&
          url.searchParams.has('oh') /* oh - signed hash */ &&
          url.searchParams.has('oe') /* oe - expiry date */) {

        throw {
          code: N.io.CLIENT_ERROR,
          message: env.t('@users.rco_restrict_images.err_fbcdn_link_forbidden')
        };
      }
    });
  }


  //
  // Forum
  //
  N.wire.after('server:forum.topic.create', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });

  N.wire.after('server:forum.topic.post.reply', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });

  N.wire.after('server:forum.topic.post.edit.update', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });


  //
  // Blogs
  //
  N.wire.after('server:blogs.entry.create', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });

  N.wire.after('server:blogs.entry.edit.update', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });

  N.wire.after('server:blogs.entry.comment.reply', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });

  N.wire.after('server:blogs.entry.comment.edit.update', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });


  //
  // Clubs
  //
  N.wire.after('server:clubs.topic.create', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });

  N.wire.after('server:clubs.topic.post.reply', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });

  N.wire.after('server:clubs.topic.post.edit.update', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });


  //
  // Market
  //
  N.wire.before('server:market.new.create_offer', { priority: -5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });

  N.wire.before('server:market.new.create_wish', { priority: -5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });

  N.wire.before('server:market.item.buy.edit.update', { priority: -5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });

  N.wire.before('server:market.item.wish.edit.update', { priority: -5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });


  //
  // Users (dialogs, albums)
  //
  N.wire.after('server:users.dialog.create', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });

  N.wire.after('server:users.dialog.reply', { priority: 5 }, async function forbid_fbcdn_domain(env) {
    await check(env);
  });
};
