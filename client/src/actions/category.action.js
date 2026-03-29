const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllCategories = async () => {
  const response = await fetch(`${base_url}/category`, {
    next: {
      tags: ["categories"]
    }
  })
  console.log(response);
  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  const data = await response.json()
  return data
}

export const getFlatCategories = async () => {
  const response = await fetch(`${base_url}/category/flat`, {
    next: {
      tags: ["categories"]
    }
  })
  console.log(response);
  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  const data = await response.json()
  return data
}

export const getCategoryById = async (id) => {
  const response = await fetch(`${base_url}/category/${id}`, {
    next: {
      tags: ["categories"]
    }
  })
  console.log(response);
  if (!response.ok) {
    throw new Error("Failed to fetch category")
  }
  const data = await response.json()
  return data
}