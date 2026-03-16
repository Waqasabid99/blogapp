const base_url = process.env.NEXT_PUBLIC_API_BASE_URL

export const getAllCategories = async () => {
  const response = await fetch(`${base_url}/category`, {
    next: {
      tags: ["categories"]
    }
  })

  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  return response.json()
}