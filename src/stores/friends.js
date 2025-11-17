import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { useAuthStore } from './auth'

export const useFriendsStore = defineStore('friends', () => {
  const authStore = useAuthStore()
  const friends = ref([])
  const friendRequests = ref([])
  const onlineUsers = ref([])

  async function loadFriends() {
    if (!authStore.user?.id) return
    // TODO: Implémenter quand le backend sera prêt
    // friends.value = await api.getFriends(authStore.user.id)
  }

  async function loadFriendRequests() {
    if (!authStore.user?.id) return
    // TODO: Implémenter quand le backend sera prêt
    // friendRequests.value = await api.getFriendRequests(authStore.user.id)
  }

  async function loadOnlineUsers() {
    try {
      const users = await api.getUsers()
      // Filtrer pour exclure l'utilisateur actuel
      onlineUsers.value = users.filter(u => u.id !== authStore.user?.id)
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
    }
  }

  async function sendFriendRequest(userId) {
    if (!authStore.user?.id) return
    // TODO: Implémenter quand le backend sera prêt
    // await api.sendFriendRequest(authStore.user.id, userId)
  }

  async function acceptFriendRequest(requestId) {
    // TODO: Implémenter quand le backend sera prêt
    // await api.acceptFriendRequest(requestId)
  }

  function isFriend(userId) {
    return friends.value.some(f => f.id === userId)
  }

  function hasPendingRequest(userId) {
    return friendRequests.value.some(r => r.sender_id === userId || r.receiver_id === userId)
  }

  return {
    friends,
    friendRequests,
    onlineUsers,
    loadFriends,
    loadFriendRequests,
    loadOnlineUsers,
    sendFriendRequest,
    acceptFriendRequest,
    isFriend,
    hasPendingRequest
  }
})

