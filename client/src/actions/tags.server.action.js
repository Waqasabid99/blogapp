const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllTags = async (filters) => {
    try {
        const response = await fetch(`${base_url}/tag?${new URLSearchParams(filters).toString()}`, {
            next: {
                tags: ["tags"]
            }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch tags");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return error.data;
    }
}