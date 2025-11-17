# Plateforme de Certification - Frontend

Application Vue.js pour la préparation aux certifications (Python, Linux, Huawei, IA, Cisco).

## 🚀 Configuration

### 1. Installation des dépendances

```sh
npm install
```

### 2. Configuration de l'API

Créez un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:3000
```

**Note :** Assurez-vous que votre backend Express est démarré sur le port 3000 (ou modifiez l'URL selon votre configuration).

### 3. Démarrage du serveur de développement

```sh
npm run dev
```

L'application sera accessible sur `http://localhost:5173` (ou le port indiqué par Vite).

## 📋 Fonctionnalités

### Authentification
- ✅ Connexion (email/password)
- ✅ Inscription (prénom, nom, email, password)
- ✅ Mot de passe oublié (interface prête)
- ✅ Gestion de session avec localStorage

### Tableau de bord
- ✅ Statistiques utilisateur
- ✅ Tableau statistique par domaine
- ✅ Graphique d'activité hebdomadaire
- ✅ Activité récente
- ✅ Navigation vers toutes les sections

### Cours
- ✅ Sélection de domaine et niveau
- ✅ Affichage des cours disponibles
- ✅ Navigation intuitive

### Quiz
- ✅ Sélection domaine/niveau
- ✅ Questions à choix multiples
- ✅ Calcul automatique du score
- ✅ Enregistrement des résultats
- ✅ Affichage des résultats avec explications

### Chat
- ✅ Liste des conversations
- ✅ Envoi/réception de messages
- ✅ Interface style Messenger
- ✅ Groupement par utilisateur

### Vidéos
- ✅ Navigation par domaine/niveau
- ✅ Grille de vidéos avec métadonnées

### Duels
- ✅ Création de duels
- ✅ Liste des duels disponibles
- ✅ Interface pour rejoindre/voir les détails

### Administration (Admin uniquement)
- ✅ Gestion des domaines (création)
- ✅ Gestion des questions (création)
- ✅ Gestion des utilisateurs (visualisation)
- ✅ Interface complète avec onglets

## 🔌 Connexion Backend

Le frontend est entièrement connecté au backend Express fourni. Toutes les routes API sont utilisées :

- `/api/users` - Authentification
- `/api/domains` - Domaines
- `/api/questions` - Questions de quiz
- `/api/results` - Résultats de quiz
- `/api/chats` - Messages
- `/api/duels` - Duels
- `/api/notifications` - Notifications
- `/api/leaderboards` - Classements
- `/api/user_stats` - Statistiques utilisateur

## 📁 Structure du projet

```
src/
├── services/
│   └── api.js          # Service API centralisé
├── stores/
│   ├── auth.js         # Store authentification
│   ├── courses.js      # Store cours/domaines
│   ├── quiz.js         # Store quiz
│   ├── chat.js         # Store chat
│   ├── videos.js       # Store vidéos
│   └── stats.js        # Store statistiques
├── views/
│   ├── LoginView.vue   # Page de connexion
│   ├── DashboardView.vue # Tableau de bord
│   ├── CoursesView.vue # Page des cours
│   ├── QuizView.vue    # Page quiz
│   ├── ChatView.vue    # Page chat
│   ├── VideosView.vue  # Page vidéos
│   ├── DuelsView.vue   # Page duels
│   └── AdminView.vue   # Panneau admin
└── router/
    └── index.js        # Configuration des routes
```

## 🔐 Rôles utilisateur

- **User** : Accès à toutes les fonctionnalités sauf l'administration
- **Admin** : Accès complet, y compris le panneau d'administration

Le rôle est déterminé par le champ `role` dans la base de données (valeur par défaut : `'user'`).

## 🛠️ Commandes disponibles

```sh
# Développement
npm run dev

# Build production
npm run build

# Linter
npm run lint

# Formatage
npm run format
```

## ⚠️ Notes importantes

1. **Backend requis** : Assurez-vous que votre backend Express est démarré et accessible
2. **CORS** : Le backend doit autoriser les requêtes depuis `http://localhost:5173`
3. **Base de données** : Vérifiez que MySQL est configuré et que les tables existent
4. **Variables d'environnement** : Créez le fichier `.env` avec `VITE_API_URL`

## 🎨 Design

- Design professionnel et épuré
- Interface responsive (mobile/desktop)
- Animations et transitions fluides
- Palette de couleurs cohérente

## 📝 TODO / Améliorations futures

- [ ] Implémenter la réinitialisation de mot de passe
- [ ] Ajouter la fonctionnalité de recherche
- [ ] Implémenter les notifications en temps réel
- [ ] Ajouter les leaderboards complets
- [ ] Améliorer la gestion des duels (participation, résultats)
- [ ] Ajouter la lecture vidéo intégrée
- [ ] Implémenter les commentaires de cours
