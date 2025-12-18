const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const CustomerVoiceConsolidator = require('./consolidator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Translation cache to avoid repeated API calls
const translationCache = new Map();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `${timestamp}_${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet') || 
            path.extname(file.originalname).toLowerCase() === '.xlsx') {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép file Excel (.xlsx)'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/consolidate', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/analyze', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file nào được tải lên' });
        }

        const consolidator = new CustomerVoiceConsolidator();
        const ExcelJS = require('exceljs');
        
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const worksheet = workbook.getWorksheet(1);
        const data = consolidator.extractData(worksheet);

        // Analyze duplicates
        const bookingCounts = {};
        data.forEach(record => {
            bookingCounts[record.bookingId] = (bookingCounts[record.bookingId] || 0) + 1;
        });

        const duplicates = Object.entries(bookingCounts)
            .filter(([_, count]) => count > 1)
            .sort(([, a], [, b]) => b - a);

        const totalDuplicateRecords = duplicates.reduce((sum, [, count]) => sum + count, 0);
        const potentialReduction = totalDuplicateRecords - duplicates.length;

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            totalRecords: data.length,
            uniqueBookingIds: Object.keys(bookingCounts).length,
            duplicateBookingIds: duplicates.length,
            topDuplicates: duplicates.slice(0, 10),
            potentialReduction: potentialReduction,
            reductionPercentage: data.length > 0 ? (potentialReduction / data.length * 100).toFixed(1) : 0
        });

    } catch (error) {
        console.error('Analysis error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Phân tích thất bại: ' + error.message });
    }
});

app.post('/api/process', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file nào được tải lên' });
        }

        const { 
            mergeMode = 'full', 
            separator = ';',
            enableTranslation = 'false',
            translationMode = 'dictionary',
            outputFormat = 'vietnamese-only'
        } = req.body;
        
        const consolidator = new CustomerVoiceConsolidator({
            mergeMode,
            separator,
            enableTranslation: enableTranslation === 'true',
            translationMode,
            outputFormat
        });

        const outputFilename = `consolidated_${Date.now()}_${req.file.originalname}`;
        const outputPath = path.join(uploadsDir, outputFilename);

        const result = await consolidator.processFile(req.file.path, outputPath);

        // Clean up input file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            result: result,
            downloadUrl: `/api/download/${outputFilename}`
        });

    } catch (error) {
        console.error('Processing error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Xử lý thất bại: ' + error.message });
    }
});

app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Không tìm thấy file' });
    }

    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).json({ error: 'Tải về thất bại' });
        }
        
        // Clean up file after download
        setTimeout(() => {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (cleanupErr) {
                console.error('Cleanup error:', cleanupErr);
            }
        }, 5000); // Delete file after 5 seconds
    });
});

// Phase 2 Dashboard Routes
app.post('/api/dashboard/upload', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file nào được tải lên' });
        }

        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const worksheet = workbook.getWorksheet(1);

        // Parse consolidated data (Phase 1 output format)
        const data = parseDashboardData(worksheet);
        
        // Validate data structure
        if (!validateDashboardData(data)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Định dạng file không hợp lệ. Vui lòng tải lên file đã được tổng hợp bởi công cụ Giai đoạn 1.' });
        }

        // Calculate KPIs
        const kpis = calculateKPIs(data);
        
        // Generate chart data
        const charts = generateChartData(data);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            data: data,
            kpis: kpis,
            charts: charts,
            recordCount: data.length
        });

    } catch (error) {
        console.error('Dashboard upload error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Tải lên thất bại: ' + error.message });
    }
});

// Load default test file for dashboard
app.get('/api/dashboard/load-default', async (req, res) => {
    try {
        const defaultFilePath = path.join(__dirname, 'uploads', 'test.xlsx');
        
        if (!fs.existsSync(defaultFilePath)) {
            return res.status(404).json({ error: 'File dữ liệu mặc định không tìm thấy' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(defaultFilePath);
        
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            return res.status(400).json({ error: 'File Excel không có sheet dữ liệu' });
        }

        const data = parseDashboardData(worksheet);
        
        if (!validateDashboardData(data)) {
            return res.status(400).json({ error: 'Định dạng file không hợp lệ' });
        }

        const kpis = calculateKPIs(data);
        const charts = generateChartData(data);

        res.json({
            success: true,
            data: data,
            kpis: kpis,
            charts: charts,
            recordCount: data.length
        });

    } catch (error) {
        console.error('Load default file error:', error);
        res.status(500).json({ error: 'Tải dữ liệu mặc định thất bại: ' + error.message });
    }
});

app.post('/api/dashboard/filter', (req, res) => {
    try {
        const { data, filters } = req.body;
        
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ error: 'Định dạng dữ liệu không hợp lệ' });
        }

        const filteredData = applyFilters(data, filters);
        const kpis = calculateKPIs(filteredData);
        const charts = generateChartData(filteredData);

        res.json({
            success: true,
            data: filteredData,
            kpis: kpis,
            charts: charts,
            recordCount: filteredData.length
        });

    } catch (error) {
        console.error('Filter error:', error);
        res.status(500).json({ error: 'Lọc dữ liệu thất bại: ' + error.message });
    }
});

// Helper functions for Phase 2 Dashboard
function parseDashboardData(worksheet) {
    const data = [];
    const headers = {};
    
    // Find headers in first row
    const firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell, colNumber) => {
        const value = cell.value?.toString().trim().toLowerCase();
        
        if (value.includes('supplier') && value.includes('id')) {
            headers.supplierId = colNumber;
        } else if (value.includes('tour') && value.includes('id')) {
            headers.tourId = colNumber;
        } else if (value.includes('tour') && value.includes('title')) {
            headers.tourTitle = colNumber;
        } else if (value.includes('booking') && value.includes('id')) {
            headers.bookingId = colNumber;
        } else if (value.includes('checkout') && value.includes('date')) {
            headers.checkoutDate = colNumber;
        } else if (value.includes('source') && value.includes('merged')) {
            headers.sourceMerged = colNumber;
        } else if (value.includes('tags') && value.includes('merged')) {
            headers.tagsMerged = colNumber;
        } else if (value.includes('complaint') && value.includes('count')) {
            headers.complaintCount = colNumber;
        } else if (value.includes('conversation') && value.includes('text')) {
            headers.conversationText = colNumber;
        }
    });

    // Extract data rows
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        
        const record = {
            supplierId: getCellValue(row, headers.supplierId),
            tourId: getCellValue(row, headers.tourId),
            tourTitle: getCellValue(row, headers.tourTitle),
            bookingId: getCellValue(row, headers.bookingId),
            checkoutDate: getCellValue(row, headers.checkoutDate),
            sourceMerged: getCellValue(row, headers.sourceMerged),
            tagsMerged: getCellValue(row, headers.tagsMerged),
            complaintCount: parseInt(getCellValue(row, headers.complaintCount)) || 1,
            conversationText: getCellValue(row, headers.conversationText)
        };

        if (record.bookingId) {
            data.push(record);
        }
    });

    return data;
}

function getCellValue(row, colNumber) {
    if (!colNumber) return '';
    const cell = row.getCell(colNumber);
    return cell.value?.toString().trim() || '';
}

function validateDashboardData(data) {
    if (!data || data.length === 0) return false;
    
    const requiredFields = ['bookingId', 'tourTitle', 'complaintCount'];
    return data.every(record => 
        requiredFields.every(field => record[field] !== undefined && record[field] !== '')
    );
}

function calculateKPIs(data) {
    const totalBookings = data.length;
    const totalComplaints = data.reduce((sum, record) => sum + record.complaintCount, 0);
    const uniqueTours = new Set(data.map(record => record.tourTitle)).size;
    
    // Extract all tags
    const allTags = data.flatMap(record => 
        record.tagsMerged ? record.tagsMerged.split(';').map(tag => tag.trim()).filter(tag => tag) : []
    );
    const uniqueTags = new Set(allTags).size;
    
    // Extract all sources
    const allSources = data.flatMap(record => 
        record.sourceMerged ? record.sourceMerged.split(';').map(source => source.trim()).filter(source => source) : []
    );
    const sourceDistribution = {};
    allSources.forEach(source => {
        sourceDistribution[source] = (sourceDistribution[source] || 0) + 1;
    });

    return {
        totalBookings,
        totalComplaints,
        uniqueTours,
        uniqueTags,
        sourceDistribution,
        averageComplaintsPerBooking: (totalComplaints / totalBookings).toFixed(1)
    };
}

function generateChartData(data) {
    // Complaints by tag
    const tagCounts = {};
    data.forEach(record => {
        if (record.tagsMerged) {
            const tags = record.tagsMerged.split(';').map(tag => tag.trim()).filter(tag => tag);
            tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + record.complaintCount;
            });
        }
    });

    // Complaints by source
    const sourceCounts = {};
    data.forEach(record => {
        if (record.sourceMerged) {
            const sources = record.sourceMerged.split(';').map(source => source.trim()).filter(source => source);
            sources.forEach(source => {
                sourceCounts[source] = (sourceCounts[source] || 0) + record.complaintCount;
            });
        }
    });

    // Top tours by complaint volume
    const tourCounts = {};
    data.forEach(record => {
        const tourKey = `${record.tourTitle} (${record.tourId})`;
        tourCounts[tourKey] = (tourCounts[tourKey] || 0) + record.complaintCount;
    });

    return {
        tagChart: {
            labels: Object.keys(tagCounts), // Show all tags
            data: Object.values(tagCounts)
        },
        sourceChart: {
            labels: Object.keys(sourceCounts),
            data: Object.values(sourceCounts)
        },
        topTours: Object.entries(tourCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tour, count]) => ({ tour, count }))
    };
}

function applyFilters(data, filters) {
    if (!filters) return data;
    
    return data.filter(record => {
        // Date range filter
        if (filters.dateFrom || filters.dateTo) {
            const checkoutDate = new Date(record.checkoutDate);
            if (filters.dateFrom && checkoutDate < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && checkoutDate > new Date(filters.dateTo)) return false;
        }
        
        // Tour filter
        if (filters.tour && !record.tourTitle.toLowerCase().includes(filters.tour.toLowerCase())) {
            return false;
        }
        
        // Tag filter
        if (filters.tag && !record.tagsMerged?.toLowerCase().includes(filters.tag.toLowerCase())) {
            return false;
        }
        
        // Source filter
        if (filters.source && !record.sourceMerged?.toLowerCase().includes(filters.source.toLowerCase())) {
            return false;
        }
        
        // Keyword search
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            const searchFields = [
                record.tourTitle,
                record.tagsMerged,
                record.sourceMerged,
                record.conversationText,
                record.bookingId
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(keyword)) {
                return false;
            }
        }
        
        // Complaint count range
        if (filters.minComplaints && record.complaintCount < filters.minComplaints) {
            return false;
        }
        if (filters.maxComplaints && record.complaintCount > filters.maxComplaints) {
            return false;
        }
        
        return true;
    });
}

// AI Conversation Translation using Gemini
async function translateConversationText(text, sourceContext = '', tags = '') {
    if (!GEMINI_API_KEY) {
        throw new Error('Chưa cấu hình GEMINI_API_KEY. Vui lòng thiết lập biến môi trường.');
    }

    // Check cache first - include tags in cache key for better accuracy
    const cacheKey = `${sourceContext}:${tags}:${text}`;
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an Advanced Localization Intelligence. Your goal is to process and translate customer feedback into natural, easy-to-read Vietnamese. 

### CORE PROCESSING RULES:
1. **Read & Synthesize:** First, analyze the input for any repetitive sentences, paragraphs, or redundant information. Do not translate duplicates. Instead, synthesize the core meaning into a single, cohesive, and concise Vietnamese response.
2. **Contextual Localization:** Avoid word-by-word translation. Rephrase the content to sound like a natural Vietnamese speaker while keeping the original sentiment and tone (e.g., frustration, satisfaction, or suggestion).
3. **Handle Discrepancies:** If the input contains repeated blocks of text (as in the example of duplicate reviews), extract the unique information and provide one clean translation.

### FORMATTING & LABELS (MANDATORY):
1. **Maintain Structure:** Keep the original intent and line breaks, but ensure the flow is logical for a Vietnamese reader.
2. **Source Label Mapping:**
   - [care_chat] → [Hỗ trợ khách hàng]
   - [relay] → [Tin nhắn khách hàng]
   - [review] → [Review]
3. **Speaker Label Mapping:**
   - customer: → Khách hàng:
   - agent: → Nhân viên hỗ trợ:
   - driver: → Tài xế:
   - guide: → Hướng dẫn viên:
   - supplier: → Nhà cung cấp:
4. **Data Integrity:** Do not translate or alter timestamps, phone numbers, or email addresses.

### OUTPUT RESTRICTION:
- Provide ONLY the final Vietnamese translation. 
- No explanations, no "Here is the translation," and no meta-comments.

${sourceContext ? `SOURCE CONTEXT: ${sourceContext}\n` : ''}${tags ? `COMPLAINT CATEGORY: ${tags}\n` : ''}

CONTENT TO PROCESS & TRANSLATE:
"""
${text}
"""

VIETNAMESE TRANSLATION:`;

    try {
        const result = await model.generateContent(prompt);
        const translatedText = result.response.text().trim();
        
        // Cache the translation
        translationCache.set(cacheKey, translatedText);
        
        // Limit cache size to prevent memory issues
        if (translationCache.size > 100) {
            const firstKey = translationCache.keys().next().value;
            translationCache.delete(firstKey);
        }
        
        return translatedText;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Lỗi khi gọi API dịch. Vui lòng thử lại sau.');
    }
}

// Translation endpoint for conversation text
app.post('/api/translate-conversation', async (req, res) => {
    try {
        const { text, source, tags } = req.body;

        // Validate input
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Không có nội dung để dịch' });
        }

        // Check if content is too long (> 10,000 characters)
        if (text.length > 10000) {
            return res.status(400).json({ error: 'Nội dung quá dài (> 10,000 ký tự)' });
        }

        // Simple Vietnamese detection
        const vietnamesePattern = /[àáạảãâấầậẩẫăắằặẳẵèéẹẻẽêếềệểễìíịỉĩòóọỏõôốồộổỗơớờợởỡùúụủũưứừựửữỳýỵỷỹđ]/i;
        const hasVietnamese = vietnamesePattern.test(text);
        
        // If mostly Vietnamese, no need to translate
        const vietnameseCharCount = (text.match(vietnamesePattern) || []).length;
        const totalChars = text.replace(/\s/g, '').length;
        
        if (hasVietnamese && vietnameseCharCount / totalChars > 0.3) {
            return res.json({ 
                translatedText: text,
                alreadyVietnamese: true,
                message: 'Nội dung đã là tiếng Việt'
            });
        }

        // Translate using Gemini with tags context
        const translatedText = await translateConversationText(text, source, tags);

        res.json({
            success: true,
            translatedText: translatedText,
            originalLength: text.length,
            translatedLength: translatedText.length,
            cached: translationCache.has(`${source}:${tags}:${text}`)
        });

    } catch (error) {
        console.error('Translation error:', error);
        
        if (error.message.includes('GEMINI_API_KEY')) {
            return res.status(500).json({ 
                error: 'Chưa cấu hình API key. Vui lòng liên hệ quản trị viên.' 
            });
        }
        
        res.status(500).json({ 
            error: error.message || 'Không thể dịch. Vui lòng thử lại sau.' 
        });
    }
});

// Get translation cache statistics
app.get('/api/translation-stats', (req, res) => {
    res.json({
        cacheSize: translationCache.size,
        apiKeyConfigured: !!GEMINI_API_KEY
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File quá lớn. Kích thước tối đa là 50MB.' });
        }
    }
    res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
    console.log(`🌐 Customer Voice Consolidation Tool - Full Platform`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Phase 1 (Consolidation): http://localhost:${PORT}/consolidate`);
    console.log(`📈 Phase 2 (Dashboard): http://localhost:${PORT}/dashboard`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
});

module.exports = app;

