import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { useAuthStore } from './auth'

export const useDuelsStore = defineStore('duels', () => {
  const authStore = useAuthStore()
  const activeDuel = ref(null)
  const duelCode = ref(null)
  const participants = ref([])

  function generateDuelCode() {
    // Générer un code aléatoire de 6 caractères
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    duelCode.value = code
    return code
  }

  async function createDuel(domainId, level) {
    try {
      const response = await api.createDuel(authStore.user.id)
      const code = generateDuelCode()
      
      activeDuel.value = {
        id: response.id,
        code: code,
        domain_id: domainId,
        level: level,
        initiator_id: authStore.user.id,
        status: 'waiting'
      }
      
      // Sauvegarder le code dans le store
      duelCode.value = code
      
      return { id: response.id, code: code }
    } catch (error) {
      console.error('Erreur création duel:', error)
      throw error
    }
  }

  async function joinDuelByCode(code) {
    try {
      // TODO: Implémenter la logique de recherche de duel par code dans le backend
      // Pour l'instant, on simule
      const duels = await api.getDuels(authStore.user.id)
      const duel = duels.find(d => d.code === code)
      
      if (!duel) {
        throw new Error('Code de duel invalide')
      }
      
      activeDuel.value = duel
      return duel
    } catch (error) {
      console.error('Erreur connexion duel:', error)
      throw error
    }
  }

  async function getDuels() {
    try {
      return await api.getDuels(authStore.user.id)
    } catch (error) {
      console.error('Erreur chargement duels:', error)
      throw error
    }
  }

  function resetDuel() {
    activeDuel.value = null
    duelCode.value = null
    participants.value = []
  }

  return {
    activeDuel,
    duelCode,
    participants,
    generateDuelCode,
    createDuel,
    joinDuelByCode,
    getDuels,
    resetDuel
  }
})

