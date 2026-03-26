import api from "@/api/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      avatar: null,
      isAuthenticated: false,
      permissions: [],
      role: null,

      isLoading: false,
      isCheckingAuth: true,
      isGoogleLoading: false,
      isAppleLoading: false,

      error: null,

      setAuthUser: (user) => {
        set({
          user,
          avatar: user?.avatarUrl,
          isAuthenticated: true,
          permissions: user?.permissions || [],
          role: user?.role || null,
          isLoading: false,
          error: null,
        });
      },

      register: async (formData) => {
        try {
          set({ isLoading: true, error: null });

          const { data } = await api.post("/auth/register", formData);

          if (data?.success) {
            toast.success(data?.message);
            get().setAuthUser(data?.data?.user);
            return {
              success: true,
            };
          } else {
            throw new Error(data?.message);
          }
        } catch (error) {
          const message = error?.response?.data?.message || error.message;
          set({
            isLoading: false,
            error: message,
          });
        }
      },

      login: async (formData) => {
        try {
          set({ isLoading: true, error: null });

          const { data } = await api.post("/auth/login", formData);

          if (data?.success) {
            toast.success(data?.message);
            get().setAuthUser(data?.data?.user);
            return {
              success: true,
            };
          } else {
            throw new Error(data?.message);
          }
        } catch (error) {
          const message = error?.response?.data?.message || error.message;
          set({
            isLoading: false,
            error: message,
          });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          const { data } = await api.post("/auth/logout");

          if (data?.success) {
            set({
              user: null,
              isAuthenticated: false,
              permissions: [],
              role: null,
              isLoading: false,
              error: null,
            });

            toast.success(data?.message);
          } else {
            throw new Error(data?.message);
          }
        } catch (error) {
          const message = error?.response?.data?.message || error.message;

          set({
            isLoading: false,
            error: message,
          });

          get().forceLogout();
        }
      },

      forgotPassword: async (formData) => {
        try {
          set({ isLoading: true, error: null });

          const { data } = await api.post("/auth/forget-password", formData);

          if (data?.success) {
            toast.success(data?.message);
            set({ isLoading: false });
          }
        } catch (error) {
          const message = error?.response?.data?.message || error.message;
          set({
            isLoading: false,
            error: message,
          });
        }
      },

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
          const { data } = await api.get("/auth");
          if (data?.success && data?.data?.user) {
            get().setAuthUser(data.data.user);
            return { success: true };
          } else {
            get().forceLogout();
            return { success: false };
          }
        } catch (error) {
          get().forceLogout();
          return { success: false };
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      forceLogout: () => {
        set({
          user: null,
          avatar: null,
          isAuthenticated: false,
          permissions: [],
          role: null,
          isLoading: false,
          isCheckingAuth: false,
          error: null,
        });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        avatar: state.avatar,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        role: state.role,
      }),
    },
  ),
);

export default useAuthStore;
