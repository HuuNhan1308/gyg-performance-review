# 📊 Customer Voice Platform

A complete two-phase platform for Customer Voice (complaint) data management:

- **Phase 1**: Clean, consolidate, and standardize data by merging duplicate Booking IDs
- **Phase 2**: Executive dashboard with interactive reporting and data visualization

## 🎯 Features

### Phase 1 - Data Consolidation
- **Booking ID Consolidation**: Merge multiple records with the same Booking ID
- **Smart Data Merging**: Combine sources, tags, and conversations intelligently
- **Multiple Interfaces**: CLI, Web interface, and programmatic API
- **Language Support**: English, Vietnamese, German with UTF-8 encoding
- **Vietnamese Translation**: Automatically translate Tags and Sources to Vietnamese
- **Multiple Translation Formats**: Vietnamese-only, Bilingual, or Side-by-side columns
- **Large File Handling**: Process files with 10,000+ rows efficiently
- **Two Merge Modes**: Full merge or AI-powered smart summaries

### Phase 2 - Executive Dashboard
- **Interactive Dashboard**: Executive-friendly KPI overview and visualizations
- **Data Exploration**: Filter, search, and sort consolidated complaint data
- **Visual Analytics**: Charts showing complaint patterns by tag, source, and tour
- **Detailed Views**: Click-through to individual complaint details
- **AI Translation**: On-demand Vietnamese translation of conversation text using Google Gemini
- **Real-time Filtering**: Dynamic data filtering without page reloads
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Installation

```bash
# Clone or download the project
cd customer-voice-consolidation-tool

# Install dependencies
npm install
```

### AI Translation Setup (Optional - Phase 2)

For Vietnamese translation of conversation text in the dashboard:

1. **Get Google Gemini API Key**: Visit https://makersuite.google.com/app/apikey
2. **Set environment variable**:
   ```bash
   # Windows PowerShell
   $env:GEMINI_API_KEY = "your_api_key_here"
   
   # Linux/Mac
   export GEMINI_API_KEY=your_api_key_here
   ```
3. **See detailed setup**: Check `ENV_SETUP.md` for full instructions

> **Note**: Translation feature works without API key configuration, but will show an error when attempting to translate.

### Usage Options

#### 1. Command Line Interface (CLI) - Phase 1

```bash
# Basic processing
npm run cli -- process -i "input.xlsx"

# With Vietnamese translation
npm run cli -- process -i "input.xlsx" -t

# Bilingual output (English → Vietnamese)
npm run cli -- process -i "input.xlsx" -t --output-format bilingual

# Side-by-side columns (EN and VI)
npm run cli -- process -i "input.xlsx" -t --output-format side-by-side

# Use smart merge mode with translation
npm run cli -- process -i "input.xlsx" -m smart -t

# Analyze file before processing
npm run cli -- analyze -i "input.xlsx"

# See all options
npm run cli -- help
```

#### 2. Web Platform - Both Phases

```bash
# Start web server
npm run web

# Phase 1 - Data Consolidation: http://localhost:3000/consolidate
# Phase 2 - Executive Dashboard: http://localhost:3000/dashboard
```

#### 3. Programmatic Usage

```javascript
const { processFile, analyzeFile } = require('./index.js');

// Analyze file
const analysis = await analyzeFile('input.xlsx');
console.log(`Found ${analysis.duplicateBookingIds} duplicate booking IDs`);

// Process file
const result = await processFile('input.xlsx', 'output.xlsx', {
    mergeMode: 'smart',
    separator: ' | '
});
console.log(`Reduced ${result.original} to ${result.consolidated} records`);
```

## 📋 Input Requirements

### Required Columns

Your Excel file must contain these columns (case-insensitive):

| Column Name       | Description                              |
| ----------------- | ---------------------------------------- |
| Supplier ID       | Supplier identifier                      |
| Tour ID           | Tour identifier                          |
| Tour Title        | Tour name                                |
| Source            | Feedback source (e.g. care_chat, review) |
| Tags              | Complaint tags                           |
| Conversation Text | Customer message or chat transcript      |
| Checkout Date     | Checkout date                            |
| Booking ID        | Booking identifier (**required**)        |

## ⚙️ Processing Rules

### Consolidation Logic

- **Booking ID**: Groups all records with the same ID
- **Supplier ID, Tour ID, Tour Title, Checkout Date**: Uses first available value
- **Source**: Merges all unique sources with semicolon separator
- **Tags**: Combines all unique tags, removes duplicates
- **Conversation Text**: Two modes available

### Vietnamese Translation Feature

#### **Source Translation**
| English | Vietnamese |
|---------|------------|
| relay | Tin nhắn khách hàng |
| care_chat | Hỗ trợ khách hàng |
| review | review |

#### **Tag Translation** 
Supports 20+ predefined complaint categories:
- Unclear Pickup Information → Thông tin đón khách không rõ ràng
- Supplier Not Responsive → Nhà cung cấp không phản hồi  
- Activity Not As Advertised → Hoạt động không đúng như quảng cáo
- And many more...

#### **Translation Output Formats**

**1. Vietnamese Only** (Default)
```
Thông tin đón khách không rõ ràng; Nhà cung cấp không phản hồi
```

**2. Bilingual** (English → Vietnamese)  
```
Unclear Pickup Information → Thông tin đón khách không rõ ràng; Supplier Not Responsive → Nhà cung cấp không phản hồi
```

**3. Side-by-Side** (Separate columns)
```
| Tags (EN)                    | Tags (VI)                          |
|------------------------------|------------------------------------ |
| Unclear Pickup Information   | Thông tin đón khách không rõ ràng  |
```

### Merge Modes

#### Full Merge (Default)
```
[care_chat]
- customer: Hi, I booked a tour...
- customer: Please confirm the pickup address

[review]
- The tour was not as advertised...
```

#### Smart Summary
```
Summary:
Customer experienced confusion regarding hotel pickup and did not receive timely confirmation from the supplier.

Key Issues:
- Unclear pickup location
- Supplier not responsive
```

## 📤 Output Format

The consolidated Excel file includes:

| Column                                | Description                           |
| ------------------------------------- | ------------------------------------- |
| Supplier ID                           | Original supplier identifier          |
| Tour ID                               | Original tour identifier              |
| Tour Title                            | Original tour name                    |
| Booking ID                            | Unique booking identifier             |
| Checkout Date                         | Original checkout date                |
| Source (Merged)                       | All sources separated by `;`          |
| Tags (Merged)                         | All unique tags separated by `;`      |
| Complaint Count                       | Number of original records merged     |
| Conversation Text (Merged or Summary) | Consolidated conversation content     |

## 🛠️ CLI Commands

### Process Command
```bash
npm run cli -- process [options]

Options:
  -i, --input <file>      Input Excel file path (required)
  -o, --output <file>     Output Excel file path (optional)
  -m, --mode <mode>       Merge mode: full or smart (default: full)
  --separator <sep>       Separator for merged fields (default: ;)
```

### Analyze Command
```bash
npm run cli -- analyze -i <file>

Shows statistics about duplicate Booking IDs without processing
```

### Examples Command
```bash
npm run cli -- help-examples

Shows detailed usage examples
```

## 🌐 Web Interface

Start the web server and access the intuitive drag-and-drop interface:

```bash
npm run web
# Open http://localhost:3000
```

### Phase 1 - Consolidation Features:
- Drag & drop file upload
- Real-time analysis
- Processing options with Vietnamese translation
- Automatic file download

### Phase 2 - Dashboard Features:
- Upload consolidated Excel file
- Interactive KPI dashboard
- Filter and search complaints
- **AI Translation**: Click "Dịch sang tiếng Việt" in complaint details
  - Translates English/German to Vietnamese
  - **Context-aware**: Uses complaint tags for more accurate translation
  - Side-by-side view of original and translated text
  - Copy translation to clipboard
  - Smart caching to minimize API calls

## 🔄 Two-Phase Workflow

### Phase 1: Data Consolidation
**Before Consolidation:**
```
Booking ID: ABC123 (3 records)
- Record 1: care_chat source, "Pickup confusion" tag
- Record 2: review source, "Late response" tag  
- Record 3: care_chat source, "Hotel location" tag
```

**After Consolidation:**
```
Booking ID: ABC123 (1 record)
- Source: care_chat; review
- Tags: Pickup confusion; Late response; Hotel location
- Complaint Count: 3
- Merged conversations with clear source separation
```

### Phase 2: Executive Reporting
**Upload the consolidated file to the dashboard to get:**
- 📊 Executive KPI overview (total complaints, affected tours, etc.)
- 📈 Visual charts showing complaint patterns and trends
- 🔍 Interactive data table with filtering and search
- 📋 Detailed complaint views for investigation
- 🎯 Management-ready insights for decision making

## ⚡ Performance

- Handles files with 10,000+ rows
- Processing time typically under 30 seconds
- Memory efficient streaming for large datasets
- Original files remain unchanged

## 🔧 Configuration Options

```javascript
const options = {
    mergeMode: 'full',        // 'full' or 'smart'
    separator: ';',           // Field separator
    tagSeparator: ';'         // Tag separator
};
```

## 📝 Use Cases

### Phase 1 - Data Processing
- Raw data consolidation from multiple platforms (GetYourGuide, Klook, KKday)
- Duplicate booking record cleanup and merging
- Multi-language complaint text standardization

### Phase 2 - Executive Reporting
- Management dashboard for complaint overview
- Supplier performance review meetings
- Operations team daily monitoring
- Quality improvement planning and decision making
- Trend analysis for customer satisfaction initiatives

## 🤝 Support

For issues or questions:
1. Check the example files in the project
2. Use `npm run cli -- help-examples` for usage examples
3. Analyze your file first with `npm run cli -- analyze`

## 📄 License

MIT License - feel free to use and modify as needed.

---

Made with ❤️ for better customer voice analysis

