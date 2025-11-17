import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCoursesStore } from './courses'

export const useVideosStore = defineStore('videos', () => {
  const coursesStore = useCoursesStore()
  const selectedDomain = ref(null)
  const selectedLevel = ref(null)

  // Vidéos YouTube réelles par domaine et niveau
  const youtubeVideos = {
    python: {
      debutant: [
        {
          id: 'video-python-1',
          title: 'Python pour débutants - Introduction complète',
          description: 'Apprenez Python de zéro avec ce tutoriel complet',
          videoId: 'kqtD5dpn9C8',
          duration: '4h 30min',
          views: 1250000,
          likes: 45000,
          instructor: 'Corey Schafer'
        },
        {
          id: 'video-python-2',
          title: 'Python : Variables et Types de données',
          description: 'Maîtrisez les bases de Python',
          videoId: 'Z1Yd7upQsXY',
          duration: '45min',
          views: 850000,
          likes: 32000,
          instructor: 'freeCodeCamp'
        },
        {
          id: 'video-python-3',
          title: 'Python : Fonctions et Modules',
          description: 'Créez et utilisez des fonctions en Python',
          videoId: 'u-OmVr_fT4s',
          duration: '1h 15min',
          views: 650000,
          likes: 28000,
          instructor: 'Programming with Mosh'
        }
      ],
      intermediaire: [
        {
          id: 'video-python-4',
          title: 'Programmation Orientée Objet en Python',
          description: 'Classes, objets et héritage',
          videoId: 'Ej_02ICOwts',
          duration: '2h 20min',
          views: 950000,
          likes: 38000,
          instructor: 'Corey Schafer'
        },
        {
          id: 'video-python-5',
          title: 'Python : Manipulation de fichiers',
          description: 'Lire et écrire des fichiers',
          videoId: 'Uh2eb1L6sGE',
          duration: '1h',
          views: 720000,
          likes: 29000,
          instructor: 'freeCodeCamp'
        }
      ],
      avance: [
        {
          id: 'video-python-6',
          title: 'Python Avancé : Décorateurs et Générateurs',
          description: 'Techniques avancées de programmation',
          videoId: 'MjHpMCIvwsY',
          duration: '3h',
          views: 580000,
          likes: 25000,
          instructor: 'Real Python'
        },
        {
          id: 'video-python-7',
          title: 'Concurrence et Asynchrone en Python',
          description: 'Threading, multiprocessing, async/await',
          videoId: 'fKl2JW_qrso',
          duration: '2h 30min',
          views: 420000,
          likes: 19000,
          instructor: 'Corey Schafer'
        }
      ]
    },
    linux: {
      debutant: [
        {
          id: 'video-linux-1',
          title: 'Linux pour débutants - Tutoriel complet',
          description: 'Introduction à Linux et commandes de base',
          videoId: 'ROjZy1WbCIA',
          duration: '3h 45min',
          views: 2100000,
          likes: 78000,
          instructor: 'freeCodeCamp'
        },
        {
          id: 'video-linux-2',
          title: 'Commandes Linux essentielles',
          description: 'Les commandes que vous devez connaître',
          videoId: 'bju_FdCoQF8',
          duration: '1h 30min',
          views: 1500000,
          likes: 62000,
          instructor: 'NetworkChuck'
        }
      ],
      intermediaire: [
        {
          id: 'video-linux-3',
          title: 'Administration système Linux',
          description: 'Gestion des utilisateurs et processus',
          videoId: 'V1y-mbWM3B8',
          duration: '4h',
          views: 980000,
          likes: 41000,
          instructor: 'freeCodeCamp'
        }
      ],
      avance: [
        {
          id: 'video-linux-4',
          title: 'Sécurité Linux avancée',
          description: 'SELinux, firewall, audit',
          videoId: '3yq4L5c9glE',
          duration: '3h 20min',
          views: 650000,
          likes: 28000,
          instructor: 'NetworkChuck'
        }
      ]
    },
    huawei: {
      debutant: [
        {
          id: 'video-huawei-1',
          title: 'Introduction aux réseaux Huawei',
          description: 'Découvrez l\'écosystème Huawei',
          videoId: 'q6o5pz3CgXc',
          duration: '2h',
          views: 450000,
          likes: 18000,
          instructor: 'Huawei Training'
        }
      ],
      intermediaire: [
        {
          id: 'video-huawei-2',
          title: 'Configuration avancée Huawei',
          description: 'Routage et switching avancés',
          videoId: 'YOUR_VIDEO_ID',
          duration: '3h',
          views: 320000,
          likes: 14000,
          instructor: 'Huawei Expert'
        }
      ],
      avance: [
        {
          id: 'video-huawei-3',
          title: 'Certification HCIP/HCIE',
          description: 'Préparation aux certifications avancées',
          videoId: 'YOUR_VIDEO_ID',
          duration: '5h',
          views: 280000,
          likes: 12000,
          instructor: 'Huawei Training'
        }
      ]
    },
    ia: {
      debutant: [
        {
          id: 'video-ia-1',
          title: 'Introduction à l\'Intelligence Artificielle',
          description: 'Concepts de base de l\'IA',
          videoId: 'JMUxmLyrhSk',
          duration: '5h 30min',
          views: 3200000,
          likes: 125000,
          instructor: 'freeCodeCamp'
        },
        {
          id: 'video-ia-2',
          title: 'Machine Learning pour débutants',
          description: 'Apprenez le ML de zéro',
          videoId: 'aircAruvnKk',
          duration: '4h',
          views: 2800000,
          likes: 110000,
          instructor: '3Blue1Brown'
        }
      ],
      intermediaire: [
        {
          id: 'video-ia-3',
          title: 'Deep Learning avec TensorFlow',
          description: 'Réseaux de neurones et TensorFlow',
          videoId: 'tPYj3fFJGjk',
          duration: '6h',
          views: 1900000,
          likes: 85000,
          instructor: 'freeCodeCamp'
        }
      ],
      avance: [
        {
          id: 'video-ia-4',
          title: 'Architectures Deep Learning avancées',
          description: 'CNN, RNN, Transformers',
          videoId: 'YOUR_VIDEO_ID',
          duration: '7h',
          views: 850000,
          likes: 42000,
          instructor: '3Blue1Brown'
        }
      ]
    },
    cisco: {
      debutant: [
        {
          id: 'video-cisco-1',
          title: 'CCNA - Introduction complète',
          description: 'Préparation à la certification CCNA',
          videoId: 'routetov6',
          duration: '10h',
          views: 1800000,
          likes: 72000,
          instructor: 'Jeremy\'s IT Lab'
        },
        {
          id: 'video-cisco-2',
          title: 'Configuration Cisco de base',
          description: 'Premiers pas avec les équipements Cisco',
          videoId: 'YOUR_VIDEO_ID',
          duration: '3h',
          views: 950000,
          likes: 38000,
          instructor: 'NetworkChuck'
        }
      ],
      intermediaire: [
        {
          id: 'video-cisco-3',
          title: 'Routage Cisco avancé',
          description: 'OSPF, EIGRP, BGP',
          videoId: 'YOUR_VIDEO_ID',
          duration: '5h',
          views: 720000,
          likes: 31000,
          instructor: 'Jeremy\'s IT Lab'
        }
      ],
      avance: [
        {
          id: 'video-cisco-4',
          title: 'CCNP - Préparation complète',
          description: 'Certification CCNP',
          videoId: 'YOUR_VIDEO_ID',
          duration: '15h',
          views: 580000,
          likes: 26000,
          instructor: 'Cisco Expert'
        }
      ]
    }
  }

  const videosData = computed(() => {
    const videos = {}
    
    coursesStore.domains.forEach(domain => {
      const domainKey = domain.name.toLowerCase()
      videos[domain.id] = {}
      
      coursesStore.levels.forEach(level => {
        const levelKey = level.id
        const domainVideos = youtubeVideos[domainKey] || {}
        const levelVideos = domainVideos[levelKey] || []
        
        videos[domain.id][level.id] = levelVideos.map(video => ({
          ...video,
          thumbnail: `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
          videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
          embedUrl: `https://www.youtube.com/embed/${video.videoId}`
        }))
      })
    })
    
    return videos
  })

  const filteredVideos = computed(() => {
    if (!selectedDomain.value || !selectedLevel.value) {
      return []
    }
    return videosData.value[selectedDomain.value]?.[selectedLevel.value] || []
  })

  // Vidéos pour le dashboard (extraits)
  const featuredVideos = computed(() => {
    const wantedTitles = [
      'Linux pour débutants - Tutoriel complet',
      'Administration système Linux',
      'Python : Variables et Types de données',
      'Python : Fonctions et Modules'
    ]

    const all = []
    Object.values(videosData.value).forEach(domainVideos => {
      Object.values(domainVideos).forEach(levelVideos => {
        all.push(...levelVideos)
      })
    })

    // Garder uniquement les 4 vidéos demandées, dans cet ordre
    const featured = []
    wantedTitles.forEach(title => {
      const video = all.find(v => v.title === title)
      if (video) {
        featured.push(video)
      }
    })

    return featured
  })

  function selectDomain(domainId) {
    selectedDomain.value = domainId
    selectedLevel.value = null
  }

  function selectLevel(levelId) {
    selectedLevel.value = levelId
  }

  // Mapper les niveaux pour correspondre aux clés du store
  function mapLevel(levelId) {
    const mapping = {
      'debutant': 'debutant',
      'intermediaire': 'intermediaire',
      'avance': 'avance',
      'easy': 'debutant',
      'intermediate': 'intermediaire',
      'advanced': 'avance'
    }
    return mapping[levelId] || levelId
  }

  return {
    selectedDomain,
    selectedLevel,
    filteredVideos,
    featuredVideos,
    videosData,
    selectDomain,
    selectLevel,
    mapLevel
  }
})
