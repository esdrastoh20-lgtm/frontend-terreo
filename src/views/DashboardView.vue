<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <img src="@/assets/logo.png" alt="Logo" class="header-logo" />
          <h1>Bienvenue sur Terreo</h1>
          <nav class="main-nav">
            <button @click="router.push('/dashboard')" :class="{ active: $route.path === '/dashboard' }">
              Accueil
            </button>
            <button @click="router.push('/courses')" :class="{ active: $route.path === '/courses' }">
              Cours
            </button>
            <button @click="router.push('/videos')" :class="{ active: $route.path === '/videos' }">
              Vidéos
            </button>
            <button @click="router.push('/chat')" :class="{ active: $route.path === '/chat' }">
              Messages
              <span v-if="chatStore.unreadCount > 0" class="badge">{{ chatStore.unreadCount }}</span>
            </button>
            <button @click="router.push('/domains')" :class="{ active: $route.path === '/domains' }">
              Domaines
            </button>
            <button @click="router.push('/duels')" :class="{ active: $route.path === '/duels' }">
              Duels
            </button>
            <button @click="router.push('/certifications')" :class="{ active: $route.path === '/certifications' }">
              Attestations
            </button>
            <button v-if="authStore.isAdmin" @click="router.push('/admin')" :class="{ active: $route.path === '/admin' }">
              Admin
            </button>
          </nav>
        </div>
        <div class="user-info">
          <div class="user-profile-wrapper">
            <div class="user-profile" @click="toggleUserInfoPanel">
              <div class="user-avatar-large">{{ getInitials() }}</div>
              <div class="user-details">
                <div class="user-name-large">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</div>
                <div class="user-email-small">{{ authStore.user?.email }}</div>
              </div>
            </div>
            <!-- Dropdown isolé sous le profil utilisateur -->
            <transition name="fade-slide">
              <div v-if="showUserInfoPanel" class="user-info-panel-dropdown">
                <h2 class="section-title">Informations personnelles</h2>
                <div class="user-info-grid">
                  <div class="user-info-item">
                    <span class="label">Nom complet</span>
                    <span class="value">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</span>
                  </div>
                  <div class="user-info-item">
                    <span class="label">Email</span>
                    <span class="value">{{ authStore.user?.email }}</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          <button @click="handleLogout" class="btn-logout">Déconnexion</button>
        </div>
      </div>
    </header>

    <main class="dashboard-content">
      <!-- Tableau statistique -->
      <div class="stats-table-section">
        <h2 class="section-title">Statistiques par domaine</h2>
        <div class="table-container">
          <table class="stats-table">
            <thead>
              <tr>
                <th>Domaine</th>
                <th>Cours disponibles</th>
                <th>Cours complétés</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="domain in statsStore.statsByDomain" :key="domain.id">
                <td>
                  <div class="domain-cell">
                    <span class="domain-color" :style="{ backgroundColor: domain.color }"></span>
                    <span class="domain-name" :style="{ color: domain.color }">{{ domain.name }}</span>
                  </div>
                </td>
                <td>
                  <span class="domain-number" :style="{ color: domain.color }">
                    {{ domain.courses }}
                  </span>
                </td>
                <td>
                  <span class="domain-number" :style="{ color: domain.color }">
                    {{ domain.completed }}
                  </span>
                </td>
                <td>
                  <button @click="selectDomain(domain.id)" class="btn-action">Voir les cours</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Demandes de duels -->
      <div class="chart-section">
        <h2 class="section-title">Demandes de duels</h2>
        <div class="duel-requests">
          <div v-if="loadingDuels" class="duel-requests-empty">Chargement des duels...</div>
          <div v-else-if="duelRequests.length === 0" class="duel-requests-empty">
            Aucune demande de duel pour le moment.
          </div>
          <div v-else class="duel-requests-list">
            <div
              v-for="duel in duelRequests"
              :key="duel.id"
              class="duel-request-card"
            >
              <div class="duel-request-header">
                <span class="duel-request-title">Duel #{{ duel.id }}</span>
                <span class="duel-request-status" :class="`status-${duel.status || 'waiting'}`">
                  {{ formatDuelStatus(duel.status) }}
                </span>
              </div>
              <div class="duel-request-body">
                <p><strong>Domaine :</strong> {{ duel.domain_name || duel.domain_id }}</p>
                <p><strong>Niveau :</strong> {{ duel.level }}</p>
                <p v-if="duel.code"><strong>Code :</strong> {{ duel.code }}</p>
              </div>
              <div class="duel-request-footer">
                <button class="btn-action" @click="router.push('/duels')">
                  Gérer les duels
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <h2 class="section-title">Actions rapides</h2>
        <div class="actions-grid">
          <button @click="router.push('/courses')" class="action-card">
            <div class="action-icon">📚</div>
            <div class="action-content">
              <h3>Consulter les cours</h3>
              <p>Accédez à tous vos cours de préparation</p>
            </div>
          </button>
          <button @click="router.push('/videos')" class="action-card">
            <div class="action-icon">🎥</div>
            <div class="action-content">
              <h3>Voir les vidéos</h3>
              <p>Regardez les vidéos de formation</p>
            </div>
          </button>
          <button @click="router.push('/chat')" class="action-card">
            <div class="action-icon">💬</div>
            <div class="action-content">
              <h3>Messages</h3>
              <p>Communiquez avec le support</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Vidéos en vedette -->
      <div class="featured-videos-section">
        <div class="section-header-videos">
          <h2 class="section-title">Vidéos en vedette</h2>
          <button @click="router.push('/videos')" class="btn-view-all">Voir toutes les vidéos →</button>
        </div>
        <div class="videos-grid">
          <div
            v-for="video in videosStore.featuredVideos"
            :key="video.id"
            class="video-preview-card"
            @click="openVideo(video)"
          >
            <div class="video-thumbnail-wrapper">
              <img :src="video.thumbnail" :alt="video.title" class="video-thumbnail" />
              <div class="play-overlay">
                <div class="play-button">▶</div>
              </div>
              <div class="video-duration-badge">{{ video.duration }}</div>
            </div>
            <div class="video-info">
              <h3 class="video-title">{{ video.title }}</h3>
              <p class="video-instructor">{{ video.instructor }}</p>
              <div class="video-stats">
                <span>👁️ {{ formatViews(video.views) }}</span>
                <span>👍 {{ formatViews(video.likes) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attestations -->
      <div class="certifications-section">
        <div class="section-header-certs">
          <h2 class="section-title">Mes Attestations</h2>
          <button @click="router.push('/certifications')" class="btn-view-all">Voir toutes les attestations →</button>
        </div>
        <div class="certifications-preview">
          <div class="cert-preview-card" v-if="certificationsCount > 0">
            <div class="cert-badge-large">🏆</div>
            <h3>{{ certificationsCount }} Attestation{{ certificationsCount > 1 ? 's' : '' }}</h3>
            <p>Félicitations pour vos réussites !</p>
            <button @click="router.push('/certifications')" class="btn-view-certs">Voir mes attestations</button>
          </div>
          <div v-else class="no-certs-preview">
            <p>Passez les examens pour obtenir vos attestations</p>
            <button @click="router.push('/courses')" class="btn-start-exam">Commencer un examen</button>
          </div>
        </div>
      </div>

      <!-- Activité récente -->
      <div class="recent-activity">
        <h2 class="section-title">Activité récente</h2>
        <div class="activity-list">
          <div 
            v-for="(activity, index) in statsStore.userStats.recentActivity" 
            :key="index"
            class="activity-item"
          >
            <div class="activity-icon">{{ getActivityIcon(activity.action) }}</div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.course }}</div>
              <div class="activity-meta">{{ activity.domain }} • {{ formatDate(activity.date) }}</div>
            </div>
            <div class="activity-badge" :class="activity.action.toLowerCase().replace(' ', '-')">
              {{ activity.action }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCoursesStore } from '@/stores/courses'
import { useChatStore } from '@/stores/chat'
import { useStatsStore } from '@/stores/stats'
import { useVideosStore } from '@/stores/videos'
import { useDuelsStore } from '@/stores/duels'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const coursesStore = useCoursesStore()
const chatStore = useChatStore()
const statsStore = useStatsStore()
const videosStore = useVideosStore()
const duelsStore = useDuelsStore()

const showUserInfoPanel = ref(false)

const certificationsCount = ref(0)

const loadingDuels = ref(false)
const duelRequests = ref([])

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  // Charger les domaines depuis l'API
  await coursesStore.loadDomains()
  // Charger les statistiques utilisateur depuis le backend
  await statsStore.loadUserStats(authStore.user.id)
  await loadCertificationsCount()
  // Charger les conversations pour mettre à jour le badge Messages
  await chatStore.loadConversations()
  // Charger les duels pour afficher les demandes de duels
  await loadDuelRequests()
})

async function loadCertificationsCount() {
  try {
    const results = await api.getUserResults(authStore.user.id)
    certificationsCount.value = results.filter(r => r.passed && r.score >= 70).length
  } catch (error) {
    console.error('Erreur chargement certifications:', error)
  }
}

async function loadDuelRequests () {
  try {
    loadingDuels.value = true
    const duels = await duelsStore.getDuels()
    duelRequests.value = Array.isArray(duels) ? duels : []
  } catch (error) {
    console.error('Erreur chargement duels:', error)
    duelRequests.value = []
  } finally {
    loadingDuels.value = false
  }
}

function openVideo(video) {
  window.open(video.videoUrl, '_blank')
}

function formatViews(views) {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M'
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K'
  }
  return views.toString()
}

function getInitials() {
  const user = authStore.user
  if (!user) return 'U'
  const first = user.first_name?.[0] || ''
  const last = user.last_name?.[0] || ''
  return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const selectDomain = (domainId) => {
  coursesStore.selectDomain(domainId)
  router.push('/courses')
}

const getActivityIcon = (action) => {
  const icons = {
    'Complété': '✅',
    'En cours': '🔄',
    'Commencer': '▶️'
  }
  return icons[action] || '📝'
}

const formatDate = (date) => {
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return "Hier"
  if (days < 7) return `Il y a ${days} jours`
  return date.toLocaleDateString('fr-FR')
}

const toggleUserInfoPanel = () => {
  showUserInfoPanel.value = !showUserInfoPanel.value
}

const formatDuelStatus = (status) => {
  const map = {
    waiting: 'En attente',
    pending: 'En attente',
    active: 'En cours',
    in_progress: 'En cours',
    completed: 'Terminé'
  }
  return map[status] || 'En attente'
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: radial-gradient(circle at top left, #e0f2fe 0, #f9fafb 45%, #e5e7eb 100%);
  position: relative;
  overflow-x: hidden;
}

.dashboard::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.dashboard-header {
  background: linear-gradient(120deg, #ecfdf5 0%, #bbf7d0 35%, #22c55e 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
  padding: 1.25rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-logo {
  max-width: 60px;
  height: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s;
}

.header-logo:hover {
  transform: scale(1.05);
}

.dashboard-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.main-nav {
  display: flex;
  gap: 0.5rem;
}

.main-nav button {
  padding: 0.625rem 1.25rem;
  background: transparent;
  border: none;
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.main-nav button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
}

.main-nav button:hover::before {
  width: 300px;
  height: 300px;
}

.main-nav button:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateY(-2px);
}

.main-nav button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.main-nav button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: white;
  border-radius: 3px 3px 0 0;
}

.badge {
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-profile-wrapper {
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.45rem 0.9rem;
  background: linear-gradient(135deg, #f9fafb 0%, #e5ecff 100%);
  border-radius: 999px;
  border: 1px solid rgba(102, 126, 234, 0.25);
  transition: all 0.3s;
  cursor: pointer;
}

.user-profile:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.4);
}

.user-avatar-large {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
  }
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name-large {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.user-email-small {
  font-size: 0.75rem;
  color: #6b7280;
}

.user-info-panel-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  min-width: 260px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
  z-index: 120;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #e0e0e0;
  color: #333;
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.25rem 2rem 2.5rem;
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid rgba(102, 126, 234, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card:hover::after {
  opacity: 1;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  animation: countUp 1s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #10b981;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  animation: expandWidth 0.6s ease-out;
}

@keyframes expandWidth {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

.stats-table-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 2rem 2.25rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  margin-bottom: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  animation: slideInLeft 0.6s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.stats-table-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(180deg, #22c55e 0%, #14b8a6 50%, #3b82f6 100%);
}

.table-container {
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table thead {
  background: #f8f9fa;
}

.stats-table th {
  padding: 1.25rem 1rem;
  text-align: left;
  font-weight: 700;
  color: #333;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 3px solid #667eea;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  position: relative;
}

.stats-table th::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.stats-table thead:hover th::after {
  width: 100%;
}

.stats-table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.stats-table tbody tr {
  transition: all 0.2s;
}

.stats-table tbody tr:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, transparent 100%);
  transform: translateX(4px);
}

.domain-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.domain-color {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-text {
  font-size: 0.875rem;
  color: #666;
  min-width: 45px;
  text-align: right;
}

.btn-action {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  position: relative;
  overflow: hidden;
}

.btn-action::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
}

.btn-action:hover::before {
  width: 300px;
  height: 300px;
}

.btn-action:hover {
  background: linear-gradient(135deg, #5568d3 0%, #653a8f 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.chart-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 2rem 2.25rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  margin-bottom: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  animation: slideInRight 0.6s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.chart-section::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(118, 75, 162, 0.05) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

.duel-requests {
  padding: 1rem 0;
}

.duel-requests-empty {
  text-align: center;
  color: #6b7280;
  padding: 1rem 0;
}

.duel-requests-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.duel-request-card {
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.duel-request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.duel-request-title {
  font-weight: 600;
  color: #111827;
}

.duel-request-status {
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-weight: 600;
}

.duel-request-status.status-waiting,
.duel-request-status.status-pending {
  background: #fef3c7;
  color: #b45309;
}

.duel-request-status.status-active,
.duel-request-status.status-in_progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.duel-request-status.status-completed {
  background: #dcfce7;
  color: #15803d;
}

.duel-request-body p {
  margin: 0.1rem 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.duel-request-footer {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.chart-container {
  padding: 1rem 0;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  height: 200px;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.chart-bar {
  width: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px 8px 0 0;
  position: relative;
  min-height: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: growUp 0.8s ease-out;
}

@keyframes growUp {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.chart-bar-wrapper:hover .chart-bar {
  transform: scaleY(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.bar-value {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.bar-label {
  font-size: 0.875rem;
  color: #666;
}

/* Responsive */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .dashboard-content {
    padding: 1.5rem 1.25rem 2rem;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 0.85rem 1rem;
  }

  .header-left {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .header-logo {
    max-width: 44px;
  }

  .dashboard-header h1 {
    font-size: 1.25rem;
  }

  .main-nav {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }

  .main-nav button {
    white-space: nowrap;
    font-size: 0.8rem;
    padding: 0.45rem 0.8rem;
  }

  .user-info {
    width: 100%;
    justify-content: space-between;
  }

  .dashboard-content {
    padding: 1rem 0.75rem 1.5rem;
  }

  .stats-table-section,
  .chart-section,
  .quick-actions,
  .featured-videos-section,
  .certifications-section,
  .recent-activity {
    padding: 1.25rem 1rem;
    border-radius: 14px;
  }

  .stats-table th,
  .stats-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .videos-grid {
    grid-template-columns: 1fr;
  }
}

.quick-actions {
  margin-bottom: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.5s;
}

.action-card:hover::before {
  left: 100%;
}

.action-card:hover {
  border-color: #667eea;
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.25);
  transform: translateY(-6px) scale(1.02);
}

.action-icon {
  font-size: 2.5rem;
  transition: transform 0.3s;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.action-card:hover .action-icon {
  transform: scale(1.2) rotate(5deg);
  filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3));
}

.action-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.action-content p {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.recent-activity {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border-left: 4px solid transparent;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.activity-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%);
  transition: width 0.3s;
}

.activity-item:hover {
  transform: translateX(8px);
  border-left-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.activity-item:hover::before {
  width: 100%;
}

.activity-icon {
  font-size: 1.75rem;
  transition: transform 0.3s;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.activity-item:hover .activity-icon {
  transform: scale(1.2) rotate(10deg);
  filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3));
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.activity-meta {
  font-size: 0.875rem;
  color: #666;
}

.activity-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.activity-badge.complété {
  background: #d1fae5;
  color: #065f46;
}

.activity-badge.en-cours {
  background: #dbeafe;
  color: #1e40af;
}

.activity-badge.commencer {
  background: #fef3c7;
  color: #92400e;
}

.featured-videos-section {
  margin-bottom: 2rem;
}

.section-header-videos,
.section-header-certs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-view-all {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #667eea;
  border-radius: 6px;
  color: #667eea;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view-all:hover {
  background: #667eea;
  color: white;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.video-preview-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s;
}

.video-preview-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

.video-preview-card {
  animation: fadeInScale 0.5s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.video-thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #f0f0f0;
  overflow: hidden;
}

.video-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s;
}

.video-preview-card:hover .play-overlay {
  opacity: 1;
}

.play-button {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #667eea;
  padding-left: 4px;
}

.video-duration-badge {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.video-info {
  padding: 1rem;
}

.video-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-instructor {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.75rem;
}

.video-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #999;
}

.certifications-section {
  margin-bottom: 2rem;
}

.certifications-preview {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e0e0e0;
}

.cert-preview-card {
  text-align: center;
  padding: 2rem;
}

.cert-badge-large {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite, glow 3s infinite;
  filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
  }
  50% {
    filter: drop-shadow(0 6px 20px rgba(102, 126, 234, 0.5));
  }
}

.cert-preview-card h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.cert-preview-card p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn-view-certs {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view-certs:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
}

.no-certs-preview {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.btn-start-exam {
  padding: 0.875rem 2rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s;
}

.btn-start-exam:hover {
  background: #059669;
  transform: translateY(-2px);
}

.user-info-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  border: 2px solid rgba(102, 126, 234, 0.15);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
}

.user-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem 2rem;
}

.user-info-item .label {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.user-info-item .value {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .main-nav {
    flex-wrap: wrap;
  }
  
  .dashboard-content {
    padding: 1rem;
  }
  
  .stats-section,
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .table-container {
    overflow-x: scroll;
  }
}
</style>
