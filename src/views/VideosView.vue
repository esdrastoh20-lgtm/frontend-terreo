<template>
  <div class="videos-page">
    <header class="videos-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="router.push('/dashboard')" class="btn-back">← Retour</button>
          <h1>Vidéos de formation</h1>
        </div>
        <div class="user-info">
          <span>{{ authStore.user?.name || 'Utilisateur' }}</span>
          <button @click="handleLogout" class="btn-logout">Déconnexion</button>
        </div>
      </div>
    </header>

    <main class="videos-content">
      <!-- Section vidéos recommandées visible dès l'arrivée -->
      <section v-if="videosStore.featuredVideos.length" class="featured-section">
        <div class="featured-header">
          <div>
            <h2 class="featured-title">Vidéos recommandées</h2>
            <p class="featured-subtitle">Commencez tout de suite avec une sélection de vidéos populaires.</p>
          </div>
        </div>
        <div class="videos-grid videos-grid--featured">
          <div
            v-for="video in videosStore.featuredVideos"
            :key="video.id"
            class="video-card video-card--featured"
            @click="selectVideo(video)"
          >
            <div class="video-thumbnail">
              <img :src="video.thumbnail" :alt="video.title" />
              <div class="video-duration">{{ video.duration }}</div>
              <div class="play-overlay" @click.stop="playVideo(video)">
                <div class="play-button play-button--pulse">▶</div>
              </div>
            </div>
            <div class="video-info">
              <h3 class="video-title">{{ video.title }}</h3>
              <p class="video-description">{{ video.description }}</p>
              <div class="video-meta">
                <span class="meta-item meta-item--instructor">{{ video.instructor }}</span>
                <span class="meta-separator">•</span>
                <span class="meta-item">{{ formatViews(video.views) }} vues</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sélection du domaine -->
      <div v-if="!videosStore.selectedDomain" class="selection-section">
        <h2>Choisissez un domaine</h2>
        <div class="domains-grid">
          <div
            v-for="domain in coursesStore.domains"
            :key="domain.id"
            class="domain-card"
            :style="{ borderLeft: `4px solid ${domain.color}` }"
            @click="videosStore.selectDomain(domain.id)"
          >
            <div class="domain-header">
              <span class="domain-name">{{ domain.name }}</span>
              <span class="domain-color" :style="{ color: domain.color }">●</span>
            </div>
            <p class="domain-description">Vidéos de formation pour {{ domain.name }}</p>
            <button class="btn-view">Voir les vidéos →</button>
          </div>
        </div>
      </div>

      <!-- Sélection du niveau -->
      <div v-else-if="!videosStore.selectedLevel" class="selection-section">
        <div class="breadcrumb">
          <span @click="videosStore.selectDomain(null)" class="breadcrumb-link">Domaines</span>
          <span> / </span>
          <span>{{ coursesStore.getDomainById(videosStore.selectedDomain)?.name }}</span>
        </div>
        <h2>Choisissez votre niveau</h2>
        <div class="levels-grid">
          <div
            v-for="level in coursesStore.levels"
            :key="level.id"
            class="level-card"
            @click="videosStore.selectLevel(level.id)"
          >
            <div class="level-header">
              <span class="level-name">{{ level.name }}</span>
            </div>
            <p class="level-description">{{ getLevelDescription(level.id) }}</p>
            <button class="btn-view">Voir les vidéos →</button>
          </div>
        </div>
      </div>

      <!-- Liste des vidéos -->
      <div v-else class="videos-section">
        <div class="breadcrumb">
          <span @click="videosStore.selectDomain(null)" class="breadcrumb-link">Domaines</span>
          <span> / </span>
          <span @click="videosStore.selectLevel(null)" class="breadcrumb-link">
            {{ coursesStore.getDomainById(videosStore.selectedDomain)?.name }}
          </span>
          <span> / </span>
          <span>{{ coursesStore.getLevelById(videosStore.selectedLevel)?.name }}</span>
        </div>

        <div class="videos-header-section">
          <div>
            <h2>
              {{ coursesStore.getDomainById(videosStore.selectedDomain)?.name }} - 
              {{ coursesStore.getLevelById(videosStore.selectedLevel)?.name }}
            </h2>
            <p class="videos-count">{{ videosStore.filteredVideos.length }} vidéos disponibles</p>
          </div>
          <button @click="resetSelection" class="btn-change">Changer de domaine</button>
        </div>

        <div v-if="videosStore.filteredVideos.length === 0" class="no-videos">
          <p>Aucune vidéo disponible pour cette sélection.</p>
        </div>

        <div v-else class="videos-grid">
          <div
            v-for="video in videosStore.filteredVideos"
            :key="video.id"
            class="video-card"
            @click="selectVideo(video)"
          >
            <div class="video-thumbnail">
              <img :src="video.thumbnail" :alt="video.title" />
              <div class="video-duration">{{ video.duration }}</div>
              <div class="play-overlay" @click.stop="playVideo(video)">
                <div class="play-button">▶</div>
              </div>
            </div>
            <div class="video-info">
              <h3 class="video-title">{{ video.title }}</h3>
              <p class="video-description">{{ video.description }}</p>
              <div class="video-meta">
                <span class="meta-item">{{ video.instructor }}</span>
                <span class="meta-separator">•</span>
                <span class="meta-item">{{ formatViews(video.views) }} vues</span>
                <span class="meta-separator">•</span>
                <span class="meta-item">{{ formatDate(video.uploadDate) }}</span>
              </div>
              <div class="video-stats">
                <span class="stat-item">👍 {{ video.likes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCoursesStore } from '@/stores/courses'
import { useVideosStore } from '@/stores/videos'

const router = useRouter()
const authStore = useAuthStore()
const coursesStore = useCoursesStore()
const videosStore = useVideosStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const resetSelection = () => {
  videosStore.selectDomain(null)
  videosStore.selectLevel(null)
}

const getLevelDescription = (levelId) => {
  const descriptions = {
    debutant: 'Vidéos pour débutants',
    intermediaire: 'Vidéos de niveau intermédiaire',
    avance: 'Vidéos avancées'
  }
  return descriptions[levelId] || ''
}

const selectVideo = (video) => {
  playVideo(video)
}

const playVideo = (video) => {
  if (video.videoUrl) {
    window.open(video.videoUrl, '_blank')
  } else if (video.embedUrl) {
    // Ouvrir dans une modal ou nouvelle fenêtre
    window.open(video.embedUrl, '_blank')
  }
}

const formatViews = (views) => {
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'k'
  }
  return views.toString()
}

const formatDate = (date) => {
  const now = new Date()
  const videoDate = new Date(date)
  const diff = now - videoDate
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return "Hier"
  if (days < 7) return `Il y a ${days} jours`
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`
  return `Il y a ${Math.floor(days / 30)} mois`
}
</script>

<style scoped>
.videos-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.videos-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e0e0e0;
}

.videos-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #2563eb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-info span {
  font-weight: 600;
  color: #2563eb;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #e0e0e0;
}

.videos-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.featured-section {
  margin-bottom: 2.5rem;
}

.featured-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}

.featured-title {
  font-size: 1.9rem;
  font-weight: 700;
  color: #111827;
}

.featured-subtitle {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  color: #6b7280;
}

.selection-section {
  margin-top: 2rem;
}

.selection-section h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  color: #666;
  font-size: 0.95rem;
}

.breadcrumb-link {
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
}

.breadcrumb-link:hover {
  color: #5568d3;
}

.domains-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.domain-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
}

.domain-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.domain-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.domain-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.domain-color {
  font-size: 1.5rem;
}

.domain-description {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.btn-view {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  background: #5568d3;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.level-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
}

.level-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.level-header {
  margin-bottom: 0.75rem;
}

.level-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.level-description {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.videos-section {
  margin-top: 2rem;
}

.videos-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.videos-header-section h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.videos-count {
  color: #666;
  font-size: 1rem;
}

.btn-change {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #667eea;
  border-radius: 8px;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-change:hover {
  background: #667eea;
  color: white;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.videos-grid--featured {
  margin-top: 0.5rem;
}

.video-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  position: relative;
}

.video-card:hover {
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
  transform: translateY(-4px) scale(1.01);
  border-color: transparent;
}

.video-card--featured::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.7), rgba(236, 72, 153, 0.7));
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.video-card--featured:hover::before {
  opacity: 1;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #f0f0f0;
  overflow: hidden;
}

.video-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.02);
  transition: transform 0.3s ease;
}

.video-duration {
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
  transition: opacity 0.2s;
}

.video-card:hover .play-overlay {
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
}

.play-button--pulse {
  box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  animation: pulse 1.6s infinite;
}

.video-info {
  padding: 1rem;
}

.video-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.video-description {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.meta-item--instructor {
  font-weight: 600;
  color: #2563eb;
}

.meta-separator {
  color: #ccc;
}

.video-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.no-videos {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  color: #666;
}

@media (max-width: 768px) {
  .videos-content {
    padding: 1rem;
  }
  
  .domains-grid,
  .levels-grid,
  .videos-grid {
    grid-template-columns: 1fr;
  }
  
  .videos-header-section {
    flex-direction: column;
  }
}
</style>

