# TYHH Admin - Chức năng trang Users & [username]

## 1. Trang Users (`/users`)

### Quản lý danh sách người dùng

- Hiển thị bảng danh sách user với các trường: tên, email, username, vai trò, trạng thái, ngày tạo, ...
- Phân trang, sắp xếp theo ngày tạo mới nhất
- Tìm kiếm, lọc theo `status` (active/inactive/...) từ backend (KHÔNG filter theo activeKey)
- Không thao tác, không filter gì liên quan đến `key` hoặc `activeKey` (theo development-instructions.md)

### Thêm mới user (Add User)

- Modal form thêm user mới
- Sử dụng Zod schema (`createUserSchema`) cho validation phía FE
- Kiểm tra trùng email/username phía BE, hiển thị lỗi trả về từ BE
- Hiển thị lỗi validation rõ ràng từng trường, border đỏ, thông báo tổng hợp
- Reset form, loading state, xử lý lỗi network
- Sau khi thêm thành công, cập nhật lại danh sách

### Xóa user

- Xác nhận trước khi xóa
- Không cho phép xóa chính mình
- Hiển thị thông báo thành công/thất bại

### Gửi email xác thực

- Gửi email xác thực cho user chưa xác thực
- Hiển thị trạng thái xác thực (verified/unverified)

### Đổi trạng thái user

- Đổi trạng thái (status) user (active/inactive)
- Không thao tác với key/activeKey

---

## 2. Trang User Detail (`/users/[username]`)

### Xem chi tiết user

- Hiển thị đầy đủ thông tin user: tên, email, username, vai trò, trạng thái, điểm, ngày tạo, ngày cập nhật, trạng thái xác thực, ...
- Hiển thị key, activeKey (chỉ xem, không thao tác)

### Sửa thông tin user (Edit User)

- Nhấn nút Edit để chuyển sang chế độ chỉnh sửa
- Form sử dụng Zod schema (`editUserSchema`) cho validation phía FE
- Password là tùy chọn, chỉ validate khi nhập
- Xác nhận lại password khi đổi
- Hiển thị lỗi validation từng trường, border đỏ, thông báo tổng hợp
- Hiển thị lỗi trả về từ backend (nếu có)
- Đảm bảo type safety, không dùng any
- Sau khi lưu thành công, cập nhật lại thông tin, điều hướng nếu đổi username

### Đổi mật khẩu user

- Chọn chế độ đổi mật khẩu (keep/change)
- Validate password mạnh (Zod schema)
- Xác nhận lại password

### Gửi lại email xác thực

- Gửi lại email xác thực cho user chưa xác thực
- Hiển thị trạng thái xác thực

### Xóa user

- Xác nhận trước khi xóa
- Không cho phép xóa chính mình
- Thông báo thành công/thất bại

---

## 3. Quy tắc & Quy trình phát triển

- Luôn check lint, build, type trước khi hoàn thành task
- Validation FE dùng Zod, BE trả lỗi rõ ràng
- Không filter, thao tác gì với key/activeKey ở trang users
- Tất cả logic validation, error handling, UI đều tuân thủ `development-instructions.md`
- Đảm bảo type safety, không dùng any
- Tách schema ra file riêng, không viết inline
- Hiển thị lỗi rõ ràng, UX nhất quán giữa các trang

---

## 4. File liên quan

- `src/app/(dashboard)/users/page.tsx` (danh sách user)
- `src/app/(dashboard)/users/[username]/page.tsx` (chi tiết/sửa user)
- `src/lib/schemas/user.ts` (Zod schema)
- `src/lib/features/api/userApi.ts` (API)
- `.github/development-instructions.md` (quy tắc phát triển)

---

_File này tự động sinh bởi AI dựa trên lịch sử phát triển, quy tắc và các yêu cầu thực tế của dự án._
