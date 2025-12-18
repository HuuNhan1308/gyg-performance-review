# 📊 Customer Voice Dashboard

An executive dashboard platform for Customer Voice (complaint) data management with interactive reporting and AI-powered Vietnamese translation.

## 🎯 Features

### Executive Dashboard
- **Interactive Dashboard**: Executive-friendly KPI overview and visualizations
- **Data Exploration**: Filter, search, and sort complaint data
- **Visual Analytics**: Charts showing complaint patterns by tag, source, and tour
- **Detailed Views**: Click-through to individual complaint details
- **AI Translation**: On-demand Vietnamese translation of conversation text using Google Gemini
- **Real-time Filtering**: Dynamic data filtering without page reloads
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-load Test Data**: Automatically loads default test file on startup

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install
```

### AI Translation Setup (Optional)

For Vietnamese translation of conversation text in the dashboard:

1. **Get Google Gemini API Key**: Visit https://makersuite.google.com/app/apikey
2. **Set environment variable**:
   ```bash
   # Windows PowerShell
   $env:GEMINI_API_KEY = "your_api_key_here"
   
   # Linux/Mac
   export GEMINI_API_KEY=your_api_key_here
   ```

> **Note**: Translation feature works without API key configuration, but will show an error when attempting to translate.

### Usage

```bash
# Start the dashboard server
npm start

# Or
npm run web

# Access dashboard at: http://localhost:3000
```

The dashboard will automatically load the default test file (`uploads/test.xlsx`) on page load.

## 📋 Input Requirements

### Required Columns

Your Excel file must contain these columns (case-insensitive):

| Column Name                | Description                              |
| -------------------------- | ---------------------------------------- |
| Supplier ID                | Supplier identifier                      |
| Tour ID                    | Tour identifier                          |
| Tour Title                 | Tour name                                |
| Booking ID                 | Booking identifier (**required**)        |
| Checkout Date              | Checkout date                            |
| Source (Merged)            | Feedback source (e.g. care_chat, review) |
| Tags (Merged)              | Complaint tags                           |
| Complaint Count            | Number of complaints                     |
| Conversation Text (Merged) | Customer message or chat transcript      |

## 📊 Dashboard Features

### KPI Summary

The dashboard displays an executive overview with the following metrics:

- **Tổng số booking có khiếu nại** (Total bookings with complaints)
- **Tổng số khiếu nại** (Total complaints)
- **Số lượng tour bị ảnh hưởng** (Number of affected tours)
- **Số lượng tag khiếu nại** (Number of complaint tags)
- **Phân bổ khiếu nại theo nguồn** (Complaint distribution by source)

### Visual Components

- **Biểu đồ cột**: Complaints by Tag
- **Biểu đồ tròn**: Complaints by Source
- **Danh sách tour**: Tours with most complaints

### Interactive Data Table

#### Table Features

- **Sắp xếp**: Sort by date, complaint count
- **Lọc theo**:
  - Tour
  - Tag
  - Source
  - Date range
- **Tìm kiếm**: Keyword search
- **Chi tiết**: Click row to view full complaint details

### AI Translation Feature

#### Overview

Provides **AI-powered translation** of conversation text from English/German to Vietnamese using Google Gemini.

#### How to Use

1. Click on any complaint row to view details
2. Click **"Dịch sang tiếng Việt"** button
3. View side-by-side original and translated text
4. Copy translation to clipboard if needed

#### Features

- **Context-aware translation**: Uses complaint tags for more accurate translation
- **Smart caching**: Reduces API calls by caching translations
- **Side-by-side view**: Compare original and translated text
- **Speaker label translation**: Converts "customer:" → "Khách hàng:", etc.
- **Source label translation**: [care_chat] → [Hỗ trợ khách hàng]

### Enhanced Readability

The conversation text display is optimized for senior users with:
- Large font sizes (1.35rem)
- High line spacing (2.1)
- High contrast colors
- Clean white background
- Professional appearance

## 📁 File Structure

```
customer-voice-dashboard/
├── server.js                  # Web server with dashboard API
├── public/
│   └── dashboard.html         # Dashboard interface
├── uploads/
│   └── test.xlsx              # Default test data file
├── package.json               # Project dependencies
└── README.md                  # This file
```

## ⚙️ Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `GEMINI_API_KEY`: Google Gemini API key for translation

### Default Test File

Place your default Excel file at `uploads/test.xlsx` to enable auto-load on dashboard startup.

## 📤 Uploading Data

You can upload your own Excel files through the dashboard interface:

1. Click the upload button
2. Select your Excel file
3. Dashboard will update with your data

## 🔧 Technical Stack

- **Backend**: Node.js + Express
- **Excel Processing**: ExcelJS
- **AI Translation**: Google Generative AI (Gemini)
- **Frontend**: Vanilla JavaScript + Chart.js

## 📝 Use Cases

- Management dashboard for complaint overview
- Supplier performance review meetings
- Operations team daily monitoring
- Quality improvement planning
- Trend analysis for customer satisfaction initiatives

## ⚡ Performance

- Handles files with 10,000+ rows
- Loading time typically under 5 seconds
- Memory efficient data processing
- Real-time filtering and search

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari

## 🤝 Support

For issues or questions:
1. Check that your Excel file matches the required format
2. Ensure the default test file exists at `uploads/test.xlsx`
3. Verify GEMINI_API_KEY is set if using translation

## 📄 License

MIT License - feel free to use and modify as needed.

---

Made with ❤️ for better customer voice analysis
