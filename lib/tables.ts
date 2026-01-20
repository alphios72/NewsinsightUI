export const ALL_TABLES = [
    { name: 'rss_feed_url', label: 'RSS Feed URL', model: 'rssFeedUrl' },
    { name: 'db_burc', label: 'DB Burc', model: 'dbBurc' },
    { name: 'relevant_or_not', label: 'Relevant Or Not', model: 'relevantOrNot' },
    { name: 'logs', label: 'Logs', model: 'logs' },
    { name: 'fonti_europee', label: 'Fonti Europee', model: 'fontiEuropee' },
    { name: 'rss_db', label: 'RSS DB', model: 'rssDb' },
    { name: 'rss_europee', label: 'RSS Europee', model: 'rssEuropee' },
    { name: 'article_db', label: 'Article DB', model: 'articleDb' },
    { name: 'burc', label: 'Burc', model: 'burc' },
    { name: 'db_europee', label: 'DB Europee', model: 'dbEuropee' },
    { name: 'url', label: 'URL', model: 'url' },
]

export type TableConfig = {
    name: string
    label: string
    model: string
}
