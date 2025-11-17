import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useCoursesStore = defineStore('courses', () => {
  const selectedDomain = ref(null)
  const selectedLevel = ref(null)
  const domains = ref([])
  
  // Domaines par défaut avec icônes et couleurs (pour l'affichage)
  const domainMetadata = {
    python: { icon: '🐍', color: '#3776ab' },
    linux: { icon: '🐧', color: '#fcc624' },
    huawei: { icon: '📡', color: '#ff6900' },
    'intelligence-artificielle': { icon: '🤖', color: '#6366f1' },
    ia: { icon: '🤖', color: '#6366f1' },
    cisco: { icon: '🌐', color: '#1ba0d7' }
  }

  async function loadDomains() {
    try {
      const apiDomains = await api.getDomains()
      if (apiDomains && apiDomains.length > 0) {
        domains.value = apiDomains.map(domain => {
          const key = domain.name.toLowerCase().replace(/\s+/g, '-')
          const meta = domainMetadata[key] || domainMetadata[domain.id] || { icon: '📚', color: '#667eea' }
          return {
            ...domain,
            icon: meta.icon,
            color: meta.color
          }
        })
      } else {
        // Si l'API retourne un tableau vide, utiliser les domaines par défaut
        domains.value = [
          { id: 1, name: 'Linux', icon: '🐧', color: '#fcc624' },
          { id: 2, name: 'Python', icon: '🐍', color: '#3776ab' },
          { id: 3, name: 'Huawei', icon: '📡', color: '#ff6900' },
          { id: 4, name: 'Intelligence Artificielle', icon: '🤖', color: '#6366f1' },
          { id: 5, name: 'Cisco', icon: '🌐', color: '#1ba0d7' }
        ]
      }
    } catch (error) {
      console.error('Erreur chargement domaines:', error)
      // Fallback sur les domaines par défaut
      domains.value = [
        { id: 1, name: 'Linux', icon: '🐧', color: '#fcc624' },
        { id: 2, name: 'Python', icon: '🐍', color: '#3776ab' },
        { id: 3, name: 'Huawei', icon: '📡', color: '#ff6900' },
        { id: 4, name: 'Intelligence Artificielle', icon: '🤖', color: '#6366f1' },
        { id: 5, name: 'Cisco', icon: '🌐', color: '#1ba0d7' }
      ]
    }
  }

  // Charger les domaines au démarrage (mais ne pas bloquer si ça échoue)
  loadDomains().catch(err => {
    console.error('Erreur lors du chargement initial des domaines:', err)
  })

  const levels = ref([
    { id: 'debutant', name: 'Débutant', icon: '🌱' },
    { id: 'intermediaire', name: 'Intermédiaire', icon: '📚' },
    { id: 'avance', name: 'Avancé', icon: '🚀' }
  ])

  // Données de cours pour chaque domaine et niveau
  const coursesData = ref({
    python: {
      debutant: [
        {
          id: 1,
          title: 'Introduction à Python',
          description: 'Apprenez les bases de Python : syntaxe, variables, types de données',
          duration: '4h',
          lessons: 12,
          progress: 0
        },
        {
          id: 2,
          title: 'Python : Structures de contrôle',
          description: 'Maîtrisez les boucles, conditions et structures de contrôle',
          duration: '3h',
          lessons: 10,
          progress: 0
        },
        {
          id: 3,
          title: 'Fonctions et Modules en Python',
          description: 'Créez et utilisez des fonctions, importez des modules',
          duration: '5h',
          lessons: 15,
          progress: 0
        }
      ],
      intermediaire: [
        {
          id: 4,
          title: 'Programmation Orientée Objet en Python',
          description: 'Classes, objets, héritage et polymorphism',
          duration: '6h',
          lessons: 18,
          progress: 0
        },
        {
          id: 5,
          title: 'Manipulation de fichiers et JSON',
          description: 'Lire, écrire et manipuler différents formats de fichiers',
          duration: '4h',
          lessons: 12,
          progress: 0
        },
        {
          id: 6,
          title: 'Gestion des erreurs et exceptions',
          description: 'Try/except, gestion avancée des erreurs',
          duration: '3h',
          lessons: 9,
          progress: 0
        }
      ],
      avance: [
        {
          id: 7,
          title: 'Python Avancé : Décorateurs et Générateurs',
          description: 'Techniques avancées de programmation Python',
          duration: '7h',
          lessons: 20,
          progress: 0
        },
        {
          id: 8,
          title: 'Concurrence et Asynchrone en Python',
          description: 'Threading, multiprocessing, async/await',
          duration: '8h',
          lessons: 22,
          progress: 0
        },
        {
          id: 9,
          title: 'Frameworks Python : Django et Flask',
          description: 'Développement web avec les frameworks Python',
          duration: '10h',
          lessons: 25,
          progress: 0
        }
      ]
    },
    linux: {
      debutant: [
        {
          id: 10,
          title: 'Introduction à Linux',
          description: 'Découvrez Linux, son histoire et ses distributions',
          duration: '3h',
          lessons: 10,
          progress: 0
        },
        {
          id: 11,
          title: 'Navigation dans le système de fichiers',
          description: 'Commandes de base : cd, ls, pwd, mkdir, etc.',
          duration: '4h',
          lessons: 12,
          progress: 0
        },
        {
          id: 12,
          title: 'Gestion des fichiers et permissions',
          description: 'Créer, modifier, supprimer et gérer les permissions',
          duration: '5h',
          lessons: 15,
          progress: 0
        }
      ],
      intermediaire: [
        {
          id: 13,
          title: 'Administration système Linux',
          description: 'Gestion des utilisateurs, groupes et processus',
          duration: '6h',
          lessons: 18,
          progress: 0
        },
        {
          id: 14,
          title: 'Scripting Bash avancé',
          description: 'Écriture de scripts shell complexes',
          duration: '7h',
          lessons: 20,
          progress: 0
        },
        {
          id: 15,
          title: 'Gestion des services et daemons',
          description: 'systemd, services, gestion des logs',
          duration: '5h',
          lessons: 15,
          progress: 0
        }
      ],
      avance: [
        {
          id: 16,
          title: 'Sécurité Linux avancée',
          description: 'SELinux, firewall, audit de sécurité',
          duration: '8h',
          lessons: 22,
          progress: 0
        },
        {
          id: 17,
          title: 'Virtualisation et Containers',
          description: 'Docker, Kubernetes, virtualisation',
          duration: '10h',
          lessons: 25,
          progress: 0
        },
        {
          id: 18,
          title: 'Performance et optimisation système',
          description: 'Monitoring, tuning, optimisation des performances',
          duration: '9h',
          lessons: 23,
          progress: 0
        }
      ]
    },
    huawei: {
      debutant: [
        {
          id: 19,
          title: 'Introduction aux réseaux Huawei',
          description: 'Découvrez l\'écosystème Huawei et ses équipements',
          duration: '4h',
          lessons: 12,
          progress: 0
        },
        {
          id: 20,
          title: 'Configuration de base des routeurs Huawei',
          description: 'Premiers pas avec les routeurs Huawei',
          duration: '5h',
          lessons: 15,
          progress: 0
        },
        {
          id: 21,
          title: 'Configuration des switches Huawei',
          description: 'Configuration VLAN et switching de base',
          duration: '4h',
          lessons: 12,
          progress: 0
        }
      ],
      intermediaire: [
        {
          id: 22,
          title: 'Routage avancé Huawei',
          description: 'OSPF, BGP, routage dynamique',
          duration: '7h',
          lessons: 20,
          progress: 0
        },
        {
          id: 23,
          title: 'Sécurité réseau Huawei',
          description: 'Firewall, ACL, VPN',
          duration: '6h',
          lessons: 18,
          progress: 0
        },
        {
          id: 24,
          title: 'Gestion et monitoring Huawei',
          description: 'eSight, SNMP, monitoring réseau',
          duration: '5h',
          lessons: 15,
          progress: 0
        }
      ],
      avance: [
        {
          id: 25,
          title: 'Architecture réseau Huawei avancée',
          description: 'SDN, NFV, architecture cloud',
          duration: '10h',
          lessons: 25,
          progress: 0
        },
        {
          id: 26,
          title: 'Certification HCIP/HCIE',
          description: 'Préparation aux certifications Huawei avancées',
          duration: '12h',
          lessons: 30,
          progress: 0
        },
        {
          id: 27,
          title: 'Troubleshooting avancé Huawei',
          description: 'Diagnostic et résolution de problèmes complexes',
          duration: '8h',
          lessons: 22,
          progress: 0
        }
      ]
    },
    ia: {
      debutant: [
        {
          id: 28,
          title: 'Introduction à l\'Intelligence Artificielle',
          description: 'Concepts de base de l\'IA et du machine learning',
          duration: '5h',
          lessons: 15,
          progress: 0
        },
        {
          id: 29,
          title: 'Machine Learning : Les bases',
          description: 'Régression, classification, algorithmes de base',
          duration: '6h',
          lessons: 18,
          progress: 0
        },
        {
          id: 30,
          title: 'Python pour l\'IA',
          description: 'NumPy, Pandas, Matplotlib pour l\'IA',
          duration: '7h',
          lessons: 20,
          progress: 0
        }
      ],
      intermediaire: [
        {
          id: 31,
          title: 'Deep Learning avec TensorFlow',
          description: 'Réseaux de neurones, TensorFlow, Keras',
          duration: '8h',
          lessons: 22,
          progress: 0
        },
        {
          id: 32,
          title: 'Computer Vision',
          description: 'Traitement d\'images, reconnaissance d\'objets',
          duration: '9h',
          lessons: 24,
          progress: 0
        },
        {
          id: 33,
          title: 'Natural Language Processing',
          description: 'Traitement du langage naturel, NLP',
          duration: '8h',
          lessons: 22,
          progress: 0
        }
      ],
      avance: [
        {
          id: 34,
          title: 'Architectures de Deep Learning avancées',
          description: 'CNN, RNN, Transformers, GANs',
          duration: '12h',
          lessons: 30,
          progress: 0
        },
        {
          id: 35,
          title: 'Reinforcement Learning',
          description: 'Apprentissage par renforcement',
          duration: '10h',
          lessons: 25,
          progress: 0
        },
        {
          id: 36,
          title: 'Déploiement de modèles IA',
          description: 'MLOps, déploiement en production',
          duration: '9h',
          lessons: 23,
          progress: 0
        }
      ]
    },
    cisco: {
      debutant: [
        {
          id: 37,
          title: 'Introduction aux réseaux Cisco',
          description: 'Découvrez l\'écosystème Cisco et CCNA',
          duration: '4h',
          lessons: 12,
          progress: 0
        },
        {
          id: 38,
          title: 'Configuration de base Cisco',
          description: 'IOS, configuration initiale des équipements',
          duration: '5h',
          lessons: 15,
          progress: 0
        },
        {
          id: 39,
          title: 'Switching Cisco de base',
          description: 'VLAN, trunking, STP',
          duration: '6h',
          lessons: 18,
          progress: 0
        }
      ],
      intermediaire: [
        {
          id: 40,
          title: 'Routage Cisco avancé',
          description: 'OSPF, EIGRP, BGP',
          duration: '8h',
          lessons: 22,
          progress: 0
        },
        {
          id: 41,
          title: 'Sécurité Cisco',
          description: 'ACL, NAT, Firewall ASA',
          duration: '7h',
          lessons: 20,
          progress: 0
        },
        {
          id: 42,
          title: 'WAN et VPN Cisco',
          description: 'Frame Relay, MPLS, VPN IPsec',
          duration: '9h',
          lessons: 24,
          progress: 0
        }
      ],
      avance: [
        {
          id: 43,
          title: 'Certification CCNP',
          description: 'Préparation à la certification CCNP',
          duration: '15h',
          lessons: 35,
          progress: 0
        },
        {
          id: 44,
          title: 'Architecture réseau Cisco avancée',
          description: 'SD-WAN, ACI, architecture datacenter',
          duration: '12h',
          lessons: 30,
          progress: 0
        },
        {
          id: 45,
          title: 'Troubleshooting avancé Cisco',
          description: 'Diagnostic et résolution de problèmes complexes',
          duration: '10h',
          lessons: 25,
          progress: 0
        }
      ]
    }
  })

  const coursesFromDB = ref([])

  const filteredCourses = computed(() => {
    if (!selectedDomain.value || !selectedLevel.value) {
      return []
    }
    
    // D'abord essayer de charger depuis la base de données
    if (coursesFromDB.value.length > 0) {
      const levelMap = {
        'debutant': ['easy', 'débutant', 'debutant', 'beginner'],
        'intermediaire': ['intermediate', 'intermédiaire', 'intermediaire', 'moyen'],
        'avance': ['advanced', 'avancé', 'avance']
      }
      
      const currentLevel = selectedLevel.value
      const levelVariants = levelMap[currentLevel] || [currentLevel]
      
      return coursesFromDB.value.filter(course => {
        const domainMatch = course.domain_id == selectedDomain.value
        
        // Mapper les niveaux de la DB vers les niveaux du frontend
        const dbLevel = course.level?.toLowerCase()
        const levelMapping = {
          'beginner': ['easy', 'débutant', 'debutant', 'beginner'],
          'intermediate': ['intermediate', 'intermédiaire', 'intermediaire', 'moyen'],
          'advanced': ['advanced', 'avancé', 'avance']
        }
        
        // Vérifier si le niveau de la DB correspond au niveau sélectionné
        const levelMatch = levelVariants.some(variant => {
          const variantLower = variant.toLowerCase()
          // Vérifier correspondance directe
          if (dbLevel === variantLower) return true
          // Vérifier via le mapping
          return Object.values(levelMapping).some(levels => 
            levels.includes(variantLower) && levels.includes(dbLevel)
          )
        })
        
        return domainMatch && levelMatch
      })
    }
    
    // Fallback sur les données statiques
    return coursesData.value[selectedDomain.value]?.[selectedLevel.value] || []
  })

  async function loadCoursesFromDB(domainId, level) {
    try {
      const courses = await api.getCourses(domainId, level)
      coursesFromDB.value = courses
      return courses
    } catch (error) {
      console.error('Erreur chargement cours depuis DB:', error)
      coursesFromDB.value = []
      return []
    }
  }

  function selectDomain(domainId) {
    selectedDomain.value = domainId
    selectedLevel.value = null // Reset level when domain changes
  }

  function selectLevel(levelId) {
    selectedLevel.value = levelId
  }

  function getDomainById(domainId) {
    return domains.value.find(d => d.id == domainId)
  }

  function getLevelById(levelId) {
    return levels.value.find(l => l.id === levelId)
  }

  return {
    domains,
    levels,
    selectedDomain,
    selectedLevel,
    filteredCourses,
    coursesData,
    coursesFromDB,
    selectDomain,
    selectLevel,
    getDomainById,
    getLevelById,
    loadCoursesFromDB
  }
})

