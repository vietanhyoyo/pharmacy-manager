# Storefront service

NestJS service phục vụ web thương mại điện tử. Luồng: HTTP controller → feature service → repository → Prisma → MySQL `pharmacy_manager`. Service dùng chung database với inventory, không tự chạy migration; schema Prisma được đồng bộ từ `inventory/prisma/schema.prisma`. Migration vẫn thuộc inventory service.

## API

Prefix: `/api/v1/storefront`. Gateway chuyển tiếp namespace này đến port 3003.

- `GET /health`: health check.
- `GET /branches`: chi nhánh đang nhận đơn.
- `GET /categories?branchId=`: danh mục OTC có hàng tại kho bán của chi nhánh.
- `GET /products?branchId=&search=&category=&page=`: danh sách 12 sản phẩm/trang theo chi nhánh.
- `GET /products/:slug?branchId=`: chi tiết và tồn khả dụng tại chi nhánh.
- `POST /orders`: tạo yêu cầu đặt hàng khách vãng lai. Body có `idempotencyKey` UUID, `branchId`, `customer`, `delivery`, `items`.
- `GET /orders/track?number=&phone=`: trả trạng thái đơn khi mã và số điện thoại khớp.
- `GET /admin/branches`, `GET /admin/orders`, `GET /admin/orders/:id`: dữ liệu quản trị có xác thực, lọc theo chi nhánh.
- `POST /admin/orders/:id/{confirm,dispatch,complete,cancel}`: xử lý vòng đời đơn.

Service lấy tổ chức từ `STOREFRONT_ORGANIZATION_CODE`, mặc định `PHARMACY_DEMO`, không chấp nhận tenant ID từ request. Sản phẩm bán cần `products.status=ACTIVE`, `prescription_type=OTC`, listing `PUBLISHED`, giá price list đang hoạt động, và tồn kho khả dụng tại chi nhánh. Thuốc kê đơn không hiển thị và không thể đặt qua API này.

Tạo đơn tính lại giá từ database, kiểm tra số lượng và tồn kho tại kho bán đầu tiên của chi nhánh, rồi ghi customer, order, order lines, event trong transaction Serializable. `idempotencyKey` tránh tạo đơn lặp khi client gửi lại. Đơn `PLACED` chờ nhân viên xác nhận. API admin xác thực qua Auth/Kafka và chỉ đọc hoặc cập nhật đơn thuộc tổ chức, chi nhánh được phép truy cập. Tra cứu công khai cần đồng thời mã đơn và số điện thoại người nhận; không trả chi tiết cá nhân.

Storefront sở hữu trạng thái `PLACED → CONFIRMED → SHIPPED → COMPLETED` hoặc `CANCELLED`, lịch sử và shipment. Trong lúc gọi inventory, đơn chuyển sang `PROCESSING` cùng ghi chú thao tác; admin có thể tiếp tục đúng thao tác đó nếu kết nối bị gián đoạn. Inventory sở hữu `inventory_balances`, `inventory_reservations` và `inventory_movements`; storefront gọi API nội bộ có shared secret để giữ, trả hoặc xuất tồn. Giữ hàng phân bổ theo lô hết hạn sớm trước; xác nhận và hủy không trừ tồn thực tế. Giao hàng tiêu thụ phiếu giữ, trừ tồn và ghi movement loại `SALE` trong cùng transaction kho. Các thao tác kho có thể gọi lại an toàn nếu phản hồi giữa hai service bị gián đoạn. Thanh toán COD được đánh dấu đã trả khi admin hoàn tất giao hàng; chưa có tích hợp cổng thanh toán hoặc vận chuyển ngoài.

`SEED_DEMO_DATA=true` chỉ thêm listing OTC và bảng giá mẫu cho danh sách SKU demo cố định khi chưa có bản ghi tương ứng. Seed không tự xuất bản sản phẩm mới do quản trị viên thêm sau này. Tắt seed cho dữ liệu thật và quản lý listing/giá theo quy trình riêng. Giá mẫu không phản ánh giá bán thực tế.

## Chạy

`npm ci && npm run build && npm start` hoặc `npm run dev`. Cấu hình DB giống inventory: `DATABASE_URL` hoặc `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Cấu hình thêm `KAFKA_RPC_URL`, `INVENTORY_SERVICE_URL`, `INTERNAL_SERVICE_SECRET`. `PORT` mặc định 3003.
