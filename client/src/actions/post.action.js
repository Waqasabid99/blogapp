const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllPosts = async () => {
    const response = await fetch(`${base_url}/post`, {
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};

export const getSinglePost = async (slug) => {
    const response = await fetch(`${base_url}/post/${slug}`, {
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
}

export const getRelatedPosts = async (categoryId, excludeId, limit) => {
    const response = await fetch(`${base_url}/post/relatedposts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryId, excludeId, limit }),
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};

export const getPublishedPosts = async () => {
    const response = await fetch(`${base_url}/post/published`, {
        method: "GET",
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};

export const getLatestPosts = async () => {
    const response = await fetch(`${base_url}/post/latest`, {
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};

export const getFeaturedPosts = async () => {
    const response = await fetch(`${base_url}/post/featured`, {
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};

export const getPinnedPosts = async () => {
    const response = await fetch(`${base_url}/post/pinned`, {
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};

export const getPopularPosts = async () => {
    const response = await fetch(`${base_url}/post/popular`, {
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};

export const getTrendingPosts = async () => {
    const response = await fetch(`${base_url}/post/trending`, {
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};

export const getPostsByCategory = async (slug) => {
    const response = await fetch(`${base_url}/post/category/${slug}`, {
        method: "GET",
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};