import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/courses',
      name: 'courses',
      component: () => import('../views/CoursesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/courses/:id',
      name: 'course-detail',
      component: () => import('../views/CourseDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/videos',
      name: 'videos',
      component: () => import('../views/VideosView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/duels',
      name: 'duels',
      component: () => import('../views/DuelsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/exam',
      name: 'exam',
      component: () => import('../views/ExamView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/certifications',
      name: 'certifications',
      component: () => import('../views/AttestationView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/domains',
      name: 'domains',
      component: () => import('../views/DomainsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/confidentialite',
      name: 'privacy',
      component: () => import('../views/PrivacyView.vue'),
    },
  ],
})

// Navigation guard pour protéger les routes nécessitant une authentification
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const privacyAccepted = localStorage.getItem('privacyAccepted') === 'true'

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  if (to.meta.requiresAuth && authStore.isAuthenticated && !privacyAccepted && to.name !== 'privacy') {
    return next({ name: 'privacy' })
  }

  next()
})

export default router
