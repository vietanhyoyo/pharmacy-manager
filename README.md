# Pharmacy Manager

Hệ thống quản lý kho thuốc gồm API NestJS, MySQL 8.4 và giao diện quản trị Next.js (TypeScript, Tailwind CSS, shadcn/ui, Zustand).

## Chạy nhanh

1. Sao chép `.env.example` thành `.env`, đặt `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` và `ADMIN_JWT_SECRET` (chuỗi ngẫu nhiên tối thiểu 32 ký tự). Nếu đã có `.env`, chỉ cần bổ sung biến còn thiếu.
2. Chạy `docker compose up -d --build` tại thư mục gốc.
3. Mở **http://127.0.0.1:3001**. API kiểm tra: **http://127.0.0.1:3000/health**.

Tài khoản quản trị mẫu: **admin** / **admin123456@**. Sau khi đăng nhập, dùng mục **Đổi mật khẩu** ở thanh bên. Mật khẩu được băm bằng scrypt; phiên đăng nhập được lưu trong cookie HttpOnly, SameSite Strict với thời hạn 8 giờ. `ADMIN_JWT_SECRET` chỉ nằm ở backend. Cổng MySQL, API và giao diện mặc định chỉ mở trên `127.0.0.1`.

Khi khởi động, backend tự chạy migration và tạo dữ liệu mẫu nếu `SEED_DEMO_DATA=true` (mặc định): một nhà thuốc, chi nhánh, kho/kệ, admin, nhóm thuốc, đơn vị, 2 nhà cung cấp, 5 thuốc, 5 lô, 2 phiếu nhập và 1 phiếu xuất. Seed có thể chạy lại mà không nhân đôi các bản ghi chính. Đặt `SEED_DEMO_DATA=false` nếu không muốn thêm dữ liệu mẫu vào môi trường mới. Dữ liệu MySQL nằm trong Docker volume `mysql_data`; `docker compose down` không xóa dữ liệu.

## Chức năng quản trị

- Tổng quan: số thuốc, tồn kho, lô sắp hết hạn trong 90 ngày, thuốc tồn thấp, biến động gần đây.
- Tạo/sửa thuốc, nhà cung cấp và lô; thay đổi trạng thái để ngừng sử dụng hoặc khóa.
- Tạo phiếu nhập nhiều dòng theo nhà cung cấp và lô, có giá nhập.
- Tạo phiếu xuất nhiều dòng theo lý do sử dụng nội bộ, hư hỏng, hết hạn, hàng mẫu hoặc khác.
- Xem tồn thực tế, tồn khả dụng, phiếu nhập/xuất và lịch sử biến động.

Phiếu nhập/xuất được ghi sổ ngay trong một giao dịch MySQL. Mỗi dòng cập nhật `inventory_balances` và tạo `inventory_movements`. Xuất kho dùng cập nhật có điều kiện để không vượt tồn khả dụng, kể cả khi có yêu cầu đồng thời. Các API quản trị giới hạn theo tổ chức của admin. Giao diện hiện dùng kho và kệ hoạt động đầu tiên của tổ chức mẫu; phần đa chi nhánh/đa kho, luồng duyệt phiếu và nghiệp vụ POS/đơn hàng vẫn nằm ngoài phạm vi giao diện này.

## Cấu trúc

- `server/src/auth`: controller, service, repository và guard xác thực admin.
- `server/src/inventory`: controller, service, repository, kiểu dữ liệu của nghiệp vụ kho.
- `server/src/database`: entity và migration TypeORM; `synchronize` đã tắt.
- `server/src/demo-seed.service.ts`: dữ liệu mẫu khởi tạo.
- `admin/src/app`: trang Next.js và API proxy giữ token trong cookie.
- `admin/src/components`: giao diện shadcn/ui và biểu mẫu quản trị.
- `admin/src/lib/store.ts`: trạng thái người dùng, danh mục dùng chung và tín hiệu tải lại bằng Zustand.

Các API chính: `POST /auth/login`, `GET /auth/me`, `POST /auth/change-password`; `GET /admin/dashboard`, `/admin/lookups`, `/admin/stock`, `/admin/movements`; `GET/POST /admin/products`, `/admin/suppliers`, `/admin/lots`, `/admin/receipts`, `/admin/issues`; `PUT /admin/products/:id`, `/admin/suppliers/:id`, `/admin/lots/:id`. Các endpoint `/admin/*` và `/auth/me`, `/auth/change-password` yêu cầu Bearer token; giao diện gọi qua proxy Next.js.

## Phát triển

Backend: `cd server && npm ci && npm run start:dev` (cần MySQL và các biến DB/`ADMIN_JWT_SECRET`). Frontend: `cd admin && npm ci && BACKEND_URL=http://127.0.0.1:3000 npm run dev -- -p 3001`. Kiểm tra: `npm run typecheck` trong `server`; `npm run lint` và `npm run build` trong `admin`.

Đặc tả cơ sở dữ liệu gốc ở [pharmacy_pos_inventory_mysql_spec.md](./pharmacy_pos_inventory_mysql_spec.md). Các bảng POS và thương mại điện tử trong đặc tả đã được ánh xạ nhưng chưa có API nghiệp vụ trong phiên bản quản trị kho này.
