const ExcelJS = require('exceljs');
const { processFile, analyzeFile } = require('./index.js');
const path = require('path');
const fs = require('fs');

/**
 * Test script for the Customer Voice Consolidation Tool
 * Creates sample data and tests the processing functionality
 */

async function createSampleData() {
    console.log('📝 Creating sample test data...');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customer Voice Data');

    // Define headers
    worksheet.columns = [
        { header: 'Supplier ID', key: 'supplierId', width: 15 },
        { header: 'Tour ID', key: 'tourId', width: 15 },
        { header: 'Tour Title', key: 'tourTitle', width: 30 },
        { header: 'Source', key: 'source', width: 15 },
        { header: 'Tags', key: 'tags', width: 40 },
        { header: 'Conversation Text', key: 'conversationText', width: 60 },
        { header: 'Checkout Date', key: 'checkoutDate', width: 15 },
        { header: 'Booking ID', key: 'bookingId', width: 20 }
    ];

    // Sample data with duplicate Booking IDs
    const sampleData = [
        {
            supplierId: 'SUP001',
            tourId: 'TOUR123',
            tourTitle: 'City Walking Tour',
            source: 'care_chat',
            tags: 'Unclear Pickup Information',
            conversationText: 'Hi, I booked a tour but I\'m not sure about the pickup location. Can you help?',
            checkoutDate: '2025-01-15',
            bookingId: 'BK001'
        },
        {
            supplierId: 'SUP001',
            tourId: 'TOUR123',
            tourTitle: 'City Walking Tour',
            source: 'review',
            tags: 'Supplier Not Responsive',
            conversationText: 'The supplier took too long to respond to my messages about pickup details.',
            checkoutDate: '2025-01-15',
            bookingId: 'BK001'
        },
        {
            supplierId: 'SUP002',
            tourId: 'TOUR456',
            tourTitle: 'Food Tour Experience',
            source: 'care_chat',
            tags: 'Booking Cancellation',
            conversationText: 'I need to cancel my booking due to weather conditions. Can I get a refund?',
            checkoutDate: '2025-01-20',
            bookingId: 'BK002'
        },
        {
            supplierId: 'SUP001',
            tourId: 'TOUR123',
            tourTitle: 'City Walking Tour',
            source: 'care_chat',
            tags: 'Hotel Pickup Issues',
            conversationText: 'The guide couldn\'t find our hotel for pickup. We waited 30 minutes.',
            checkoutDate: '2025-01-15',
            bookingId: 'BK001'
        },
        {
            supplierId: 'SUP003',
            tourId: 'TOUR789',
            tourTitle: 'Museum Private Tour',
            source: 'review',
            tags: 'Tour Quality Issues',
            conversationText: 'The tour was not as described. The guide seemed unprepared and rushed.',
            checkoutDate: '2025-01-25',
            bookingId: 'BK003'
        },
        {
            supplierId: 'SUP002',
            tourId: 'TOUR456',
            tourTitle: 'Food Tour Experience',
            source: 'review',
            tags: 'Service Quality; Communication Issues',
            conversationText: 'Great food but poor communication from the tour operator before the tour.',
            checkoutDate: '2025-01-20',
            bookingId: 'BK002'
        },
        {
            supplierId: 'SUP004',
            tourId: 'TOUR101',
            tourTitle: 'Adventure Hiking Tour',
            source: 'care_chat',
            tags: 'Safety Concerns',
            conversationText: 'The trail was more difficult than advertised. No proper safety briefing was given.',
            checkoutDate: '2025-01-30',
            bookingId: 'BK004'
        },
        {
            supplierId: 'SUP003',
            tourId: 'TOUR789',
            tourTitle: 'Museum Private Tour',
            source: 'care_chat',
            tags: 'Booking Confirmation Issues',
            conversationText: 'I never received confirmation for my private tour booking. Is it confirmed?',
            checkoutDate: '2025-01-25',
            bookingId: 'BK003'
        }
    ];

    // Add data to worksheet
    sampleData.forEach(record => {
        worksheet.addRow(record);
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6E6' }
    };

    const sampleFilePath = 'sample_customer_voice_data.xlsx';
    await workbook.xlsx.writeFile(sampleFilePath);
    
    console.log(`✅ Sample data created: ${sampleFilePath}`);
    console.log(`📊 Contains ${sampleData.length} records with duplicate Booking IDs`);
    
    return sampleFilePath;
}

async function testAnalysis(filePath) {
    console.log('\n🔍 Testing file analysis...');
    
    try {
        const analysis = await analyzeFile(filePath);
        
        console.log('📊 Analysis Results:');
        console.log(`   Total records: ${analysis.totalRecords}`);
        console.log(`   Unique booking IDs: ${analysis.uniqueBookingIds}`);
        console.log(`   Duplicate booking IDs: ${analysis.duplicateBookingIds}`);
        console.log(`   Potential reduction: ${analysis.potentialReduction} records (${analysis.reductionPercentage}%)`);
        
        if (analysis.topDuplicates.length > 0) {
            console.log('\n🔄 Top duplicated booking IDs:');
            analysis.topDuplicates.forEach(([bookingId, count]) => {
                console.log(`   ${bookingId}: ${count} occurrences`);
            });
        }
        
        return analysis;
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        throw error;
    }
}

async function testProcessing(filePath, mode = 'full') {
    console.log(`\n⚙️ Testing file processing (${mode} mode)...`);
    
    try {
        const outputPath = `sample_consolidated_${mode}.xlsx`;
        
        const result = await processFile(filePath, outputPath, { 
            mergeMode: mode,
            separator: '; '
        });
        
        console.log('✅ Processing completed successfully!');
        console.log(`📊 Processing Results:`);
        console.log(`   Original records: ${result.original}`);
        console.log(`   Consolidated records: ${result.consolidated}`);
        console.log(`   Reduction: ${((result.original - result.consolidated) / result.original * 100).toFixed(1)}%`);
        console.log(`   Output file: ${outputPath}`);
        
        return result;
    } catch (error) {
        console.error('❌ Processing failed:', error.message);
        throw error;
    }
}

async function testTranslation(filePath) {
    console.log(`\n🌐 Testing Vietnamese translation feature...`);
    
    try {
        // Test Vietnamese-only translation
        console.log('   Testing Vietnamese-only output...');
        let outputPath = 'sample_consolidated_vietnamese.xlsx';
        let result = await processFile(filePath, outputPath, { 
            mergeMode: 'full',
            separator: '; ',
            enableTranslation: true,
            translationMode: 'dictionary',
            outputFormat: 'vietnamese-only'
        });
        
        console.log(`   ✅ Vietnamese-only: ${result.consolidated} records`);
        if (result.translation) {
            console.log(`      Untranslated items: ${result.translation.untranslatedCount}`);
        }

        // Test bilingual translation
        console.log('   Testing bilingual output...');
        outputPath = 'sample_consolidated_bilingual.xlsx';
        result = await processFile(filePath, outputPath, { 
            mergeMode: 'full',
            separator: '; ',
            enableTranslation: true,
            translationMode: 'dictionary',
            outputFormat: 'bilingual'
        });
        
        console.log(`   ✅ Bilingual: ${result.consolidated} records`);

        // Test side-by-side translation
        console.log('   Testing side-by-side columns...');
        outputPath = 'sample_consolidated_sidebyside.xlsx';
        result = await processFile(filePath, outputPath, { 
            mergeMode: 'full',
            separator: '; ',
            enableTranslation: true,
            translationMode: 'dictionary',
            outputFormat: 'side-by-side'
        });
        
        console.log(`   ✅ Side-by-side: ${result.consolidated} records`);
        
        console.log('✅ Translation testing completed successfully!');
        return result;
    } catch (error) {
        console.error('❌ Translation testing failed:', error.message);
        throw error;
    }
}

async function runTests() {
    console.log('🚀 Customer Voice Consolidation Tool - Test Suite');
    console.log('================================================\n');
    
    try {
        // Create sample data
        const sampleFilePath = await createSampleData();
        
        // Test analysis
        await testAnalysis(sampleFilePath);
        
        // Test full merge processing
        await testProcessing(sampleFilePath, 'full');
        
        // Test smart merge processing
        await testProcessing(sampleFilePath, 'smart');

        // Test translation feature
        await testTranslation(sampleFilePath);
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('\nGenerated files:');
        console.log('- sample_customer_voice_data.xlsx (original)');
        console.log('- sample_consolidated_full.xlsx (full merge)');
        console.log('- sample_consolidated_smart.xlsx (smart summary)');
        console.log('- sample_consolidated_vietnamese.xlsx (Vietnamese translation)');
        console.log('- sample_consolidated_bilingual.xlsx (bilingual output)');
        console.log('- sample_consolidated_sidebyside.xlsx (side-by-side columns)');
        console.log('\nYou can now compare the original and consolidated files.');
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        process.exit(1);
    }
}

// Export test functions for individual use
module.exports = {
    createSampleData,
    testAnalysis,
    testProcessing,
    testTranslation,
    runTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}


