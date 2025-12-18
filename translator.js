const fs = require('fs');
const path = require('path');

class Translator {
    constructor(options = {}) {
        this.translationMode = options.translationMode || 'dictionary'; // 'dictionary' or 'ai'
        this.outputFormat = options.outputFormat || 'vietnamese-only'; // 'vietnamese-only', 'bilingual', 'side-by-side'
        this.separator = options.separator || ';';
        
        this.loadTranslationDictionary();
        this.untranslatedItems = new Set();
    }

    loadTranslationDictionary() {
        try {
            const translationsPath = path.join(__dirname, 'translations.json');
            const translationsData = fs.readFileSync(translationsPath, 'utf8');
            this.translations = JSON.parse(translationsData);
        } catch (error) {
            console.warn('⚠️ Could not load translation dictionary, using empty dictionary');
            this.translations = { sources: {}, tags: {} };
        }
    }

    translateSource(source) {
        if (!source) return '';
        
        const trimmedSource = source.trim();
        const translated = this.translations.sources[trimmedSource];
        
        if (translated) {
            return this.formatOutput(trimmedSource, translated);
        }
        
        // Mark as untranslated
        this.untranslatedItems.add(`Source: ${trimmedSource}`);
        return this.formatOutput(trimmedSource, trimmedSource);
    }

    translateTag(tag) {
        if (!tag) return '';
        
        const trimmedTag = tag.trim();
        const translated = this.translations.tags[trimmedTag];
        
        if (translated) {
            return this.formatOutput(trimmedTag, translated);
        }
        
        // Try case-insensitive matching
        const lowerTag = trimmedTag.toLowerCase();
        for (const [englishTag, vietnameseTag] of Object.entries(this.translations.tags)) {
            if (englishTag.toLowerCase() === lowerTag) {
                return this.formatOutput(trimmedTag, vietnameseTag);
            }
        }
        
        // Mark as untranslated
        this.untranslatedItems.add(`Tag: ${trimmedTag}`);
        return this.formatOutput(trimmedTag, trimmedTag);
    }

    formatOutput(original, translated) {
        switch (this.outputFormat) {
            case 'vietnamese-only':
                return translated;
            case 'bilingual':
                return original === translated ? original : `${original} → ${translated}`;
            case 'side-by-side':
                // This will be handled differently in the consolidator
                return { original, translated };
            default:
                return translated;
        }
    }

    translateSourcesMerged(sourcesString) {
        if (!sourcesString) return this.outputFormat === 'side-by-side' ? { original: '', translated: '' } : '';
        
        const sources = sourcesString.split(this.separator).map(s => s.trim()).filter(s => s);
        const translatedSources = sources.map(source => this.translateSource(source));
        
        if (this.outputFormat === 'side-by-side') {
            const originals = sources;
            const translations = translatedSources.map(t => typeof t === 'object' ? t.translated : t);
            return {
                original: originals.join(`${this.separator} `),
                translated: translations.join(`${this.separator} `)
            };
        }
        
        return translatedSources.join(`${this.separator} `);
    }

    translateTagsMerged(tagsString) {
        if (!tagsString) return this.outputFormat === 'side-by-side' ? { original: '', translated: '' } : '';
        
        const tags = tagsString.split(this.separator).map(t => t.trim()).filter(t => t);
        const translatedTags = tags.map(tag => this.translateTag(tag));
        
        if (this.outputFormat === 'side-by-side') {
            const originals = tags;
            const translations = translatedTags.map(t => typeof t === 'object' ? t.translated : t);
            return {
                original: originals.join(`${this.separator} `),
                translated: translations.join(`${this.separator} `)
            };
        }
        
        return translatedTags.join(`${this.separator} `);
    }

    getUntranslatedItems() {
        return Array.from(this.untranslatedItems);
    }

    exportUntranslatedItems(filePath) {
        const untranslated = this.getUntranslatedItems();
        if (untranslated.length === 0) {
            console.log('✅ All items were translated successfully');
            return;
        }

        const content = {
            info: 'Items that could not be translated',
            count: untranslated.length,
            items: untranslated,
            suggestions: {
                sources: {},
                tags: {}
            }
        };

        // Separate sources and tags for easier manual translation
        untranslated.forEach(item => {
            if (item.startsWith('Source:')) {
                const source = item.replace('Source: ', '');
                content.suggestions.sources[source] = ''; // User can fill this in
            } else if (item.startsWith('Tag:')) {
                const tag = item.replace('Tag: ', '');
                content.suggestions.tags[tag] = ''; // User can fill this in
            }
        });

        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
        console.log(`📝 ${untranslated.length} untranslated items exported to: ${filePath}`);
    }

    // Method to add custom translations at runtime
    addCustomTranslations(customTranslations) {
        if (customTranslations.sources) {
            Object.assign(this.translations.sources, customTranslations.sources);
        }
        if (customTranslations.tags) {
            Object.assign(this.translations.tags, customTranslations.tags);
        }
    }

    // Method to get translation statistics
    getTranslationStats() {
        return {
            availableSources: Object.keys(this.translations.sources).length,
            availableTags: Object.keys(this.translations.tags).length,
            untranslatedCount: this.untranslatedItems.size,
            translationMode: this.translationMode,
            outputFormat: this.outputFormat
        };
    }
}

module.exports = Translator;
