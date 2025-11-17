<template>
  <div class="courses-page">
    <header class="courses-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="btn-back">← Retour</button>
          <h1>Mes Cours</h1>
        </div>
        <div class="user-info">
          <span>Bienvenue, {{ authStore.user?.name || 'Utilisateur' }}</span>
          <button @click="handleLogout" class="btn-logout">Déconnexion</button>
        </div>
      </div>
    </header>

    <main class="courses-content">
      <!-- Sélection du domaine -->
      <div v-if="!coursesStore.selectedDomain" class="selection-section">
        <h2>Choisissez un domaine</h2>
        
        <!-- État de chargement -->
        <div v-if="loadingDomains" class="loading-domains">
          <div class="spinner"></div>
          <p>Chargement des domaines...</p>
        </div>
        
        <!-- Liste des domaines -->
        <div v-else-if="coursesStore.domains.length > 0" class="domains-grid">
          <div
            v-for="domain in coursesStore.domains"
            :key="domain.id"
            class="domain-card"
            :style="{ borderColor: domain.color }"
            @click="coursesStore.selectDomain(domain.id)"
          >
            <div
              class="domain-icon"
              :style="{
                backgroundColor: (domain.color || '#6366f1') + '15',
                color: domain.color || '#1f2937'
              }"
            >
              {{ getDomainInitials(domain.name) }}
            </div>
            <h3>{{ domain.name }}</h3>
          </div>
        </div>
        
        <!-- Message si aucun domaine -->
        <div v-else class="no-domains">
          <div class="empty-icon">📚</div>
          <p>Aucun domaine disponible</p>
          <button @click="reloadDomains" class="btn-reload">Réessayer</button>
        </div>
      </div>

      <!-- Sélection du niveau -->
      <div v-else-if="!coursesStore.selectedLevel" class="selection-section">
        <div class="breadcrumb">
          <span @click="coursesStore.selectDomain(null)" class="breadcrumb-link">
            Domaines
          </span>
          <span> / </span>
          <span>{{ coursesStore.getDomainById(coursesStore.selectedDomain)?.name }}</span>
        </div>
        <h2>Choisissez votre niveau</h2>
        <div class="levels-grid">
          <div
            v-for="level in coursesStore.levels"
            :key="level.id"
            class="level-card"
            @click="coursesStore.selectLevel(level.id)"
          >
            <div class="level-icon">{{ getLevelInitials(level.id) }}</div>
            <h3>{{ level.name }}</h3>
            <p>{{ getLevelDescription(level.id) }}</p>
          </div>
        </div>
      </div>

      <!-- Liste des cours -->
      <div v-else class="courses-section">
        <div class="breadcrumb">
          <span @click="coursesStore.selectDomain(null)" class="breadcrumb-link">
            Domaines
          </span>
          <span> / </span>
          <span @click="coursesStore.selectLevel(null)" class="breadcrumb-link">
            {{ coursesStore.getDomainById(coursesStore.selectedDomain)?.name }}
          </span>
          <span> / </span>
          <span>{{ coursesStore.getLevelById(coursesStore.selectedLevel)?.name }}</span>
        </div>

        <div class="courses-header-section">
          <div>
            <h2>
              {{ coursesStore.getDomainById(coursesStore.selectedDomain)?.name }} - 
              {{ coursesStore.getLevelById(coursesStore.selectedLevel)?.name }}
            </h2>
            <p class="courses-count">
              {{ courses.length }} cours disponibles
            </p>
          </div>
          <button @click="resetSelection" class="btn-change">
            Changer de domaine
          </button>
        </div>

        <div v-if="loading" class="loading-courses">
          <div class="spinner"></div>
          <p>Chargement des cours...</p>
        </div>

        <div v-else-if="courses.length === 0" class="no-courses">
          <div class="empty-courses">
            <div class="empty-icon">📚</div>
            <p>Aucun cours disponible pour cette sélection.</p>
            <button @click="resetSelection" class="btn-back-selection">Choisir un autre domaine</button>
          </div>
        </div>

        <div v-else class="courses-grid">
          <div
            v-for="course in courses"
            :key="course.id"
            class="course-card"
            :style="{
              '--course-color': coursesStore.getDomainById(coursesStore.selectedDomain)?.color || '#6366f1'
            }"
          >
            <div class="course-header">
              <div class="course-icon">📖</div>
              <div class="course-badge" :style="{ 
                backgroundColor: coursesStore.getDomainById(coursesStore.selectedDomain)?.color + '20',
                color: coursesStore.getDomainById(coursesStore.selectedDomain)?.color
              }">
                {{ getLevelName(course.level) }}
              </div>
            </div>
            <h3>{{ course.title || course.name || 'Cours sans titre' }}</h3>
            <p class="course-description">{{ course.description || 'Aucune description disponible' }}</p>
            <div class="course-meta">
              <span class="meta-item" v-if="course.duration">⏱️ {{ course.duration }}</span>
              <span class="meta-item" v-if="course.lessons">📝 {{ course.lessons }} leçons</span>
              <span class="meta-item" v-if="course.created_at">📅 {{ formatDate(course.created_at) }}</span>
            </div>
            <div class="course-progress" v-if="course.progress > 0">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ 
                    width: course.progress + '%',
                    backgroundColor: coursesStore.getDomainById(coursesStore.selectedDomain)?.color
                  }"
                ></div>
              </div>
              <span class="progress-text">{{ course.progress }}% complété</span>
            </div>
            <div class="course-actions">
              <button class="btn-course" @click="openCourse(course)">Commencer le cours</button>
              <button @click="startExam(course)" class="btn-exam">Passer l'examen</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCoursesStore } from '@/stores/courses'
import { useExamStore } from '@/stores/exam'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const coursesStore = useCoursesStore()
const examStore = useExamStore()

const courses = ref([])
const loading = ref(false)
const loadingDomains = ref(false)

watch(() => [coursesStore.selectedDomain, coursesStore.selectedLevel], async ([domainId, levelId]) => {
  if (domainId && levelId) {
    await loadCourses(domainId, levelId)
  }
}, { immediate: true })

async function loadCourses(domainId, levelId) {
  loading.value = true
  try {
    // Mapper le niveau pour l'API
    const levelMap = {
      'debutant': 'easy',
      'intermediaire': 'intermediate',
      'avance': 'advanced'
    }
    const apiLevel = levelMap[levelId] || levelId
    
    // Charger depuis la base de données
    await coursesStore.loadCoursesFromDB(domainId, apiLevel)
    courses.value = coursesStore.filteredCourses
    
    // Si aucun cours dans la DB, utiliser les cours statiques
    if (courses.value.length === 0) {
      courses.value = coursesStore.filteredCourses
    }
  } catch (error) {
    console.error('Erreur chargement cours:', error)
    courses.value = coursesStore.filteredCourses
  } finally {
    loading.value = false
  }
}

const startExam = async (course) => {
  // Mapper les niveaux
  const levelMap = {
    'debutant': 'easy',
    'intermediaire': 'intermediate',
    'avance': 'advanced'
  }
  
  const apiLevel = levelMap[coursesStore.selectedLevel] || coursesStore.selectedLevel
  
  try {
    await examStore.loadQuestions(coursesStore.selectedDomain, apiLevel)
    router.push({
      path: '/exam',
      query: {
        domainId: coursesStore.selectedDomain,
        level: apiLevel
      }
    })
  } catch (error) {
    alert('Erreur lors du chargement de l\'examen: ' + error.message)
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const goBack = () => {
  if (coursesStore.selectedLevel) {
    coursesStore.selectLevel(null)
  } else if (coursesStore.selectedDomain) {
    coursesStore.selectDomain(null)
  } else {
    router.push('/dashboard')
  }
}

const resetSelection = () => {
  coursesStore.selectDomain(null)
  coursesStore.selectLevel(null)
}

const getLevelDescription = (levelId) => {
  const descriptions = {
    debutant: 'Parfait pour commencer votre parcours',
    intermediaire: 'Pour approfondir vos connaissances',
    avance: 'Pour maîtriser les concepts avancés'
  }
  return descriptions[levelId] || ''
}

const getLevelName = (level) => {
  if (!level) return 'Niveau'
  const levels = {
    easy: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    debutant: 'Débutant',
    intermediaire: 'Intermédiaire',
    avance: 'Avancé'
  }
  return levels[level.toLowerCase()] || level
}

const getDomainInitials = (name) => {
  if (!name) return '??'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 1) {
    // Exemples: Linux -> Li, Python -> Py
    return parts[0].slice(0, 2).toUpperCase()
  }
  // Exemples: Intelligence Artificielle -> IA, IT Academy -> IA
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const getLevelInitials = (levelId) => {
  const map = {
    debutant: 'D',
    intermediaire: 'I',
    avance: 'A'
  }
  return map[levelId] || levelId?.[0]?.toUpperCase() || '?'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const openCourse = (course) => {
  if (!course || !course.id) return
  router.push({
    name: 'course-detail',
    params: { id: course.id }
  })
}

const reloadDomains = async () => {
  loadingDomains.value = true
  try {
    await coursesStore.loadDomains()
  } catch (error) {
    console.error('Erreur rechargement domaines:', error)
  } finally {
    loadingDomains.value = false
  }
}

onMounted(async () => {
  // S'assurer que les domaines sont chargés
  loadingDomains.value = true
  try {
    if (coursesStore.domains.length === 0) {
      await coursesStore.loadDomains()
    }
  } catch (error) {
    console.error('Erreur chargement domaines:', error)
  } finally {
    loadingDomains.value = false
  }
  
  // Si un domaine et un niveau sont déjà sélectionnés, charger les cours
  if (coursesStore.selectedDomain && coursesStore.selectedLevel) {
    await loadCourses(coursesStore.selectedDomain, coursesStore.selectedLevel)
  }
})
</script>

<style scoped>
.courses-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e2ecff 50%, #f9fafb 100%);
}

.courses-header {
  background: linear-gradient(135deg, #ffffff 0%, #f3f4ff 50%, #e0ebff 100%);
  color: #111827;
  padding: 1.75rem 2rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-bottom: 1px solid rgba(148, 163, 184, 0.4);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.7);
  border-radius: 999px;
  color: #1e3a8a;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #1d4ed8;
  color: white;
  border-color: #1d4ed8;
}

.courses-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 50%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-info span {
  font-weight: 500;
  color: #1d4ed8;
}

.btn-logout {
  padding: 0.5rem 1.25rem;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.7);
  border-radius: 999px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.courses-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.selection-section {
  margin-top: 2rem;
}

.selection-section h2 {
  color: #333;
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
  text-align: center;
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
  color: #764ba2;
}

.domains-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.domain-card {
  background: radial-gradient(circle at top left, #ffffff, #f9fafb);
  border-radius: 18px;
  padding: 1.75rem 1.5rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.07);
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid rgba(148, 163, 184, 0.5);
  position: relative;
  overflow: hidden;
}

.domain-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
  border-color: rgba(59, 130, 246, 0.5);
}

.domain-icon {
  font-size: 2.5rem;
  width: 3.25rem;
  height: 3.25rem;
  margin: 0 auto 1rem auto;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.06);
}

.domain-card h3 {
  color: #333;
  font-size: 1.25rem;
  margin: 0;
  font-weight: 600;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.level-card {
  background: radial-gradient(circle at top left, #ffffff, #f9fafb);
  border-radius: 18px;
  padding: 2rem 1.75rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.07);
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid rgba(148, 163, 184, 0.5);
}

.level-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
  border-color: rgba(59, 130, 246, 0.5);
}

.level-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.level-card h3 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.level-card p {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.courses-section {
  margin-top: 2rem;
}

.courses-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.courses-header-section h2 {
  color: #333;
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.courses-count {
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
  transition: all 0.3s;
}

.btn-change:hover {
  background: #667eea;
  color: white;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background: radial-gradient(circle at top left, #ffffff, #f9fafb);
  border-radius: 18px;
  padding: 1.75rem 1.5rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  transition: all 0.3s;
  border: 1px solid rgba(148, 163, 184, 0.45);
  position: relative;
  overflow: hidden;
  border-left: 5px solid var(--course-color, #6366f1);
}

.course-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--course-color, #6366f1) 10%, transparent),
    transparent 40%,
    color-mix(in srgb, var(--course-color, #6366f1) 6%, transparent)
  );
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.course-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
  border-color: color-mix(in srgb, var(--course-color, #6366f1) 60%, #ffffff 40%);
}

.course-card:hover::before {
  opacity: 1;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.course-icon {
  font-size: 1.75rem;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.08);
}

.course-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.course-card h3 {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.course-description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.course-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  color: #666;
  font-size: 0.875rem;
}

.course-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  color: #666;
  font-size: 0.875rem;
}

.course-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-course {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-course:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
}

.btn-exam {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-exam:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
}

.no-courses {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  color: #666;
}

.no-domains {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-domains {
  text-align: center;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.btn-reload {
  padding: 0.875rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s;
}

.btn-reload:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.empty-courses {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.btn-back-selection {
  padding: 0.875rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.loading-courses {
  text-align: center;
  padding: 3rem;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .courses-header h1 {
    font-size: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .courses-content {
    padding: 1rem;
  }
  
  .domains-grid,
  .levels-grid,
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .courses-header-section {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .courses-header {
    padding: 1.25rem 1.25rem;
  }

  .selection-section h2 {
    font-size: 1.3rem;
  }

  .course-card {
    padding: 1.25rem 1.1rem;
  }
}
</style>

