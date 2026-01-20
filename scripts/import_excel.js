const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

// Helper to handle date parsing
const parseDate = (val) => {
    if (val instanceof Date) return val;
    if (!val) return null;
    return new Date(val);
};

// Helper to ensure string and handle nulls/undefined
const asString = (val) => {
    if (val === null || val === undefined) return null;
    return String(val);
};

const mappings = {
    // Already succeeded tables (commented out to avoid duplicates/overhead)
    /*
    'BURC': { ... },
    'url': { ... },
    'relevant_or_not': { ... },
    'logs': { ... },
    'rss_feed_url': { ... },
    'rss_db': { ... },
    */

    // Detailed mappings for failed/remaining tables
    'db_BURC': {
        model: 'dbBurc',
        map: (row) => ({
            article_url: asString(row['article_url']),
            fetched_at: parseDate(row['fetched_at']),
            stato: asString(row['stato'])
        })
    },
    'article_db': {
        model: 'articleDb',
        map: (row) => ({
            article_url: asString(row['article_url']),
            summarized: asString(row['summarized']),
            summary: asString(row['summary']),
            fetched_at: parseDate(row['fetched_at']),
            title: asString(row['title']),
            motivazione_e_tema: asString(row['motivazione e tema']),
            tema_trattato: asString(row['tema trattato'])
        })
    },
    'fonti_europee': {
        model: 'fontiEuropee',
        map: (row) => ({
            website: asString(row['website ']),
            url: asString(row['url']),
            domain: asString(row['domain']),
            css_selector: asString(row['CSS_selector']),
            return_value: asString(row['return_value']),
            attribute: asString(row['attribute'])
        })
    },
    'rss_europee': {
        model: 'rssEuropee',
        map: (row) => ({
            website: asString(row['website ']),
            url: asString(row['url']),
            domain: asString(row['domain']),
            css_selector: asString(row['CSS_selector']),
            return_value: asString(row['return_value']),
            attribute: asString(row['attribute'])
        })
    },
    'db_europee': {
        model: 'dbEuropee',
        map: (row) => ({
            article_url: asString(row['article_url']),
            summarized: row['summarized'] === true || row['summarized'] === 'TRUE' || row['summarized'] === 1,
            summary: asString(row['summary']),
            fetched_at: parseDate(row['fetched_at']),
            title: asString(row['title']),
            motivazione_e_tema: asString(row['motivazione e tema']),
            indice_attinenza: (typeof row['indice attinenza'] === 'number') ? row['indice attinenza'] : parseInt(row['indice attinenza'] || '0'),
            tema_trattato: asString(row['tema trattato'])
        })
    }
};

async function main() {
    try {
        const filePath = path.join(__dirname, '..', 'data.xlsx');
        console.log(`Reading file from: ${filePath}`);

        // Read with cellDates: true to handle date columns correctly
        const workbook = XLSX.readFile(filePath, { cellDates: true });

        for (const [sheetName, config] of Object.entries(mappings)) {
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                console.warn(`Sheet "${sheetName}" not found. Skipping.`);
                continue;
            }

            console.log(`\nProcessing sheet: ${sheetName} -> Table: ${config.model}`);

            // Read as JSON
            const rawData = XLSX.utils.sheet_to_json(worksheet);
            console.log(`  Found ${rawData.length} rows`);

            if (rawData.length === 0) continue;

            const records = rawData.map((row, index) => {
                try {
                    return config.map(row);
                } catch (e) {
                    console.warn(`  Error mapping row ${index}:`, e.message);
                    return null;
                }
            }).filter(record => record !== null);

            console.log(`  Prepared ${records.length} records for insertion`);

            if (records.length > 0) {
                try {
                    const result = await prisma[config.model].createMany({
                        data: records,
                        skipDuplicates: true,
                    });
                    console.log(`  ✅ Successfully inserted ${result.count} records into ${config.model}`);
                } catch (err) {
                    console.error(`  ❌ Error inserting into ${config.model}:`, err.message);
                }
            }
        }

    } catch (error) {
        console.error('Fatal error importing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
