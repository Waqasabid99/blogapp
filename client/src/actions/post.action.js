import { cookies } from "next/headers";

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

export const getPostById = async (id) => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const response = await fetch(`${base_url}/post/postId/${id}`, {
        headers: {
            Cookie: `accessToken=${accessToken}`
        },
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};

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

export const getPublishedPosts = async() => {
    const response = await fetch(`${base_url}/post/published`, {
        method: "GET",
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};

export const getLatestPosts = async() => {
    const response = await fetch(`${base_url}/post/latest`, {
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};

export const getFeaturedPosts = async() => {
    const response = await fetch(`${base_url}/post/featured`, {
        next: {
            tags: ["posts"]
        }
    })
    console.log(response)
    const data = await response.json()
    return data
};

export const getPinnedPosts = async() => {
    const response = await fetch(`${base_url}/post/pinned`, {
        next: {
            tags: ["posts"]
        }
    })
    const data = await response.json()
    return data
};