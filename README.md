# Pharmacy Manager

Hệ thống quản lý kho thuốc gồm API Gateway Node.js, auth service Java, Kafka RPC service Node.js, inventory service NestJS, Apache Kafka, MySQL 8.4 và giao diện quản trị Next.js (TypeScript, Tailwind CSS, shadcn/ui, Zustand).

## Chạy nhanh

1. Sao chép `.env.example` thành `.env`, đặt `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `ADMIN_JWT_SECRET` và `INTERNAL_SERVICE_SECRET` (hai secret là chuỗi ngẫu nhiên tối thiểu 32 ký tự). Nếu đã có `.env`, chỉ cần bổ sung biến còn thiếu.
2. Chạy `docker compose up -d --build` tại thư mục gốc.
3. Mở **http://127.0.0.1:3001**. API kiểm tra: **http://127.0.0.1:3000/api/health**.

Tài khoản quản trị mẫu: **admin** / **admin123456@**. Sau khi đăng nhập, dùng mục **Đổi mật khẩu** ở thanh bên. Mật khẩu được băm bằng scrypt; phiên đăng nhập được lưu trong cookie HttpOnly, SameSite Strict với thời hạn 8 giờ. `ADMIN_JWT_SECRET` chỉ nằm ở backend. Cổng MySQL, API và giao diện mặc định chỉ mở trên `127.0.0.1`.

Khi khởi động, container `migrate` chạy migration một lần. Auth service Java khởi tạo tài khoản quản trị và tổ chức demo trước; inventory service sau đó tạo chi nhánh, kho/kệ, nhóm thuốc, đơn vị, nhà cung cấp, thuốc, lô, phiếu nhập và phiếu xuất. Seed có thể chạy lại mà không nhân đôi các bản ghi chính. Đặt `SEED_DEMO_DATA=false` nếu không muốn thêm dữ liệu mẫu vào môi trường mới. Dữ liệu MySQL nằm trong Docker volume `mysql_data`; `docker compose down` không xóa dữ liệu.

## Chức năng quản trị

- Tổng quan: số thuốc, tồn kho, lô sắp hết hạn trong 90 ngày, thuốc tồn thấp, biến động gần đây.
- Tạo/sửa thuốc, nhà cung cấp và lô; thay đổi trạng thái để ngừng sử dụng hoặc khóa.
- Tạo phiếu nhập nhiều dòng theo nhà cung cấp và lô, có giá nhập.
- Tạo phiếu xuất nhiều dòng theo lý do sử dụng nội bộ, hư hỏng, hết hạn, hàng mẫu hoặc khác.
- Xem tồn thực tế, tồn khả dụng, phiếu nhập/xuất và lịch sử biến động.

Phiếu nhập/xuất được ghi sổ ngay trong một giao dịch MySQL. Mỗi dòng cập nhật `inventory_balances` và tạo `inventory_movements`. Xuất kho dùng cập nhật có điều kiện để không vượt tồn khả dụng, kể cả khi có yêu cầu đồng thời. Các API quản trị giới hạn theo tổ chức của admin. Giao diện hiện dùng kho và kệ hoạt động đầu tiên của tổ chức mẫu; phần đa chi nhánh/đa kho, luồng duyệt phiếu và nghiệp vụ POS/đơn hàng vẫn nằm ngoài phạm vi giao diện này.

## Cấu trúc

- `server/services/gateway`: HTTP API Gateway viết bằng Node.js, chỉ định tuyến `/api/v1/auth/*` đến Auth service và `/api/v1/inventory/*` đến Inventory service.
- `server/services/kafka`: Kafka RPC adapter Node.js, chuyển các yêu cầu xác thực nội bộ qua Apache Kafka.
- `server/services/auth`: Java Spring Boot service sở hữu API đăng nhập, kiểm tra phiên, đổi mật khẩu, JWT và seed admin.
- `server/services/inventory`: NestJS service sở hữu các REST controller kho, service, repository, migration và demo seed.
- Inventory dùng Prisma Client với schema ở `server/services/inventory/prisma/schema.prisma`; repositories, nghiệp vụ ghi kho, seed và truy vấn relation dùng Prisma model API. Bộ migration TypeORM hiện tại được giữ để tương thích lịch sử schema đang có.
- Inventory service xác thực Bearer token bằng cách gọi Auth service qua Kafka RPC; Gateway không đọc token, xử lý nghiệp vụ hay truy cập database.
- Mỗi service có dependencies và Dockerfile riêng để build/deploy độc lập. `server/package.json` chỉ cung cấp lệnh tiện ích tổng hợp.
- `admin/src/app`: trang Next.js và API proxy giữ token trong cookie.
- `admin/src/components`: giao diện shadcn/ui và biểu mẫu quản trị.
- `admin/src/lib/store.ts`: trạng thái người dùng, danh mục dùng chung và tín hiệu tải lại bằng Zustand.

Các API công khai được phân namespace theo service: `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/change-password`; và `/api/v1/inventory/dashboard`, `/api/v1/inventory/lookups`, `/api/v1/inventory/stock`, `/api/v1/inventory/movements`, `/api/v1/inventory/products`, `/api/v1/inventory/suppliers`, `/api/v1/inventory/lots`, `/api/v1/inventory/receipts`, `/api/v1/inventory/issues`. Các route kho yêu cầu Bearer token; NestJS Inventory service gọi Kafka RPC để nhờ Auth service xác thực. Giao diện gọi gateway qua proxy Next.js.

Kafka ở cấu hình Compose một broker để phát triển cục bộ. RPC hiện dùng request-response qua Kafka, nên không mặc định nhanh hơn gọi service trực tiếp; lợi ích chính là tách triển khai và cho phép từng service dùng ngôn ngữ riêng. Kafka RPC adapter hiện chạy một replica vì trạng thái correlation ID nằm trong bộ nhớ. Cấu hình broker plaintext chỉ dùng cho môi trường phát triển nội bộ. `INTERNAL_SERVICE_SECRET` dùng để xác thực Inventory service với Kafka RPC adapter.

## Phát triển

Phát triển cục bộ: chạy `docker compose up -d db kafka`, chạy `npm --prefix server/services/inventory run db:migrate:dev`, sau đó mở các tiến trình `npm --prefix server/services/kafka run dev`, `mvn -f server/services/auth/pom.xml spring-boot:run`, `npm --prefix server/services/inventory run dev` và `npm --prefix server/services/gateway run dev`. Đặt `KAFKA_BROKERS=localhost:9092`, biến DB, `ADMIN_JWT_SECRET`, `INTERNAL_SERVICE_SECRET`, `KAFKA_RPC_URL=http://localhost:3100`, `AUTH_SERVICE_URL=http://localhost:8081` và `INVENTORY_SERVICE_URL=http://localhost:3002`. Frontend: `cd admin && npm ci && BACKEND_URL=http://127.0.0.1:3000 npm run dev -- -p 3001`. Kiểm tra backend từ thư mục `server`: `npm run typecheck:inventory && npm run build`; kiểm tra giao diện: `cd admin && npm run lint && npm run build`.

Đặc tả cơ sở dữ liệu gốc ở [pharmacy_pos_inventory_mysql_spec.md](./pharmacy_pos_inventory_mysql_spec.md). Các bảng POS và thương mại điện tử trong đặc tả đã được ánh xạ nhưng chưa có API nghiệp vụ trong phiên bản quản trị kho này.
