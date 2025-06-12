<template>
  <div>
    <n-page-header title="Dashboard" subtitle="Welcome to your dashboard">
      <template #extra>
        <n-button @click="refreshData" :loading="isLoading">
          <template #icon>
            <n-icon><RefreshIcon /></n-icon>
          </template>
          Refresh
        </n-button>
      </template>
    </n-page-header>

    <n-grid :cols="1" :x-gap="16" :y-gap="16" style="margin-top: 16px;">
      <!-- Welcome Card -->
      <n-grid-item>
        <n-card title="Welcome Back!" size="large">
          <n-text>
            Hello, {{ authStore.user?.email }}! Here's an overview of your account.
          </n-text>
        </n-card>
      </n-grid-item>

      <!-- Stats Cards -->
      <n-grid-item>
        <n-grid :cols="2" :x-gap="16" :y-gap="16" responsive="screen">
          <n-grid-item>
            <n-card>
              <n-statistic label="Active Subscriptions" :value="stats.activeSubscriptions">
                <template #prefix>
                  <n-icon color="#18a058">
                    <CheckCircleIcon />
                  </n-icon>
                </template>
              </n-statistic>
            </n-card>
          </n-grid-item>
          
          <n-grid-item>
            <n-card>
              <n-statistic label="Total Subscriptions" :value="stats.totalSubscriptions">
                <template #prefix>
                  <n-icon color="#2080f0">
                    <SubscriptionsIcon />
                  </n-icon>
                </template>
              </n-statistic>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-grid-item>

      <!-- Recent Activity -->
      <n-grid-item>
        <n-card title="Recent Activity" size="large">
          <n-empty v-if="recentActivity.length === 0" description="No recent activity">
            <template #extra>
              <router-link to="/plans">
                <n-button>Browse Plans</n-button>
              </router-link>
            </template>
          </n-empty>
          
          <n-list v-else>
            <n-list-item v-for="activity in recentActivity" :key="activity.id">
              <n-thing :title="activity.title" :description="activity.description">
                <template #header-extra>
                  <n-tag :type="activity.type">{{ activity.status }}</n-tag>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-card>
      </n-grid-item>

      <!-- Quick Actions -->
      <n-grid-item>
        <n-card title="Quick Actions" size="large">
          <n-space>
            <router-link to="/plans">
              <n-button type="primary">
                <template #icon>
                  <n-icon><PlansIcon /></n-icon>
                </template>
                Browse Plans
              </n-button>
            </router-link>
            
            <router-link to="/subscriptions">
              <n-button>
                <template #icon>
                  <n-icon><SubscriptionsIcon /></n-icon>
                </template>
                My Subscriptions
              </n-button>
            </router-link>
            
            <router-link to="/profile">
              <n-button>
                <template #icon>
                  <n-icon><SettingsIcon /></n-icon>
                </template>
                Profile Settings
              </n-button>
            </router-link>
          </n-space>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import { NIcon } from 'naive-ui'
import {
  RefreshOutlined as RefreshIcon,
  CheckCircleOutlined as CheckCircleIcon,
  SubscriptionsOutlined as SubscriptionsIcon,
  ShoppingCartOutlined as PlansIcon,
  SettingsOutlined as SettingsIcon
} from '@vicons/material'

const authStore = useAuthStore()
const isLoading = ref(false)

const stats = ref({
  activeSubscriptions: 0,
  totalSubscriptions: 0
})

const recentActivity = ref<Array<{
  id: number
  title: string
  description: string
  status: string
  type: 'success' | 'warning' | 'error' | 'info'
}>>([])

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    // Fetch user subscriptions (when implemented)
    // const subscriptionsResponse = await api.get('/user/subscriptions')
    // stats.value.totalSubscriptions = subscriptionsResponse.data.length
    // stats.value.activeSubscriptions = subscriptionsResponse.data.filter(s => s.status === 'active').length
    
    // For now, use placeholder data
    stats.value = {
      activeSubscriptions: 1,
      totalSubscriptions: 2
    }
    
    // Placeholder recent activity
    recentActivity.value = [
      {
        id: 1,
        title: 'Subscription Request Submitted',
        description: 'Your request for Premium Plan is being reviewed',
        status: 'Pending',
        type: 'warning'
      }
    ]
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshData = () => {
  fetchDashboardData()
}

onMounted(() => {
  fetchDashboardData()
})
</script>