
'use strict';

const SCRIPT_NOT_LOADED = 0;
const SCRIPT_LOADING    = 1;
const SCRIPT_LOADED     = 2;

let ya_script_status = SCRIPT_NOT_LOADED;


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
      let scroll_top = $(window).scrollTop();
      let tag_height = $tag.height();
      let window_center = scroll_top + $(window).height() / 2;
      let tag_bottom = $tag.offset().top + tag_height;

      $tag.remove();

      if (window_center > tag_bottom) {
        $(window).scrollTop(scroll_top - tag_height);
      }
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
        $('head').append('<script src="http://an.yandex.ru/system/context.js" type="text/javascript" async></script>');
        ya_script_status = SCRIPT_LOADING;

        window.yandexContextAsyncCallbacks = window.yandexContextAsyncCallbacks || [];
        window.yandexContextAsyncCallbacks.push(() => { ya_script_status = SCRIPT_LOADED; });
        window.yandexContextAsyncCallbacks.push(fn);
        break;

      case SCRIPT_LOADING:
        window.yandexContextAsyncCallbacks = window.yandexContextAsyncCallbacks || [];
        window.yandexContextAsyncCallbacks.push(fn);
        break;

      case SCRIPT_LOADED:
        // delay loading until it is inserted to the DOM
        setTimeout(fn, 1);
        break;
    }
  });
}


N.wire.on('navigate.done', function append_ads_on_load() {
  append_ads($(document));
});


N.wire.on('navigate.update', function append_ads_on_update(data) {
  append_ads(data.$);
});
