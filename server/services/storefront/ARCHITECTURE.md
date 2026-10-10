# Storefront service

NestJS service phục vụ web thương mại điện tử. Luồng: HTTP controller → feature service → repository → Prisma → MySQL `pharmacy_manager`. Service dùng chung database với inventory, không tự chạy migration; schema Prisma được đồng bộ từ `inventory/prisma/schema.prisma`. Migration vẫn thuộc inventory service.

## API

Prefix: `/api/v1/storefront`. Gateway chuyển tiếp namespace này đến port 3003.

- `GET /health`: health check.
- `GET /categories`: danh mục có sản phẩm OTC đã xuất bản.
- `GET /products?search=&category=&page=`: danh sách 12 sản phẩm/trang.
- `GET /products/:slug`: chi tiết sản phẩm.
- `POST /orders`: tạo yêu cầu đặt hàng khách vãng lai. Body có `idempotencyKey` UUID, `customer`, `delivery`, `items`.

Service lấy tổ chức từ `STOREFRONT_ORGANIZATION_CODE`, mặc định `PHARMACY_DEMO`, không chấp nhận tenant ID từ request. Sản phẩm bán cần `products.status=ACTIVE`, `prescription_type=OTC`, listing `PUBLISHED`, giá price list đang hoạt động, và tồn kho khả dụng tại chi nhánh. Thuốc kê đơn không hiển thị và không thể đặt qua API này.

Tạo đơn tính lại giá từ database, kiểm tra số lượng và tồn kho, rồi ghi customer, order, order lines, event trong transaction Serializable. `idempotencyKey` tránh tạo đơn lặp khi client gửi lại. Không có thanh toán trực tuyến, tài khoản khách, giữ tồn, hay tự động trừ kho. Đơn `PLACED` cần quy trình nhân viên xác nhận. Route không công khai dữ liệu khách/đơn qua GET.

`SEED_DEMO_DATA=true` chỉ thêm listing OTC và bảng giá mẫu cho danh sách SKU demo cố định khi chưa có bản ghi tương ứng. Seed không tự xuất bản sản phẩm mới do quản trị viên thêm sau này. Tắt seed cho dữ liệu thật và quản lý listing/giá theo quy trình riêng. Giá mẫu không phản ánh giá bán thực tế.

## Chạy

`npm ci && npm run build && npm start` hoặc `npm run dev`. Cấu hình DB giống inventory: `DATABASE_URL` hoặc `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. `PORT` mặc định 3003.
