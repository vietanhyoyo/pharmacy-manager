# Pharmacy Manager

Pharmacy Manager là hệ thống quản lý thuốc và kho cho nhà thuốc có nhiều chi nhánh. Hệ thống gồm trang quản trị cho nhân viên và website để khách hàng xem, đặt thuốc, theo dõi đơn hàng.

## Hệ thống giúp bạn

- Quản lý chi nhánh, kho, thuốc, nhà cung cấp và lô thuốc.
- Theo dõi số lượng tồn, thuốc sắp hết hạn và lịch sử nhập xuất.
- Tạo phiếu nhập, ghi nhận xuất kho và xem dữ liệu theo từng kho.
- Cho khách chọn chi nhánh, xem thuốc tại chi nhánh đó, đặt hàng và tra cứu đơn.
- Giữ hàng khi đơn được xác nhận; trừ tồn khi hàng được bàn giao cho đơn vị vận chuyển.

## Các ứng dụng

- **Trang quản trị:** http://127.0.0.1:3001
- **Website bán thuốc:** http://127.0.0.1:3004
- **API:** http://127.0.0.1:3000

Backend gồm các dịch vụ xác thực, quản lý kho và bán hàng trực tuyến. Các dịch vụ dùng chung cơ sở dữ liệu MySQL; Kafka hỗ trợ trao đổi nội bộ. Giao diện được xây dựng bằng Next.js, Tailwind CSS và shadcn/ui.

## Chạy hệ thống

1. Sao chép `.env.example` thành `.env` và điền các mật khẩu, khóa bí mật cần thiết.
2. Tại thư mục gốc, chạy:

   ```bash
   docker compose up -d --build
   ```

3. Mở trang quản trị hoặc website ở các địa chỉ phía trên.

Trong môi trường demo, tài khoản quản trị mặc định là `admin` với mật khẩu `admin123456@`. Hãy đổi mật khẩu sau lần đăng nhập đầu tiên. Dữ liệu ứng dụng được lưu trong volume MySQL; `docker compose down` không xóa dữ liệu.

Thông tin phát triển chi tiết nằm trong [hướng dẫn admin](./admin/README.md), [hướng dẫn web](./web/README.md) và [kiến trúc storefront](./server/services/storefront/ARCHITECTURE.md).
