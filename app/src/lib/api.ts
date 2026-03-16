const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
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

    // Posts
    getFeed: (userId?: string) =>
        request<any[]>(userId ? `/posts?userId=${userId}` : '/posts'),
    getMyPosts: (creatorProfileId: string) => request<any[]>(`/posts/my?creatorProfileId=${creatorProfileId}`),
    getPost: (id: string, userId?: string) => request<any>(`/posts/${id}${userId ? `?userId=${userId}` : ''}`),
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

    // Wallet
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
        request<any>(`/users/${userId}/ban`, { method: 'PUT', body: JSON.stringify({ isBanned }) }),

    // Uploads
    uploadImage: (file: File) => {
        const formData = new FormData()
        formData.append('file', file)

        // Use standard fetch instead of request wrapper since we need to send FormData without Content-Type: application/json
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        }).then(res => {
            if (!res.ok) throw new Error('Failed to upload image')
            return res.json()
        })
    },

    // Launches
    getLaunches: (status?: string) =>
        request<any[]>(`/launches${status ? `?status=${status}` : ''}`),
    getMyLaunches: () =>
        request<any[]>('/launches/my'),
    submitLaunch: (data: { name: string; company: string; summary: string; tags?: string[]; disclosure?: string }) =>
        request<any>('/launches', { method: 'POST', body: JSON.stringify(data) }),
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
