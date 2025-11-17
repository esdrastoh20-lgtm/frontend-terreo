<template>
  <div class="quiz-page">
    <header class="quiz-header">
      <div class="header-content">
        <button @click="goBack" class="btn-back">← Retour</button>
        <h1>Quiz de certification</h1>
        <div class="quiz-info">
          <span v-if="quizStore.selectedDomain">{{ getDomainName() }}</span>
          <span v-if="quizStore.selectedLevel"> - {{ getLevelName() }}</span>
        </div>
      </div>
    </header>

    <main class="quiz-content">
      <!-- Sélection domaine/niveau -->
      <div v-if="!quizStore.selectedDomain" class="selection-section">
        <h2>Choisissez un domaine et un niveau</h2>
        <div class="selection-grid">
          <div class="select-group">
            <label>Domaine</label>
            <select v-model="selectedDomainId" class="select-input">
              <option value="">Sélectionner un domaine</option>
              <option v-for="domain in domains" :key="domain.id" :value="domain.id">
                {{ domain.name }}
              </option>
            </select>
          </div>
          <div class="select-group" v-if="selectedDomainId">
            <label>Niveau</label>
            <select v-model="selectedLevel" class="select-input">
              <option value="">Sélectionner un niveau</option>
              <option value="easy">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>
          <button 
            @click="startQuiz" 
            class="btn-start"
            :disabled="!selectedDomainId || !selectedLevel"
          >
            Commencer le quiz
          </button>
        </div>
      </div>

      <!-- Quiz en cours ou en mode correction -->
      <div v-else-if="quizStore.currentQuestion" class="quiz-container">
        <div class="quiz-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: quizStore.progress + '%' }"></div>
          </div>
          <div class="progress-text">
            Question {{ quizStore.currentQuestionIndex + 1 }} / {{ quizStore.totalQuestions }}
          </div>
        </div>

        <div class="question-card">
          <div class="question-header">
            <h2>{{ quizStore.currentQuestion.question }}</h2>
          </div>

          <div class="answers-list">
            <button
              v-for="(option, key) in getOptions()"
              :key="key"
              :class="['answer-btn', { 
                selected: quizStore.answers[quizStore.currentQuestion.id] === key,
                correct: showResults && key === quizStore.currentQuestion.correct_answer,
                wrong: showResults && quizStore.answers[quizStore.currentQuestion.id] === key && key !== quizStore.currentQuestion.correct_answer
              }]"
              @click="selectAnswer(key)"
              :disabled="showResults"
            >
              <span class="option-label">{{ key.toUpperCase() }}</span>
              <span class="option-text">{{ option }}</span>
            </button>
          </div>

          <div v-if="quizStore.currentQuestion.explanation && showResults" class="explanation">
            <strong>Explication :</strong> {{ quizStore.currentQuestion.explanation }}
          </div>

          <div class="quiz-actions">
            <button 
              @click="quizStore.previousQuestion()" 
              class="btn-nav"
              :disabled="!quizStore.hasPrevious"
            >
              ← Précédent
            </button>
            <button 
              v-if="quizStore.hasNext"
              @click="quizStore.nextQuestion()" 
              class="btn-nav btn-primary"
            >
              Suivant →
            </button>
            <button 
              v-else
              @click="finishQuiz" 
              class="btn-nav btn-primary"
            >
              Terminer le quiz
            </button>
          </div>
        </div>
      </div>

      <!-- Résultats (affichés en même temps que les corrections via showResults) -->
      <div v-else-if="quizStore.isCompleted" class="results-container">
        <div class="results-card">
          <div class="result-icon" :class="{ passed: quizStore.score >= 70, failed: quizStore.score < 70 }">
            {{ quizStore.score >= 70 ? '✅' : '❌' }}
          </div>
          <h2>{{ quizStore.score >= 70 ? 'Félicitations !' : 'Dommage...' }}</h2>
          <div class="result-score">
            <span class="score-value">{{ quizStore.score }}%</span>
            <span class="score-label">Score final</span>
          </div>
          <div class="result-details">
            <div class="detail-item">
              <span class="detail-label">Niveau :</span>
              <span class="detail-value">{{ getLevelName() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Temps passé :</span>
              <span class="detail-value">{{ formatTime(quizStore.timeSpent) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Statut :</span>
              <span class="detail-value" :class="{ passed: quizStore.score >= 70, failed: quizStore.score < 70 }">
                {{ quizStore.score >= 70 ? 'Réussi' : 'Échoué' }}
              </span>
            </div>
          </div>
          <div class="result-actions">
            <button @click="restartQuiz" class="btn-action">Recommencer</button>
            <button @click="goBack" class="btn-action btn-secondary">Retour au dashboard</button>
          </div>
        </div>
      </div>

      <!-- Chargement -->
      <div v-else class="loading-container">
        <p>Chargement des questions...</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useQuizStore } from '@/stores/quiz'
import { useCoursesStore } from '@/stores/courses'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const quizStore = useQuizStore()
const coursesStore = useCoursesStore()

const domains = ref([])
const selectedDomainId = ref(null)
const selectedLevel = ref(null)
const showResults = ref(false)

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await loadDomains()
})

async function loadDomains() {
  try {
    domains.value = await api.getDomains()
  } catch (error) {
    console.error('Erreur chargement domaines:', error)
  }
}

async function startQuiz() {
  if (!selectedDomainId.value || !selectedLevel.value) return
  
  try {
    await quizStore.loadQuestions(selectedDomainId.value, selectedLevel.value)
    if (quizStore.questions.length === 0) {
      alert('Aucune question disponible pour cette sélection.')
    }
  } catch (error) {
    alert('Erreur lors du chargement des questions: ' + error.message)
  }
}

function selectAnswer(answer) {
  if (quizStore.currentQuestion) {
    quizStore.selectAnswer(quizStore.currentQuestion.id, answer)
  }
}

function getOptions() {
  if (!quizStore.currentQuestion) return {}
  return {
    a: quizStore.currentQuestion.option_a,
    b: quizStore.currentQuestion.option_b,
    c: quizStore.currentQuestion.option_c,
    d: quizStore.currentQuestion.option_d
  }
}

async function finishQuiz() {
  showResults.value = true
  // Attendre un peu pour voir les résultats
  setTimeout(async () => {
    try {
      await quizStore.submitQuiz(authStore.user.id)
    } catch (error) {
      alert('Erreur lors de la soumission: ' + error.message)
    }
  }, 2000)
}

function restartQuiz() {
  quizStore.resetQuiz()
  selectedDomainId.value = null
  selectedLevel.value = null
  showResults.value = false
}

function goBack() {
  router.push('/dashboard')
}

function getDomainName() {
  const domain = domains.value.find(d => d.id == quizStore.selectedDomain)
  return domain?.name || ''
}

function getLevelName() {
  const levels = {
    easy: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé'
  }
  return levels[quizStore.selectedLevel] || quizStore.selectedLevel
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}
</script>

<style scoped>
.quiz-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.quiz-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
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
}

.quiz-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.quiz-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.selection-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #e0e0e0;
}

.selection-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.select-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.select-group label {
  font-weight: 500;
  color: #333;
}

.select-input {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
}

.btn-start {
  padding: 0.875rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start:hover:not(:disabled) {
  background: #5568d3;
}

.btn-start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quiz-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #e0e0e0;
}

.quiz-progress {
  margin-bottom: 2rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-header h2 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin: 0;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.answer-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.answer-btn:hover:not(:disabled) {
  border-color: #667eea;
  background: #f8f9ff;
}

.answer-btn.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.answer-btn.correct {
  border-color: #10b981;
  background: #d1fae5;
}

.answer-btn.wrong {
  border-color: #ef4444;
  background: #fee2e2;
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

.explanation {
  padding: 1rem;
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  border-radius: 4px;
  color: #333;
}

.quiz-actions {
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

.btn-nav:hover:not(:disabled) {
  background: #5568d3;
  color: white;
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: 600;
  color: #333;
}

.detail-value.passed {
  color: #10b981;
}

.detail-value.failed {
  color: #ef4444;
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

.loading-container {
  text-align: center;
  padding: 3rem;
  color: #666;
}
</style>

