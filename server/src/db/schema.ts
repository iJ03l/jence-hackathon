import { pgTable, text, timestamp, boolean, integer, uuid, primaryKey, unique } from 'drizzle-orm/pg-core'

// ===== Better Auth Tables =====

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    username: text('username').unique(), // Made optional initially to avoid migration issues with existing data, but logic should enforce it
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    role: text('role').notNull().default('subscriber'), // 'subscriber' | 'creator' | 'admin'
    isBanned: boolean('is_banned').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id),
})

export const account = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ===== Jence Platform Tables =====

export const vertical = pgTable('vertical', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    disclaimer: text('disclaimer').notNull(),
    iconName: text('icon_name').notNull(),
    color: text('color').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const creatorProfile = pgTable('creator_profile', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id).unique(),
    pseudonym: text('pseudonym').notNull().unique(),
    bio: text('bio'),
    verticalId: uuid('vertical_id').references(() => vertical.id),
    kycStatus: text('kyc_status').notNull().default('pending'), // 'pending' | 'verified' | 'rejected'
    kycDocumentType: text('kyc_document_type'), // 'NIN' | 'BVN' | 'Passport'
    kycDocumentHash: text('kyc_document_hash'), // encrypted reference, never the actual document
    selfCertificationSigned: boolean('self_certification_signed').notNull().default(false),
    selfCertificationDate: timestamp('self_certification_date'),
    strikeCount: integer('strike_count').notNull().default(0),
    isBanned: boolean('is_banned').notNull().default(false),
    payoutAddress: text('payout_address'),
    payoutMethod: text('payout_method').default('crypto'), // 'crypto' | 'bank'
    subscriptionPrice: text('subscription_price').notNull().default('0'), // USDC amount, '0' = free
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const post = pgTable('post', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    excerpt: text('excerpt'),
    creatorId: uuid('creator_id').notNull().references(() => creatorProfile.id),
    verticalId: uuid('vertical_id').notNull().references(() => vertical.id),
    isPublished: boolean('is_published').notNull().default(true),
    isFree: boolean('is_free').notNull().default(false),
    isPinned: boolean('is_pinned').notNull().default(false),
    moderationStatus: text('moderation_status').notNull().default('published'), // 'published' | 'under_review' | 'removed'
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const subscription = pgTable('subscription', {
    id: uuid('id').defaultRandom().primaryKey(),
    subscriberUserId: text('subscriber_user_id').notNull().references(() => user.id),
    creatorProfileId: uuid('creator_profile_id').notNull().references(() => creatorProfile.id),
    status: text('status').notNull().default('active'), // 'active' | 'cancelled' | 'expired'
    txSignature: text('tx_signature'), // Solana transaction signature for payment proof
    amountUsdc: text('amount_usdc'), // Amount paid in USDC
    nextBillingDate: timestamp('next_billing_date'), // Track when the cron job should charge the next month
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const strike = pgTable('strike', {
    id: uuid('id').defaultRandom().primaryKey(),
    creatorProfileId: uuid('creator_profile_id').notNull().references(() => creatorProfile.id),
    postId: uuid('post_id').references(() => post.id),
    reason: text('reason').notNull(),
    policyClause: text('policy_clause'), // specific policy violated
    consequence: text('consequence').notNull(), // 'warning' | 'suspension' | 'termination'
    issuedAt: timestamp('issued_at').notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at'),
})

export const notification = pgTable('notification', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    type: text('type').notNull().default('new_post'), // 'new_post' | 'system'
    title: text('title').notNull(),
    body: text('body'),
    postId: uuid('post_id').references(() => post.id),
    creatorPseudonym: text('creator_pseudonym'),
    isRead: boolean('is_read').notNull().default(false),
    emailSent: boolean('email_sent').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ===== Community / Forum Tables =====

export const communityPost = pgTable('community_post', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const tag = pgTable('tag', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(), // stored as lowercase, no #
    usageCount: integer('usage_count').notNull().default(0),
    color: text('color'), // optional custom color
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const communityPostTag = pgTable('community_post_tag', {
    postId: uuid('post_id').notNull().references(() => communityPost.id),
    tagId: uuid('tag_id').notNull().references(() => tag.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
    primaryKey({ columns: [t.postId, t.tagId] })
])

export const communityPostLike = pgTable('community_post_like', {
    postId: uuid('post_id').notNull().references(() => communityPost.id),
    userId: text('user_id').notNull().references(() => user.id),
    value: integer('value').notNull().default(1), // 1 for upvote, -1 for downvote
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
    primaryKey({ columns: [t.postId, t.userId] })
])

export const postComment = pgTable('post_comment', {
    id: uuid('id').defaultRandom().primaryKey(),
    postId: uuid('post_id').notNull().references(() => post.id),
    userId: text('user_id').notNull().references(() => user.id),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const postVote = pgTable('post_vote', {
    postId: uuid('post_id').notNull().references(() => post.id),
    userId: text('user_id').notNull().references(() => user.id),
    value: integer('value').notNull().default(1), // 1 for upvote, -1 for downvote
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
    primaryKey({ columns: [t.postId, t.userId] })
])

export const communityPostComment = pgTable('community_post_comment', {
    id: uuid('id').defaultRandom().primaryKey(),
    postId: uuid('post_id').notNull().references(() => communityPost.id),
    userId: text('user_id').notNull().references(() => user.id),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const creatorRating = pgTable('creator_rating', {
    id: uuid('id').defaultRandom().primaryKey(),
    creatorProfileId: uuid('creator_profile_id').notNull().references(() => creatorProfile.id),
    userId: text('user_id').notNull().references(() => user.id),
    rating: integer('rating').notNull(), // 1 to 5
    feedback: text('feedback'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
    unique('creator_user_rating_unique').on(t.creatorProfileId, t.userId)
])

// ===== Self-Hosted Wallets =====

export const wallet = pgTable('wallet', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id).unique(), // One managed wallet per user
    publicKey: text('public_key').notNull().unique(), // The Solana public address
    encryptedPrivateKey: text('encrypted_private_key').notNull(), // The AES-256-GCM encrypted seed/secret
    iv: text('iv').notNull(), // Initialization Vector for decryption
    authTag: text('auth_tag').notNull(), // Authentication Tag to ensure data integrity
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
