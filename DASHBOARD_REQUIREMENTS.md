

# Customer Voice Reporting Web Interface

## Phase 2 – UI & Visualization (Updated Requirements – Vietnamese UI)

### Note

This document describes **additional requirements** built **on top of the existing Phase 1 Customer Voice consolidation tool**.
The Phase 1 data processing and Excel consolidation functionality is considered **stable and complete**.

---

## 1. Objective (Phase 2)

The objective of Phase 2 is to **build a web-based user interface** that consumes the **consolidated Excel output from Phase 1** and presents the data in a **clear, visual, and executive-friendly format for Vietnamese users**.

This phase focuses on **data presentation, exploration, and reporting**, not data processing.

---

## 2. Language & Localization Requirements

### 2.1 UI Language

* **The entire user interface must be displayed in Vietnamese**
* This includes:

  * Page titles
  * Navigation labels
  * Buttons
  * Table headers
  * Filter labels
  * Tooltips
  * Error and success messages
  * Empty-state messages

### 2.2 Data Language Handling

* **Data content itself must remain unchanged** (original preserved)

  * Conversation Text may include English, Vietnamese, German, etc.
* **AI Translation feature** provides Vietnamese translations on-demand (see Section 5.6)
* UI labels and system-generated text must be in Vietnamese
* UTF-8 encoding is mandatory

---

## 3. Dependencies & Assumptions

* Input Excel file is generated from Phase 1
* One row represents one Booking ID
* No duplicate Booking IDs exist
* No additional data cleansing is required

---

## 4. Input Specifications (Inherited from Phase 1)

### 4.1 Input Type

* Excel file (`.xlsx`)
* Single worksheet

### 4.2 Required Columns

| Column Name                |
| -------------------------- |
| Supplier ID                |
| Tour ID                    |
| Tour Title                 |
| Booking ID                 |
| Checkout Date              |
| Source (Merged)            |
| Tags (Merged)              |
| Complaint Count            |
| Conversation Text (Merged) |

---

## 5. Functional Requirements (Phase 2)

### 5.1 Excel Upload & Validation

#### a. Default Data Auto-Load (Enhancement)

* System automatically loads a default test file on page load
* Default file path: `uploads/test .xlsx`
* Dashboard displays immediately without manual upload
* Users can still upload their own files to override default data
* Error handling if default file is missing

#### b. Manual Upload

* User can upload an Excel file
* System validates required columns
* Error messages must be displayed **in Vietnamese**
* Upload status must be clearly shown

---

### 5.2 Data Rendering & Formatting

* Parse and render all records from Excel
* Format Checkout Date into a readable date format
* Preserve multilingual content in Conversation Text
* No modification to source data

---

### 5.3 Dashboard Summary (Vietnamese UI)

The system must display a **dashboard overview** with the following KPIs:

* Tổng số booking có khiếu nại
* Tổng số khiếu nại
* Số lượng tour bị ảnh hưởng
* Số lượng tag khiếu nại
* Phân bổ khiếu nại theo nguồn (Source)

#### Visual Components

* Biểu đồ cột: Khiếu nại theo Tag
* Biểu đồ tròn: Khiếu nại theo Source
* Danh sách tour có nhiều khiếu nại nhất

---

### 5.4 Interactive Data Table

#### Table Columns (Vietnamese Labels)

* Nhà cung cấp (Supplier ID)
* Tên tour
* Mã booking
* Ngày checkout
* Nguồn phản hồi
* Tag khiếu nại
* Số lượng khiếu nại

#### Table Features

* Sắp xếp (theo ngày, số lượng khiếu nại)
* Lọc theo:

  * Tour
  * Tag
  * Nguồn
  * Khoảng ngày
* Tìm kiếm theo từ khóa
* Phân trang hoặc virtual scroll

---

### 5.5 Complaint Detail View

* Click vào một dòng để mở **màn hình chi tiết**
* Hiển thị:

  * Mã booking
  * Tên tour
  * Ngày checkout
  * Nguồn phản hồi
  * Tag khiếu nại
  * Nội dung phản hồi đầy đủ

#### Conversation Display Rules

* Giữ nguyên line break
* Hiển thị theo dạng hội thoại
* Nội dung dài có thể thu gọn / mở rộng

---

### 5.6 AI Conversation Translation Feature

#### 5.6.1 Objective

Provide **AI-powered translation** of the raw Conversation Text content from English/German to Vietnamese, making it easier for Vietnamese stakeholders to understand customer feedback.

---

#### 5.6.2 Input Data

* **Source**: Raw Conversation Text (Merged) from Phase 1 output
* **Original Languages**: English, German, or mixed language content
* **Format**: Unstructured text, may include:
  * Chat transcripts
  * Customer reviews
  * Email content
  * Mixed formats

---

#### 5.6.3 Functional Requirements

##### a. Translation Trigger

* User clicks **"Dịch sang tiếng Việt"** button in the Complaint Detail View
* Translation is performed on-demand (not pre-processed)
* Loading indicator shown during translation

##### b. AI Translation Service

* Use AI/LLM service (e.g., OpenAI GPT, Google Translate API, or local model)
* Translate entire conversation content to Vietnamese
* Preserve the meaning and context of customer complaints
* Handle mixed-language content gracefully

##### c. Output Display Requirements

The translated content must be displayed **clearly and professionally**:

| Display Element              | Requirement                                                |
| ---------------------------- | ---------------------------------------------------------- |
| Layout                       | Side-by-side or tabbed view (Original vs Vietnamese)       |
| Formatting                   | Preserve line breaks and paragraph structure               |
| Speaker Labels               | Translate labels (e.g., "customer:" → "Khách hàng:")       |
| Source Indicators            | Keep source markers (e.g., [care_chat], [review])          |
| Timestamps                   | Keep timestamps unchanged                                  |
| Highlighting                 | Highlight key complaint phrases                            |

##### d. Display Format Example

**Original (English):**
```
[care_chat]
- customer: Hi, I booked a tour but the pickup location was not clear.
- customer: The driver never showed up at the hotel.

[review]
- The tour guide was 30 minutes late and did not apologize.
```

**Translated (Vietnamese):**
```
[Hỗ trợ khách hàng]
- Khách hàng: Xin chào, tôi đã đặt tour nhưng địa điểm đón không rõ ràng.
- Khách hàng: Tài xế không bao giờ xuất hiện tại khách sạn.

[Review]
- Hướng dẫn viên đến trễ 30 phút và không xin lỗi.
```

---

#### 5.6.4 Additional Features

| Feature                      | Description                                                |
| ---------------------------- | ---------------------------------------------------------- |
| Copy Translation             | Button to copy translated text to clipboard                |
| Original Toggle              | Switch between original and translated view                |
| Auto-detect Language         | Detect source language before translating                  |
| Translation Cache            | Cache translations to avoid repeated API calls             |
| Export with Translation      | Option to export data with Vietnamese translations         |

---

#### 5.6.5 Error Handling

| Scenario                     | Behavior                                                   |
| ---------------------------- | ---------------------------------------------------------- |
| API unavailable              | Show error message: "Không thể dịch. Vui lòng thử lại sau" |
| Content too long             | Split into chunks and translate sequentially               |
| Already in Vietnamese        | Show message: "Nội dung đã là tiếng Việt"                  |
| Mixed language content       | Translate non-Vietnamese portions only                     |
| Empty conversation           | Show message: "Không có nội dung để dịch"                  |

---

#### 5.6.6 UI Labels (Vietnamese)

| Element                      | Vietnamese Label                                           |
| ---------------------------- | ---------------------------------------------------------- |
| Translate Button             | Dịch sang tiếng Việt                                       |
| Original Tab                 | Nội dung gốc                                               |
| Translated Tab               | Bản dịch tiếng Việt                                        |
| Copy Button                  | Sao chép                                                   |
| Loading Message              | Đang dịch...                                               |
| Success Message              | Dịch thành công                                            |

---

#### 5.6.7 Technical Requirements

* API key configuration for AI translation service
* Rate limiting to prevent excessive API calls
* Response timeout: 30 seconds maximum
* Support for content up to 10,000 characters per translation
* Secure API key storage (environment variables)

---

### 5.7 Visual & UX Requirements

#### a. General Display

* Tag hiển thị dạng badge
* Source hiển thị dạng label
* Số lượng khiếu nại lớn được highlight
* Giao diện rõ ràng, dễ đọc cho quản lý

#### b. Enhanced Readability for Senior Users

The "Nội dung phản hồi" (Conversation Text) section must be optimized for readability, especially for older users:

| Element              | Specification                                              |
| -------------------- | ---------------------------------------------------------- |
| Font Size            | 1.35rem (desktop), 1.2rem (mobile)                         |
| Line Height          | 2.1 (desktop), 1.9 (mobile)                                |
| Letter Spacing       | 0.3px (desktop), 0.2px (mobile)                            |
| Text Color           | #1a1a1a (high contrast)                                    |
| Background           | Pure white (#ffffff) with subtle shadow                    |
| Padding              | 30px (desktop), 20px (mobile)                              |
| Border               | 2px solid border + 5px left accent                         |
| Label Font Size      | 1.15rem (increased for clarity)                            |
| Font Family          | 'Segoe UI', Tahoma, Geneva, Verdana (easy-to-read)         |

**Design Principles:**
* High contrast for reduced eye strain
* Generous spacing between lines for comfortable reading
* Clean white background to reduce visual clutter
* Large, clear fonts suitable for users 50+ years old
* Professional appearance with subtle shadows
* Consistent spacing and padding throughout

---

## 6. Non-Functional Requirements

* Web-based (desktop-first)
* Hỗ trợ tối thiểu 10,000 dòng
* Thời gian load ban đầu < 5 giây (including auto-load of default data)
* Không thay đổi file Excel gốc
* Dữ liệu xử lý theo session
* Auto-load default data on page initialization
* Graceful fallback if default file is unavailable

---

## 7. UX Principles (Vietnamese Audience)

* Ngôn ngữ đơn giản, dễ hiểu
* Không dùng thuật ngữ kỹ thuật
* Phù hợp cho:

  * Quản lý
  * Operation team
  * Báo cáo nội bộ

---

## 8. Technical Implementation Notes

### 8.1 Auto-Load Implementation

* **Endpoint**: `GET /api/dashboard/load-default`
* **Default File Path**: `uploads/test .xlsx`
* **Behavior**: Automatically called on page load via `loadDefaultData()` function
* **Error Handling**: Display error message in Vietnamese, allow manual upload as fallback
* **Dependencies**: ExcelJS library for server-side Excel parsing

### 8.2 Enhanced Readability Implementation

* **CSS Specifications**: Applied to `.conversation-text` class
* **Responsive Design**: Different font sizes for desktop and mobile
* **Visual Enhancements**: Box shadow, borders, and spacing optimized
* **Cross-browser Compatibility**: Tested font stack for Windows/Mac/Linux

---

## 9. Optional Future Enhancements

* Xuất báo cáo PDF (tiếng Việt)
* Lưu bộ lọc yêu thích
* Tóm tắt khiếu nại bằng AI (tiếng Việt)
* So sánh theo thời gian
* Batch translation (dịch nhiều booking cùng lúc)
* Auto-translate on load (tự động dịch khi mở chi tiết)
* Configurable default file path
* Multiple default files support (switchable datasets)

---

## 10. Primary Users

* Quản lý (especially senior management)
* Nhân sự vận hành
* Bộ phận đánh giá nhà cung cấp

### User Accessibility Considerations

* Interface optimized for users aged 50+
* High contrast and large fonts for reduced eye strain
* Clear visual hierarchy
* Simple, intuitive navigation
* Minimal technical jargon


