<template>
  <div class="course-detail-page">
    <header class="course-detail-header">
      <div class="header-inner">
        <button class="btn-back" @click="goBack">← Retour aux cours</button>
        <div class="header-text">
          <p class="course-domain" v-if="course?.domain_id">Cours du domaine #{{ course.domain_id }}</p>
          <h1>{{ course?.title || 'Cours' }}</h1>
          <p class="course-subtitle" v-if="course?.description">
            {{ course.description }}
          </p>
        </div>
      </div>
    </header>

    <main v-if="!loading && course" class="course-main">
      <div class="course-layout">
        <section class="course-panel course-panel--meta">
          <div class="meta-row">
            <span class="meta-label">Niveau</span>
            <span class="meta-value" v-if="course.level">{{ getLevelName(course.level) }}</span>
            <span class="meta-value" v-else>Non spécifié</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Durée estimée</span>
            <span class="meta-value">⏱️ 30 min</span>
          </div>
        </section>

        <section class="course-panel course-panel--content" v-if="course.content">
          <h2>Contenu du cours</h2>
          <div class="course-content-text" v-html="formattedContent"></div>
        </section>
      </div>
    </main>

    <div v-else-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement du cours...</p>
    </div>

    <div v-else class="error-message">
      <p>Impossible de charger ce cours.</p>
      <button class="btn-back" @click="goBack">Retour aux cours</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const course = ref(null)
const loading = ref(false)

const getLevelName = (level) => {
  if (!level) return 'Niveau'
  const levels = {
    easy: 'Débutant',
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    debutant: 'Débutant',
    intermediaire: 'Intermédiaire',
    avance: 'Avancé'
  }
  return levels[level.toLowerCase()] || level
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formattedContent = computed(() => {
  if (!course.value?.content) return ''

  const lines = course.value.content.split(/\r?\n/)

  const htmlLines = lines.map(rawLine => {
    const line = rawLine.trimEnd()

    // Échapper le HTML
    const escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    if (!escaped) {
      return '<div class="course-line course-line--empty"></div>'
    }

    // Titres de chapitre de type "# Chapitre 1 - ..."
    if (/^\s*#\s+/.test(line)) {
      const titleText = escaped.replace(/^\s*#\s+/, '')
      return `<div class="course-line course-line--title"><span>${titleText}</span></div>`
    }

    // Titre numéroté : "1. Introduction à Linux"
    if (/^\s*\d+\.\s+/.test(line)) {
      return `<div class="course-line course-line--title"><span>${escaped}</span></div>`
    }

    // Lignes de liste commençant par "- " ou "•"
    if (/^\s*-\s+/.test(line) || /^\s*•\s*/.test(line)) {
      const bulletText = escaped
        .replace(/^\s*-\s+/, '')
        .replace(/^\s*•\s*/, '')
      return `<div class="course-line course-line--bullet"><span class="bullet-dot">•</span><span>${bulletText}</span></div>`
    }

    // Sous-titres terminés par ':'
    if (/.*:\s*$/.test(line)) {
      return `<div class="course-line course-line--subtitle"><span>${escaped}</span></div>`
    }

    return `<div class="course-line course-line--text"><span>${escaped}</span></div>`
  })

  return htmlLines.join('')
})

const goBack = () => {
  router.push({ name: 'courses' })
}

onMounted(async () => {
  const id = route.params.id
  if (!id) return

  loading.value = true
  try {
    course.value = await api.getCourseById(id)
  } catch (error) {
    console.error('Erreur chargement cours:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.course-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.course-detail-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1.5rem;
}

.header-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background: white;
  color: #667eea;
}

.header-text h1 {
  font-size: 1.9rem;
  margin: 0 0 0.5rem;
  font-weight: 700;
}

.course-domain {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.course-subtitle {
  font-size: 0.95rem;
  max-width: 640px;
  opacity: 0.9;
}

.course-main {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem 2rem;
}

.course-layout {
  display: grid;
  grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
  gap: 1.5rem;
}

.course-panel {
  background: white;
  border-radius: 14px;
  padding: 1.5rem 1.75rem;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
}

.course-panel--meta {
  align-self: flex-start;
}

.course-panel--content h2 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #111827;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.course-panel--content h2::before {
  content: '📚';
  font-size: 1.2rem;
}

.course-panel--content h2::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.35rem;
  width: 72px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.meta-row:last-child {
  border-bottom: none;
}

.meta-label {
  font-size: 0.9rem;
  color: #6b7280;
}

.meta-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: #111827;
}

.course-content-text {
  white-space: normal;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.7;
  color: #1f2933;
  font-size: 0.96rem;
  background: #f9fafb;
  border-radius: 14px;
  padding: 1.5rem 1.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 8px 18px rgba(15, 23, 42, 0.04);
}

.course-content-text::selection {
  background: #e0e7ff;
}

.course-line {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.course-line--empty {
  margin-bottom: 0.6rem;
}

.course-line--title {
  margin-top: 0.75rem;
}

.course-line--title span {
  font-weight: 700;
  color: #111827;
}

.course-line--subtitle span {
  font-weight: 600;
  color: #1f2937;
}

.course-line--bullet {
  padding-left: 0.25rem;
}

.bullet-dot {
  color: #4f46e5;
  margin-top: 0.2rem;
}

.course-line--text span {
  color: #374151;
}

.course-panel--content {
  position: relative;
  overflow: hidden;
}

.course-panel--content::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.06), rgba(118, 75, 162, 0.04));
  pointer-events: none;
}

.course-panel--content > * {
  position: relative;
}

.loading,
.error-message {
  max-width: 600px;
  margin: 3rem auto;
  text-align: center;
  color: #4b5563;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
