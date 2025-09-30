# 🚨 CRITICAL WORKFLOW REMINDERS - LUÔN ĐỌC MỖI PROMPT 🚨

## ⚠️ TUYỆT ĐỐI BẮT BUỘC - KHÔNG ĐƯỢC BỎ QUA

### 1. 🔍 LUÔN CHECK LINT TRƯỚC KHI KẾT LUẬN

```bash
cd "d:\VSCODE\react-learning\TYHH ADMIN"
npm run lint
```

**PHẢI CHẠY SAU MỖI THAY ĐỔI CODE!**

### 2. 🏗️ LUÔN CHECK BUILD TRƯỚC KHI KẾT LUẬN

```bash
cd "d:\VSCODE\react-learning\TYHH ADMIN"
npm run build
```

**PHẢI CHẠY SAU MỖI THAY ĐỔI CODE!**

### 3. 📊 QUY TRÌNH BẮT BUỘC CHO MỌI TASK:

1. ✅ Thực hiện thay đổi code
2. ✅ **CHẠY LINT** - kiểm tra errors/warnings
3. ✅ **CHẠY BUILD** - đảm bảo compile thành công
4. ✅ Test runtime nếu có thể
5. ✅ Chỉ kết luận thành công khi TẤT CẢ đã PASS

### 4. 🚫 TUYỆT ĐỐI KHÔNG ĐƯỢC:

- ❌ Kết luận "thành công" mà không chạy lint
- ❌ Kết luận "thành công" mà không chạy build
- ❌ Bỏ qua runtime errors
- ❌ Giả định mọi thứ OK mà không verify

### 5. 📝 CÁC QUY TẮC KHÁC:

- 🔄 Preserve existing working code (bài học từ dashboard)
- 🎯 Minimal changes only
- 🔍 Always check actual data structure vs expectations
- ✅ TypeScript type safety
- 🧪 Test API endpoints if possible

## 🎯 REMEMBER: "TÔI YÊU CẦU TỐI ƯU HẾT, BẠN KHÔNG ĐƯỢC PHÉP BỎ DỞ CÔNG VIỆC"

**LINT + BUILD = MANDATORY BEFORE ANY "SUCCESS" CONCLUSION!**
