<template>
  <div class="attestation-page">
    <div class="attestation-container" v-if="passedResults.length">
      <header class="attestation-header">
        <button class="btn-back" @click="goBack">← Retour au tableau de bord</button>
        <h1>Mon attestation de réussite</h1>
      </header>

      <main class="attestation-main">
        <section class="attestation-list">
          <h2 class="list-title">Toutes mes attestations réussies</h2>
          <div class="list-grid">
            <article
              v-for="att in passedResults"
              :key="att.id"
              class="att-card"
              :class="{ active: selectedResult && selectedResult.id === att.id }"
              @click="selectedResult = att"
            >
              <div class="att-card-header">
                <div class="att-card-domain">{{ att.domain_name }}</div>
                <div class="att-card-level">{{ att.level_name }}</div>
              </div>
              <div class="att-card-body">
                <div class="att-card-score">{{ att.score }}%</div>
                <div class="att-card-date">{{ formatDate(att.obtained_at) }}</div>
              </div>
            </article>
          </div>
        </section>

        <div class="certificate-wrapper">
          <div class="certificate-card" ref="certificateRef">
            <div class="certificate-header">
              <div class="brand-block">
                <img :src="terreoLogo" alt="plateforme Terreo" class="brand-logo" />
                <div class="brand-text">plateforme Terreo</div>
              </div>
              <div class="badge-block">
                <div class="badge-ring">
                  <div class="badge-inner">🏅</div>
                </div>
                <div class="badge-label">Attestation officielle</div>
              </div>
            </div>

            <div class="certificate-body">
              <h2 class="title">Attestation de réussite</h2>
              <p class="intro">Cette attestation est décernée à :</p>

              <div class="learner-name">{{ candidateName }}</div>

              <p class="description">
                pour avoir réussi avec un score de
                <strong>{{ selectedResult.score }}%</strong>
                l'examen de certification suivant :
              </p>

              <div class="exam-summary">
                <div class="summary-row">
                  <span class="label">Domaine</span>
                  <span class="value">{{ selectedResult.domain_name }}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Niveau</span>
                  <span class="value">{{ selectedResult.level_name }}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Score</span>
                  <span class="value score">{{ selectedResult.score }}%</span>
                </div>
                <div class="summary-row">
                  <span class="label">Date</span>
                  <span class="value">{{ formatDate(selectedResult.obtained_at) }}</span>
                </div>
              </div>

              <div class="certificate-footer">
                <div class="sign-block">
                  <div class="sign-signature-wrapper">
                    <img :src="signatureSrc" alt="Signature" class="sign-signature" />
                  </div>
                  <div class="sign-line"></div>
                  <div class="sign-name">Esdras TOH</div>
                  <div class="sign-role">Directeur Général</div>
                </div>
                <div class="meta-block">
                  <div>Référence : CERT-{{ selectedResult.certificate_id || selectedResult.id }}</div>
                  <div>Date émission : {{ today }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary" @click="downloadPdf">Télécharger l'attestation en PDF</button>
        </div>
      </main>
    </div>

    <div v-else class="attestation-empty">
      <p>Aucune attestation réussie pour le moment.</p>
      <button class="btn-primary" @click="goBack">Retour au tableau de bord</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import signatureSrc from '@/assets/signature.png'
import terreoLogo from '@/assets/logo.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const results = ref([])
const selectedResult = ref(null)
const certificateRef = ref(null)

const passedResults = computed(() => {
  return results.value
    .filter(r => r.passed && r.score >= 70)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(r => decorateResult(r))
})

const candidateName = computed(() => {
  const u = authStore.user
  if (!u) return 'Candidat'
  return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Candidat'
})

const today = computed(() => {
  return new Date().toLocaleDateString('fr-FR')
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  await loadResults()
  selectFromRoute()
})

async function loadResults() {
  try {
    const data = await api.getUserResults(authStore.user.id)
    results.value = data
  } catch (e) {
    console.error('Erreur chargement résultats:', e)
  }
}

function selectFromRoute() {
  const id = route.query.resultId
  if (id && passedResults.value.length) {
    const found = passedResults.value.find(r => String(r.id) === String(id))
    if (found) {
      selectedResult.value = found
      return
    }
  }
  // Sinon, prendre la dernière réussite (score >= 70)
  if (passedResults.value.length) {
    selectedResult.value = passedResults.value[0]
  }
}

function decorateResult(r) {
  const domainNames = {
    1: 'Python',
    2: 'Linux',
    3: 'Cisco',
    4: 'Huawei',
    5: 'Intelligence Artificielle'
  }

  const levels = {
    easy: 'Débutant',
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    debutant: 'Débutant',
    intermediaire: 'Intermédiaire',
    avance: 'Avancé',
    level: 'Niveau'
  }

  const rawLevel = (r.level || '').toString().toLowerCase()

  return {
    ...r,
    domain_name: r.domain_name
      || domainNames[r.domain_id]
      || r.domain
      || (r.domain_id ? `Domaine ${r.domain_id}` : 'Domaine'),
    level_name: r.level_name
      || levels[rawLevel]
      || 'Niveau',
    obtained_at: r.obtained_at || r.created_at
  }
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function downloadPdf() {
  if (!certificateRef.value || !selectedResult.value) return

  const canvas = await html2canvas(certificateRef.value, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('landscape', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pdfWidth
  const imgHeight = (canvas.height * pdfWidth) / canvas.width
  const y = (pdfHeight - imgHeight) / 2

  pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight)
  const domain = selectedResult.value.domain_name || 'attestation'
  pdf.save(`attestation-${domain}-${formatDate(selectedResult.value.obtained_at)}.pdf`)
}

function goBack() {
  router.push('/dashboard')
}
</script>

<style scoped>
.attestation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e0ecff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.attestation-container {
  max-width: 900px;
  width: 100%;
}

.attestation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.attestation-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.btn-back {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
}

.attestation-main {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.2);
}

.attestation-list {
  margin-bottom: 1.5rem;
}

.list-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 0.75rem;
}

.att-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.att-card.active {
  border-color: #fbbf24;
  box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.5);
}

.att-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.12);
}

.att-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.att-card-domain {
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
}

.att-card-level {
  font-size: 0.75rem;
  color: #2563eb;
  font-weight: 500;
}

.att-card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.att-card-score {
  font-weight: 600;
  color: #16a34a;
}

.att-card-date {
  color: #6b7280;
}

.certificate-wrapper {
  display: flex;
  justify-content: center;
}

.certificate-card {
  width: 100%;
  max-width: 700px;
  background: radial-gradient(circle at top, #fef3c7 0%, #fffaf0 40%, #f9fafb 100%);
  border-radius: 14px;
  border: 3px solid #fbbf24;
  padding: 1.75rem 2rem;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.15);
}

.certificate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-logo {
  height: 34px;
  width: auto;
  object-fit: contain;
}

.brand-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fef3c7, #fbbf24);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #92400e;
}

.brand-text {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #92400e;
  font-weight: 600;
}

.badge-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.badge-ring {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid rgba(250, 204, 21, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-inner {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fefce8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-label {
  font-size: 0.7rem;
  color: #6b7280;
}

.certificate-body {
  text-align: center;
}

.title {
  font-size: 1.4rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #92400e;
  margin-bottom: 0.5rem;
}

.intro {
  font-size: 0.85rem;
  color: #6b7280;
}

.learner-name {
  margin: 0.75rem auto;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #fef3c7aa 0%, #facc15aa 100%);
  border-radius: 999px;
  max-width: 360px;
}

.description {
  font-size: 0.85rem;
  color: #4b5563;
  max-width: 520px;
  margin: 0 auto 1rem auto;
}

.exam-summary {
  max-width: 520px;
  margin: 0 auto;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  padding: 0.15rem 0;
}

.label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

.value {
  color: #111827;
  font-weight: 600;
}

.value.score {
  color: #16a34a;
}

.certificate-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.sign-block {
  text-align: center;
}

.sign-signature-wrapper {
  height: 80px;
  margin-bottom: 0.25rem;
}

.sign-signature {
  max-height: 100%;
  width: auto;
  object-fit: contain;
}

.sign-line {
  width: 160px;
  height: 1px;
  background: #4b5563;
  margin: 0 auto 0.25rem auto;
}

.sign-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
}

.sign-role {
  font-size: 0.75rem;
  color: #6b7280;
}

.meta-block {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
}

.actions {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-primary {
  padding: 0.85rem 2rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
  color: #111827;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(251, 191, 36, 0.4);
}

.btn-primary:hover {
  transform: translateY(-1px);
}

.attestation-empty {
  text-align: center;
}
</style>
