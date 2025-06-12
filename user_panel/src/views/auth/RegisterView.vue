<template>
  <div class="register-container">
    <n-card style="width: 400px;" title="Register" size="large">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        @submit.prevent="handleSubmit"
      >
        <n-form-item path="email" label="Email">
          <n-input
            v-model:value="formData.email"
            type="email"
            placeholder="Enter your email"
            :disabled="authStore.isLoading"
          />
        </n-form-item>
        
        <n-form-item path="password" label="Password">
          <n-input
            v-model:value="formData.password"
            type="password"
            placeholder="Enter your password"
            :disabled="authStore.isLoading"
          />
        </n-form-item>
        
        <n-form-item path="password_confirmation" label="Confirm Password">
          <n-input
            v-model:value="formData.password_confirmation"
            type="password"
            placeholder="Confirm your password"
            :disabled="authStore.isLoading"
            @keydown.enter="handleSubmit"
          />
        </n-form-item>
        
        <n-form-item>
          <n-button
            type="primary"
            block
            :loading="authStore.isLoading"
            @click="handleSubmit"
          >
            Register
          </n-button>
        </n-form-item>
        
        <n-form-item>
          <n-text depth="3">
            Already have an account? 
            <router-link to="/login" style="color: var(--primary-color);">
              Login here
            </router-link>
          </n-text>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const formRef = ref<FormInst | null>(null)

const formData = reactive({
  email: '',
  password: '',
  password_confirmation: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Invalid email format' }
  ],
  password: [
    { required: true, message: 'Password is required' },
    { min: 8, message: 'Password must be at least 8 characters' }
  ],
  password_confirmation: [
    { required: true, message: 'Password confirmation is required' },
    {
      validator: (rule, value) => {
        return value === formData.password
      },
      message: 'Passwords do not match'
    }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    await authStore.register(formData.email, formData.password, formData.password_confirmation)
    message.success('Registration successful! Please login.')
    router.push('/login')
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const firstError = Object.values(errors)[0] as string[]
      message.error(firstError[0])
    } else {
      message.error('Registration failed. Please try again.')
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>