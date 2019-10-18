
'use strict';

const SCRIPT_NOT_LOADED = 0;
const SCRIPT_LOADING    = 1;
const SCRIPT_LOADED     = 2;

let ya_script_status = SCRIPT_NOT_LOADED;
let scrolling = false;
let after_scroll = [];


function remove_block($tag) {
  let scroll_top = $(window).scrollTop();
  let window_center = scroll_top + $(window).height() / 2;
  let tag_height = $tag.outerHeight(true);
  let tag_bottom = $tag.offset().top + tag_height;

  $tag.remove();

  if (window_center > tag_bottom) {
    $(window).scrollTop(scroll_top - tag_height);
  }
}


function render_rtb($tag) {
  let blockId    = $tag.data('rtb-id');
  let pageNumber = $tag.data('page-number');
  let renderTo   = $tag.data('render-to');

  // callback function called when ads are loaded
  return function () {
    window.Ya.Context.AdvManager.render({
      blockId,
      renderTo,
      pageNumber,
      async: true
    }, function () {
      // failure to load ads, remove block
      if (scrolling) after_scroll.push(() => remove_block($tag));
      else remove_block($tag);
    });
  };
}


function append_ads(selector) {
  selector.find('.rcdad').addBack('.rcdad').each(function () {
    let $tag = $(this);

    window.yandexContextAsyncCallbacks = window.yandexContextAsyncCallbacks || [];

    let fn = render_rtb($tag);

    switch (ya_script_status) {
      case SCRIPT_NOT_LOADED:
        let script = document.createElement('script');

        script.src = 'https://an.yandex.ru/system/context.js';
        script.type = 'text/javascript';
        script.async = true;

        document.getElementsByTagName('head')[0].appendChild(script);

        ya_script_status = SCRIPT_LOADING;

        script.onload = () => { ya_script_status = SCRIPT_LOADED; };

        window.yandexContextAsyncCallbacks = window.yandexContextAsyncCallbacks || [];
        window.yandexContextAsyncCallbacks.push(fn);
        break;

      case SCRIPT_LOADING:
        window.yandexContextAsyncCallbacks = window.yandexContextAsyncCallbacks || [];
        window.yandexContextAsyncCallbacks.push(fn);
        break;

      case SCRIPT_LOADED:
        fn();
        break;
    }
  });
}


N.wire.once('navigate.done', function init_scroll_tracker() {
  let timeout_id;

  function on_scroll_stop() {
    scrolling = false;
    for (let fn of after_scroll) fn();
    after_scroll = [];
  }

  $(window).on('scroll', function () {
    scrolling = true;
    clearTimeout(timeout_id);
    timeout_id = setTimeout(on_scroll_stop, 300);
  });
});


N.wire.on('navigate.done:forum.topic', function append_ads_on_load() {
  append_ads($(document));
});


N.wire.on('navigate.exit', function cleanup_callbacks() {
  window.yandexContextAsyncCallbacks = [];
});
