---
title: "Xây hệ thống donate realtime với VietQR như thế nào"
description: "Kiến trúc thực tế của một hệ thống donate realtime: từ tạo mã VietQR, đối soát giao dịch ngân hàng, đến đẩy alert lên màn hình stream bằng WebSocket — kinh nghiệm từ VietDon."
pubDate: 2026-06-02
heroImage: /og-image.png
heroImageAlt: "Kiến trúc hệ thống donate realtime với VietQR"
tags: ["VietQR", "Realtime", "WebSocket", "Backend", "FastAPI", "Redis", "VietDon"]
keywords: "VietQR là gì, donate realtime, WebSocket donate alert, đối soát giao dịch ngân hàng, FastAPI WebSocket, Redis pub/sub, hệ thống donate Việt Nam"
---

Một trong những phần thú vị nhất khi xây [VietDon](/vietdon/) là làm cho donate **hiển thị realtime**: người xem quét mã VietQR, chuyển tiền xong, và alert bật lên màn hình stream chỉ trong vài giây. Bài này mình kể lại kiến trúc đứng sau luồng đó.

## VietQR là gì và vì sao chọn nó

**VietQR** là chuẩn QR code thanh toán liên ngân hàng tại Việt Nam, do Napas và các ngân hàng triển khai. Người dùng chỉ cần mở app ngân hàng, quét mã, số tiền và nội dung đã được điền sẵn. Với donate, đây là trải nghiệm lý tưởng: **không thẻ, không đăng ký, không phí ẩn** — đúng tinh thần "nhanh và quen thuộc" mình muốn.

Điểm mấu chốt là **nội dung chuyển khoản**: mỗi giao dịch donate được gắn một mã định danh duy nhất (ví dụ `VD7F3K`) nằm trong nội dung. Nhờ đó hệ thống biết khoản tiền vừa về là của ai, cho creator nào.

## Luồng xử lý tổng quát

```
Viewer quét VietQR
   │
   ▼
Chuyển khoản (nội dung: mã donate)
   │
   ▼
Webhook/đối soát từ cổng thanh toán  ──►  Backend xác nhận giao dịch
   │
   ▼
Ghi DB + publish event (Redis pub/sub)
   │
   ▼
WebSocket đẩy alert  ──►  Overlay trên màn hình stream
```

## Các thành phần chính

### 1. Sinh mã VietQR

Khi viewer bấm donate, backend tạo một bản ghi giao dịch ở trạng thái `pending`, sinh mã định danh và dựng chuỗi VietQR tương ứng (theo chuẩn EMVCo). Frontend render mã này thành QR.

### 2. Nhận và đối soát giao dịch

Tiền về tài khoản creator được xác nhận qua webhook từ cổng thanh toán (hoặc đối soát định kỳ). Backend khớp **nội dung chuyển khoản** với mã định danh để chuyển giao dịch từ `pending` sang `success`. Bước này cần idempotent — cùng một thông báo có thể đến nhiều lần, và mình không được cộng tiền hai lần.

### 3. Phát sự kiện realtime

Khi giao dịch `success`, backend **publish** một event lên **Redis pub/sub**. Cơ chế này cho phép tách rời phần xử lý thanh toán và phần đẩy thông báo — dễ scale ra nhiều tiến trình.

### 4. Đẩy alert qua WebSocket

Một service WebSocket (mình dùng **FastAPI** với `websockets`) subscribe các event từ Redis và đẩy xuống overlay mà creator nhúng vào OBS. Alert hiện tên người donate, số tiền và lời nhắn — gần như tức thì.

## Những điểm dễ sai

- **Idempotency**: luôn coi webhook có thể bị lặp. Dùng khoá duy nhất theo mã giao dịch.
- **Bảo mật webhook**: xác thực chữ ký từ cổng thanh toán, đừng tin dữ liệu đầu vào.
- **Khớp nội dung "lỏng"**: người dùng đôi khi gõ thiếu/thừa ký tự. Cần chuẩn hoá và so khớp linh hoạt.
- **Reconnect WebSocket**: overlay phải tự kết nối lại khi mạng chập chờn, nếu không creator sẽ mất alert.

## Tạm kết

Realtime nghe "ảo diệu" nhưng bản chất là vài mảnh ghép quen thuộc: một hàng đợi sự kiện (Redis), một kênh đẩy (WebSocket) và kỷ luật về tính nhất quán dữ liệu. Mình viết thêm về cách [Redis caching trong Django](/blog/redis-caching-django/) ở bài khác. Nếu muốn xem sản phẩm hoàn chỉnh, ghé [VietDon](/vietdon/).
