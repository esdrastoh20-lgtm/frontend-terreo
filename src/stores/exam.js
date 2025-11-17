import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useExamStore = defineStore('exam', () => {
  const questions = ref([])
  const currentQuestionIndex = ref(0)
  const answers = ref({})
  const timeRemaining = ref(0) // en secondes
  const isStarted = ref(false)
  const isCompleted = ref(false)
  const selectedDomain = ref(null)
  const selectedLevel = ref(null)
  const startTime = ref(null)
  const timerInterval = ref(null)

  const totalQuestions = 40
  const timeLimits = {
    easy: 20 * 60,      // 20 minutes en secondes
    intermediate: 25 * 60, // 25 minutes
    advanced: 30 * 60     // 30 minutes
  }

  const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value] || null
  })

  const progress = computed(() => {
    return Math.round((currentQuestionIndex.value / totalQuestions) * 100)
  })

  const timeFormatted = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  const isTimeUp = computed(() => timeRemaining.value <= 0 && isStarted.value)

  async function loadQuestions(domainId, level) {
    try {
      selectedDomain.value = domainId
      selectedLevel.value = level
      const allQuestions = await api.getQuestions(domainId, level)
      
      // Prendre 40 questions aléatoirement
      const shuffled = allQuestions.sort(() => 0.5 - Math.random())
      questions.value = shuffled.slice(0, totalQuestions)
      
      // Initialiser le timer
      const levelKey = (level || '').toLowerCase()
      timeRemaining.value = timeLimits[levelKey] || timeLimits.easy
      
      return questions.value
    } catch (error) {
      console.error('Erreur chargement questions:', error)
      throw error
    }
  }

  function startExam() {
    if (questions.value.length === 0) return
    
    isStarted.value = true
    startTime.value = Date.now()
    currentQuestionIndex.value = 0
    answers.value = {}
    
    // Démarrer le timer
    timerInterval.value = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        finishExam(true) // Temps écoulé
      }
    }, 1000)
  }

  function selectAnswer(questionId, answer) {
    answers.value[questionId] = answer
  }

  function nextQuestion() {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
    }
  }

  function goToQuestion(index) {
    if (index >= 0 && index < questions.value.length) {
      currentQuestionIndex.value = index
    }
  }

  function calculateScore() {
    let correct = 0
    questions.value.forEach(question => {
      const userAnswer = answers.value[question.id]
      if (!userAnswer || !question) return

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
          // Cas 1 : la BDD stocke directement la lettre
          correctKey = rawCorrect
        } else {
          // Cas 2 : la BDD stocke le texte exact de l'option
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
    return Math.round((correct / questions.value.length) * 100)
  }

  async function finishExam(timeUp = false) {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }

    const timeSpent = startTime.value 
      ? Math.floor((Date.now() - startTime.value) / 1000)
      : 0

    const finalScore = calculateScore()
    const passed = finalScore >= 70

    isCompleted.value = true
    isStarted.value = false

    return {
      score: finalScore,
      passed,
      timeSpent,
      timeUp,
      totalQuestions: questions.value.length,
      answered: Object.keys(answers.value).length
    }
  }

  async function submitExam(userId) {
    const result = await finishExam()
    
    try {
      await api.saveQuizResult({
        user_id: userId,
        domain_id: selectedDomain.value,
        level: selectedLevel.value,
        score: result.score,
        time_spent: result.timeSpent,
        passed: result.passed,
        answers: answers.value
      })
      
      return result
    } catch (error) {
      console.error('Erreur soumission examen:', error)
      throw error
    }
  }

  function resetExam() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
    questions.value = []
    currentQuestionIndex.value = 0
    answers.value = {}
    timeRemaining.value = 0
    isStarted.value = false
    isCompleted.value = false
    selectedDomain.value = null
    selectedLevel.value = null
    startTime.value = null
  }

  return {
    questions,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    progress,
    answers,
    timeRemaining,
    timeFormatted,
    isStarted,
    isCompleted,
    isTimeUp,
    selectedDomain,
    selectedLevel,
    loadQuestions,
    startExam,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    calculateScore,
    finishExam,
    submitExam,
    resetExam
  }
})

