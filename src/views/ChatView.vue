<template>
  <div class="chat-page">
    <header class="chat-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="router.push('/dashboard')" class="btn-back">← Retour</button>
          <h1>Messages</h1>
        </div>
        <div class="user-info">
          <span>{{ authStore.user?.name || 'Utilisateur' }}</span>
          <button @click="router.push('/notifications')" class="btn-notifications">Notifications</button>
          <button @click="handleLogout" class="btn-logout">Déconnexion</button>
        </div>
      </div>
    </header>

    <div class="chat-container">
      <!-- Liste des conversations -->
      <aside class="conversations-sidebar">
        <div class="sidebar-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'conversations' }]"
            @click="activeTab = 'conversations'"
          >
            Conversations
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'users' }]"
            @click="activeTab = 'users'"
          >
            Utilisateurs
          </button>
        </div>

        <!-- Onglet Conversations -->
        <div v-if="activeTab === 'conversations'" class="tab-content">
          <div class="sidebar-header">
            <h2>Conversations</h2>
          </div>
          <div class="conversations-list">
          <div
            v-for="conversation in chatStore.conversations"
            :key="conversation.id"
            :class="['conversation-item', { active: chatStore.activeConversation === conversation.id }]"
            @click="chatStore.selectConversation(conversation.id)"
          >
            <div class="conversation-avatar">{{ conversation.avatar }}</div>
            <div class="conversation-content">
              <div class="conversation-header">
                <span class="conversation-name">{{ conversation.name }}</span>
                <span class="conversation-time">{{ formatTime(conversation.timestamp) }}</span>
              </div>
              <div class="conversation-preview">
                <span class="preview-text">{{ conversation.lastMessage }}</span>
                <span v-if="conversation.unread > 0" class="unread-badge">{{ conversation.unread }}</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        <!-- Onglet Utilisateurs -->
        <div v-if="activeTab === 'users'" class="tab-content">
          <div class="sidebar-header">
            <h2>Utilisateurs</h2>
            <button @click="loadOnlineUsers" class="btn-refresh">🔄</button>
          </div>
          <div class="users-list">
            <div
              v-for="user in friendsStore.onlineUsers"
              :key="user.id"
              class="user-item"
            >
              <div class="user-avatar">👤</div>
              <div class="user-content">
                <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
              </div>
              <div class="user-actions">
                <button 
                  @click="startChatWithUser(user.id)"
                  class="btn-chat-user"
                  title="Envoyer un message"
                >
                  💬
                </button>
                <button 
                  @click="proposeDuel(user.id)"
                  class="btn-duel-user"
                  title="Proposer un duel"
                >
                  ⚔️
                </button>
              </div>
            </div>
            <div v-if="friendsStore.onlineUsers.length === 0" class="no-users">
              <p>Aucun utilisateur en ligne</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Zone de chat principale -->
      <main class="chat-main" v-if="chatStore.activeConversation">
        <div class="chat-header-main">
          <div class="chat-user-info">
            <div class="chat-avatar">
              {{ getActiveConversation()?.avatar }}
            </div>
            <div>
              <div class="chat-user-name">{{ getActiveConversation()?.name }}</div>
              <div class="chat-status">En ligne</div>
            </div>
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div
            v-for="message in chatStore.activeMessages"
            :key="message.id"
            :class="['message', { 'own-message': message.isOwn }]"
          >
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>

        <div class="chat-input-container">
          <div class="input-wrapper">
            <input
              v-model="messageInput"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Tapez votre message..."
              class="chat-input"
            />
            <button @click="sendMessage" class="btn-send" :disabled="!messageInput.trim()">
              Envoyer
            </button>
          </div>
        </div>
      </main>

      <!-- Écran vide si aucune conversation sélectionnée -->
      <main class="chat-main empty" v-else>
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <h2>Sélectionnez une conversation</h2>
          <p>Choisissez une conversation dans la liste pour commencer à discuter</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useFriendsStore } from '@/stores/friends'
import { useDuelsStore } from '@/stores/duels'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const friendsStore = useFriendsStore()
const duelsStore = useDuelsStore()

const messageInput = ref('')
const messagesContainer = ref(null)
const activeTab = ref('conversations')

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await chatStore.loadConversations()
  await friendsStore.loadOnlineUsers()
})

const loadOnlineUsers = async () => {
  await friendsStore.loadOnlineUsers()
}

const startChatWithUser = (userId) => {
  chatStore.selectConversation(userId)
  activeTab.value = 'conversations'
}

const proposeDuel = async (userId) => {
  const domainId = prompt('Entrez l\'ID du domaine pour le duel:')
  if (!domainId) return
  
  const level = prompt('Niveau (easy/intermediate/advanced):')
  if (!level) return
  
  try {
    const { code } = await duelsStore.createDuel(domainId, level)
    const message = `Je vous propose un duel ! Code: ${code} - Domaine: ${domainId}, Niveau: ${level}`
    
    // Envoyer le message directement via l'API
    await api.sendMessage(authStore.user.id, userId, message)

    // Créer une notification de type duel pour le destinataire
    const sender = authStore.user
    const senderName = `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || sender.email
    await api.createNotification(
      userId,
      'duel',
      `${senderName} vous a proposé un duel. Code: ${code}`
    )
    
    // Recharger les conversations et sélectionner celle avec cet utilisateur
    await chatStore.loadConversations()
    chatStore.selectConversation(userId)
    activeTab.value = 'conversations'
    alert('Duel proposé et message envoyé !')
  } catch (error) {
    alert('Erreur création duel: ' + error.message)
  }
}

const sendMessage = async () => {
  if (!messageInput.value.trim()) return
  
  try {
    await chatStore.sendMessage(messageInput.value)
    messageInput.value = ''
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    alert('Erreur lors de l\'envoi: ' + error.message)
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const getActiveConversation = () => {
  if (!chatStore.activeConversation) return null
  return chatStore.conversations.find(c => c.id === chatStore.activeConversation)
}

const formatTime = (date) => {
  const now = new Date()
  const messageDate = new Date(date)
  const diff = now - messageDate
  
  if (diff < 60000) return 'À l\'instant'
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`
  if (diff < 604800000) return `Il y a ${Math.floor(diff / 86400000)} j`
  
  return messageDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

watch(() => chatStore.activeMessages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: radial-gradient(circle at top left, #e0f2fe 0, #f9fafb 40%, #e5e7eb 100%);
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: linear-gradient(135deg, #ffffff 0%, #f3f4ff 100%);
  border-bottom: 1px solid #e5e7eb;
  padding: 0.85rem 2rem;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
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
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e0e0e0;
}

.chat-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info span {
  font-weight: 600;
  color: #2563eb;
}

.btn-notifications {
  padding: 0.5rem 1rem;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 999px;
  color: #3730a3;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-notifications:hover {
  background: #e0e7ff;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #e0e0e0;
}

.chat-container {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  height: calc(100vh - 72px);
  margin-top: 0.75rem;
}

.conversations-sidebar {
  width: 350px;
  background: rgba(255, 255, 255, 0.96);
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  border-radius: 16px 0 0 16px;
  overflow: hidden;
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f8f9fa;
}

.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-refresh {
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #2563eb;
}

.btn-new-chat {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-new-chat:hover {
  background: #5568d3;
}

.conversations-list,
.users-list {
  flex: 1;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.user-item:hover {
  background: #f8f9fa;
}

.user-avatar {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-content {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.75rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-add-friend,
.btn-chat-user,
.btn-duel-user {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-friend {
  background: #dbeafe;
  color: #1e40af;
}

.btn-add-friend:hover {
  background: #bfdbfe;
}

.btn-chat-user {
  background: #d1fae5;
  color: #065f46;
}

.btn-chat-user:hover {
  background: #a7f3d0;
}

.btn-duel-user {
  background: #fee2e2;
  color: #991b1b;
}

.btn-duel-user:hover {
  background: #fecaca;
}

.no-users {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.conversation-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: background 0.2s, transform 0.1s;
  border-radius: 12px;
  margin: 0.15rem 0.5rem;
}

.conversation-item:hover {
  background: #f3f4f6;
}

.conversation-item.active {
  background: #e0f2fe;
  border-left: 3px solid #0ea5e9;
}

.conversation-avatar {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border-radius: 50%;
  flex-shrink: 0;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.conversation-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.95rem;
}

.conversation-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.conversation-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.preview-text {
  font-size: 0.875rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.unread-badge {
  background: #667eea;
  color: white;
  border-radius: 10px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #e5ddd5;
  border-radius: 0 16px 16px 0;
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

.chat-main.empty {
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.chat-header-main {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.96), rgba(239, 246, 255, 0.96));
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-avatar {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
}

.chat-user-name {
  font-weight: 600;
  color: #1a1a1a;
}

.chat-status {
  font-size: 0.875rem;
  color: #10b981;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-image:
    radial-gradient(circle at 0 0, rgba(0, 0, 0, 0.03) 0, transparent 35%),
    radial-gradient(circle at 100% 100%, rgba(0, 0, 0, 0.035) 0, transparent 40%);
  background-size: cover;
}

.message {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.message.own-message {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message.own-message .message-content {
  align-items: flex-end;
}

.message-text {
  padding: 0.75rem 1rem;
  border-radius: 18px;
  word-wrap: break-word;
}

.message:not(.own-message) .message-text {
  background: #ffffff;
  color: #111827;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12);
}

.message.own-message .message-text {
  background: #d1f4cc;
  color: #065f46;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.16);
}

.message-time {
  font-size: 0.75rem;
  color: #666;
  padding: 0 0.5rem;
}

.chat-input-container {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(248, 250, 252, 0.96);
}

.input-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #667eea;
}

.btn-send {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-send:hover:not(:disabled) {
  background: #5568d3;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }
  
  .conversations-sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .chat-main {
    height: calc(100vh - 280px);
  }
}
</style>

