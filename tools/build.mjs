// Dùng: node tools/build.mjs "<thư mục chứa các file 'NNN - Ten.pdf'>" [--new-salt]
// Cần tools/names.json: [{"stt":1,"name":"Đặng Phương Nam"}, ...]  (file này KHÔNG được commit)
// Kết quả: certs/<hash>.pdf  +  data/index.js  (chỉ chứa hash, không chứa tên)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { canonical } = require(path.join(root, 'assets/js/normalize.js'));

const src = process.argv[2];
if (!src) { console.error('Thiếu đường dẫn thư mục PDF nguồn'); process.exit(1); }
const people = JSON.parse(fs.readFileSync(path.join(root, 'tools/names.json'), 'utf8'));

const certsDir = path.join(root, 'certs');
fs.mkdirSync(certsDir, { recursive: true });

// Giữ nguyên salt cũ (link/hash ổn định khi chỉ thay nội dung PDF); thêm --new-salt để đổi salt.
let salt = crypto.randomBytes(8).toString('hex');
const idx = path.join(root, 'data/index.js');
if (!process.argv.includes('--new-salt') && fs.existsSync(idx)) {
  const m = /"salt":\s*"([0-9a-f]+)"/.exec(fs.readFileSync(idx, 'utf8'));
  if (m) salt = m[1];
}
const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 32);
const pdfs = fs.readdirSync(src).filter((f) => /^\d+ - .+\.pdf$/i.test(f));
const seen = new Map();
const files = [];
for (const p of people) {
  const prefix = String(p.stt).padStart(3, '0') + ' - ';
  const match = pdfs.filter((f) => f.startsWith(prefix));
  if (match.length !== 1) throw new Error(`STT ${p.stt}: tìm thấy ${match.length} file PDF`);
  const key = canonical(p.name);
  if (seen.has(key)) throw new Error(`Trùng tên sau khi chuẩn hoá: "${p.name}" và "${seen.get(key)}"`);
  seen.set(key, p.name);
  const h = sha(salt + '|' + key);
  fs.copyFileSync(path.join(src, match[0]), path.join(certsDir, h + '.pdf'));
  files.push(h);
}
// Xoá PDF cũ không còn trong danh sách (sau khi đã copy xong)
const keep = new Set(files.map((h) => h + '.pdf'));
for (const f of fs.readdirSync(certsDir)) if (f.endsWith('.pdf') && !keep.has(f)) fs.unlinkSync(path.join(certsDir, f));
fs.writeFileSync(path.join(root, 'data/index.js'),
  `/* Tự sinh bởi tools/build.mjs — không chứa họ tên, chỉ chứa mã băm. */\nwindow.CERT_INDEX = ${JSON.stringify({ salt, files }, null, 1)};\n`);
console.log(`OK: ${files.length} giấy chứng nhận -> certs/`);
