# Development Instructions - TYHH Admin

## QUAN TRỌNG: Các lưu ý LUÔN phải tuân thủ

### 1. Code Quality & Build Process

- **LUÔN phải check lỗi lint** sau mỗi thay đổi code
- **LUÔN phải run build** để chắc chắn không có lỗi compile
- **KHÔNG BAO GIỜ** được bỏ qua lỗi TypeScript/ESLint
- Sửa tất cả lỗi lint và compile trước khi hoàn thành task

### 2. TypeScript & Type Safety

- **LUÔN đảm bảo type safety** khi làm việc với TypeScript
- Kiểm tra type compatibility giữa frontend và backend
- Không sử dụng `any` type trừ khi thực sự cần thiết
- Đảm bảo interface và type definitions chính xác

### 3. API Integration

- **LUÔN kiểm tra API response type** khớp với frontend interface
- Validate data type trước khi gửi lên API
- Handle error cases properly
- Check API contract giữa FE và BE

### 4. Form Handling

- Validate form data type trước khi submit
- Handle loading states và error states
- Proper form reset và cleanup
- Type-safe form data handling

### 5. File Organization

- Follow project structure conventions
- Import paths phải chính xác
- Component naming conventions (PascalCase)
- Proper file extensions (.tsx, .ts)

### 6. Error Handling & Debugging

- **LUÔN handle errors gracefully**
- Proper console logging for debugging
- Clear error messages for users
- Try-catch blocks where necessary

### 7. Code Review Checklist

Trước khi hoàn thành bất kỳ task nào:

- [ ] Check lint errors: `npm run lint`
- [ ] Build project: `npm run build`
- [ ] Test functionality
- [ ] Check TypeScript errors
- [ ] Verify API integration
- [ ] Test form validation
- [ ] Check responsive design
- [ ] Review console for warnings/errors

### 8. Common Issues to Avoid

- String vs Number type mismatches
- Missing error handling
- Improper form state management
- Type casting without validation
- Missing dependency imports
- Undefined/null reference errors

### 9. Project-Specific Rules

- **TUYỆT ĐỐI KHÔNG filter bất cứ gì liên quan đến activeKey** ở trang users
- **KHÔNG thao tác bất cứ gì với key hay activeKey** ở trang users
- Filtering chỉ sử dụng field `status` từ backend
- Frontend filtering cho tất cả search/filter operations

### 10. Development Workflow

1. Đọc requirements carefully
2. Plan implementation approach
3. Write code with proper types
4. **Check lint errors immediately**
5. **Test build process**
6. Test functionality manually
7. Fix any issues found
8. Double-check before completion

## REMINDER: LUÔN TUÂN THỦ CÁC LUU Ý TRÊN!
