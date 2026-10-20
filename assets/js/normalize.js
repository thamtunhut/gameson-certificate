/*
 * Chuẩn hoá họ tên để tra cứu: không phân biệt hoa/thường, vẫn phân biệt dấu tiếng Việt.
 * Dùng chung cho trình duyệt (app.js) và Node (tools/build.mjs) để hash luôn khớp nhau.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NameNormalizer = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var T = '[\\u0300\\u0301\\u0303\\u0309\\u0323]'; // huyền, sắc, ngã, hỏi, nặng
  // Cùng một dấu nhưng đặt kiểu cũ/mới: hòa/hoà, thúy/thuý, khỏe/khoẻ -> quy về đặt dấu ở nguyên âm thứ 2.
  var RE_TONE = new RegExp('(?:(o)(' + T + ')([ae])|(u)(' + T + ')(y))(?![\\u0302\\u0306\\u031B])', 'g');

  function canonical(input) {
    var s = String(input == null ? '' : input)
      .replace(/[​-‍﻿]/g, '')
      .replace(/[\s ]+/g, ' ')
      .trim()
      .normalize('NFC')
      .toLowerCase()
      .normalize('NFD')
      .replace(RE_TONE, function (m, a, t1, b, c, t2, d) {
        return a ? a + b + t1 : c + d + t2;
      });
    return s.normalize('NFC');
  }

  function noAccent(input) {
    return String(input == null ? '' : input)
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function titleCase(input) {
    return String(input == null ? '' : input).replace(/[\s ]+/g, ' ').trim().normalize('NFC')
      .toLowerCase().split(' ').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }

  return { canonical: canonical, noAccent: noAccent, titleCase: titleCase };
});
