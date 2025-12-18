#!/usr/bin/env node

const { Command } = require('commander');
const CustomerVoiceConsolidator = require('./consolidator');
const path = require('path');
const fs = require('fs');

const program = new Command();

program
    .name('cv-consolidate')
    .description('Customer Voice Consolidation Tool - Merge duplicate booking IDs in Excel files')
    .version('1.0.0');

program
    .command('process')
    .description('Process an Excel file to consolidate customer voice data')
    .option('-i, --input <file>', 'Input Excel file path')
    .option('-o, --output <file>', 'Output Excel file path (optional)')
    .option('-m, --mode <mode>', 'Merge mode: full or smart', 'full')
    .option('--separator <sep>', 'Separator for merged fields', ';')
    .option('-t, --translate', 'Enable translation of tags and sources to Vietnamese')
    .option('--translation-mode <mode>', 'Translation mode: dictionary or ai', 'dictionary')
    .option('--output-format <format>', 'Translation output format: vietnamese-only, bilingual, or side-by-side', 'vietnamese-only')
    .action(async (options) => {
        try {
            if (!options.input) {
                console.error('❌ Error: Input file is required. Use -i or --input to specify the file.');
                process.exit(1);
            }

            const inputPath = path.resolve(options.input);
            
            if (!fs.existsSync(inputPath)) {
                console.error(`❌ Error: Input file not found: ${inputPath}`);
                process.exit(1);
            }

            // Generate output filename if not provided
            let outputPath = options.output;
            if (!outputPath) {
                const ext = path.extname(inputPath);
                const base = path.basename(inputPath, ext);
                const dir = path.dirname(inputPath);
                outputPath = path.join(dir, `${base}_consolidated${ext}`);
            } else {
                outputPath = path.resolve(outputPath);
            }

            console.log('🚀 Starting Customer Voice Consolidation Tool');
            console.log(`📥 Input:  ${inputPath}`);
            console.log(`📤 Output: ${outputPath}`);
            console.log(`🔧 Mode:   ${options.mode}`);
            console.log('');

            const consolidator = new CustomerVoiceConsolidator({
                mergeMode: options.mode,
                separator: options.separator,
                enableTranslation: options.translate,
                translationMode: options.translationMode,
                outputFormat: options.outputFormat
            });

            const result = await consolidator.processFile(inputPath, outputPath);

            console.log('');
            console.log('📊 Processing Summary:');
            console.log(`   Original records: ${result.original}`);
            console.log(`   Consolidated records: ${result.consolidated}`);
            console.log(`   Reduction: ${((result.original - result.consolidated) / result.original * 100).toFixed(1)}%`);
            
            if (result.translation) {
                console.log('');
                console.log('🌐 Translation Summary:');
                console.log(`   Translation enabled: ${result.translation.enabled}`);
                console.log(`   Mode: ${result.translation.mode}`);
                console.log(`   Output format: ${result.translation.outputFormat}`);
                console.log(`   Untranslated items: ${result.translation.untranslatedCount}`);
                if (result.translation.untranslatedFile) {
                    console.log(`   Untranslated items exported to: ${result.translation.untranslatedFile}`);
                }
            }
            
            console.log('');
            console.log('✅ Process completed successfully!');
            
        } catch (error) {
            console.error('❌ Processing failed:', error.message);
            process.exit(1);
        }
    });

program
    .command('analyze')
    .description('Analyze an Excel file to show duplicate booking statistics')
    .option('-i, --input <file>', 'Input Excel file path')
    .action(async (options) => {
        try {
            if (!options.input) {
                console.error('❌ Error: Input file is required. Use -i or --input to specify the file.');
                process.exit(1);
            }

            const inputPath = path.resolve(options.input);
            
            if (!fs.existsSync(inputPath)) {
                console.error(`❌ Error: Input file not found: ${inputPath}`);
                process.exit(1);
            }

            console.log('🔍 Analyzing Excel file...');
            
            const consolidator = new CustomerVoiceConsolidator();
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

            console.log('');
            console.log('📊 Analysis Results:');
            console.log(`   Total records: ${data.length}`);
            console.log(`   Unique booking IDs: ${Object.keys(bookingCounts).length}`);
            console.log(`   Duplicate booking IDs: ${duplicates.length}`);
            console.log('');

            if (duplicates.length > 0) {
                console.log('🔄 Top duplicated booking IDs:');
                duplicates.slice(0, 10).forEach(([bookingId, count]) => {
                    console.log(`   ${bookingId}: ${count} occurrences`);
                });

                const totalDuplicateRecords = duplicates.reduce((sum, [, count]) => sum + count, 0);
                const potentialReduction = totalDuplicateRecords - duplicates.length;
                console.log('');
                console.log(`💡 Potential reduction: ${potentialReduction} records (${(potentialReduction / data.length * 100).toFixed(1)}%)`);
            } else {
                console.log('✅ No duplicate booking IDs found!');
            }

        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            process.exit(1);
        }
    });

program
    .command('help-examples')
    .description('Show usage examples')
    .action(() => {
        console.log('📚 Customer Voice Consolidation Tool - Usage Examples:');
        console.log('');
        console.log('1. Basic consolidation:');
        console.log('   cv-consolidate process -i "data.xlsx"');
        console.log('');
        console.log('2. Specify output file:');
        console.log('   cv-consolidate process -i "data.xlsx" -o "consolidated.xlsx"');
        console.log('');
        console.log('3. Use smart merge mode:');
        console.log('   cv-consolidate process -i "data.xlsx" -m smart');
        console.log('');
        console.log('4. Analyze file before processing:');
        console.log('   cv-consolidate analyze -i "data.xlsx"');
        console.log('');
        console.log('5. Custom separator:');
        console.log('   cv-consolidate process -i "data.xlsx" --separator " | "');
        console.log('');
        console.log('6. Enable Vietnamese translation:');
        console.log('   cv-consolidate process -i "data.xlsx" -t');
        console.log('');
        console.log('7. Bilingual output (English → Vietnamese):');
        console.log('   cv-consolidate process -i "data.xlsx" -t --output-format bilingual');
        console.log('');
        console.log('8. Side-by-side columns (EN and VI):');
        console.log('   cv-consolidate process -i "data.xlsx" -t --output-format side-by-side');
        console.log('');
    });

// Parse command line arguments
program.parse();

// If no command is provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}


