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
    onboardCreator: (data: any) =>
        request<any>('/creators/onboard', { method: 'POST', body: JSON.stringify(data) }),

    // Posts
    getFeed: (userId?: string) =>
        request<any[]>(userId ? `/posts?userId=${userId}` : '/posts'),
    createPost: (data: any) =>
        request<any>('/posts', { method: 'POST', body: JSON.stringify(data) }),

    // Subscriptions
    subscribe: (subscriberUserId: string, creatorProfileId: string) =>
        request<any>('/subscriptions', {
            method: 'POST',
            body: JSON.stringify({ subscriberUserId, creatorProfileId }),
        }),
    unsubscribe: (id: string) =>
        request<any>(`/subscriptions/${id}`, { method: 'DELETE' }),
}
