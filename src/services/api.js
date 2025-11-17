const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    if (options.body) {
      config.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // ========================================
  // AUTHENTIFICATION
  // ========================================
  async login(email, password) {
    return this.request('/api/users/login', {
      method: 'POST',
      body: { email, password }
    })
  }

  async register(first_name, last_name, email, password) {
    return this.request('/api/users', {
      method: 'POST',
      body: { first_name, last_name, email, password }
    })
  }

  // Demande de réinitialisation de mot de passe (envoi du code à l'utilisateur)
  async requestPasswordReset(email) {
    return this.request('/api/users/forgot-password', {
      method: 'POST',
      body: { email }
    })
  }

  // Réinitialisation de mot de passe avec code reçu par email/SMS
  async resetPasswordWithCode(email, code, newPassword) {
    return this.request('/api/users/reset-password', {
      method: 'POST',
      body: { email, code, newPassword }
    })
  }

  async getUsers() {
    return this.request('/api/users')
  }

  async deleteUser(userId) {
    return this.request(`/api/users/${userId}`, {
      method: 'DELETE'
    })
  }

  // ========================================
  // DOMAINES
  // ========================================
  async getDomains() {
    return this.request('/api/domains')
  }

  async createDomain(name, description) {
    return this.request('/api/domains', {
      method: 'POST',
      body: { name, description }
    })
  }

  // ========================================
  // QUESTIONS
  // ========================================
  async getQuestions(domainId, level = null) {
    const endpoint = level 
      ? `/api/questions/${domainId}?level=${level}`
      : `/api/questions/${domainId}`
    return this.request(endpoint)
  }

  async createQuestion(questionData) {
    return this.request('/api/questions', {
      method: 'POST',
      body: questionData
    })
  }

  // ========================================
  // RÉSULTATS QUIZ
  // ========================================
  async saveQuizResult(resultData) {
    return this.request('/api/results', {
      method: 'POST',
      body: resultData
    })
  }

  async getUserResults(userId) {
    return this.request(`/api/results/${userId}`)
  }

  // ========================================
  // CHAT
  // ========================================
  async getChats(userId) {
    return this.request(`/api/chats/${userId}`)
  }

  async sendMessage(sender_id, receiver_id, message) {
    return this.request('/api/chats', {
      method: 'POST',
      body: { sender_id, receiver_id, message }
    })
  }

  // ========================================
  // COMMENTAIRES
  // ========================================
  async addCourseComment(user_id, course_id, comment, rating = 0) {
    return this.request('/api/course_comments', {
      method: 'POST',
      body: { user_id, course_id, comment, rating }
    })
  }

  // ========================================
  // DUELS
  // ========================================
  async getDuels(userId) {
    return this.request(`/api/duels/${userId}`)
  }

  async createDuel(initiator_id) {
    return this.request('/api/duels', {
      method: 'POST',
      body: { initiator_id }
    })
  }

  async saveDuelResult(duel_id, participant_id, score, time_spent, result) {
    return this.request('/api/duel_results', {
      method: 'POST',
      body: { duel_id, participant_id, score, time_spent, result }
    })
  }

  // ========================================
  // NOTIFICATIONS
  // ========================================
  async getNotifications(userId) {
    return this.request(`/api/notifications/${userId}`)
  }

  async createNotification(user_id, type, message) {
    return this.request('/api/notifications', {
      method: 'POST',
      body: { user_id, type, message }
    })
  }

  // ========================================
  // LEADERBOARDS
  // ========================================
  async getLeaderboards(domainId = null) {
    const endpoint = domainId 
      ? `/api/leaderboards?domainId=${domainId}`
      : '/api/leaderboards'
    return this.request(endpoint)
  }

  // ========================================
  // STATISTIQUES UTILISATEUR
  // ========================================
  async getUserStats(userId) {
    return this.request(`/api/user_stats/${userId}`)
  }

  // ========================================
  // RECHERCHE
  // ========================================
  async createSearchIndex(entity_type, entity_id, keywords) {
    return this.request('/api/search_index', {
      method: 'POST',
      body: { entity_type, entity_id, keywords }
    })
  }

  // ========================================
  // COURS
  // ========================================
  async getCourses(domainId = null, level = null) {
    // Pour l'instant, on retourne les cours basés sur les domaines
    // TODO: Créer l'endpoint backend /api/courses
    const endpoint = domainId 
      ? `/api/courses?domainId=${domainId}${level ? `&level=${level}` : ''}`
      : '/api/courses'
    try {
      return await this.request(endpoint)
    } catch (error) {
      // Fallback si l'endpoint n'existe pas encore
      return []
    }
  }

  async getCourseById(courseId) {
    return this.request(`/api/courses/${courseId}`)
  }
}

export default new ApiService()
