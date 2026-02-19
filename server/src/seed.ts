import 'dotenv/config'
import { db } from './db/index.js'
import { vertical } from './db/schema.js'

const verticals = [
    {
        slug: 'financial-banking',
        name: 'Financial & Banking',
        description: 'Sector trend analysis, regulatory outlook, financial product comparisons, fintech observations',
        disclaimer: 'Content in this vertical is for informational purposes only and does not constitute financial advice. Always consult a licensed financial advisor before making investment decisions.',
        iconName: 'Landmark',
        color: '#7928CA',
    },
    {
        slug: 'government-policy',
        name: 'Government & Policy',
        description: 'Public-record-based government sector research, policy trajectory forecasting',
        disclaimer: 'Analysis is based on publicly available information. Content does not represent official government positions and should not be construed as political advice.',
        iconName: 'Shield',
        color: '#3B82F6',
    },
    {
        slug: 'sports-recreational',
        name: 'Sports & Recreational',
        description: 'Statistical analysis, probability modeling, form analysis, market commentary',
        disclaimer: 'Sports analysis is for entertainment and informational purposes only. Past performance does not guarantee future results. Gambling involves risk.',
        iconName: 'Trophy',
        color: '#00D68F',
    },
    {
        slug: 'digital-assets-web3',
        name: 'Digital Assets & Web3',
        description: 'Blockchain research, on-chain data analysis, DeFi comparisons, airdrop research',
        disclaimer: 'Digital asset markets are highly volatile. Content does not constitute investment advice. You may lose your entire investment. Do your own research.',
        iconName: 'Bitcoin',
        color: '#F59E0B',
    },
    {
        slug: 'real-estate-property',
        name: 'Real Estate & Property',
        description: 'Area appreciation analysis, developer track record research, rental yield estimates',
        disclaimer: 'Property analysis is based on available data and professional opinion. Actual property values may differ. Consult a licensed agent before purchasing.',
        iconName: 'Building2',
        color: '#EC4899',
    },
    {
        slug: 'professional-career',
        name: 'Professional & Career',
        description: 'Hiring trends, salary benchmarking, career navigation, professional development',
        disclaimer: 'Career advice reflects individual creator perspectives. Employment outcomes vary. Verify information with official sources.',
        iconName: 'Briefcase',
        color: '#8B5CF6',
    },
    {
        slug: 'open-market-trade',
        name: 'Open Market & Trade',
        description: 'Supply chain patterns, import logistics, product availability trends, wholesale dynamics',
        disclaimer: 'Market observations are based on creator experience. Prices and availability change frequently. Verify before making business decisions.',
        iconName: 'Store',
        color: '#EF4444',
    },
    {
        slug: 'creator-economy',
        name: 'Creator Economy & Digital Business',
        description: 'Platform strategy, monetization commentary, content trends, brand deal observations',
        disclaimer: 'Creator economy insights reflect individual experiences. Results vary by platform, niche, and effort. No income guarantees.',
        iconName: 'Palette',
        color: '#FF6B35',
    },
    {
        slug: 'agriculture-food',
        name: 'Agriculture & Food',
        description: 'Harvest intelligence, commodity price trends, supply chain pattern observation',
        disclaimer: 'Agricultural analysis is based on available data and field observations. Actual yields and prices may vary significantly.',
        iconName: 'Wheat',
        color: '#22C55E',
    },
    {
        slug: 'oil-gas-energy',
        name: 'Oil, Gas & Energy',
        description: 'Energy sector market analysis, fuel pricing trends, power sector reform analysis',
        disclaimer: 'Energy sector content is for informational purposes only. Market conditions change rapidly. Not investment advice.',
        iconName: 'Fuel',
        color: '#06B6D4',
    },
]

async function seed() {
    console.log('🌱 Seeding verticals...')

    for (const v of verticals) {
        await db.insert(vertical).values(v).onConflictDoNothing()
    }

    console.log(`✅ Seeded ${verticals.length} verticals`)
    process.exit(0)
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
})
