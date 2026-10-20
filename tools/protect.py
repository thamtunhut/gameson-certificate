#!/usr/bin/env python3
"""Khoá quyền chỉnh sửa PDF (owner password, AES-128). Mở/xem/in bình thường, không cần mật khẩu.
Dùng:  OWNER_PW='...' python3 tools/protect.py <thư mục PDF nguồn> <thư mục PDF đã khoá>
Mật khẩu owner KHÔNG được lưu trong repo — giữ riêng để sau này mở khoá/chỉnh sửa.
Quyền cho phép: in (kể cả chất lượng cao) + trình đọc màn hình. Cấm: sửa nội dung, sao chép chữ, ghi chú, form, ghép/xoá trang.
"""
import os, sys, glob
import pymupdf

src, dst = sys.argv[1], sys.argv[2]
pw = os.environ.get("OWNER_PW")
if not pw or len(pw) < 12:
    sys.exit("Thiếu OWNER_PW (>= 12 ký tự)")
os.makedirs(dst, exist_ok=True)
perm = pymupdf.PDF_PERM_PRINT | pymupdf.PDF_PERM_PRINT_HQ | pymupdf.PDF_PERM_ACCESSIBILITY
files = sorted(glob.glob(os.path.join(src, "*.pdf")))
for f in files:
    d = pymupdf.open(f)
    out = os.path.join(dst, os.path.basename(f))
    d.save(out, encryption=pymupdf.PDF_ENCRYPT_AES_128, owner_pw=pw, user_pw="", permissions=perm, garbage=4, deflate=True)
    d.close()
print(f"OK: khoá {len(files)} file -> {dst}")
