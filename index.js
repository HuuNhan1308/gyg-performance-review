const CustomerVoiceConsolidator = require('./consolidator');
const path = require('path');

/**
 * Main entry point for the Customer Voice Consolidation Tool
 * Can be used programmatically or as a module
 */

// If running directly (not as a module)
if (require.main === module) {
    console.log('🚀 Customer Voice Consolidation Tool');
    console.log('');
    console.log('Usage options:');
    console.log('1. CLI: npm run cli -- process -i "input.xlsx"');
    console.log('2. Web Interface: npm run web');
    console.log('3. Programmatically: const consolidator = require("./index.js");');
    console.log('');
    console.log('For more help: npm run cli -- help');
}

/**
 * Create a new consolidator instance
 * @param {Object} options - Configuration options
 * @param {string} options.mergeMode - 'full' or 'smart' merge mode
 * @param {string} options.separator - Separator for merged fields
 * @returns {CustomerVoiceConsolidator} New consolidator instance
 */
function createConsolidator(options = {}) {
    return new CustomerVoiceConsolidator(options);
}

/**
 * Process a file directly
 * @param {string} inputPath - Path to input Excel file
 * @param {string} outputPath - Path for output Excel file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing results
 */
async function processFile(inputPath, outputPath, options = {}) {
    const consolidator = createConsolidator(options);
    return await consolidator.processFile(inputPath, outputPath);
}

/**
 * Analyze a file for duplicate statistics
 * @param {string} inputPath - Path to input Excel file
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeFile(inputPath) {
    const consolidator = createConsolidator();
    const ExcelJS = require('exceljs');
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputPath);
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

    return {
        totalRecords: data.length,
        uniqueBookingIds: Object.keys(bookingCounts).length,
        duplicateBookingIds: duplicates.length,
        topDuplicates: duplicates.slice(0, 10),
        potentialReduction: potentialReduction,
        reductionPercentage: data.length > 0 ? (potentialReduction / data.length * 100).toFixed(1) : 0
    };
}

// Export the main functions
module.exports = {
    CustomerVoiceConsolidator,
    createConsolidator,
    processFile,
    analyzeFile
};


