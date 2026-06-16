---
title: "Tối ưu PostgreSQL cho ứng dụng backend: 7 điều mình luôn kiểm tra"
description: "Bảy kỹ thuật tối ưu PostgreSQL mình áp dụng cho mọi dự án backend: index đúng chỗ, EXPLAIN ANALYZE, tránh N+1, connection pool, VACUUM và cache. Kinh nghiệm thực tế."
pubDate: 2026-06-10
heroImage: /og-image.png
heroImageAlt: "Tối ưu PostgreSQL cho backend"
tags: ["PostgreSQL", "Database", "Tối ưu", "Backend", "Performance"]
keywords: "tối ưu PostgreSQL, postgresql index, explain analyze, n+1 query, connection pool postgresql, tăng tốc database, postgresql performance tuning"
---

Backend chậm, chín trên mười lần là do **database**. Trong kỳ thực tập ở Rikai mình từng kéo một truy vấn routing từ **33 giây xuống 1.2 giây**, và phần lớn cải thiện đến từ database chứ không phải code. Dưới đây là 7 điều mình luôn kiểm tra với **PostgreSQL**.

## 1. Index đúng chỗ (chứ không phải mọi chỗ)

Index tăng tốc đọc nhưng làm chậm ghi và tốn dung lượng. Hãy index những cột **thường xuất hiện trong `WHERE`, `JOIN`, `ORDER BY`**. Với truy vấn lọc nhiều điều kiện, **composite index** đúng thứ tự cột quan trọng hơn việc tạo nhiều index rời rạc.

## 2. Luôn đọc EXPLAIN ANALYZE

Đừng đoán. Chạy:

```sql
EXPLAIN ANALYZE
SELECT * FROM donations WHERE creator_id = 42 AND status = 'success';
```

Nhìn vào `Seq Scan` (quét toàn bảng — thường là dấu hiệu thiếu index) so với `Index Scan`. Để ý số rows ước lượng và thực tế lệch nhau bao nhiêu.

## 3. Diệt N+1 query

Đây là lỗi kinh điển khi dùng ORM. Lặp qua một danh sách rồi mỗi vòng lại query thêm một lần. Với Django, dùng `select_related` (JOIN) và `prefetch_related` (truy vấn gộp):

```python
# N+1: mỗi donation lại query creator
donations = Donation.objects.all()

# Gộp lại còn 1–2 query
donations = Donation.objects.select_related("creator").all()
```

## 4. Chỉ lấy cột cần dùng

`SELECT *` tải về cả những cột bạn không dùng (đặc biệt là các cột `TEXT`/`JSONB` lớn). Dùng `.only()` / `.values()` trong Django, hoặc liệt kê cột rõ ràng trong SQL.

## 5. Connection pool

Mở kết nối mới cho mỗi request rất tốn kém. Dùng **PgBouncer** hoặc connection pool ở tầng ứng dụng để tái sử dụng kết nối — đặc biệt quan trọng khi chạy nhiều worker.

## 6. VACUUM và thống kê

PostgreSQL dùng số liệu thống kê để lập kế hoạch truy vấn. Đảm bảo `autovacuum` hoạt động, và chạy `ANALYZE` sau khi nạp lượng lớn dữ liệu để planner chọn đúng index.

## 7. Cache những gì ít đổi

Truy vấn nhanh nhất là truy vấn không phải chạy. Những dữ liệu đọc nhiều, đổi ít (ví dụ cấu hình trang donate của creator) nên được cache ở **Redis**. Mình viết riêng về điều này trong bài [Redis caching trong Django](/blog/redis-caching-django/).

## Tạm kết

Tối ưu database không phải phép màu mà là kỷ luật: đo trước khi sửa, index có chủ đích, tránh N+1 và cache đúng chỗ. Áp dụng đủ 7 điều trên là bạn đã giải quyết được phần lớn vấn đề hiệu năng thường gặp. Xem thêm bài viết khác tại [blog của Mai Quốc Việt](/blog/).
