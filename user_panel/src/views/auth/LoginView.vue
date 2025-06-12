<template>
  <div class="login-container">
    <n-card style="width: 400px;" title="Login" size="large">
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
            Login
          </n-button>
        </n-form-item>
        
        <n-form-item>
          <n-text depth="3">
            Don't have an account? 
            <router-link to="/register" style="color: var(--primary-color);">
              Register here
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
  password: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Invalid email format' }
  ],
  password: [
    { required: true, message: 'Password is required' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    await authStore.login(formData.email, formData.password)
    message.success('Login successful!')
    router.push('/')
  } catch (error: any) {
    if (error.response?.data?.error) {
      message.error(error.response.data.error)
    } else {
      message.error('Login failed. Please try again.')
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>