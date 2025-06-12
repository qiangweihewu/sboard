<template>
  <div>
    <n-page-header title="Profile Settings" subtitle="Manage your account settings" />

    <n-grid :cols="1" :x-gap="16" :y-gap="16" style="margin-top: 16px;">
      <!-- Account Information -->
      <n-grid-item>
        <n-card title="Account Information" size="large">
          <n-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-placement="left"
            label-width="120px"
          >
            <n-form-item label="Email" path="email">
              <n-input
                v-model:value="profileForm.email"
                placeholder="Enter your email"
                :disabled="isUpdating"
              />
            </n-form-item>
            
            <n-form-item>
              <n-button
                type="primary"
                :loading="isUpdating"
                @click="updateProfile"
              >
                Update Profile
              </n-button>
            </n-form-item>
          </n-form>
        </n-card>
      </n-grid-item>

      <!-- Change Password -->
      <n-grid-item>
        <n-card title="Change Password" size="large">
          <n-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-placement="left"
            label-width="120px"
          >
            <n-form-item label="New Password" path="password">
              <n-input
                v-model:value="passwordForm.password"
                type="password"
                placeholder="Enter new password"
                :disabled="isUpdating"
              />
            </n-form-item>
            
            <n-form-item label="Confirm Password" path="password_confirmation">
              <n-input
                v-model:value="passwordForm.password_confirmation"
                type="password"
                placeholder="Confirm new password"
                :disabled="isUpdating"
              />
            </n-form-item>
            
            <n-form-item>
              <n-button
                type="primary"
                :loading="isUpdating"
                @click="updatePassword"
              >
                Change Password
              </n-button>
            </n-form-item>
          </n-form>
        </n-card>
      </n-grid-item>

      <!-- Account Status -->
      <n-grid-item>
        <n-card title="Account Status" size="large">
          <n-descriptions :column="1" bordered>
            <n-descriptions-item label="Email">
              {{ authStore.user?.email }}
            </n-descriptions-item>
            <n-descriptions-item label="Status">
              <n-tag :type="authStore.user?.is_active ? 'success' : 'error'">
                {{ authStore.user?.is_active ? 'Active' : 'Inactive' }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="Role">
              {{ authStore.user?.role?.name || 'User' }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const message = useMessage()
const authStore = useAuthStore()

const profileFormRef = ref<FormInst | null>(null)
const passwordFormRef = ref<FormInst | null>(null)
const isUpdating = ref(false)

const profileForm = reactive({
  email: ''
})

const passwordForm = reactive({
  password: '',
  password_confirmation: ''
})

const profileRules: FormRules = {
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Invalid email format' }
  ]
}

const passwordRules: FormRules = {
  password: [
    { required: true, message: 'Password is required' },
    { min: 8, message: 'Password must be at least 8 characters' }
  ],
  password_confirmation: [
    { required: true, message: 'Password confirmation is required' },
    {
      validator: (rule, value) => {
        return value === passwordForm.password
      },
      message: 'Passwords do not match'
    }
  ]
}

const updateProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    isUpdating.value = true
    
    await authStore.updateProfile({
      email: profileForm.email
    })
    
    message.success('Profile updated successfully!')
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const firstError = Object.values(errors)[0] as string[]
      message.error(firstError[0])
    } else {
      message.error('Failed to update profile')
    }
  } finally {
    isUpdating.value = false
  }
}

const updatePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    isUpdating.value = true
    
    await authStore.updateProfile({
      password: passwordForm.password,
      password_confirmation: passwordForm.password_confirmation
    })
    
    // Clear password form
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
    
    message.success('Password changed successfully!')
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const firstError = Object.values(errors)[0] as string[]
      message.error(firstError[0])
    } else {
      message.error('Failed to change password')
    }
  } finally {
    isUpdating.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    profileForm.email = authStore.user.email
  }
})
</script>