---
title: "Redis caching trong Django: giảm tải database một cách hiệu quả"
description: "Hướng dẫn dùng Redis làm cache trong Django: cấu hình cache backend, cache-aside, cache view và per-site, cùng các chiến lược invalidation để tránh dữ liệu cũ."
pubDate: 2026-06-14
heroImage: /og-image.png
heroImageAlt: "Redis caching trong Django"
tags: ["Redis", "Django", "Cache", "Backend", "Performance"]
keywords: "redis django, django caching, cache-aside, redis cache backend django, django cache invalidation, giảm tải database, tăng tốc django"
---

Sau khi đã [tối ưu PostgreSQL](/blog/toi-uu-postgresql-cho-backend/), bước tiếp theo để hệ thống nhẹ hơn là **cache**. Truy vấn nhanh nhất là truy vấn không phải chạy. Bài này mình chia sẻ cách dùng **Redis** làm cache trong **Django** — cách mình áp dụng cho [VietDon](/vietdon/).

## Vì sao là Redis

Redis là in-memory store cực nhanh, hỗ trợ TTL (tự hết hạn), nhiều cấu trúc dữ liệu và pub/sub. Dùng làm cache thì gần như là lựa chọn mặc định trong thế giới backend hiện nay.

## Cấu hình cache backend

Từ Django 4 trở đi đã có sẵn backend Redis, không cần thư viện ngoài:

```python
# settings.py
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}
```

## Mẫu cache-aside (phổ biến nhất)

Đọc cache trước; nếu miss thì query DB rồi ghi lại cache:

```python
from django.core.cache import cache

def get_creator_page(creator_id: int):
    key = f"creator_page:{creator_id}"
    data = cache.get(key)
    if data is None:
        data = CreatorPage.objects.values().get(creator_id=creator_id)
        cache.set(key, data, timeout=300)  # 5 phút
    return data
```

Đây là mẫu mình dùng cho **trang donate công khai** — dữ liệu đọc rất nhiều nhưng thay đổi ít.

## Cache cả view

Với những trang gần như tĩnh, có thể cache nguyên view:

```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # 15 phút
def public_stats(request):
    ...
```

## Vấn đề khó nhất: invalidation

> "There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton

Cache sai còn tệ hơn không cache. Vài chiến lược mình dùng:

- **TTL ngắn** cho dữ liệu chấp nhận trễ vài phút — đơn giản và an toàn.
- **Xoá cache theo sự kiện**: khi creator cập nhật trang, chủ động `cache.delete(key)`.
- **Versioned key**: nhúng version/`updated_at` vào key để dữ liệu mới có key mới, dữ liệu cũ tự rụng theo TTL.

## Những gì KHÔNG nên cache

- Dữ liệu nhạy cảm hoặc thay đổi liên tục (ví dụ số dư ví realtime — cái này nên đẩy qua [WebSocket](/blog/xay-he-thong-donate-realtime-vietqr/)).
- Dữ liệu mang tính cá nhân nếu không cẩn thận với key — dễ rò rỉ giữa các user.

## Tạm kết

Cache đúng chỗ giúp giảm tải database đáng kể với chi phí rất nhỏ. Bí quyết là: cache những thứ đọc nhiều ghi ít, đặt TTL hợp lý, và có chiến lược invalidation rõ ràng. Đọc thêm các bài backend khác tại [blog của Mai Quốc Việt](/blog/).
