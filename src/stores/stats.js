import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCoursesStore } from './courses'
import api from '@/services/api'

export const useStatsStore = defineStore('stats', () => {
  const coursesStore = useCoursesStore()
  
  const userStats = ref({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHours: 0,
    certifications: 0,
    averageProgress: 0,
    domainProgress: {
      python: 0,
      linux: 0,
      huawei: 0,
      ia: 0,
      cisco: 0
    },
    weeklyActivity: [
      { day: 'Lun', hours: 2.5 },
      { day: 'Mar', hours: 3.0 },
      { day: 'Mer', hours: 1.5 },
      { day: 'Jeu', hours: 4.0 },
      { day: 'Ven', hours: 2.0 },
      { day: 'Sam', hours: 1.0 },
      { day: 'Dim', hours: 0.5 }
    ],
    recentActivity: [
      { course: 'Introduction à Python', domain: 'Python', date: new Date(), action: 'Complété' },
      { course: 'Configuration Linux', domain: 'Linux', date: new Date(Date.now() - 86400000), action: 'En cours' },
      { course: 'Routage Cisco', domain: 'Cisco', date: new Date(Date.now() - 172800000), action: 'Commencer' }
    ]
  })

  async function loadUserStats(userId) {
    try {
      const data = await api.getUserStats(userId)
      userStats.value = {
        ...userStats.value,
        ...data,
        domainProgress: {
          ...userStats.value.domainProgress,
          ...(data.domainProgress || {})
        }
      }
    } catch (error) {
      console.error('Erreur chargement statistiques utilisateur:', error)
    }
  }

  const statsByDomain = computed(() => {
    // L'utilisateur souhaite afficher 3 cours disponibles par domaine
    const totalCoursesPerDomain = 3

    return coursesStore.domains.map(domain => {
      const progress = userStats.value.domainProgress[domain.id] || 0
      return {
        ...domain,
        courses: totalCoursesPerDomain,
        progress,
        completed: Math.round((progress / 100) * totalCoursesPerDomain)
      }
    })
  })

  return {
    userStats,
    statsByDomain,
    loadUserStats
  }
})

