import { createClient } from '@sanity/client'

export const sanityClient = createClient({
    projectId: process.env.SANITY_PROJECT_ID || '',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-02-20',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || '',
})
