<template>
  <div class="domains-page">
    <header class="domains-header">
      <div class="domains-hero">
        <div class="domains-hero-inner">
          <div class="domains-hero-badge">Mode examen</div>
          <h1 class="page-title">Tests chronométrés par domaine</h1>
          <p class="page-subtitle">
            Configurez un test comme un vrai examen de certification : choisissez votre <strong>domaine</strong>,
            votre <strong>niveau</strong> et lancez un compte à rebours.
          </p>
          <div class="domains-hero-stats">
            <div class="stat-item">
              <span class="stat-label">Domaines</span>
              <span class="stat-value">{{ coursesStore.domains.length || 5 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Niveaux</span>
              <span class="stat-value">3</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Mode</span>
              <span class="stat-value">Chronométré</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="domains-content">
      <div class="domains-layout">
        <section class="domain-selection">
          <div class="selection-header">
            <h2>Configuration du test</h2>
            <p>
              Choisissez un domaine et un niveau de difficulté. Nous générerons un ensemble de questions optimisé pour
              votre préparation.
            </p>
          </div>

          <div class="selection-grid">
            <div class="select-group">
              <label for="domain-select" class="select-label">Domaine</label>
              <div class="select-wrapper">
                <select
                  id="domain-select"
                  v-model="selectedDomainId"
                  class="select-field"
                >
                  <option value="">Sélectionner un domaine</option>
                  <option
                    v-for="domain in coursesStore.domains"
                    :key="domain.id"
                    :value="domain.id"
                  >
                    {{ domain.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="select-group" v-if="selectedDomainId">
              <label for="level-select" class="select-label">Niveau</label>
              <div class="select-wrapper">
                <select
                  id="level-select"
                  v-model="selectedLevel"
                  class="select-field"
                >
                  <option value="">Sélectionner un niveau</option>
                  <option
                    v-for="level in coursesStore.levels"
                    :key="level.id"
                    :value="level.id"
                  >
                    {{ level.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="selection-footer">
              <div class="selection-info">
                <span class="dot"></span>
                Le test sera chronométré et comportera un ensemble de questions aléatoires.
              </div>
              <button
                class="btn-start"
                @click="startTimedTest"
                :disabled="!selectedDomainId || !selectedLevel"
              >
                Lancer le test chronométré
              </button>
            </div>
          </div>
        </section>

        <section class="domains-hint">
          <h3>Ce que vous obtiendrez</h3>
          <ul>
            <li>
              <span class="hint-icon">⏱️</span>
              <span>Un test chronométré avec un compte à rebours clair et visible.</span>
            </li>
            <li>
              <span class="hint-icon">🧭</span>
              <span>Une navigation fluide entre les questions avant la soumission.</span>
            </li>
            <li>
              <span class="hint-icon">📊</span>
              <span>Un score final détaillé avec indication de réussite ou d'échec.</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCoursesStore } from '@/stores/courses'

const router = useRouter()
const authStore = useAuthStore()
const coursesStore = useCoursesStore()

const selectedDomainId = ref('')
const selectedLevel = ref('')

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (!coursesStore.domains.length) {
    try {
      await coursesStore.loadDomains()
    } catch (error) {
      console.error('Erreur chargement domaines:', error)
    }
  }
})

function startTimedTest() {
  if (!selectedDomainId.value || !selectedLevel.value) return

  router.push({
    path: '/exam',
    query: {
      domainId: selectedDomainId.value,
      level: selectedLevel.value
    }
  })
}
</script>

<style scoped>
.domains-page {
  min-height: 100vh;
  background: radial-gradient(circle at top left, #e0ebff 0, #f5f7fb 45%, #f9fafb 100%);
}

.domains-header {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 35%, #0ea5e9 100%);
  color: #ffffff;
  padding: 2.5rem 1.5rem 3rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.domains-content {
  flex: 1;
  padding: 0 1.5rem 2.5rem;
  margin-top: -2.5rem;
}

.domain-selection {
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  padding: 2rem 2.25rem;
}

.selection-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.select-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.domains-hero {
  max-width: 1040px;
  margin: 0 auto;
}

.domains-hero-inner {
  border-radius: 18px;
  padding: 1.5rem 2rem 1.75rem;
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 55%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.25);
}

.domains-hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  background: rgba(15, 23, 42, 0.12);
}

.page-subtitle {
  max-width: 640px;
  margin: 0;
  font-size: 0.95rem;
  color: rgba(249, 250, 251, 0.9);
}

.domains-hero-stats {
  display: flex;
  gap: 1.75rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(226, 232, 240, 0.9);
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.domains-layout {
  max-width: 1040px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1.5fr);
  gap: 1.75rem;
}

.selection-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: #111827;
}

.selection-header p {
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.select-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.select-wrapper {
  position: relative;
}

.select-field {
  width: 100%;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 0.6rem 2.5rem 0.6rem 0.9rem;
  font-size: 0.95rem;
  color: #111827;
  background: #ffffff;
  appearance: none;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.select-field:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.35);
}

.selection-footer {
  margin-top: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.selection-info {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.selection-info .dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
}

.btn-start {
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.8rem;
  font-weight: 600;
  font-size: 0.95rem;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #ffffff;
  box-shadow: 0 12px 25px rgba(79, 70, 229, 0.35);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease, opacity 0.15s ease;
}

.btn-start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 35px rgba(79, 70, 229, 0.45);
  filter: brightness(1.03);
}

.btn-start:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.domains-hint {
  align-self: stretch;
  border-radius: 18px;
  padding: 1.5rem 1.75rem;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.domains-hint h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #111827;
}

.domains-hint ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.domains-hint li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4b5563;
}

.hint-icon {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 0.95rem;
}

@media (max-width: 576px) {
  .page-title {
    font-size: 1.5rem;
  }
  .domains-header {
    padding: 2rem 1rem 2.5rem;
  }
  .domains-content {
    padding: 0 1rem 2rem;
    margin-top: -2rem;
  }
  .domains-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .domain-selection {
    padding: 1.25rem 1.25rem 1.5rem;
  }
}
</style>
