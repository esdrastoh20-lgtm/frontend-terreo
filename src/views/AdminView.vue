<template>
  <div class="admin-page">
    <header class="admin-header">
      <div class="header-content">
        <button @click="router.push('/dashboard')" class="btn-back">← Retour</button>
        <h1>Panneau Administrateur</h1>
      </div>
    </header>

    <main class="admin-content">
      <div v-if="!authStore.isAdmin" class="unauthorized">
        <p>Accès refusé. Vous devez être administrateur.</p>
      </div>

      <div v-else class="admin-panel">
        <nav class="admin-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['nav-tab', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>

        <!-- Gestion des domaines -->
        <div v-if="activeTab === 'domains'" class="admin-section">
          <div class="section-header">
            <h2>Gestion des domaines</h2>
            <button @click="showDomainForm = true" class="btn-add">+ Ajouter un domaine</button>
          </div>
          
          <div v-if="showDomainForm" class="form-card">
            <h3>Nouveau domaine</h3>
            <div class="form-group">
              <label>Nom</label>
              <input v-model="newDomain.name" type="text" placeholder="Python" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="newDomain.description" placeholder="Description du domaine"></textarea>
            </div>
            <div class="form-actions">
              <button @click="createDomain" class="btn-save">Enregistrer</button>
              <button @click="cancelDomainForm" class="btn-cancel">Annuler</button>
            </div>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="domain in domains"
                  :key="domain.id"
                  class="domain-row"
                  @click="selectDomainForQuestions(domain)"
                >
                  <td>{{ domain.id }}</td>
                  <td>{{ domain.name }}</td>
                  <td>{{ domain.description || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Gestion des questions -->
        <div v-if="activeTab === 'questions'" class="admin-section">
          <div class="section-header">
            <h2>Gestion des questions</h2>
            <button @click="showQuestionForm = true" class="btn-add">+ Ajouter une question</button>
          </div>

          <div v-if="showQuestionForm" class="form-card">
            <h3>Nouvelle question</h3>
            <div class="form-group">
              <label>Domaine</label>
              <select v-model="newQuestion.domain_id">
                <option value="">Sélectionner</option>
                <option v-for="domain in domains" :key="domain.id" :value="domain.id">
                  {{ domain.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Niveau</label>
              <select v-model="newQuestion.level">
                <option value="easy">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>
            <div class="form-group">
              <label>Question</label>
              <textarea v-model="newQuestion.question" placeholder="Texte de la question"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Option A</label>
                <input v-model="newQuestion.option_a" type="text" />
              </div>
              <div class="form-group">
                <label>Option B</label>
                <input v-model="newQuestion.option_b" type="text" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Option C</label>
                <input v-model="newQuestion.option_c" type="text" />
              </div>
              <div class="form-group">
                <label>Option D</label>
                <input v-model="newQuestion.option_d" type="text" />
              </div>
            </div>
            <div class="form-group">
              <label>Réponse correcte</label>
              <select v-model="newQuestion.correct_answer">
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="d">D</option>
              </select>
            </div>
            <div class="form-group">
              <label>Explication</label>
              <textarea v-model="newQuestion.explanation" placeholder="Explication de la réponse"></textarea>
            </div>
            <div class="form-actions">
              <button @click="createQuestion" class="btn-save">Enregistrer</button>
              <button @click="cancelQuestionForm" class="btn-cancel">Annuler</button>
            </div>
          </div>
        </div>

        <!-- Gestion des utilisateurs -->
        <div v-if="activeTab === 'users'" class="admin-section">
          <h2>Gestion des utilisateurs</h2>
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>{{ user.first_name }} {{ user.last_name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="role-badge" :class="user.role">{{ user.role }}</span>
                  </td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <button
                      v-if="user.role !== 'admin'"
                      class="btn-edit btn-delete-user"
                      @click="deleteUser(user)"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
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
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('domains')
const tabs = [
  { id: 'domains', label: 'Domaines' },
  { id: 'questions', label: 'Questions' },
  { id: 'users', label: 'Utilisateurs' }
]

const domains = ref([])
const users = ref([])
const showDomainForm = ref(false)
const showQuestionForm = ref(false)

const newDomain = ref({
  name: '',
  description: ''
})

const newQuestion = ref({
  domain_id: '',
  level: 'easy',
  question: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'a',
  explanation: ''
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  if (!authStore.isAdmin) {
    return
  }
  await loadData()
})

async function loadData() {
  try {
    domains.value = await api.getDomains()
    users.value = await api.getUsers()
  } catch (error) {
    console.error('Erreur chargement données:', error)
  }
}

async function createDomain() {
  try {
    await api.createDomain(newDomain.value.name, newDomain.value.description)
    await loadData()
    cancelDomainForm()
    alert('Domaine créé avec succès')
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

function cancelDomainForm() {
  showDomainForm.value = false
  newDomain.value = { name: '', description: '' }
}

async function createQuestion() {
  try {
    await api.createQuestion(newQuestion.value)
    cancelQuestionForm()
    alert('Question créée avec succès')
  } catch (error) {
    alert('Erreur: ' + error.message)
  }
}

function cancelQuestionForm() {
  showQuestionForm.value = false
  newQuestion.value = {
    domain_id: '',
    level: 'easy',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a',
    explanation: ''
  }
}

function selectDomainForQuestions(domain) {
  if (!domain || !domain.id) return
  activeTab.value = 'questions'
  showQuestionForm.value = true
  newQuestion.value.domain_id = domain.id
}

async function deleteUser(userToDelete) {
  if (!userToDelete || !userToDelete.id) return
  if (userToDelete.role === 'admin') return

  const confirmed = confirm(`Supprimer l'utilisateur ${userToDelete.first_name} ${userToDelete.last_name} ?`)
  if (!confirmed) return

  try {
    await api.deleteUser(userToDelete.id)
    users.value = users.value.filter(u => u.id !== userToDelete.id)
    alert("Utilisateur supprimé avec succès")
  } catch (error) {
    alert('Erreur lors de la suppression: ' + (error.message || error))
  }
}

function editDomain(domain) {
  // TODO: Implémenter l'édition
  alert('Fonctionnalité à venir')
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR')
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background:
    linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)),
    url('@/assets/etudiants.jpg') center/cover no-repeat fixed;
}

.admin-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.header-content {
  max-width: 1400px;
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
  cursor: pointer;
}

.admin-header h1 {
  flex: 1;
  font-size: 1.5rem;
  margin: 0;
  color: #1d4ed8;
}

.admin-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  color: #111827;
}

.unauthorized {
  text-align: center;
  padding: 3rem;
  color: #ef4444;
  font-size: 1.25rem;
}

.admin-panel {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  animation: adminFadeIn 0.6s ease-out;
}

@keyframes adminFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.admin-nav {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(90deg, #eff6ff, #eef2ff);
}

.nav-tab {
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #1f2937;
  transition: all 0.2s;
  position: relative;
}

.nav-tab::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0.35rem;
  width: 0;
  height: 3px;
  background: rgba(59, 130, 246, 0.6);
  border-radius: 999px;
  transform: translateX(-50%);
  transition: width 0.25s ease-out;
}

.nav-tab:hover::after {
  width: 40%;
}

.nav-tab.active {
  color: #ffffff;
  border-bottom-color: transparent;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  box-shadow: 0 8px 18px rgba(59, 130, 246, 0.35);
}

.admin-section {
  padding: 2rem;
  background: #ffffff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
  transition: all 0.2s;
}

.btn-add:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.45);
}

.form-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.75rem 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
  border-color: #bfdbfe;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #111827;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  padding: 1rem;
  text-align: left;
  background: #f8f9fa;
  font-weight: 600;
  color: #111827;
  border-bottom: 2px solid #e5e7eb;
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #111827;
}

.admin-table tbody tr:hover {
  background: #eff6ff;
  transition: background 0.2s ease;
}

.btn-edit {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  background: #e5e7eb;
  border-color: #cbd5f5;
  color: #1d4ed8;
}

.btn-delete-user {
  background: #fee2e2;
  border-color: #fecaca;
  color: #b91c1c;
}

.btn-delete-user:hover {
  background: #fecaca;
  border-color: #fca5a5;
  color: #7f1d1d;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge.admin {
  background: #fee2e2;
  color: #991b1b;
}

.role-badge.user {
  background: #dbeafe;
  color: #1e40af;
}
</style>

