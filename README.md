# Tra cứu Giấy chứng nhận TNV — Games On: Hải Phòng 2026

Site tĩnh (HTML/CSS/JS thuần, không build, không dependency). Tình nguyện viên nhập đúng họ tên (có dấu, không phân biệt hoa/thường) → tải PDF của mình.

## Deploy GitHub Pages
1. Tạo repo, push **toàn bộ nội dung thư mục này** (kèm `certs/` ~134MB và `.nojekyll`).
2. Settings → Pages → Deploy from branch → `main` / root.
3. Không push `tools/names.json` (đã có trong `.gitignore`), cũng không push file Excel/PDF gốc có tên người.

## Bảo mật tên (repo public)
- PDF được đổi tên thành `certs/<hash>.pdf`; `data/index.js` chỉ chứa mã băm SHA-256 (có salt), **không chứa họ tên**.
- Không ai liệt kê được danh sách tên từ repo, nhưng ai đoán đúng họ tên thì vẫn tải được (đúng mục đích của site). Đây là bảo vệ mức "khó dò", không phải xác thực.
- Trang có `noindex` để công cụ tìm kiếm không index.

## Quy tắc khớp tên (`assets/js/normalize.js`)
- Bỏ khoảng trắng thừa, không phân biệt hoa/thường, **vẫn phân biệt dấu** (Luân ≠ Luan).
- Hai kiểu đặt dấu thanh được coi là một: thuỳ/thùy, hoà/hòa, khoẻ/khỏe.

## Cập nhật danh sách / PDF
1. Sửa `tools/names.json` (`[{"stt":1,"name":"..."}]`) và chuẩn bị thư mục chứa các PDF dạng `NNN - Ten.pdf`.
2. Chạy `node tools/build.mjs "<thư mục PDF>"` → sinh lại `certs/` và `data/index.js` (salt mới mỗi lần).

## Hình ảnh nhận diện (tuỳ chọn)
Site vẫn hiển thị tốt khi thiếu ảnh (tự ẩn hoặc thay bằng chữ). Để đồng bộ với trang sự kiện, lưu các file sau vào `assets/img/` (lấy từ https://vnggames.com/games-on-hai-phong-2026/_astro/):

- `games-on-logo.webp` ← games-on-logo.Dih5JDx5_k7lJP.webp
- `vnggames-logo-black.svg` ← vnggames-logo-black.BBmx4TNk_FqmVx.svg
- `hero-kv-desktop.webp` ← hero-kv.D8YNPVES_ZH7LgY.webp (1280w)
- `hero-kv-mobile.webp` ← hero-kv-mobile.um-ZkncZ_ZmqjmG.webp (780w)

Tên file có hash có thể đổi nếu trang gốc được build lại — lấy URL mới từ tab Network của trình duyệt.
