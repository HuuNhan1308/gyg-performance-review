const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const Translator = require('./translator');

class CustomerVoiceConsolidator {
    constructor(options = {}) {
        this.mergeMode = options.mergeMode || 'full'; // 'full' or 'smart'
        this.separator = options.separator || ';';
        this.tagSeparator = options.tagSeparator || ';';
        
        // Translation options
        this.enableTranslation = options.enableTranslation || false;
        this.translationMode = options.translationMode || 'dictionary'; // 'dictionary' or 'ai'
        this.outputFormat = options.outputFormat || 'vietnamese-only'; // 'vietnamese-only', 'bilingual', 'side-by-side'
        
        // Initialize translator if translation is enabled
        if (this.enableTranslation) {
            this.translator = new Translator({
                translationMode: this.translationMode,
                outputFormat: this.outputFormat,
                separator: this.separator
            });
        }
    }

    async processFile(inputPath, outputPath) {
        try {
            console.log('📁 Reading Excel file...');
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(inputPath);
            
            const worksheet = workbook.getWorksheet(1);
            const data = this.extractData(worksheet);
            
            console.log(`📊 Found ${data.length} records`);
            
            console.log('🔄 Consolidating duplicate Booking IDs...');
            const consolidated = this.consolidateByBookingId(data);
            
            console.log(`✅ Consolidated to ${consolidated.length} unique bookings`);
            
        console.log('💾 Creating output file...');
        await this.writeConsolidatedFile(consolidated, outputPath);
        
        console.log(`🎉 Successfully created: ${outputPath}`);
        
        const result = {
            original: data.length,
            consolidated: consolidated.length,
            outputPath
        };

        // Add translation information if translation was enabled
        if (this.enableTranslation && this.translator) {
            const translationStats = this.translator.getTranslationStats();
            const untranslatedItems = this.translator.getUntranslatedItems();
            
            result.translation = {
                enabled: true,
                mode: this.translationMode,
                outputFormat: this.outputFormat,
                stats: translationStats,
                untranslatedCount: untranslatedItems.length
            };

            // Export untranslated items if any
            if (untranslatedItems.length > 0) {
                const untranslatedPath = outputPath.replace('.xlsx', '_untranslated.json');
                this.translator.exportUntranslatedItems(untranslatedPath);
                result.translation.untranslatedFile = untranslatedPath;
            }

            console.log(`📊 Translation Stats:`);
            console.log(`   Mode: ${this.translationMode}`);
            console.log(`   Output Format: ${this.outputFormat}`);
            console.log(`   Available Sources: ${translationStats.availableSources}`);
            console.log(`   Available Tags: ${translationStats.availableTags}`);
            console.log(`   Untranslated Items: ${untranslatedItems.length}`);
        }
        
        return result;
        } catch (error) {
            console.error('❌ Error processing file:', error.message);
            throw error;
        }
    }

    extractData(worksheet) {
        const data = [];
        const headers = {};
        
        // Find headers in first row
        const firstRow = worksheet.getRow(1);
        firstRow.eachCell((cell, colNumber) => {
            const value = cell.value?.toString().trim().toLowerCase();
            
            // Map various possible column names to standardized names
            if (value.includes('supplier') && value.includes('id')) {
                headers.supplierId = colNumber;
            } else if (value.includes('tour') && value.includes('id')) {
                headers.tourId = colNumber;
            } else if (value.includes('tour') && value.includes('title')) {
                headers.tourTitle = colNumber;
            } else if (value.includes('source')) {
                headers.source = colNumber;
            } else if (value.includes('tag')) {
                headers.tags = colNumber;
            } else if (value.includes('conversation') || value.includes('text')) {
                headers.conversationText = colNumber;
            } else if (value.includes('checkout') && value.includes('date')) {
                headers.checkoutDate = colNumber;
            } else if (value.includes('booking') && value.includes('id')) {
                headers.bookingId = colNumber;
            }
        });

        console.log('📋 Detected columns:', Object.keys(headers));

        // Extract data rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row
            
            const record = {
                supplierId: this.getCellValue(row, headers.supplierId),
                tourId: this.getCellValue(row, headers.tourId),
                tourTitle: this.getCellValue(row, headers.tourTitle),
                source: this.getCellValue(row, headers.source),
                tags: this.getCellValue(row, headers.tags),
                conversationText: this.getCellValue(row, headers.conversationText),
                checkoutDate: this.getCellValue(row, headers.checkoutDate),
                bookingId: this.getCellValue(row, headers.bookingId)
            };

            // Only add records with a valid Booking ID
            if (record.bookingId) {
                data.push(record);
            }
        });

        return data;
    }

    getCellValue(row, colNumber) {
        if (!colNumber) return '';
        const cell = row.getCell(colNumber);
        return cell.value?.toString().trim() || '';
    }

    consolidateByBookingId(data) {
        const grouped = {};
        
        // Group by Booking ID
        data.forEach(record => {
            const bookingId = record.bookingId;
            
            if (!grouped[bookingId]) {
                grouped[bookingId] = {
                    supplierId: record.supplierId,
                    tourId: record.tourId,
                    tourTitle: record.tourTitle,
                    bookingId: bookingId,
                    checkoutDate: record.checkoutDate,
                    sources: [],
                    tags: [],
                    conversations: [],
                    complaintCount: 0
                };
            }
            
            const group = grouped[bookingId];
            
            // Collect sources
            if (record.source && !group.sources.includes(record.source)) {
                group.sources.push(record.source);
            }
            
            // Collect tags
            if (record.tags) {
                const tagList = record.tags.split(this.tagSeparator)
                    .map(tag => tag.trim())
                    .filter(tag => tag && !group.tags.includes(tag));
                group.tags.push(...tagList);
            }
            
            // Collect conversations
            if (record.conversationText) {
                group.conversations.push({
                    source: record.source || 'unknown',
                    text: record.conversationText
                });
            }
            
            group.complaintCount++;
        });

        // Convert to array and merge conversations
        return Object.values(grouped).map(group => {
            const sourceMerged = group.sources.join(this.separator + ' ');
            const tagsMerged = group.tags.join(this.tagSeparator + ' ');
            
            const result = {
                ...group,
                sourceMerged: sourceMerged,
                tagsMerged: tagsMerged,
                conversationTextMerged: this.mergeConversations(group.conversations)
            };

            // Apply translations if enabled
            if (this.enableTranslation && this.translator) {
                const translatedSources = this.translator.translateSourcesMerged(sourceMerged);
                const translatedTags = this.translator.translateTagsMerged(tagsMerged);

                if (this.outputFormat === 'side-by-side') {
                    // Add separate columns for original and translated versions
                    result.sourceOriginal = translatedSources.original;
                    result.sourceTranslated = translatedSources.translated;
                    result.tagsOriginal = translatedTags.original;
                    result.tagsTranslated = translatedTags.translated;
                    
                    // Keep the merged fields as translated for backward compatibility
                    result.sourceMerged = translatedSources.translated;
                    result.tagsMerged = translatedTags.translated;
                } else {
                    // Replace the merged fields with translated versions
                    result.sourceMerged = translatedSources;
                    result.tagsMerged = translatedTags;
                }
            }

            return result;
        });
    }

    mergeConversations(conversations) {
        if (!conversations.length) return '';
        
        if (this.mergeMode === 'smart') {
            return this.generateSmartSummary(conversations);
        }
        
        // Full merge mode (default)
        const grouped = {};
        
        conversations.forEach(conv => {
            if (!grouped[conv.source]) {
                grouped[conv.source] = [];
            }
            grouped[conv.source].push(conv.text);
        });
        
        let result = '';
        Object.entries(grouped).forEach(([source, texts]) => {
            result += `[${source}]\n`;
            texts.forEach(text => {
                result += `- ${text}\n`;
            });
            result += '\n';
        });
        
        return result.trim();
    }

    generateSmartSummary(conversations) {
        // Simple keyword-based summary (can be enhanced with AI/NLP later)
        const allText = conversations.map(c => c.text).join(' ');
        const keywords = this.extractKeywords(allText);
        
        const summary = `Summary: Customer complaint regarding ${keywords.slice(0, 3).join(', ')}.`;
        const keyIssues = keywords.slice(0, 5).map(keyword => `- ${keyword}`).join('\n');
        
        return `${summary}\n\nKey Issues:\n${keyIssues}`;
    }

    extractKeywords(text) {
        // Simple keyword extraction - can be improved
        const commonIssues = [
            'pickup', 'hotel', 'confirmation', 'supplier', 'responsive', 'unclear',
            'cancelled', 'refund', 'quality', 'guide', 'location', 'time', 'delay',
            'communication', 'booking', 'information', 'service', 'problem'
        ];
        
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        return commonIssues.filter(issue => words.includes(issue));
    }

    async writeConsolidatedFile(data, outputPath) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Consolidated Customer Voice');

        // Define base columns
        const columns = [
            { header: 'Supplier ID', key: 'supplierId', width: 15 },
            { header: 'Tour ID', key: 'tourId', width: 15 },
            { header: 'Tour Title', key: 'tourTitle', width: 30 },
            { header: 'Booking ID', key: 'bookingId', width: 20 },
            { header: 'Checkout Date', key: 'checkoutDate', width: 15 }
        ];

        // Add source columns based on translation mode
        if (this.enableTranslation && this.outputFormat === 'side-by-side') {
            columns.push(
                { header: 'Source (EN)', key: 'sourceOriginal', width: 20 },
                { header: 'Source (VI)', key: 'sourceTranslated', width: 20 },
                { header: 'Tags (EN)', key: 'tagsOriginal', width: 40 },
                { header: 'Tags (VI)', key: 'tagsTranslated', width: 40 }
            );
        } else {
            columns.push(
                { header: 'Source (Merged)', key: 'sourceMerged', width: 20 },
                { header: 'Tags (Merged)', key: 'tagsMerged', width: 40 }
            );
        }

        // Add remaining columns
        columns.push(
            { header: 'Complaint Count', key: 'complaintCount', width: 15 },
            { header: 'Conversation Text (Merged)', key: 'conversationTextMerged', width: 60 }
        );

        worksheet.columns = columns;

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6E6' }
        };

        // Add data
        data.forEach(record => {
            worksheet.addRow(record);
        });

        // Auto-fit columns for better readability
        worksheet.columns.forEach(column => {
            if (column.key === 'conversationTextMerged') {
                column.width = 60; // Fixed width for conversation text
            }
        });

        await workbook.xlsx.writeFile(outputPath);
    }
}

module.exports = CustomerVoiceConsolidator;


