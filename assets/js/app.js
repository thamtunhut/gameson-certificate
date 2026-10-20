(function () {
  'use strict';
  var N = window.NameNormalizer;
  var INDEX = window.CERT_INDEX || { salt: '', files: [] };
  var known = {};
  INDEX.files.forEach(function (h) { known[h] = true; });

  var form = document.getElementById('lookup-form');
  var input = document.getElementById('fullname');
  var btn = document.getElementById('submit-btn');
  var out = document.getElementById('result');

  // ---- SHA-256: dùng Web Crypto; fallback JS thuần khi trang chạy trên HTTP không an toàn ----
  function utf8(str) { return new TextEncoder().encode(str); }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function sha256Fallback(bytes) {
    var K = [], H = [], i, j, p = 2, n = 0;
    function frac(x) { return ((x - Math.floor(x)) * 4294967296) | 0; }
    while (n < 64) { var prime = true; for (i = 2; i * i <= p; i++) if (p % i === 0) { prime = false; break; }
      if (prime) { if (n < 8) H[n] = frac(Math.pow(p, .5)); K[n++] = frac(Math.pow(p, 1 / 3)); } p++; }
    var l = bytes.length, words = [], bitLen = l * 8;
    for (i = 0; i < l; i++) words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
    words[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    var total = (((l + 8) >> 6) << 4) + 16;
    for (i = 0; i < total; i++) words[i] = words[i] | 0;
    words[total - 1] = bitLen;
    for (j = 0; j < words.length; j += 16) {
      var w = words.slice(j, j + 16), a = H.slice(0);
      for (i = 0; i < 64; i++) {
        if (i >= 16) { var w15 = w[i - 15], w2 = w[i - 2];
          w[i] = (w[i - 16] + (((w15 >>> 7) | (w15 << 25)) ^ ((w15 >>> 18) | (w15 << 14)) ^ (w15 >>> 3)) + w[i - 7] + (((w2 >>> 17) | (w2 << 15)) ^ ((w2 >>> 19) | (w2 << 13)) ^ (w2 >>> 10))) | 0; }
        var e = a[4], ch = (e & a[5]) ^ (~e & a[6]), aa = a[0], maj = (aa & a[1]) ^ (aa & a[2]) ^ (a[1] & a[2]);
        var t1 = (a[7] + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ch + K[i] + w[i]) | 0;
        var t2 = ((((aa >>> 2) | (aa << 30)) ^ ((aa >>> 13) | (aa << 19)) ^ ((aa >>> 22) | (aa << 10))) + maj) | 0;
        a = [(t1 + t2) | 0, a[0], a[1], a[2], (a[3] + t1) | 0, a[4], a[5], a[6]];
      }
      for (i = 0; i < 8; i++) H[i] = (H[i] + a[i]) | 0;
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }
  function sha256(str) {
    var bytes = utf8(str);
    if (window.crypto && crypto.subtle) return crypto.subtle.digest('SHA-256', bytes).then(hex);
    return Promise.resolve(sha256Fallback(Array.prototype.slice.call(bytes)));
  }

  function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function show(html) { out.innerHTML = html; }

  function found(display, file) {
    var dlName = 'Giay chung nhan TNV - ' + N.noAccent(display) + '.pdf';
    show(
      '<div class="res res--ok">' +
        '<p class="res__title">Đã tìm thấy giấy chứng nhận!</p>' +
        '<p class="res__name">' + esc(display) + '</p>' +
        '<div class="res__actions">' +
          '<a class="btn btn--dl" href="' + file + '" download="' + esc(dlName) + '"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v13M6 11l6 6 6-6M4 21h16"/></svg><span>TẢI GIẤY CHỨNG NHẬN (PDF)</span></a>' +
          '<a class="btn btn--ghost" href="' + file + '" target="_blank" rel="noopener">XEM TRƯỚC</a>' +
        '</div>' +
      '</div>');
  }

  function notFound() {
    show(
      '<div class="res res--err">' +
        '<p class="res__title">Chưa tìm thấy tên này</p>' +
        '<p class="res__msg">Hãy kiểm tra lại họ và tên <b>đầy đủ, có dấu tiếng Việt</b> (ví dụ: Nguyễn Văn A). ' +
        'Nếu vẫn không tra cứu được, vui lòng liên hệ Ban tổ chức.</p>' +
      '</div>');
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var raw = input.value;
    var key = N.canonical(raw);
    if (!key) {
      input.setAttribute('aria-invalid', 'true');
      show('<div class="res res--err"><p class="res__title">Vui lòng nhập họ và tên</p></div>');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    btn.disabled = true;
    sha256(INDEX.salt + '|' + key).then(function (h) {
      var hash = h.slice(0, 32);
      if (known[hash]) found(N.titleCase(raw), 'certs/' + hash + '.pdf');
      else { input.setAttribute('aria-invalid', 'true'); notFound(); }
    }).catch(function () {
      show('<div class="res res--err"><p class="res__title">Có lỗi xảy ra</p><p class="res__msg">Vui lòng tải lại trang và thử lại.</p></div>');
    }).then(function () { btn.disabled = false; });
  });

  input.addEventListener('input', function () { input.removeAttribute('aria-invalid'); if (out.firstChild) show(''); });
})();
