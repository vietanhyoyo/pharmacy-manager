# Web nhà thuốc An Tâm

Next.js App Router, TypeScript, Tailwind CSS 4 và shadcn/ui. Cấu trúc tuân theo `ARCHITECTURE_BASE.md` của dự án tham chiếu: `src/app` chứa route, `src/components/custom` chứa giao diện theo tính năng, `src/components/ui` chứa component shadcn, `src/services/modules` chứa lời gọi API, `src/services/api_client.ts` là HTTP client dùng chung, `src/services/types/response` là contract API.

## Chạy cục bộ

1. Khởi động API gateway và storefront service từ thư mục gốc: `docker compose up -d --build storefront-service gateway`.
2. `cd web && npm ci && npm run dev -- --port 3004`.
3. Mở <http://localhost:3004>.

`BACKEND_URL` mặc định là `http://localhost:3000`. Server components gọi gateway qua URL này; browser gọi route handler cùng gốc `/api/v1/storefront/*`, route handler chuyển tiếp đến gateway bằng `BACKEND_URL` lúc chạy. Trong Docker Compose, biến này là `http://gateway:3000`.

## Luồng mua hàng

- Khách chọn chi nhánh ở đầu trang; danh mục và tồn khả dụng lấy từ kho bán của chi nhánh đó. Đổi chi nhánh sẽ xóa giỏ hàng cũ.
- Danh mục chỉ hiển thị sản phẩm đang hoạt động, không kê đơn, có listing ở trạng thái `PUBLISHED` và có hàng trong kho bán của chi nhánh.
- Giá bán lấy từ price list đang hoạt động. Sản phẩm chưa có giá không thể thêm vào giỏ.
- Giỏ hàng lưu trong `localStorage`. Giá lưu ở đó chỉ để xem; API tính lại giá và kiểm tra tồn khi tạo đơn.
- Đặt hàng dạng khách, giao tận nơi, trạng thái khởi tạo `PLACED`/`UNPAID`. Chưa tích hợp cổng thanh toán hoặc tài khoản khách hàng. Nhà thuốc cần xác nhận trước khi giao.
- Hệ thống chưa giữ tồn khi đơn ở trạng thái `PLACED`; xác nhận cuối cùng thuộc quy trình xử lý đơn của nhà thuốc.
- Sau khi đặt, khách có thể tra cứu trạng thái qua mã đơn và số điện thoại người nhận. Admin xác nhận sẽ giữ hàng; khi giao hàng mới trừ tồn thực tế.

Các component đã được cài bằng `npx shadcn@latest add --all -y`. Những mục trong tài liệu shadcn như Data Table, Date Picker và Typography là công thức ghép từ component gốc, nên CLI không tạo file riêng cho từng mục đó.

Kiểm tra: `npm run lint && npm run build`.
