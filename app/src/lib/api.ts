const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api`

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const adminToken = localStorage.getItem('jence_admin_token')
    const headers = new Headers(options?.headers)
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }
    
    if (adminToken) {
        headers.set('x-admin-token', adminToken)
    }

    const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers,
        ...options,
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(error.error || 'API request failed')
    }

    return res.json()
}

// Global
export const api = {
    getGlobalStats: () => request<any>('/stats/global'),

    // Admin
    verifyAdmin: (identifier: string, keyphrase: string) => request<{ success: boolean, token: string }>('/admin/verify', { method: 'POST', body: JSON.stringify({ identifier, keyphrase }) }),
    getAdminMetrics: () => request<any>('/admin/metrics'),
    getAdminMetricsHistory: (interval: string) => request<any>(`/admin/metrics/history?interval=${interval}`),
    getAdminUsers: (query: string = '') => request<any>(`/admin/users?q=${query}`),

    // Users
    saveOnboardingData: (data: { role?: string, verticals?: string[] }) => 
        request<any>('/users/onboarding', { method: 'POST', body: JSON.stringify(data) }),

    // Verticals
    getVerticals: () => request<any[]>('/verticals'),
    getVertical: (slug: string) => request<{ vertical: any; posts: any[] }>(`/verticals/${slug}`),

    // Creators
    getCreators: () => request<any[]>('/creators'),
    getCreator: (id: string) => request<{ creator: any; posts: any[] }>(`/creators/${id}`),
    getCreatorByUsername: (username: string, viewerUserId?: string) =>
        request<{ creator: any; posts: any[]; feedback?: any[] }>(`/creators/u/${username}${viewerUserId ? `?viewerUserId=${viewerUserId}` : ''}`),
    getCreatorByUserId: (userId: string, viewerUserId?: string) =>
        request<{ creator: any; posts: any[]; feedback?: any[] }>(`/creators/user/${userId}${viewerUserId ? `?viewerUserId=${viewerUserId}` : ''}`),
    onboardCreator: (data: any) =>
        request<any>('/creators/onboard', { method: 'POST', body: JSON.stringify(data) }),
    updateCreatorProfile: (id: string, data: any) =>
        request<any>(`/creators/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getCreatorStats: (creatorProfileId: string) => request<any>(`/posts/stats?creatorProfileId=${creatorProfileId}`),

    // Search
    search: (query: string, type: string = 'all') => request(`/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`),

    // Posts
    getFeed: (userId?: string) =>
        request<any[]>(userId ? `/posts?userId=${userId}` : '/posts'),
    getMyPosts: (creatorProfileId: string) => request<any[]>(`/posts/my?creatorProfileId=${creatorProfileId}`),
    getPost: (id: string, userId?: string) => request<any>(`/posts/${id}${userId ? `?userId=${userId}` : ''}`),
    trackPostView: (id: string) =>
        request<any>(`/posts/${id}/view`, { method: 'POST' }),
    createPost: (data: any) =>
        request<any>('/posts', { method: 'POST', body: JSON.stringify(data) }),
    deletePost: (id: string) =>
        request<any>(`/posts/${id}`, { method: 'DELETE' }),
    pinPost: (id: string, creatorId: string, isPinned: boolean) =>
        request<any>(`/posts/${id}/pin`, { method: 'POST', body: JSON.stringify({ creatorId, isPinned }) }),
    votePost: (postId: string, userId: string, value: number) =>
        request<any>(`/posts/${postId}/vote`, { method: 'POST', body: JSON.stringify({ userId, value }) }),
    getPostComments: (postId: string) =>
        request<any[]>(`/posts/${postId}/comments`),
    createPostComment: (postId: string, userId: string, content: string) =>
        request<any>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ userId, content }) }),

    // Subscriptions
    subscribe: (subscriberUserId: string, creatorProfileId: string, txSignature?: string) =>
        request<any>('/subscriptions', {
            method: 'POST',
            body: JSON.stringify({ subscriberUserId, creatorProfileId, txSignature }),
        }),
    unsubscribe: (id: string) =>
        request<any>(`/subscriptions/${id}`, { method: 'DELETE' }),

    // Tips
    tip: (data: { amountUsdc: number; creatorProfileId?: string; postId?: string; launchNoteId?: string }) =>
        request<any>('/tips', { method: 'POST', body: JSON.stringify(data) }),

    // Wallet
    getWalletMe: () => request<{ address: string | null; usdcBalance: number }>('/wallet/me'),
    createWallet: () => request<any>('/wallet/create', { method: 'POST' }),
    exportWallet: () => request<{ privateKey: string }>('/wallet/export'),

    // Ratings
    rateCreator: (creatorProfileId: string, userId: string, rating: number, feedback: string) =>
        request<any>(`/creators/${creatorProfileId}/rate`, {
            method: 'POST',
            body: JSON.stringify({ userId, rating, feedback }),
        }),

    // Notifications
    getNotifications: (userId: string) =>
        request<any[]>(`/notifications?userId=${userId}`),
    getUnreadCount: (userId: string) =>
        request<{ count: number }>(`/notifications/unread-count?userId=${userId}`),
    markNotificationsRead: (userId: string) =>
        request<any>('/notifications/mark-read', { method: 'POST', body: JSON.stringify({ userId }) }),

    // Community
    getCommunityPosts: (tag?: string, userId?: string) =>
        request<any[]>(`/community/posts?${tag ? `tag=${tag}&` : ''}${userId ? `userId=${userId}` : ''}`),
    getCommunityPost: (id: string, userId?: string) =>
        request<any>(`/community/posts/${id}${userId ? `?userId=${userId}` : ''}`),
    trackCommunityPostView: (id: string) =>
        request<any>(`/community/posts/${id}/view`, { method: 'POST' }),
    getTrendingTags: () => request<any[]>('/community/tags'),
    createCommunityPost: (data: { content: string, userId: string }) =>
        request<any>('/community/posts', { method: 'POST', body: JSON.stringify(data) }),
    deleteCommunityPost: (id: string, userId: string) =>
        request<any>(`/community/posts/${id}?userId=${userId}`, { method: 'DELETE' }),
    voteCommunityPost: (postId: string, userId: string, value: number) =>
        request<any>(`/community/posts/${postId}/vote`, { method: 'POST', body: JSON.stringify({ userId, value }) }),
    unvoteCommunityPost: (postId: string, userId: string) =>
        request<any>(`/community/posts/${postId}/like?userId=${userId}`, { method: 'DELETE' }),
    getComments: (postId: string) =>
        request<any[]>(`/community/posts/${postId}/comments`),
    createComment: (postId: string, userId: string, content: string) =>
        request<any>(`/community/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ userId, content }) }),

    // Users
    updateUser: (id: string, data: any) =>
        request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    exportData: (userId: string) =>
        request<any>(`/users/${userId}/export`),
    toggleUserBan: (userId: string, isBanned: boolean) =>
        request<any>(`/admin/users/${userId}/ban`, { method: 'POST', body: JSON.stringify({ isBanned }) }),

    // Uploads
    uploadImage: (file: File) => {
        const formData = new FormData()
        formData.append('file', file)

        // Use standard fetch instead of request wrapper since we need to send FormData without Content-Type: application/json
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        }).then(async res => {
            const data = await res.json().catch(() => null)
            if (!res.ok) {
                throw new Error(data?.error || data?.message || 'Jence could not upload that image.')
            }
            return data
        })
    },

    // Launches
    getLaunches: (status?: string) =>
        request<any[]>(`/launches${status ? `?status=${status}` : ''}`),
    getLaunch: (id: string) =>
        request<any>(`/launches/${id}`),
    trackLaunchView: (id: string) =>
        request<any>(`/launches/${id}/view`, { method: 'POST' }),
    getMyLaunches: () =>
        request<any[]>('/launches/my'),
    submitLaunch: (data: { name: string; company: string; logoUrl?: string; videoUrl?: string; imageAssets?: string[]; summary: string; tags?: string[]; disclosure?: string; allowTips?: boolean }) =>
        request<any>('/launches', { method: 'POST', body: JSON.stringify(data) }),
    upvoteLaunch: (id: string) =>
        request<any>(`/launches/${id}/upvote`, { method: 'POST' }),
    removeLaunchUpvote: (id: string) =>
        request<any>(`/launches/${id}/upvote`, { method: 'DELETE' }),
    reviewLaunch: (id: string, status: 'approved' | 'rejected', reviewNote?: string) =>
        request<any>(`/launches/${id}/review`, { method: 'PUT', body: JSON.stringify({ status, reviewNote }) }),
    deleteLaunch: (id: string) =>
        request<any>(`/launches/${id}`, { method: 'DELETE' }),

    // Landing page helpers
    getLatestPosts: () =>
        request<any[]>('/posts'),
    getTopCreators: () =>
        request<any[]>('/creators'),
}
