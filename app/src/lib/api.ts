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

// Verticals
export const api = {
    getVerticals: () => request<any[]>('/verticals'),
    getVertical: (slug: string) => request<{ vertical: any; posts: any[] }>(`/verticals/${slug}`),

    // Creators
    getCreators: () => request<any[]>('/creators'),
    getCreator: (id: string) => request<{ creator: any; posts: any[] }>(`/creators/${id}`),
    getCreatorByUsername: (username: string, viewerUserId?: string) =>
        request<{ creator: any; posts: any[] }>(`/creators/u/${username}${viewerUserId ? `?viewerUserId=${viewerUserId}` : ''}`),
    onboardCreator: (data: any) =>
        request<any>('/creators/onboard', { method: 'POST', body: JSON.stringify(data) }),
    updateCreatorProfile: (id: string, data: any) =>
        request<any>(`/creators/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getCreatorStats: (creatorProfileId: string) => request<any>(`/posts/stats?creatorProfileId=${creatorProfileId}`),

    // Posts
    getFeed: (userId?: string) =>
        request<any[]>(userId ? `/posts?userId=${userId}` : '/posts'),
    getMyPosts: (creatorProfileId: string) => request<any[]>(`/posts/my?creatorProfileId=${creatorProfileId}`),
    createPost: (data: any) =>
        request<any>('/posts', { method: 'POST', body: JSON.stringify(data) }),
    votePost: (postId: string, userId: string, value: number) =>
        request<any>(`/posts/${postId}/vote`, { method: 'POST', body: JSON.stringify({ userId, value }) }),
    getPostComments: (postId: string) =>
        request<any[]>(`/posts/${postId}/comments`),
    createPostComment: (postId: string, userId: string, content: string) =>
        request<any>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ userId, content }) }),

    // Subscriptions
    subscribe: (subscriberUserId: string, creatorProfileId: string) =>
        request<any>('/subscriptions', {
            method: 'POST',
            body: JSON.stringify({ subscriberUserId, creatorProfileId }),
        }),
    unsubscribe: (id: string) =>
        request<any>(`/subscriptions/${id}`, { method: 'DELETE' }),

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
}
