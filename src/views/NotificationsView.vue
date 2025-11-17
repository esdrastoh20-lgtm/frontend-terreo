<template>
  <div class="notifications-page">
    <header class="notifications-header">
      <div class="header-content">
        <button @click="router.push('/dashboard')" class="btn-back">← Retour</button>
        <h1>Notifications</h1>
      </div>
    </header>

    <main class="notifications-content">
      <section class="notifications-section">
        <h2 class="section-title">Dernières notifications</h2>
        <div v-if="loading" class="state state--loading">Chargement...</div>
        <div v-else-if="notifications.length === 0" class="state state--empty">
          <p>Aucune notification pour le moment.</p>
        </div>
        <ul v-else class="notifications-list">
          <li v-for="notif in notifications" :key="notif.id" class="notification-card">
            <div class="notification-header">
              <span class="notification-type" :class="`type--${notif.type}`">
                {{ formatType(notif.type) }}
              </span>
              <span class="notification-date">{{ formatDate(notif.created_at) }}</span>
            </div>
            <p class="notification-message">{{ notif.message }}</p>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const notifications = ref([])
const loading = ref(false)

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await loadNotifications()
})

async function loadNotifications () {
  try {
    loading.value = true
    notifications.value = await api.getNotifications(authStore.user.id)
  } catch (error) {
    console.error('Erreur chargement notifications:', error)
  } finally {
    loading.value = false
  }
}

function formatType (type) {
  const map = {
    duel: 'Duel',
    course: 'Cours',
    quiz: 'Quiz'
  }
  return map[type] || type
}

function formatDate (date) {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
  background: radial-gradient(circle at top left, #e0f2fe 0, #f9fafb 45%, #e5e7eb 100%);
}

.notifications-header {
  background: linear-gradient(120deg, #ffffff 0%, #eef2ff 40%, #dcfce7 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
}

.header-content {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: #f3f4ff;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  color: #4b5563;
  cursor: pointer;
  font-size: 0.9rem;
}

.notifications-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

@media (max-width: 768px) {
  .notifications-header h1 {
    font-size: 1.4rem;
  }
  
  .notifications-content {
    padding: 1.5rem 1.5rem 2rem;
  }
}

@media (max-width: 480px) {
  .notifications-header {
    padding: 0.85rem 1.25rem;
  }

  .notifications-content {
    padding: 1.25rem 1.25rem 1.75rem;
  }

  .notifications-section {
    padding: 1.5rem 1.4rem;
  }

  .notification-card {
    padding: 0.8rem 0.9rem;
  }
}

.notifications-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.25rem 2rem 2.5rem;
}

.notifications-section {
  background: #ffffff;
  border-radius: 22px;
  padding: 1.9rem 2.2rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
  position: relative;
  overflow: hidden;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 1.25rem 0;
  color: #111827;
}

.state {
  text-align: center;
  padding: 2rem 0;
  color: #6b7280;
}

.notifications-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.notification-card {
  background: #f9fafb;
  border-radius: 14px;
  padding: 0.9rem 1.25rem;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
  background: #f3f4ff;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.notification-type {
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.notification-type.type--chat {
  background: #dbeafe;
  color: #1d4ed8;
}

.notification-type.type--duel {
  background: #fee2e2;
  color: #b91c1c;
}

.notification-type.type--course {
  background: #ecfdf5;
  color: #047857;
}

.notification-type.type--quiz {
  background: #fef3c7;
  color: #b45309;
}

.notification-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.notification-message {
  margin: 0;
  font-size: 0.95rem;
  color: #111827;
}

.notification-actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
}

.btn-accept,
.btn-reject {
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-accept {
  background: #22c55e;
  color: white;
}

.btn-accept:hover {
  background: #16a34a;
}

.btn-reject {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-reject:hover {
  background: #e5e7eb;
}
</style>
