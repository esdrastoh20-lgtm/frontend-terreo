import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useQuizStore = defineStore('quiz', () => {
  const questions = ref([])
  const currentQuestionIndex = ref(0)
  const answers = ref({})
  const score = ref(0)
  const timeSpent = ref(0)
  const isCompleted = ref(false)
  const selectedDomain = ref(null)
  const selectedLevel = ref(null)
  const startTime = ref(null)

  const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value] || null
  })

  const totalQuestions = computed(() => questions.value.length)

  const progress = computed(() => {
    if (totalQuestions.value === 0) return 0
    return Math.round((currentQuestionIndex.value / totalQuestions.value) * 100)
  })

  const hasNext = computed(() => {
    return currentQuestionIndex.value < questions.value.length - 1
  })

  const hasPrevious = computed(() => {
    return currentQuestionIndex.value > 0
  })

  async function loadQuestions(domainId, level) {
    try {
      selectedDomain.value = domainId
      selectedLevel.value = level
      questions.value = await api.getQuestions(domainId, level)
      resetQuiz()
      return questions.value
    } catch (error) {
      console.error('Erreur chargement questions:', error)
      throw error
    }
  }

  function resetQuiz() {
    currentQuestionIndex.value = 0
    answers.value = {}
    score.value = 0
    timeSpent.value = 0
    isCompleted.value = false
    startTime.value = Date.now()
  }

  function selectAnswer(questionId, answer) {
    answers.value[questionId] = answer
  }

  function nextQuestion() {
    if (hasNext.value) {
      currentQuestionIndex.value++
    }
  }

  function previousQuestion() {
    if (hasPrevious.value) {
      currentQuestionIndex.value--
    }
  }

  function calculateScore() {
    let correct = 0
    questions.value.forEach(question => {
      const userAnswer = answers.value[question.id]
      if (!userAnswer || !question) return

      // Normaliser la bonne réponse et l'answer utilisateur
      const userKey = String(userAnswer).trim().toLowerCase()
      let correctKey = null

      if (question.correct_answer) {
        const rawCorrect = String(question.correct_answer).trim().toLowerCase()

        // Cas 0 : la BDD stocke 'option_a', 'option_b', etc.
        const optionMap = {
          option_a: 'a',
          option_b: 'b',
          option_c: 'c',
          option_d: 'd'
        }

        if (optionMap[rawCorrect]) {
          correctKey = optionMap[rawCorrect]
        } else if (['a', 'b', 'c', 'd'].includes(rawCorrect)) {
          // Cas 1: la BDD stocke directement la lettre ("a", "b", "c", "d" ou majuscules)
          correctKey = rawCorrect
        } else {
          // Cas 2: la BDD stocke le texte exact de l'option
          const options = {
            a: question.option_a,
            b: question.option_b,
            c: question.option_c,
            d: question.option_d
          }
          for (const [key, value] of Object.entries(options)) {
            if (value && String(value).trim().toLowerCase() === rawCorrect) {
              correctKey = key
              break
            }
          }
        }
      }

      if (correctKey && userKey === correctKey) {
        correct++
      }
    })
    score.value = Math.round((correct / questions.value.length) * 100)
    return score.value
  }

  async function submitQuiz(userId) {
    if (startTime.value) {
      timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000)
    }
    
    const finalScore = calculateScore()
    const passed = finalScore >= 70 // 70% pour réussir

    try {
      await api.saveQuizResult({
        user_id: userId,
        domain_id: selectedDomain.value,
        level: selectedLevel.value,
        score: finalScore,
        time_spent: timeSpent.value,
        passed: passed,
        answers: answers.value
      })
      
      isCompleted.value = true
      return { score: finalScore, passed, timeSpent: timeSpent.value }
    } catch (error) {
      console.error('Erreur soumission quiz:', error)
      throw error
    }
  }

  return {
    questions,
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    progress,
    answers,
    score,
    timeSpent,
    isCompleted,
    selectedDomain,
    selectedLevel,
    hasNext,
    hasPrevious,
    loadQuestions,
    resetQuiz,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    calculateScore,
    submitQuiz
  }
})

