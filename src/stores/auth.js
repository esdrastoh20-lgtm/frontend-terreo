import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Charger l'utilisateur depuis le localStorage au démarrage
  function loadUser() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
  }

  // Sauvegarder l'utilisateur dans le localStorage
  function saveUser(userData) {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  async function login(email, password) {
    try {
      const response = await api.login(email, password)
      if (response.user) {
        user.value = {
          id: response.user.id,
          email: response.user.email,
          first_name: response.user.first_name,
          last_name: response.user.last_name,
          name: `${response.user.first_name} ${response.user.last_name}`,
          role: response.user.role || 'user'
        }
        saveUser(user.value)
        return { success: true, message: response.message }
      }
      return { success: false, error: 'Erreur de connexion' }
    } catch (error) {
      return { success: false, error: error.message || 'Email ou mot de passe incorrect' }
    }
  }

  async function register(first_name, last_name, email, password) {
    try {
      const response = await api.register(first_name, last_name, email, password)
      if (response.id) {
        // Connecter automatiquement après inscription
        return await login(email, password)
      }
      return { success: false, error: 'Erreur lors de l\'inscription' }
    } catch (error) {
      return { success: false, error: error.message || 'Erreur lors de l\'inscription' }
    }
  }

  function logout() {
    user.value = null
    saveUser(null)
  }

  async function resetPassword(email) {
    if (!email) {
      return { success: false, error: 'Email invalide' }
    }
    try {
      const response = await api.requestPasswordReset(email)
      return { success: true, message: response.message || 'Un code de réinitialisation vous a été envoyé.' }
    } catch (error) {
      return { success: false, error: error.message || 'Erreur lors de la demande de réinitialisation' }
    }
  }

  async function confirmResetPassword(email, code, newPassword) {
    if (!email || !code || !newPassword) {
      return { success: false, error: 'Informations incomplètes' }
    }
    try {
      const response = await api.resetPasswordWithCode(email, code, newPassword)
      return { success: true, message: response.message || 'Mot de passe réinitialisé avec succès' }
    } catch (error) {
      return { success: false, error: error.message || 'Erreur lors de la réinitialisation du mot de passe' }
    }
  }

  // Initialiser au chargement
  loadUser()

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    resetPassword,
    confirmResetPassword,
    loadUser
  }
})

