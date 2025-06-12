<template>
  <div>
    <n-page-header title="Available Plans" subtitle="Choose a subscription plan that fits your needs">
      <template #extra>
        <n-button @click="fetchPlans" :loading="isLoading">
          <template #icon>
            <n-icon><RefreshIcon /></n-icon>
          </template>
          Refresh
        </n-button>
      </template>
    </n-page-header>

    <n-spin :show="isLoading" style="margin-top: 16px;">
      <n-grid :cols="1" :x-gap="16" :y-gap="16" responsive="screen" style="margin-top: 16px;">
        <n-grid-item v-for="plan in plans" :key="plan.id">
          <n-card :title="plan.name" size="large">
            <template #header-extra>
              <n-tag v-if="plan.is_active" type="success">Active</n-tag>
              <n-tag v-else type="error">Inactive</n-tag>
            </template>

            <n-descriptions :column="2" bordered>
              <n-descriptions-item label="Duration">
                {{ plan.duration_days }} days
              </n-descriptions-item>
              <n-descriptions-item label="Traffic Limit">
                {{ plan.traffic_limit_gb }} GB
              </n-descriptions-item>
              <n-descriptions-item label="Device Limit">
                {{ plan.device_limit }} devices
              </n-descriptions-item>
              <n-descriptions-item label="Price">
                {{ plan.price ? `$${plan.price}` : 'Free' }}
              </n-descriptions-item>
            </n-descriptions>

            <n-text v-if="plan.description" style="margin-top: 16px; display: block;">
              {{ plan.description }}
            </n-text>

            <template #action>
              <n-space justify="end">
                <n-button
                  type="primary"
                  :disabled="!plan.is_active || isRequesting"
                  :loading="requestingPlanId === plan.id"
                  @click="requestSubscription(plan)"
                >
                  {{ plan.is_active ? 'Request Subscription' : 'Not Available' }}
                </n-button>
              </n-space>
            </template>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-spin>

    <n-empty v-if="!isLoading && plans.length === 0" description="No plans available">
      <template #extra>
        <n-button @click="fetchPlans">Refresh</n-button>
      </template>
    </n-empty>

    <!-- Request Subscription Modal -->
    <n-modal v-model:show="showRequestModal" preset="dialog" title="Request Subscription">
      <template #header>
        <div>Request Subscription</div>
      </template>
      <div v-if="selectedPlan">
        <n-text>
          Are you sure you want to request a subscription for <strong>{{ selectedPlan.name }}</strong>?
        </n-text>
        <n-descriptions :column="1" bordered style="margin-top: 16px;">
          <n-descriptions-item label="Plan">{{ selectedPlan.name }}</n-descriptions-item>
          <n-descriptions-item label="Duration">{{ selectedPlan.duration_days }} days</n-descriptions-item>
          <n-descriptions-item label="Traffic">{{ selectedPlan.traffic_limit_gb }} GB</n-descriptions-item>
          <n-descriptions-item label="Devices">{{ selectedPlan.device_limit }}</n-descriptions-item>
          <n-descriptions-item label="Price">{{ selectedPlan.price ? `$${selectedPlan.price}` : 'Free' }}</n-descriptions-item>
        </n-descriptions>
      </div>
      <template #action>
        <n-space>
          <n-button @click="showRequestModal = false">Cancel</n-button>
          <n-button type="primary" :loading="isRequesting" @click="confirmRequest">
            Confirm Request
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { api } from '@/services/api'
import { NIcon } from 'naive-ui'
import { RefreshOutlined as RefreshIcon } from '@vicons/material'

interface Plan {
  id: number
  name: string
  description?: string
  duration_days: number
  traffic_limit_gb: number
  device_limit: number
  price?: number
  is_active: boolean
}

const message = useMessage()
const isLoading = ref(false)
const isRequesting = ref(false)
const requestingPlanId = ref<number | null>(null)
const showRequestModal = ref(false)
const selectedPlan = ref<Plan | null>(null)

const plans = ref<Plan[]>([])

const fetchPlans = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/user/plans')
    plans.value = response.data.data || response.data
  } catch (error) {
    console.error('Failed to fetch plans:', error)
    message.error('Failed to load plans')
  } finally {
    isLoading.value = false
  }
}

const requestSubscription = (plan: Plan) => {
  selectedPlan.value = plan
  showRequestModal.value = true
}

const confirmRequest = async () => {
  if (!selectedPlan.value) return
  
  isRequesting.value = true
  requestingPlanId.value = selectedPlan.value.id
  
  try {
    await api.post('/user/subscriptions/request', {
      plan_id: selectedPlan.value.id
    })
    
    message.success('Subscription request submitted successfully! Please wait for admin approval.')
    showRequestModal.value = false
    selectedPlan.value = null
  } catch (error: any) {
    console.error('Failed to request subscription:', error)
    if (error.response?.data?.message) {
      message.error(error.response.data.message)
    } else {
      message.error('Failed to submit subscription request')
    }
  } finally {
    isRequesting.value = false
    requestingPlanId.value = null
  }
}

onMounted(() => {
  fetchPlans()
})
</script>