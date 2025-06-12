<template>
  <n-layout has-sider>
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>
    
    <n-layout>
      <n-layout-header bordered style="height: 64px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
        <h1 style="margin: 0; font-size: 18px; font-weight: 600;">
          Xray Node Manager
        </h1>
        
        <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
          <n-button text>
            <n-icon size="18" style="margin-right: 8px;">
              <UserIcon />
            </n-icon>
            {{ authStore.user?.email }}
          </n-button>
        </n-dropdown>
      </n-layout-header>
      
      <n-layout-content content-style="padding: 24px;">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  NIcon, 
  type MenuOption,
  type DropdownOption
} from 'naive-ui'
import {
  DashboardOutlined as DashboardIcon,
  PersonOutlined as UserIcon,
  SubscriptionsOutlined as SubscriptionsIcon,
  ShoppingCartOutlined as PlansIcon,
  LogoutOutlined as LogoutIcon,
  SettingsOutlined as SettingsIcon
} from '@vicons/material'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const collapsed = ref(false)

const activeKey = computed(() => route.name as string)

const renderIcon = (icon: any) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: 'Dashboard',
    key: 'Dashboard',
    icon: renderIcon(DashboardIcon)
  },
  {
    label: 'My Subscriptions',
    key: 'Subscriptions',
    icon: renderIcon(SubscriptionsIcon)
  },
  {
    label: 'Available Plans',
    key: 'Plans',
    icon: renderIcon(PlansIcon)
  }
]

const userMenuOptions: DropdownOption[] = [
  {
    label: 'Profile Settings',
    key: 'profile',
    icon: renderIcon(SettingsIcon)
  },
  {
    type: 'divider'
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: renderIcon(LogoutIcon)
  }
]

const handleMenuSelect = (key: string) => {
  router.push({ name: key })
}

const handleUserMenuSelect = (key: string) => {
  if (key === 'logout') {
    authStore.logout()
    router.push('/login')
  } else if (key === 'profile') {
    router.push('/profile')
  }
}
</script>