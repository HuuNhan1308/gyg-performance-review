# Environment Configuration Guide

## Google Gemini API Setup

The Customer Voice Dashboard uses Google Gemini AI for translating conversation text from English/German to Vietnamese.

### 1. Get Your Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variable

#### On Windows (PowerShell):
```powershell
$env:GEMINI_API_KEY = "your_api_key_here"
```

#### On Windows (Command Prompt):
```cmd
set GEMINI_API_KEY=your_api_key_here
```

#### On Linux/Mac:
```bash
export GEMINI_API_KEY=your_api_key_here
```

### 3. For Permanent Configuration

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
```

Then install and use `dotenv`:
```bash
npm install dotenv
```

Add to the top of `server.js`:
```javascript
require('dotenv').config();
```

### 4. Verify Configuration

Start the server and check the console:
```bash
npm run web
```

Visit: http://localhost:3000/api/translation-stats

You should see:
```json
{
  "cacheSize": 0,
  "apiKeyConfigured": true
}
```

### 5. Security Notes

- **Never commit** your `.env` file to version control
- Add `.env` to `.gitignore`
- Keep your API key private
- Use environment variables in production

### 6. API Usage Limits

Google Gemini API has usage limits:
- Free tier: 60 requests per minute
- Translation cache is used to minimize API calls
- Cache stores up to 100 translations

### 7. Troubleshooting

**Error: "Chưa cấu hình GEMINI_API_KEY"**
- The API key environment variable is not set
- Follow steps 2-3 above

**Error: "Không thể dịch. Vui lòng thử lại sau"**
- API rate limit exceeded
- Network connectivity issue
- Invalid API key

**Translation returns "Nội dung đã là tiếng Việt"**
- The content is already in Vietnamese
- No translation needed

