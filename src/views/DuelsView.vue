<template>
  <div class="duels-page">
    <header class="duels-header">
      <div class="header-content">
        <button @click="router.push('/dashboard')" class="btn-back">← Retour</button>
        <h1>Duels</h1>
      </div>
    </header>

    <main class="duels-content">
      <!-- Créer un duel -->
      <div class="create-duel-section">
        <h2>Créer un nouveau duel</h2>
        <div class="duel-form">
          <div class="form-group">
            <label>Domaine</label>
            <select v-model="newDuel.domainId" class="select-input">
              <option value="">Sélectionner un domaine</option>
              <option v-for="domain in domains" :key="domain.id" :value="domain.id">
                {{ domain.name }}
              </option>
            </select>
          </div>
          <div class="form-group" v-if="newDuel.domainId">
            <label>Niveau</label>
            <select v-model="newDuel.level" class="select-input">
              <option value="">Sélectionner un niveau</option>
              <option value="easy">Débutant (20 min)</option>
              <option value="intermediate">Intermédiaire (25 min)</option>
              <option value="advanced">Avancé (30 min)</option>
            </select>
          </div>
          <button 
            @click="createDuel" 
            class="btn-create"
            :disabled="!newDuel.domainId || !newDuel.level"
          >
            Créer un duel
          </button>
        </div>
      </div>

      <!-- Code de duel généré -->
      <div v-if="duelsStore.duelCode" class="duel-code-section">
        <div class="code-card">
          <h3>Salle d'attente du duel</h3>
          <div class="code-display">
            <span class="code-value">{{ duelsStore.duelCode }}</span>
            <button @click="copyCode" class="btn-copy">📋 Copier</button>
          </div>
          <p class="code-instructions">
            Partagez ce code avec votre adversaire pour qu'il puisse rejoindre le duel.
            Lorsque vous voyez qu'il a rejoint (via vos échanges), vous pouvez lancer le duel.
          </p>
          <button @click="startDuelExam" class="btn-start-duel">Lancer le duel</button>
        </div>
      </div>

      <!-- Rejoindre un duel -->
      <div class="join-duel-section">
        <h2>Rejoindre un duel</h2>
        <div class="join-form">
          <div class="form-group">
            <label>Code du duel</label>
            <input 
              v-model="joinCode" 
              type="text" 
              placeholder="Entrez le code du duel"
              class="code-input"
              maxlength="6"
              style="text-transform: uppercase;"
            />
          </div>
          <button 
            @click="joinDuel" 
            class="btn-join"
            :disabled="!joinCode || joinCode.length !== 6"
          >
            Rejoindre le duel
          </button>
        </div>
      </div>

      <!-- Mes duels -->
      <div class="my-duels-section">
        <h2>Mes duels</h2>
        <div v-if="loading" class="loading">Chargement...</div>
        <div v-else-if="duels.length === 0" class="empty-state">
          <p>Aucun duel disponible</p>
        </div>
        <div v-else class="duels-list">
          <div v-for="duel in duels" :key="duel.id" class="duel-card">
            <div class="duel-header">
              <h3>Duel #{{ duel.id }}</h3>
              <span class="duel-status" :class="getStatusClass(duel.status)">
                {{ getStatusText(duel.status) }}
              </span>
            </div>
            <div class="duel-info">
              <p><strong>Initié par :</strong> Utilisateur #{{ duel.initiator_id }}</p>
              <p><strong>Créé le :</strong> {{ formatDate(duel.created_at) }}</p>
              <p v-if="duel.code"><strong>Code :</strong> {{ duel.code }}</p>
            </div>
            <div class="duel-actions">
              <button @click="viewDuel(duel.id)" class="btn-view">Voir détails</button>
              <button v-if="duel.status === 'waiting'" @click="startDuelExamById(duel.id)" class="btn-start">
                Commencer
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDuelsStore } from '@/stores/duels'
import { useExamStore } from '@/stores/exam'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const duelsStore = useDuelsStore()
const examStore = useExamStore()

const domains = ref([])
const duels = ref([])
const loading = ref(false)
const joinCode = ref('')
const newDuel = ref({
  domainId: '',
  level: ''
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await loadDomains()
  await loadDuels()
})

async function loadDomains() {
  try {
    domains.value = await api.getDomains()
  } catch (error) {
    console.error('Erreur chargement domaines:', error)
  }
}

async function loadDuels() {
  loading.value = true
  try {
    duels.value = await duelsStore.getDuels()
  } catch (error) {
    console.error('Erreur chargement duels:', error)
  } finally {
    loading.value = false
  }
}

async function createDuel() {
  try {
    await duelsStore.createDuel(newDuel.value.domainId, newDuel.value.level)
    await loadDuels()
    alert(`Duel créé ! Code: ${duelsStore.duelCode}`)
  } catch (error) {
    alert('Erreur création duel: ' + error.message)
  }
}

async function joinDuel() {
  try {
    await duelsStore.joinDuelByCode(joinCode.value.toUpperCase())
    alert('Duel rejoint avec succès !')
    await loadDuels()
    // Rediriger vers l'examen du duel
    if (duelsStore.activeDuel) {
      await startDuelExam()
    }
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

async function startDuelExam() {
  if (!duelsStore.activeDuel) return
  
  try {
    await examStore.loadQuestions(
      duelsStore.activeDuel.domain_id,
      duelsStore.activeDuel.level
    )
    router.push({
      path: '/exam',
      query: {
        domainId: duelsStore.activeDuel.domain_id,
        level: duelsStore.activeDuel.level,
        duelId: duelsStore.activeDuel.id
      }
    })
  } catch (error) {
    alert('Erreur démarrage duel: ' + error.message)
  }
}

async function startDuelExamById(duelId) {
  const duel = duels.value.find(d => d.id === duelId)
  if (!duel) return
  
  duelsStore.activeDuel = duel
  await startDuelExam()
}

function viewDuel(duelId) {
  // TODO: Implémenter la vue détaillée
  alert('Fonctionnalité à venir')
}

function copyCode() {
  navigator.clipboard.writeText(duelsStore.duelCode)
  alert('Code copié dans le presse-papier !')
}

function getStatusClass(status) {
  return status || 'pending'
}

function getStatusText(status) {
  const statuses = {
    pending: 'En attente',
    active: 'En cours',
    completed: 'Terminé'
  }
  return statuses[status] || 'En attente'
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR')
}
</script>

<style scoped>
.duels-page {
  min-height: 100vh;
  background:
    linear-gradient(to bottom, rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.86)),
    url('@/assets/ze.jpg') center/cover no-repeat fixed;
  color: #e5e7eb;
}

.duels-header {
  background: linear-gradient(120deg, #020617 0%, #111827 40%, #0f172a 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.4);
  padding: 1rem 2rem;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.8);
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
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.6);
  border-radius: 999px;
  color: #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(148, 163, 184, 0.15);
  transform: translateX(-2px);
}

.duels-header h1 {
  flex: 1;
  font-size: 1.5rem;
  margin: 0;
}

.duels-content {
  max-width: 840px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  align-items: center;
}

.create-duel-section,
.join-duel-section,
.my-duels-section {
  background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.9));
  border-radius: 18px;
  padding: 1.75rem 1.9rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
  width: 100%;
  max-width: 780px;
}

.create-duel-section h2,
.join-duel-section h2,
.my-duels-section h2 {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  color: #e5e7eb;
}

.duel-form,
.join-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #e5e7eb;
}

.select-input,
.code-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(148, 163, 184, 0.6);
  border-radius: 999px;
  font-size: 1rem;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
}

.btn-create,
.btn-join {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(120deg, #22c55e, #16a34a);
  color: white;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  transition: all 0.2s;
  box-shadow: 0 10px 25px rgba(34, 197, 94, 0.45);
}

.btn-create:disabled,
.btn-join:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-create:hover:not(:disabled),
.btn-join:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 14px 30px rgba(34, 197, 94, 0.65);
}

.duel-code-section {
  background: radial-gradient(circle at top, #22c55e, #0f172a 60%);
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2rem;
  color: white;
}

.code-card {
  text-align: center;
}

.code-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.code-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.code-value {
  font-size: 3rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  border-radius: 8px;
}

.btn-copy {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.code-instructions {
  margin: 1.5rem 0;
  opacity: 0.9;
}

.btn-start-duel {
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start-duel:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.duels-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.duel-card {
  background: radial-gradient(circle at top, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.95));
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  border: 1px solid rgba(148, 163, 184, 0.5);
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.75);
  position: relative;
  overflow: hidden;
}

.duel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.duel-status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.duel-status.waiting {
  background: rgba(234, 179, 8, 0.15);
  color: #facc15;
}

.duel-status.in_progress {
  background: rgba(59, 130, 246, 0.16);
  color: #60a5fa;
}

.duel-status.completed {
  background: rgba(22, 163, 74, 0.18);
  color: #4ade80;
}

.duel-info {
  margin-bottom: 1rem;
  color: #666;
}

.duel-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-view,
.btn-start {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-view {
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  border: 1px solid rgba(148, 163, 184, 0.6);
}

.btn-start {
  background: linear-gradient(120deg, #f97316, #ea580c);
  color: white;
}

.btn-view:hover {
  background: rgba(15, 23, 42, 0.85);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
