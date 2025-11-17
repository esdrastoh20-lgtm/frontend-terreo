import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()
  const conversations = ref([])
  const allUsers = ref([])

  const activeConversation = ref(null)
  const activeReceiverId = ref(null)

  const activeMessages = computed(() => {
    if (!activeConversation.value) return []
    const conv = conversations.value.find(c => c.id === activeConversation.value)
    return conv?.messages || []
  })

  async function loadConversations() {
    if (!authStore.user?.id) return
    
    try {
      const chats = await api.getChats(authStore.user.id)
      const users = await api.getUsers()
      allUsers.value = users
      
      // Grouper les messages par conversation
      const convMap = new Map()
      
      chats.forEach(chat => {
        const otherUserId = chat.sender_id === authStore.user.id ? chat.receiver_id : chat.sender_id
        const otherUser = users.find(u => u.id === otherUserId)
        
        if (!convMap.has(otherUserId)) {
          convMap.set(otherUserId, {
            id: otherUserId,
            name: otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : `Utilisateur ${otherUserId}`,
            avatar: '👤',
            lastMessage: chat.message,
            timestamp: new Date(chat.created_at),
            unread: 0,
            messages: []
          })
        }
        
        const conv = convMap.get(otherUserId)
        conv.messages.push({
          id: chat.id,
          sender: chat.sender_id === authStore.user.id ? 'Vous' : conv.name,
          text: chat.message,
          timestamp: new Date(chat.created_at),
          isOwn: chat.sender_id === authStore.user.id
        })
        
        if (new Date(chat.created_at) > conv.timestamp) {
          conv.timestamp = new Date(chat.created_at)
          conv.lastMessage = chat.message
        }
      })

      // Déterminer les messages non lus : si le dernier message vient de l'autre utilisateur,
      // on considère qu'il y a au moins 1 message non lu (comme un indicateur de nouveau message).
      conversations.value = Array.from(convMap.values()).map(conv => {
        if (conv.messages.length > 0) {
          const lastMsg = conv.messages[conv.messages.length - 1]
          conv.unread = lastMsg && !lastMsg.isOwn ? 1 : conv.unread
        }
        return conv
      })
    } catch (error) {
      console.error('Erreur chargement conversations:', error)
    }
  }

  function selectConversation(conversationId) {
    activeConversation.value = conversationId
    activeReceiverId.value = conversationId
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      conv.unread = 0
    }
  }

  async function sendMessage(text) {
    if (!activeReceiverId.value || !text.trim() || !authStore.user?.id) return

    try {
      const message = text.trim()
      await api.sendMessage(authStore.user.id, activeReceiverId.value, message)

      // Créer une notification pour le destinataire
      const sender = authStore.user
      const senderName = `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || sender.email
      const preview = message.length > 60 ? message.slice(0, 57) + '…' : message
      await api.createNotification(
        activeReceiverId.value,
        'chat',
        `${senderName} vous a envoyé un message : "${preview}"`
      )

      await loadConversations()
    } catch (error) {
      console.error('Erreur envoi message:', error)
      throw error
    }
  }

  const unreadCount = computed(() => {
    return conversations.value.reduce((total, conv) => total + conv.unread, 0)
  })

  return {
    conversations,
    activeConversation,
    activeMessages,
    activeReceiverId,
    allUsers,
    unreadCount,
    selectConversation,
    sendMessage,
    loadConversations
  }
})

