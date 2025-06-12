<template>
  <div>
    <n-page-header title="My Subscriptions" subtitle="Manage your active and past subscriptions">
      <template #extra>
        <n-button @click="fetchSubscriptions" :loading="isLoading">
          <template #icon>
            <n-icon><RefreshIcon /></n-icon>
          </template>
          Refresh
        </n-button>
      </template>
    </n-page-header>

    <n-spin :show="isLoading" style="margin-top: 16px;">
      <n-grid :cols="1" :x-gap="16" :y-gap="16" style="margin-top: 16px;">
        <n-grid-item v-for="subscription in subscriptions" :key="subscription.id">
          <n-card size="large">
            <template #header>
              <n-space justify="space-between" align="center">
                <div>
                  <n-text strong>{{ subscription.plan?.name || 'Unknown Plan' }}</n-text>
                </div>
                <n-tag :type="getStatusType(subscription.status)">
                  {{ getStatusText(subscription.status) }}
                </n-tag>
              </n-space>
            </template>

            <n-descriptions :column="2" bordered>
              <n-descriptions-item label="Start Date">
                {{ subscription.start_date ? formatDate(subscription.start_date) : 'Not started' }}
              </n-descriptions-item>
              <n-descriptions-item label="End Date">
                {{ subscription.end_date ? formatDate(subscription.end_date) : 'Not set' }}
              </n-descriptions-item>
              <n-descriptions-item label="Traffic Used">
                {{ subscription.used_traffic_gb || 0 }} GB / {{ subscription.total_traffic_gb || 0 }} GB
              </n-descriptions-item>
              <n-descriptions-item label="Devices">
                {{ subscription.current_device_count || 0 }} / {{ subscription.plan?.device_limit || 0 }}
              </n-descriptions-item>
            </n-descriptions>

            <!-- Traffic Usage Progress -->
            <div v-if="subscription.status === 'ACTIVE'" style="margin-top: 16px;">
              <n-text depth="3">Traffic Usage</n-text>
              <n-progress
                type="line"
                :percentage="getTrafficPercentage(subscription)"
                :status="getTrafficStatus(subscription)"
                style="margin-top: 8px;"
              />
              <n-text depth="3" style="margin-top: 8px; display: block;">
                {{ subscription.used_traffic_gb || 0 }} GB / {{ subscription.total_traffic_gb || 0 }} GB used
              </n-text>
            </div>

            <!-- Subscription Link -->
            <div v-if="subscription.status === 'ACTIVE' && subscription.subscription_token" style="margin-top: 16px;">
              <n-text depth="3">Subscription Link</n-text>
              <n-input-group style="margin-top: 8px;">
                <n-input
                  :value="getSubscriptionUrl(subscription.subscription_token)" 
                  readonly
                  placeholder="Subscription URL"
                />
                <n-button @click="copySubscriptionUrl(subscription.subscription_token)">
                  <template #icon>
                    <n-icon><CopyIcon /></n-icon>
                  </template>
                  Copy
                </n-button>
              </n-input-group>
              <n-text depth="3" style="margin-top: 8px; display: block; font-size: 12px;">
                Import this URL into your proxy client (V2RayN, Clash, etc.)
              </n-text>
            </div>

            <template #action>
              <n-space justify="end">
                <n-button
                  v-if="subscription.status === 'PENDING_APPROVAL'"
                  type="error"
                  @click="cancelRequest(subscription)"
                  :loading="cancellingId === subscription.id"
                >
                  Cancel Request
                </n-button>
                <n-button
                  v-if="subscription.status === 'ACTIVE'"
                  @click="viewDetails(subscription)"
                >
                  View Details
                </n-button>
              </n-space>
            </template>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-spin>

    <n-empty v-if="!isLoading && subscriptions.length === 0" description="No subscriptions found">
      <template #extra>
        <router-link to="/plans">
          <n-button type="primary">Browse Plans</n-button>
        </router-link>
      </template>
    </n-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { api } from '@/services/api'
import { NIcon } from 'naive-ui'
import {
  RefreshOutlined as RefreshIcon,
  ContentCopyOutlined as CopyIcon
} from '@vicons/material'

interface Subscription {
  id: number
  plan_id: number
  start_date?: string
  end_date?: string
  total_traffic_gb: number
  used_traffic_gb: number
  current_device_count: number
  subscription_token?: string
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  plan?: {
    id: number
    name: string
    device_limit: number
  }
}

const message = useMessage()
const isLoading = ref(false)
const cancellingId = ref<number | null>(null)

const subscriptions = ref<Subscription[]>([])

const fetchSubscriptions = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/user/subscriptions')
    subscriptions.value = response.data.data || response.data
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error)
    message.error('Failed to load subscriptions')
  } finally {
    isLoading.value = false
  }
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'PENDING_APPROVAL': return 'warning'
    case 'EXPIRED': return 'error'
    case 'CANCELLED': return 'error'
    default: return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'Active'
    case 'PENDING_APPROVAL': return 'Pending Approval'
    case 'EXPIRED': return 'Expired'
    case 'CANCELLED': return 'Cancelled'
    default: return status
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const getTrafficPercentage = (subscription: Subscription) => {
  if (!subscription.total_traffic_gb) return 0
  return Math.round((subscription.used_traffic_gb / subscription.total_traffic_gb) * 100)
}

const getTrafficStatus = (subscription: Subscription) => {
  const percentage = getTrafficPercentage(subscription)
  if (percentage >= 90) return 'error'
  if (percentage >= 70) return 'warning'
  return 'success'
}

const getSubscriptionUrl = (token: string) => {
  const baseUrl = window.location.origin
  return `${baseUrl}/subscribe/${token}`
}

const copySubscriptionUrl = async (token: string) => {
  try {
    await navigator.clipboard.writeText(getSubscriptionUrl(token))
    message.success('Subscription URL copied to clipboard!')
  } catch (error) {
    message.error('Failed to copy URL')
  }
}

const cancelRequest = async (subscription: Subscription) => {
  cancellingId.value = subscription.id
  try {
    await api.delete(`/user/subscriptions/${subscription.id}`)
    message.success('Subscription request cancelled')
    fetchSubscriptions()
  } catch (error) {
    console.error('Failed to cancel subscription:', error)
    message.error('Failed to cancel subscription request')
  } finally {
    cancellingId.value = null
  }
}

const viewDetails = (subscription: Subscription) => {
  // TODO: Implement detailed view
  message.info('Detailed view coming soon!')
}

onMounted(() => {
  fetchSubscriptions()
})
</script>