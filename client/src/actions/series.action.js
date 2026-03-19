const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllSeries = async () => {
  const response = await fetch(`${base_url}/series`, {
    next: {
      tags: ["series"]
    }
  })

  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  const data = await response.json()
  return data
}