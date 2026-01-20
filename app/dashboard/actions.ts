'use server'

import { prisma } from '@/lib/prisma'

export interface DashboardStats {
    articleCount: number
    sources: {
        name: string
        value: number
    }[]
    wordCloudData: { value: string; count: number }[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
    // 1. Article Count (ArticleDb + DbEuropee ? Just ArticleDb based on request "Numero di articoli nel database")
    // Use ArticleDb as main source.
    const articleCount = await prisma.articleDb.count()

    // 2. Sources Count
    const [rssFeedCount, urlCount, fontiEuropeeCount, rssEuropeeCount] = await Promise.all([
        prisma.rssFeedUrl.count(),
        prisma.url.count(),
        prisma.fontiEuropee.count(),
        prisma.rssEuropee.count(),
    ])

    const sources = [
        { name: 'RSS Feed URL', value: rssFeedCount },
        { name: 'URL', value: urlCount },
        { name: 'Fonti Europee', value: fontiEuropeeCount },
        { name: 'RSS Europee', value: rssEuropeeCount },
    ]

    // 3. Word Cloud Data
    // Fetch descriptions from RelevantOrNot where relevant > 0 (assuming 1 is relevant)
    // The user said "items ritenuti rilevanti".
    const relevantItems = await prisma.relevantOrNot.findMany({
        where: { relevant: 1 },
        select: { description: true },
    })

    // Simple word frequency analysis
    const wordMap: Record<string, number> = {}
    const stopWords = new Set(['di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'e', 'o', 'se', 'ma', 'che', 'non', 'del', 'della', 'dei', 'delle', 'al', 'allo', 'alla', 'ai', 'agli', 'alle', 'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle', 'nel', 'nello', 'nella', 'nei', 'negli', 'nelle', 'vol', 'n.', 'n', 'art.', 'art'])

    relevantItems.forEach(item => {
        if (!item.description) return
        const words = item.description.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/)
        words.forEach(word => {
            if (word.length > 2 && !stopWords.has(word)) {
                wordMap[word] = (wordMap[word] || 0) + 1
            }
        })
    })

    // Convert to array and sort
    const wordCloudData = Object.entries(wordMap)
        .map(([text, value]) => ({ value: text, count: value })) // react-tagcloud expects 'value' as text, 'count' as weight
        .sort((a, b) => b.count - a.count)
        .slice(0, 100) // Top 100 words

    return {
        articleCount,
        sources,
        wordCloudData
    }
}
