# AI Translation Feature Guide

## Tính năng Dịch bằng AI

Công cụ Customer Voice Dashboard hỗ trợ dịch tự động nội dung phản hồi khách hàng từ tiếng Anh/Đức sang tiếng Việt bằng Google Gemini AI.

---

## 🎯 Mục đích

- Giúp nhân viên Việt Nam hiểu nhanh nội dung phản hồi khách hàng
- Tiết kiệm thời gian phân tích khiếu nại
- Cải thiện chất lượng hỗ trợ khách hàng

---

## 🚀 Cách sử dụng

### Bước 1: Cấu hình API Key

Xem hướng dẫn chi tiết trong file `ENV_SETUP.md`

Nhanh chóng:
```powershell
# Windows PowerShell
$env:GEMINI_API_KEY = "your_api_key_here"
```

### Bước 2: Khởi động Dashboard

```bash
npm install  # Cài đặt dependencies (chỉ lần đầu)
npm run web  # Khởi động server
```

Truy cập: http://localhost:3000/dashboard

### Bước 3: Tải file Excel đã tổng hợp

1. Click vào khu vực "Kéo thả file Excel đã tổng hợp vào đây"
2. Chọn file output từ Phase 1 (đã được consolidate)
3. Đợi hệ thống xử lý và hiển thị dashboard

### Bước 4: Xem chi tiết khiếu nại

1. Click vào bất kỳ dòng nào trong bảng dữ liệu
2. Cửa sổ chi tiết sẽ hiện ra

### Bước 5: Dịch nội dung

1. Trong cửa sổ chi tiết, tìm phần "Nội dung phản hồi"
2. Click nút **"🌐 Dịch sang tiếng Việt"**
3. Đợi 2-5 giây (tùy độ dài nội dung)
4. Hệ thống sẽ hiển thị 2 tab:
   - **Nội dung gốc**: Bản tiếng Anh/Đức gốc
   - **Bản dịch tiếng Việt**: Bản dịch AI

### Bước 6: Sao chép bản dịch (nếu cần)

1. Click nút **"📋 Sao chép bản dịch"**
2. Dán vào tài liệu khác (Word, Excel, Email, etc.)

---

## 🎨 Giao diện

### Ví dụ nội dung gốc:
```
[care_chat]
- customer: Hi, I booked a tour but the pickup location was not clear.
- customer: The driver never showed up at the hotel.

[review]
- The tour guide was 30 minutes late and did not apologize.
```

### Sau khi dịch:
```
[Hỗ trợ khách hàng]
- Khách hàng: Xin chào, tôi đã đặt tour nhưng địa điểm đón không rõ ràng.
- Khách hàng: Tài xế không bao giờ xuất hiện tại khách sạn.

[Review]
- Hướng dẫn viên đến trễ 30 phút và không xin lỗi.
```

---

## ⚙️ Tính năng thông minh

### 1. Phát hiện ngôn ngữ tự động
- Nếu nội dung đã là tiếng Việt → Hiển thị "Nội dung đã là tiếng Việt"
- Không lãng phí API call

### 2. Ngữ cảnh thông minh (Context-aware Translation)
- **Tag khiếu nại** được gửi kèm để AI hiểu rõ ngữ cảnh
- Ví dụ: Nếu tag là "Unclear Pickup Information", AI sẽ dịch chính xác hơn các thuật ngữ liên quan đến đón khách
- Giúp bản dịch chính xác và phù hợp với tình huống cụ thể

### 3. Cache thông minh
- Lưu 100 bản dịch gần nhất
- Cache key bao gồm: nguồn + tags + nội dung
- Dịch lại cùng nội dung với cùng ngữ cảnh → Trả kết quả ngay lập tức
- Tiết kiệm chi phí API

### 3. Xử lý lỗi
| Lỗi | Thông báo | Giải pháp |
|-----|-----------|-----------|
| Chưa cấu hình API key | "Chưa cấu hình API key" | Xem ENV_SETUP.md |
| Nội dung quá dài | "Nội dung quá dài (> 10,000 ký tự)" | Chia nhỏ nội dung |
| API không khả dụng | "Không thể dịch. Vui lòng thử lại sau" | Đợi 1 phút và thử lại |
| Không có nội dung | "Không có nội dung để dịch" | Kiểm tra dữ liệu |

---

## 📊 Giới hạn sử dụng

### Google Gemini API (Free Tier)
- **60 requests/minute** (1 request/giây)
- **1,500 requests/day**
- **1 million tokens/month**

### Khuyến nghị
- Chỉ dịch khi thực sự cần
- Sử dụng cache hiệu quả
- Xem xét upgrade nếu sử dụng nhiều

---

## 🔐 Bảo mật

### ✅ Nên làm:
- Giữ API key riêng tư
- Không commit `.env` vào Git
- Dùng environment variables
- Rotate API key định kỳ

### ❌ Không nên:
- Share API key công khai
- Hard-code API key trong code
- Commit API key lên GitHub
- Dùng chung API key nhiều người

---

## 💡 Tips & Tricks

### 1. Dịch hàng loạt
Hiện tại: Dịch từng booking một
Tương lai: Batch translation (roadmap)

### 2. Xuất bản dịch
Hiện tại: Copy thủ công
Tương lai: Export Excel với bản dịch

### 3. Tự động dịch
Hiện tại: Click nút để dịch
Tương lai: Auto-translate khi mở chi tiết

---

## 🐛 Troubleshooting

### Lỗi: "Chưa cấu hình GEMINI_API_KEY"
```bash
# Kiểm tra xem đã set chưa
echo $env:GEMINI_API_KEY  # PowerShell
echo %GEMINI_API_KEY%     # CMD
echo $GEMINI_API_KEY      # Linux/Mac

# Nếu chưa, set lại:
$env:GEMINI_API_KEY = "your_key"  # PowerShell
```

### Lỗi: "Không thể dịch. Vui lòng thử lại sau"
- Kiểm tra kết nối internet
- Kiểm tra API key còn hiệu lực
- Kiểm tra quota còn lại
- Thử lại sau 1 phút

### Bản dịch không chính xác
- Nội dung gốc chất lượng kém
- Ngữ cảnh không rõ ràng
- Thuật ngữ chuyên ngành
→ Có thể chỉnh sửa thủ công

### Dịch chậm
- Nội dung quá dài (> 5000 ký tự)
- Kết nối mạng chậm
- API đang bận
→ Đợi thêm 5-10 giây

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console log (F12)
2. Xem file `ENV_SETUP.md`
3. Kiểm tra API key configuration
4. Xem quota tại: https://makersuite.google.com/

---

## 🔮 Roadmap

### Đang phát triển:
- ✅ Dịch on-demand
- ✅ Cache translation
- ✅ Copy to clipboard
- ✅ Tab switching

### Tương lai:
- ⏳ Batch translation (dịch nhiều cùng lúc)
- ⏳ Auto-translate khi mở chi tiết
- ⏳ Export với bản dịch
- ⏳ Translation history
- ⏳ Custom prompts
- ⏳ Multi-language support (thêm tiếng Đức, Nhật, v.v.)

---

Made with ❤️ for better customer service

