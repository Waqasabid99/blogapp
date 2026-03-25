"use client";
import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'

const CheckAuth = ({children}) => {
   const { checkAuth } = useAuthStore();

   useEffect(() => {
    checkAuth()
   }, [])

  return (
    <>
        {children}
    </>
  )
}

export default CheckAuth