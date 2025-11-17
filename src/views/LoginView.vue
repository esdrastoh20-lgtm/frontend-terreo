<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-layout">
        <div class="login-main">
          <div class="login-header">
            <div class="brand-row">
              <img src="@/assets/logo.png" alt="Logo" class="login-logo" />
              <div class="brand-text-block">
                <span class="brand-pill">Terreo</span>
                <span class="brand-sub">Préparation aux certifications IT</span>
              </div>
            </div>
            <h1>Rejoignez votre espace de préparation</h1>
            <p>Entraînez-vous avec des quiz et examens chronométrés pour obtenir vos attestations.</p>
          </div>

          <div class="tabs">
            <button
              :class="['tab', { active: activeTab === 'login' }]"
              @click="activeTab = 'login'"
            >
              Connexion
            </button>
            <button
              :class="['tab', { active: activeTab === 'register' }]"
              @click="activeTab = 'register'"
            >
              Inscription
            </button>
            <button
              :class="['tab', { active: activeTab === 'forgot' }]"
              @click="activeTab = 'forgot'"
            >
              Mot de passe oublié
            </button>
          </div>

          <!-- Formulaire de Connexion -->
          <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input
                id="login-email"
                v-model="loginForm.email"
                type="email"
                required
                placeholder="votre@email.com"
              />
            </div>
            <div class="form-group">
              <label for="login-password">Mot de passe</label>
              <input
                id="login-password"
                v-model="loginForm.password"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Connexion...' : 'Se connecter' }}
            </button>
            <p v-if="error" class="error-message">{{ error }}</p>
            <p class="privacy-link">
              En vous connectant, vous acceptez notre
              <button type="button" class="link-button" @click="goToPrivacy">
                politique de confidentialité
              </button>
            </p>
          </form>

          <!-- Formulaire d'Inscription -->
          <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="form">
            <div class="form-group">
              <label for="register-firstname">Prénom</label>
              <input
                id="register-firstname"
                v-model="registerForm.first_name"
                type="text"
                required
                placeholder="Jean"
              />
            </div>
            <div class="form-group">
              <label for="register-lastname">Nom</label>
              <input
                id="register-lastname"
                v-model="registerForm.last_name"
                type="text"
                required
                placeholder="Dupont"
              />
            </div>
            <div class="form-group">
              <label for="register-email">Email</label>
              <input
                id="register-email"
                v-model="registerForm.email"
                type="email"
                required
                placeholder="votre@email.com"
              />
            </div>
            <div class="form-group">
              <label for="register-password">Mot de passe</label>
              <input
                id="register-password"
                v-model="registerForm.password"
                type="password"
                required
                placeholder="••••••••"
                minlength="6"
              />
            </div>
            <div class="form-group">
              <label for="register-confirm">Confirmer le mot de passe</label>
              <input
                id="register-confirm"
                v-model="registerForm.confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                minlength="6"
              />
            </div>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Inscription...' : "S'inscrire" }}
            </button>
            <p v-if="error" class="error-message">{{ error }}</p>
            <p class="privacy-link">
              En vous inscrivant, vous acceptez notre
              <button type="button" class="link-button" @click="goToPrivacy">
                politique de confidentialité
              </button>
            </p>
          </form>

          <!-- Formulaire Mot de passe oublié -->
          <div v-if="activeTab === 'forgot'" class="form">
            <!-- Étape 1 : demander le code par email -->
            <form @submit.prevent="handleForgotPassword" class="form">
              <div class="form-group">
                <label for="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  v-model="forgotForm.email"
                  type="email"
                  required
                  placeholder="votre@email.com"
                />
              </div>
              <p class="info-message">
                Entrez votre adresse email et nous vous enverrons un code pour réinitialiser votre mot de passe.
              </p>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Envoi...' : 'Envoyer le code' }}
              </button>
            </form>

            <p v-if="successMessage" class="success-message" style="margin-top: 1rem;">
              {{ successMessage }}
            </p>

            <!-- Bouton pour afficher le panneau de changement de mot de passe -->
            <button
              type="button"
              class="btn btn-secondary-toggle"
              @click="showResetPanel = !showResetPanel"
              style="margin-top: 1.25rem;"
            >
              {{ showResetPanel ? 'Fermer le formulaire' : 'J\'ai reçu mon code, changer mon mot de passe' }}
            </button>

            <!-- Étape 2 : saisir le code + nouveau mot de passe, avec effet de panneau qui se déplie -->
            <transition name="slide-panel">
              <div v-if="showResetPanel" class="reset-panel">
                <form @submit.prevent="handleConfirmReset" class="form">
                  <div class="form-group">
                    <label for="reset-email">Email</label>
                    <input
                      id="reset-email"
                      v-model="forgotForm.emailForReset"
                      type="email"
                      required
                      placeholder="L'email qui a reçu le code"
                    />
                  </div>
                  <div class="form-group">
                    <label for="reset-code">Code de validation</label>
                    <input
                      id="reset-code"
                      v-model="forgotForm.code"
                      type="text"
                      required
                      placeholder="Code reçu par email (5 chiffres)"
                    />
                  </div>
                  <div class="form-group">
                    <label for="reset-password">Nouveau mot de passe</label>
                    <input
                      id="reset-password"
                      v-model="forgotForm.newPassword"
                      type="password"
                      required
                      minlength="6"
                      placeholder="Nouveau mot de passe"
                    />
                  </div>
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    {{ loading ? 'Validation...' : 'Changer mon mot de passe' }}
                  </button>
                </form>
              </div>
            </transition>

            <p v-if="error" class="error-message">{{ error }}</p>
          </div>
        </div>

        <aside class="login-side">
          <h2>Bienvenue sur Terreo</h2>
          <p class="side-subtitle">Votre espace pour préparer et valider vos certifications IT.</p>
          <ul class="side-list">
            <li><span class="dot"></span>Suivez vos progrès par domaine et par niveau.</li>
            <li><span class="dot"></span>Accédez à des examens chronométrés et des quiz ciblés.</li>
            <li><span class="dot"></span>Générez vos attestations officielles en PDF.</li>
          </ul>
          <p class="side-footer">Connectez-vous pour reprendre là où vous vous êtes arrêté.</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const forgotForm = ref({
  email: '',
  emailForReset: '',
  code: '',
  newPassword: ''
})

const showResetPanel = ref(false)

const handleLogin = async () => {
  error.value = ''

  const privacyAccepted = localStorage.getItem('privacyAccepted') === 'true'
  if (!privacyAccepted) {
    error.value = 'Vous devez d\'abord lire et accepter la politique de confidentialité.'
    router.push('/confidentialite')
    return
  }

  loading.value = true
  
  try {
    const result = await authStore.login(loginForm.value.email, loginForm.value.password)
    if (result.success) {
      router.push('/dashboard')
    } else {
      error.value = result.error || 'Erreur de connexion'
    }
  } catch (err) {
    error.value = err.message || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const handleConfirmReset = async () => {
  error.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const email = forgotForm.value.emailForReset || forgotForm.value.email
    const code = forgotForm.value.code
    const newPassword = forgotForm.value.newPassword

    const result = await authStore.confirmResetPassword(email, code, newPassword)
    if (result.success) {
      successMessage.value = result.message || 'Mot de passe réinitialisé avec succès'
      // Optionnel : vider les champs
      forgotForm.value.code = ''
      forgotForm.value.newPassword = ''
    } else {
      error.value = result.error || 'Erreur lors de la réinitialisation du mot de passe'
    }
  } catch (err) {
    error.value = err.message || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  error.value = ''
  successMessage.value = ''
  
  if (!registerForm.value.first_name || !registerForm.value.last_name) {
    error.value = 'Le prénom et le nom sont requis'
    return
  }
  
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }
  
  if (registerForm.value.password.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }
  
  loading.value = true
  
  try {
    const result = await authStore.register(
      registerForm.value.first_name,
      registerForm.value.last_name,
      registerForm.value.email,
      registerForm.value.password
    )
    if (result.success) {
      // Redirection vers le tableau de bord après inscription
      router.push('/dashboard')
    } else {
      error.value = result.error || 'Erreur lors de l\'inscription'
    }
  } catch (err) {
    error.value = err.message || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = async () => {
  error.value = ''
  successMessage.value = ''
  loading.value = true
  
  try {
    const result = await authStore.resetPassword(forgotForm.value.email)
    if (result.success) {
      successMessage.value = result.message || 'Email envoyé avec succès'
      if (!forgotForm.value.emailForReset) {
        forgotForm.value.emailForReset = forgotForm.value.email
      }
    } else {
      error.value = result.error || 'Erreur lors de l\'envoi'
    }
  } catch (err) {
    error.value = err.message || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const goToPrivacy = () => {
  router.push('/confidentialite')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('@/assets/etudiants.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 2rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 22px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.45);
  padding: 1.25rem 1.5rem;
  width: 100%;
  max-width: 820px;
  animation: slideUp 0.5s ease-out;
  border: 1px solid rgba(129, 140, 248, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.login-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 1.25rem;
  align-items: stretch;
}

.login-main {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login-header {
  text-align: left;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.login-logo {
  max-width: 120px;
  height: auto;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.brand-text-block {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.brand-sub {
  font-size: 0.8rem;
  color: #6b7280;
}

.login-header h1 {
  color: #333;
  font-size: 1.35rem;
  margin-bottom: 0.2rem;
  font-weight: 700;
}

.login-header p {
  color: #666;
  font-size: 0.85rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid rgba(209, 213, 219, 0.9);
}

.tab {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab:hover {
  color: #667eea;
}

.tab.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(129, 140, 248, 0.12));
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #374151;
  font-size: 0.85rem;
  font-weight: 500;
}

.form-group input {
  padding: 0.65rem 0.9rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
  outline: none;
}

.form-group input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn {
  padding: 0.75rem 1.35rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.login-side {
  border-radius: 18px;
  padding: 1.25rem 1.4rem;
  background: radial-gradient(circle at top left, #eff6ff, #dbeafe, #e0f2fe);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
}

.login-side h2 {
  font-size: 1.3rem;
  color: #0f172a;
  margin: 0;
}

.side-subtitle {
  font-size: 0.9rem;
  color: #475569;
}

.side-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: #1e293b;
}

.side-list .dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #2563eb;
  margin-right: 0.4rem;
}

.side-footer {
  font-size: 0.85rem;
  color: #64748b;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #a855f7 50%, #f97316 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 0.5rem;
}

.success-message {
  color: #10b981;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 0.5rem;
}

.privacy-link {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #6b7280;
  text-align: center;
}

.link-button {
  background: none;
  border: none;
  padding: 0;
  margin-left: 0.25rem;
  color: #2563eb;
  cursor: pointer;
  font-size: 0.8rem;
  text-decoration: underline;
}

.link-button:hover {
  color: #1d4ed8;
}

.info-message {
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .login-card {
    padding: 1.5rem;
  }

  .login-layout {
    grid-template-columns: 1fr;
  }

  .login-side {
    order: -1;
  }

  .tabs {
    flex-direction: column;
    gap: 0;
  }
  
  .tab {
    text-align: center;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 0;
  }
  
  .tab.active {
    border-bottom-color: #667eea;
  }
}
</style>

