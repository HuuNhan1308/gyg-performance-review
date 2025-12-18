# Customer Voice Consolidation Tool – Requirements

## 1. Objective

The purpose of this tool is to **clean, consolidate, and standardize Customer Voice (complaint) data** from an Excel file by **merging duplicate Booking IDs into a single record**, making the data easier to read, analyze, and report.

---

## 2. Input Requirements

### 2.1 File Format

* Excel file (`.xlsx`)
* Single worksheet (or user-selectable sheet)

### 2.2 Required Columns

| Column Name       | Description                              |
| ----------------- | ---------------------------------------- |
| Supplier ID       | Supplier identifier                      |
| Tour ID           | Tour identifier                          |
| Tour Title        | Tour name                                |
| Source            | Feedback source (e.g. care_chat, review) |
| Tags              | Complaint tags                           |
| Conversation Text | Customer message or chat transcript      |
| Checkout Date     | Checkout date                            |
| Booking ID        | Booking identifier                       |

---

## 3. Problem Statement

* The same **Booking ID can appear multiple times**
* Each row may represent:

  * A different complaint
  * A different source
  * A different tag
* This results in:

  * Duplicate data
  * Poor readability
  * Difficulty in analysis and reporting

---

## 4. Functional Requirements

### 4.1 Booking ID Consolidation

* The tool must **group records by Booking ID**
* Each Booking ID must appear **only once** in the output file

---

### 4.2 Column Merge Rules

#### a. Supplier ID, Tour ID, Tour Title, Checkout Date

* Use the **first available value**
* If inconsistencies are detected, optionally flag as a warning

---

#### b. Source (Merged)

* Merge all sources related to the same Booking ID
* Remove duplicates
* Separate values using a semicolon (`;`)

**Example:**

```
care_chat; review
```

---

#### c. Tags (Merged)

* Merge all tags related to the same Booking ID
* Remove duplicate tags
* Preserve original order (or sort alphabetically – configurable)

**Example:**

```
Unclear Pickup Information; Supplier Not Responsive
```

---

#### d. Conversation Text (Merged)

The tool must support **two merge modes**:

##### Mode 1 – Full Merge (Default)

* Combine all conversation texts into one field
* Clearly separate content by source

**Suggested format:**

```
[care_chat]
- customer: Hi, I booked a tour...
- customer: Please confirm the pickup address

[review]
- The tour was not as advertised...
```

---

##### Mode 2 – Smart Merge (Optional / AI-based)

* Generate a summarized version of all conversations
* Output includes:

  * Short summary (2–3 sentences)
  * Key issues as bullet points

**Example:**

```
Summary:
Customer experienced confusion regarding hotel pickup and did not receive timely confirmation from the supplier.

Key Issues:
- Unclear pickup location
- Supplier not responsive
```

---

### 4.3 Complaint Count

* The tool must generate an additional column:

| Column Name     | Description                                      |
| --------------- | ------------------------------------------------ |
| Complaint Count | Number of original rows merged into this booking |

---

### 4.4 Language & Encoding Support

* Must support:

  * English
  * Vietnamese
  * German
* UTF-8 encoding required
* No character loss or text corruption

---

## 5. Output Requirements

### 5.1 File Format

* Excel file (`.xlsx`)

### 5.2 Output Columns (Suggested Order)

| Column                                |
| ------------------------------------- |
| Supplier ID                           |
| Tour ID                               |
| Tour Title                            |
| Booking ID                            |
| Checkout Date                         |
| Source (Merged)                       |
| Tags (Merged)                         |
| Complaint Count                       |
| Conversation Text (Merged or Summary) |

---

## 6. Non-Functional Requirements

* Must handle large files (≥ 10,000 rows)
* Processing time should be under 30 seconds
* Original input file must remain unchanged
* Optional preview and processing log

---

## 7. User Flow (High Level)

1. User uploads Excel file
2. Tool analyzes data and detects duplicate Booking IDs
3. User selects merge mode (Full or Smart)
4. User runs consolidation process
5. User downloads consolidated Excel file

---

## 8. Primary Use Cases

* Platform performance reviews (GetYourGuide, Klook, KKday)
* Customer complaint analysis
* Internal reporting and insights
* Operations and supplier quality improvement

---

## 9. Tag Translation Feature (Phase 1 Enhancement)

### 9.1 Objective

Automatically translate the **Tags (Merged)** column content from English to Vietnamese in the output file, making the data more accessible for Vietnamese-speaking stakeholders.

---

### 9.2 Functional Requirements

#### a. Translation Scope

* The **Tags** column content will be translated
* The **Source** column content will be translated
* Other columns (Conversation Text, Tour Title, etc.) remain unchanged

---

#### b. Source Translation Mapping

The tool must translate the **Source (Merged)** column values:

| English Source | Vietnamese Translation | Description                                              |
| -------------- | ---------------------- | -------------------------------------------------------- |
| relay          | Tin nhắn khách hàng    | Message between customer and our company                 |
| care_chat      | Hỗ trợ khách hàng      | Conversation between customer and customer service supervisor |
| review         | review                 | Keep in English (customer review)                        |

---

#### d. Tag Translation Mapping

The tool must support a **predefined translation dictionary** for common tags:

| English Tag                                        | Vietnamese Translation                                         |
| -------------------------------------------------- | -------------------------------------------------------------- |
| Unclear Pickup Information                         | Thông tin đón khách không rõ ràng                              |
| Supplier Not Responsive                            | Nhà cung cấp không phản hồi                                    |
| Activity Not As Advertised                         | Hoạt động không đúng như quảng cáo                             |
| Pickup/Guide Late or No Show                       | Đón khách/Hướng dẫn viên trễ hoặc không đến                    |
| Too Crowded                                        | Quá đông đúc                                                   |
| Safety Equipment Not Available                     | Thiết bị an toàn không có sẵn                                  |
| Duration Not As Advertised                         | Thời lượng không đúng như quảng cáo                            |
| Unclear Meeting Point Location                     | Địa điểm tập trung không rõ ràng                               |
| Aggressive Abusive Behaviour                       | Hành vi hung hăng, lạm dụng                                    |
| Change Drop Off Location                           | Thay đổi địa điểm trả khách                                    |
| Discriminating Behavior                            | Hành vi phân biệt đối xử                                       |
| Food or Drinks Low Quality or Not As Advertised    | Đồ ăn/thức uống chất lượng kém hoặc không đúng quảng cáo       |
| Unexpected Change to Activity                      | Thay đổi hoạt động bất ngờ                                     |
| Change Pick Up Time                                | Thay đổi giờ đón khách                                         |
| Accident Injury                                    | Tai nạn/Chấn thương                                            |
| Unsafe Environment                                 | Môi trường không an toàn                                       |
| Unsafe Driving                                     | Lái xe không an toàn                                           |
| Guide Language Wrong or Low Proficiency            | Ngôn ngữ hướng dẫn viên sai hoặc trình độ thấp                 |
| Scam Fraud                                         | Lừa đảo/Gian lận                                               |
| Damage To Belongings                               | Hư hỏng tài sản cá nhân                                        |

*(This dictionary should be expandable by the user)*

---

#### e. Translation Modes

##### Mode 1 – Dictionary-Based Translation (Default)

* Use predefined translation mapping
* Fast processing, no external API required
* Unknown tags remain in English (or flagged for review)

##### Mode 2 – AI-Based Translation (Optional)

* Use AI/LLM service to translate unknown tags
* Provides more accurate translations for new/custom tags
* Requires API configuration

---

#### f. Output Format Options

| Option                | Description                                      |
| --------------------- | ------------------------------------------------ |
| Vietnamese Only       | Display only Vietnamese translation              |
| Bilingual (EN → VI)   | Display both: `English Tag → Bản dịch tiếng Việt`|
| Side-by-Side Columns  | Two separate columns: Tags (EN) and Tags (VI)    |

**Example Output (Bilingual format):**

```
Unclear Pickup Information → Thông tin đón khách không rõ ràng; Supplier Not Responsive → Nhà cung cấp không phản hồi
```

---

### 9.3 User Configuration

* User can select translation output format before processing
* User can add/edit custom tag translations via settings
* Unknown tags can be exported to a separate list for manual translation

---

### 9.4 Technical Requirements

* Translation dictionary stored in configurable file (JSON/Excel)
* Support case-insensitive matching
* Preserve tag order after translation
* Handle partial matches and similar tags gracefully

---

### 9.5 Error Handling

| Scenario                     | Behavior                                               |
| ---------------------------- | ------------------------------------------------------ |
| Tag not found in dictionary  | Keep original English tag + flag as "Untranslated"     |
| Source not found in mapping  | Keep original English source value                     |
| Empty tag/source value       | Output empty cell                                      |
| Multiple tags (merged)       | Translate each tag individually, maintain separator    |
| Multiple sources (merged)    | Translate each source individually, maintain separator |

