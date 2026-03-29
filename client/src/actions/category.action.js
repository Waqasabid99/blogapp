"use client";

import api from "@/api/api";

export const getAllCategories = async () => {
  try {
    const { data } = await api.get(`/category`)
    console.log(data);
    if (!data.success) {
      throw new Error("Failed to fetch categories")
    }
    return data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const getFlatCategories = async () => {
  try {
    const { data } = await api.get(`/category/flat`)
    console.log(data);
    if (!data.success) {
      throw new Error("Failed to fetch categories")
    }
    return data
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const getCategoryById = async (id) => {
  try {
    const { data } = await api.get(`/category/${id}`)
    console.log(data);
    if (!data.success) {
      throw new Error("Failed to fetch category")
    }
    return data
  } catch (error) {
    console.log(error);
    throw error
  }
}