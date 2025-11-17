<template>
  <div class="exam-page">
    <header class="exam-header">
      <div class="header-content">
        <div class="exam-info">
          <h1>Examen de certification</h1>
          <div class="exam-meta">
            <span>{{ getDomainName() }}</span>
            <span> - </span>
            <span>{{ getLevelName() }}</span>
          </div>
        </div>
        <div class="timer-section" :class="{ warning: examStore.timeRemaining < 300, danger: examStore.timeRemaining < 60 }">
          <div class="timer-label">Temps restant</div>
          <div class="timer-value">{{ examStore.timeFormatted }}</div>
        </div>
      </div>
    </header>

    <main class="exam-content">
      <!-- Écran de démarrage -->
      <div v-if="!examStore.isStarted && !examStore.isCompleted" class="start-screen">
        <div class="start-card">
          <h2>Examen de certification</h2>
          <div class="exam-details">
            <div class="detail-item">
              <span class="detail-label">Domaine :</span>
              <span class="detail-value">{{ getDomainName() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Niveau :</span>
              <span class="detail-value">{{ getLevelName() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Nombre de questions :</span>
              <span class="detail-value">{{ examStore.totalQuestions }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Durée :</span>
              <span class="detail-value">{{ getTimeLimit() }}</span>
            </div>
          </div>
          <div class="instructions">
            <h3>Instructions :</h3>
            <ul>
              <li>L'examen contient {{ examStore.totalQuestions }} questions à choix multiples</li>
              <li>Vous avez {{ getTimeLimit() }} pour compléter l'examen</li>
              <li>Une fois commencé, le chronomètre ne peut pas être arrêté</li>
              <li>Vous devez obtenir au moins 70% pour réussir</li>
              <li>Vous pouvez naviguer entre les questions avant de soumettre</li>
            </ul>
          </div>
          <button @click="startExam" class="btn-start">Commencer l'examen</button>
        </div>
      </div>

      <!-- Examen en cours -->
      <div v-else-if="examStore.isStarted && !examStore.isCompleted" class="exam-container">
        <div class="exam-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: examStore.progress + '%' }"></div>
          </div>
          <div class="progress-text">
            Question {{ examStore.currentQuestionIndex + 1 }} / {{ examStore.totalQuestions }}
          </div>
        </div>

        <div class="question-card">
          <div class="question-header">
            <h2>{{ examStore.currentQuestion?.question }}</h2>
          </div>

          <div class="answers-list">
            <button
              v-for="(option, key) in getOptions()"
              :key="key"
              :class="['answer-btn', { 
                selected: examStore.answers[examStore.currentQuestion.id] === key
              }]"
              @click="selectAnswer(key)"
            >
              <span class="option-label">{{ key.toUpperCase() }}</span>
              <span class="option-text">{{ option }}</span>
            </button>
          </div>

          <div class="exam-actions">
            <button 
              @click="examStore.previousQuestion()" 
              class="btn-nav"
              :disabled="!examStore.currentQuestionIndex"
            >
              ← Précédent
            </button>
            <button 
              v-if="examStore.currentQuestionIndex < examStore.questions.length - 1"
              @click="examStore.nextQuestion()" 
              class="btn-nav btn-primary"
              :disabled="!examStore.answers[examStore.currentQuestion?.id]"
            >
              Valider →
            </button>
            <button 
              v-else
              @click="finishExam" 
              class="btn-nav btn-submit"
              :disabled="!examStore.answers[examStore.currentQuestion?.id]"
            >
              Valider et terminer
            </button>
          </div>
        </div>

        <!-- Mini-map des questions -->
        <div class="questions-map">
          <h3>Navigation rapide</h3>
          <div class="questions-grid">
            <button
              v-for="(q, index) in examStore.questions"
              :key="q.id"
              :class="['question-btn', {
                current: index === examStore.currentQuestionIndex,
                answered: examStore.answers[q.id],
                visited: index <= examStore.currentQuestionIndex
              }]"
              @click="examStore.goToQuestion(index)"
            >
              {{ index + 1 }}
            </button>
          </div>
        </div>
      </div>

      <!-- Résultats + Attestation premium -->
      <div v-else-if="examStore.isCompleted" class="results-container">
        <!-- Carte de résultat simple -->
        <div class="results-card premium-results">
          <div v-if="showCertificationNotification" class="certification-notice">
            <div class="notice-text">
              Félicitations ! Vous avez obtenu une attestation.
            </div>
            <button class="btn-action btn-primary-gold" @click="goToCertifications">
              Voir mon attestation
            </button>
          </div>
          <div class="result-icon" :class="{ passed: resultData.passed, failed: !resultData.passed }">
            {{ resultData.passed ? '🏆' : '📘' }}
          </div>
          <h2>{{ resultData.passed ? 'Félicitations !' : 'Examen complété' }}</h2>
          <p class="results-subtitle">
            Vous avez obtenu
            <strong>{{ resultData.score }}%</strong>
            au test de certification en {{ getDomainName() }} ({{ getLevelName() }}).
          </p>

          <div class="result-score">
            <span class="score-value">{{ resultData.score }}%</span>
            <span class="score-label">Score final</span>
          </div>

          <div class="result-details compact">
            <div class="detail-item">
              <span class="detail-label">Questions répondues</span>
              <span class="detail-value">{{ resultData.answered }} / {{ resultData.totalQuestions }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Temps utilisé</span>
              <span class="detail-value">{{ formatTime(resultData.timeSpent) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Statut</span>
              <span class="detail-value" :class="{ passed: resultData.passed, failed: !resultData.passed }">
                {{ resultData.passed ? 'Réussi' : 'Échoué' }}
              </span>
            </div>
          </div>

          <div class="result-actions">
            <button @click="showCertificate = true" class="btn-action btn-primary-gold">
              Voir l'attestation
            </button>
            <button @click="goBack" class="btn-action btn-secondary">
              Retour au dashboard
            </button>
          </div>
        </div>

        <!-- Attestation premium (visible après clic) -->
        <div v-if="showCertificate" class="certificate-wrapper">
          <div class="certificate-bg"></div>
          <div class="certificate-glow"></div>

          <div class="certificate-card" ref="certificateRef">
            <div class="certificate-header">
              <div class="brand-badge">
                <img :src="terreoLogo" alt="plateforme Terreo" class="brand-logo" />
                <span class="brand-text">plateforme Terreo</span>
              </div>

              <div class="congrats-badge" :class="{ failed: !resultData.passed }">
                <div class="badge-ring">
                  <div class="badge-inner">
                    <span class="badge-icon">🏅</span>
                  </div>
                </div>
                <div class="badge-text">
                  <span class="badge-title">{{ resultData.passed ? 'Certification obtenue' : 'Examen complété' }}</span>
                  <span class="badge-subtitle">{{ resultData.score }}% de réussite</span>
                </div>
              </div>
            </div>

            <div class="certificate-body">
              <h1 class="certificate-title">Attestation de {{ resultData.passed ? 'Réussite' : 'Participation' }}</h1>
              <p class="certificate-intro">
                Cette attestation est décernée à
              </p>

              <div class="learner-name">
                {{ candidateName }}
              </div>

              <p class="certificate-text">
                pour avoir {{ resultData.passed ? 'réussi' : 'complété' }} avec
                un score de <strong>{{ resultData.score }}%</strong>
                l'examen de certification suivant :
              </p>

              <div class="exam-summary">
                <div class="summary-item">
                  <span class="summary-label">Domaine</span>
                  <span class="summary-value">{{ getDomainName() }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Niveau</span>
                  <span class="summary-value">{{ getLevelName() }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Score</span>
                  <span class="summary-value score">{{ resultData.score }}%</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Temps utilisé</span>
                  <span class="summary-value">{{ formatTime(resultData.timeSpent) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Questions répondues</span>
                  <span class="summary-value">{{ resultData.answered }} / {{ resultData.totalQuestions }}</span>
                </div>
              </div>

              <div v-if="resultData.timeUp" class="time-up-warning premium">
                ⚠️ L'examen a été terminé car le temps était écoulé.
              </div>

              <div class="certificate-footer">
                <div class="signatures">
                  <div class="sig-block">
                    <div class="sig-line"></div>
                    <div class="sig-name">Esdras TOH</div>
                    <div class="sig-role">Directeur Général</div>
                  </div>
                  <div class="sig-block">
                    <div class="sig-line"></div>
                    <div class="sig-name">IT Learning Academy</div>
                    <div class="sig-role">Certification Officielle</div>
                  </div>
                </div>

                <div class="certificate-meta">
                  <span>Référence : CERT-{{ new Date().getFullYear() }}-{{ resultData?.id || 'EXAM' }}</span>
                  <span>Date : {{ today }}</span>
                </div>
              </div>
            </div>

            <div class="certificate-actions">
              <button @click="downloadCertificate" class="btn-action btn-gold">
                Télécharger l'attestation en PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useExamStore } from '@/stores/exam'
import { useCoursesStore } from '@/stores/courses'
import api from '@/services/api'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import terreoLogo from '@/assets/logo.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const examStore = useExamStore()
const coursesStore = useCoursesStore()

const domains = ref([])
const resultData = ref(null)
const showCertificate = ref(false)
const certificateRef = ref(null)
const showCertificationNotification = ref(false)
const terreoLogoRef = terreoLogo

const candidateName = computed(() => {
  return (
    authStore.user?.full_name ||
    authStore.user?.name ||
    authStore.user?.username ||
    authStore.user?.email ||
    'Candidat'
  )
})

const today = computed(() => {
  return new Date().toLocaleDateString('fr-FR')
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  await loadDomains()
  
  const domainId = route.query.domainId || examStore.selectedDomain
  const level = route.query.level || examStore.selectedLevel

  if (domainId && level) {
    await loadExam(domainId, level)
  } else {
    router.push('/courses')
  }
})

onUnmounted(() => {
  if (examStore.timerInterval) {
    clearInterval(examStore.timerInterval)
  }
})

async function loadDomains() {
  try {
    domains.value = await api.getDomains()
  } catch (error) {
    console.error('Erreur chargement domaines:', error)
  }
}

async function downloadCertificate() {
  if (!certificateRef.value) return

  const element = certificateRef.value
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('landscape', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = pdfWidth
  const imgHeight = (canvas.height * pdfWidth) / canvas.width
  const y = (pdfHeight - imgHeight) / 2

  pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight)
  pdf.save(`attestation-${today.value}.pdf`)
}

async function loadExam(domainId, level) {
  try {
    await examStore.loadQuestions(domainId, level)
  } catch (error) {
    alert('Erreur lors du chargement des questions: ' + error.message)
    router.push('/courses')
  }
}

function startExam() {
  examStore.startExam()
}

function selectAnswer(answer) {
  if (examStore.currentQuestion) {
    examStore.selectAnswer(examStore.currentQuestion.id, answer)
  }
}

function getOptions() {
  if (!examStore.currentQuestion) return {}
  return {
    a: examStore.currentQuestion.option_a,
    b: examStore.currentQuestion.option_b,
    c: examStore.currentQuestion.option_c,
    d: examStore.currentQuestion.option_d
  }
}

async function finishExam() {
  if (confirm('Êtes-vous sûr de vouloir terminer l\'examen ?')) {
    try {
      resultData.value = await examStore.submitExam(authStore.user.id)
      // Enregistrer aussi le résultat dans le cadre d'un duel si un duelId est présent
      const duelId = route.query.duelId
      if (duelId) {
        try {
          await api.saveDuelResult(
            duelId,
            authStore.user.id,
            resultData.value.score,
            resultData.value.timeSpent || 0,
            'completed'
          )
        } catch (duelError) {
          console.error('Erreur enregistrement résultat duel:', duelError)
        }
      }

      if (resultData.value.passed && resultData.value.score >= 70) {
        showCertificationNotification.value = true
      }
    } catch (error) {
      alert('Erreur lors de la soumission: ' + error.message)
    }
  }
}

function restartExam() {
  examStore.resetExam()
  router.push('/courses')
}

function goBack() {
  examStore.resetExam()
  router.push('/dashboard')
}

function goToCertifications() {
  router.push('/certifications')
}

function getDomainName() {
  // Préférer le domain_id des questions si disponible
  const questionDomainId = examStore.questions?.[0]?.domain_id
  const domainId = questionDomainId || examStore.selectedDomain

  // Table de correspondance fixe pour éviter les incohérences DB
  const manualDomainNames = {
    1: 'Linux',
    2: 'Cisco',
    3: 'Python',
    4: 'Huawei',
    5: 'Intelligence Artificielle'
  }

  if (manualDomainNames[domainId]) {
    return manualDomainNames[domainId]
  }

  const domain = domains.value.find(d => d.id == domainId)
  return domain?.name || ''
}

function getLevelName() {
  const levels = {
    easy: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    debutant: 'Débutant',
    intermediaire: 'Intermédiaire',
    avance: 'Avancé'
  }

  // Préférer le niveau des questions si présent
  const questionLevel = examStore.questions?.[0]?.level
  const rawLevel = (questionLevel || examStore.selectedLevel || '').toLowerCase()

  return levels[rawLevel] || rawLevel || 'Niveau'
}

function getTimeLimit() {
  const level = examStore.selectedLevel
  if (level === 'debutant' || level === 'easy') return '20 minutes'
  if (level === 'intermediaire' || level === 'intermediate') return '25 minutes'
  if (level === 'avance' || level === 'advanced') return '30 minutes'
  return '20 minutes'
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}
</script>

<style scoped>
.exam-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.exam-header {
  background: white;
  border-bottom: 2px solid #e0e0e0;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.exam-info h1 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  color: #1d4ed8;
}

.exam-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.exam-meta span:nth-child(1) {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: rgba(102, 126, 234, 0.1);
  color: #1d4ed8;
  font-weight: 600;
}

.exam-meta span:nth-child(2) {
  color: #9ca3af;
}

.exam-meta span:nth-child(3) {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.08);
  color: #047857;
  font-weight: 600;
}

.timer-section {
  text-align: center;
  padding: 1rem 2rem;
  background: #f0f4ff;
  border-radius: 8px;
  border: 2px solid #667eea;
}

.timer-section.warning {
  background: #fef3c7;
  border-color: #f59e0b;
}

.timer-section.danger {
  background: #fee2e2;
  border-color: #ef4444;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.timer-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.timer-value {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  font-family: 'Courier New', monospace;
}

.timer-section.warning .timer-value {
  color: #f59e0b;
}

.timer-section.danger .timer-value {
  color: #ef4444;
}

.exam-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.start-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.start-card {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.start-card h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.exam-details {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #111827;
}

.detail-value {
  font-weight: 600;
  color: #111827;
}

.instructions {
  margin-bottom: 2rem;
}

.instructions h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.instructions ul {
  list-style: none;
  padding: 0;
}

.instructions li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.instructions li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.btn-start {
  width: 100%;
  padding: 1rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.exam-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.exam-progress {
  grid-column: 1 / -1;
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #667eea;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
}

.question-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #e0e0e0;
}

.question-header h2 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.answer-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.answer-btn:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.answer-btn.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.option-label {
  font-weight: 600;
  color: #667eea;
  min-width: 30px;
}

.option-text {
  flex: 1;
  color: #333;
}

.exam-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.btn-nav {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-nav.btn-primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-nav.btn-submit {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btn-nav:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.questions-map {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  height: fit-content;
}

.questions-map h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #333;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.5rem;
}

.question-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.question-btn:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.question-btn.current {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.question-btn.answered {
  background: #d1fae5;
  border-color: #10b981;
}

.question-btn.visited {
  border-color: #93c5fd;
}

.results-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.results-card {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  border: 1px solid #e0e0e0;
  max-width: 500px;
  width: 100%;
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.result-icon.passed {
  color: #10b981;
}

.result-icon.failed {
  color: #ef4444;
}

.results-card h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #16a34a;
}

.result-score {
  margin: 2rem 0;
}

.results-subtitle {
  color: #111827;
  font-size: 0.95rem;
}

.score-value {
  display: block;
  font-size: 4rem;
  font-weight: 700;
  color: #667eea;
}

.score-label {
  display: block;
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.time-up-warning {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  margin-top: 1rem;
}

.result-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-action {
  flex: 1;
  padding: 0.875rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-action:hover {
  background: #5568d3;
}

.btn-action.btn-secondary:hover {
  background: #f0f4ff;
}

/* --- Styles attestation (certificat) --- */

.certificate-wrapper {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.certificate-card {
  position: relative;
  width: 100%;
  max-width: 720px;
  aspect-ratio: 3 / 2;
  background: #fcfbf7;
  border-radius: 12px;
  padding: 1.75rem 2rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
  border: 2px solid #e5e7eb;
  box-sizing: border-box;
}

.certificate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.brand-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  height: 34px;
  width: auto;
  object-fit: contain;
}

.brand-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fef3c7, #fbbf24);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #7c2d12;
}

.brand-text {
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #4b5563;
}

.congrats-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  color: #1f2933;
}

.congrats-badge.failed {
  background: linear-gradient(90deg, #f97373, #f43f5e);
  color: #111827;
}

.badge-ring {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-inner {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fefce8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-title {
  font-size: 0.8rem;
  font-weight: 700;
}

.badge-subtitle {
  font-size: 0.7rem;
}

.certificate-body {
  text-align: center;
  margin-top: 0.25rem;
}

.certificate-title {
  font-size: 1.3rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  color: #111827;
}

.certificate-intro {
  font-size: 0.8rem;
  color: #6b7280;
}

.learner-name {
  margin: 0.5rem auto 0.5rem auto;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.certificate-text {
  font-size: 0.8rem;
  color: #4b5563;
  max-width: 600px;
  margin: 0 auto 1rem auto;
}

.exam-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem 1rem;
  margin-bottom: 1rem;
}

.summary-item {
  text-align: left;
}

.summary-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

.summary-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
}

.summary-value.score {
  color: #b45309;
}

.certificate-footer {
  margin-top: 1rem;
}

.signatures {
  display: flex;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

.sig-block {
  flex: 1;
  text-align: center;
}

.sig-line {
  border-bottom: 1px solid #d1d5db;
  margin-bottom: 0.5rem;
}

.sig-name {
  font-weight: 600;
  color: #111827;
}

.sig-role {
  font-size: 0.75rem;
  color: #6b7280;
}

.certificate-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
}

.certificate-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-gold {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  color: #111827;
}

.btn-gold:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

@media (max-width: 1024px) {
  .exam-container {
    grid-template-columns: 1fr;
  }
  
  .questions-map {
    order: -1;
  }
}
</style>

