import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

interface User {
  id: number
  email: string
  is_active: boolean
  role?: {
    id: number
    name: string
  }
}

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password
      })
      
      token.value = response.data.access_token
      localStorage.setItem('token', response.data.access_token)
      
      // Fetch user data
      await fetchUser()
      
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  const register = async (email: string, password: string, password_confirmation: string) => {
    isLoading.value = true
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        password_confirmation
      })
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  const fetchUser = async () => {
    if (!token.value) return
    
    try {
      const response = await api.get<User>('/auth/me')
      user.value = response.data
    } catch (error) {
      // Token might be invalid, logout
      logout()
      throw error
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  const updateProfile = async (data: { email?: string; password?: string; password_confirmation?: string }) => {
    const response = await api.put('/user/profile', data)
    if (data.email) {
      user.value = { ...user.value!, email: data.email }
    }
    return response.data
  }

  // Initialize auth state
  if (token.value) {
    fetchUser().catch(() => {
      // Silent fail on initialization
      logout()
    })
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    updateProfile
  }
})