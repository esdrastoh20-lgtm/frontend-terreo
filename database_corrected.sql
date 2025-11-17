-- ========================================
-- BASE DE DONNÉES CORRIGÉE ET COHÉRENTE
-- Certification Platform Database
-- Version corrigée - Cohérente avec le frontend
-- ========================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ========================================
-- SUPPRESSION DES TABLES EXISTANTES
-- ========================================

DROP TABLE IF EXISTS `chats`;
DROP TABLE IF EXISTS `course_comments`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `duel_results`;
DROP TABLE IF EXISTS `duels`;
DROP TABLE IF EXISTS `leaderboards`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `quiz_results`;
DROP TABLE IF EXISTS `search_index`;
DROP TABLE IF EXISTS `user_stats`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `domains`;

-- ========================================
-- TABLE: domains
-- ========================================

CREATE TABLE `domains` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: users
-- ========================================

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(191) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(191) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_general_ci DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: courses
-- CORRIGÉ: level standardisé sur 'beginner', 'intermediate', 'advanced'
-- AJOUTÉ: description, duration, lessons pour correspondre au frontend
-- ========================================

CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `domain_id` int NOT NULL,
  `level` enum('beginner','intermediate','advanced') COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `content` text COLLATE utf8mb4_general_ci NOT NULL,
  `duration` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lessons` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `domain_id` (`domain_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: questions
-- CORRIGÉ: level standardisé sur 'easy', 'intermediate', 'advanced'
-- (le frontend utilise 'easy' mais accepte aussi 'beginner')
-- ========================================

CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `domain_id` int NOT NULL,
  `level` enum('easy','intermediate','advanced') COLLATE utf8mb4_general_ci NOT NULL,
  `question` text COLLATE utf8mb4_general_ci NOT NULL,
  `option_a` text COLLATE utf8mb4_general_ci,
  `option_b` text COLLATE utf8mb4_general_ci,
  `option_c` text COLLATE utf8mb4_general_ci,
  `option_d` text COLLATE utf8mb4_general_ci,
  `option_e` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correct_answer` varchar(5) COLLATE utf8mb4_general_ci NOT NULL,
  `explanation` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  KEY `domain_id` (`domain_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: quiz_results
-- CORRIGÉ: level standardisé sur 'easy', 'intermediate', 'advanced'
-- ========================================

CREATE TABLE `quiz_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `domain_id` int NOT NULL,
  `level` enum('easy','intermediate','advanced') COLLATE utf8mb4_general_ci NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `time_spent` int DEFAULT NULL,
  `passed` tinyint(1) NOT NULL,
  `answers` text COLLATE utf8mb4_general_ci,
  `certificate_url` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `domain_id` (`domain_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: chats
-- ========================================

CREATE TABLE `chats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `message` text COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: course_comments
-- ========================================

CREATE TABLE `course_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `comment` text COLLATE utf8mb4_general_ci NOT NULL,
  `rating` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `course_id` (`course_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: duels
-- ========================================

CREATE TABLE `duels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `initiator_id` int NOT NULL,
  `participant1_id` int DEFAULT NULL,
  `participant2_id` int DEFAULT NULL,
  `participant3_id` int DEFAULT NULL,
  `participant4_id` int DEFAULT NULL,
  `status` enum('pending','active','finished') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `winner_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `initiator_id` (`initiator_id`),
  KEY `participant1_id` (`participant1_id`),
  KEY `participant2_id` (`participant2_id`),
  KEY `participant3_id` (`participant3_id`),
  KEY `participant4_id` (`participant4_id`),
  KEY `winner_id` (`winner_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: duel_results
-- ========================================

CREATE TABLE `duel_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `duel_id` int NOT NULL,
  `participant_id` int NOT NULL,
  `score` int DEFAULT '0',
  `time_spent` int DEFAULT '0',
  `result` enum('win','lose','draw') COLLATE utf8mb4_general_ci DEFAULT 'draw',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `duel_id` (`duel_id`),
  KEY `participant_id` (`participant_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: notifications
-- ========================================

CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('chat','duel','course','quiz') COLLATE utf8mb4_general_ci NOT NULL,
  `message` text COLLATE utf8mb4_general_ci NOT NULL,
  `read_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: leaderboards
-- ========================================

CREATE TABLE `leaderboards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `domain_id` int DEFAULT NULL,
  `total_score` int DEFAULT '0',
  `user_rank` int DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `domain_id` (`domain_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: user_stats
-- ========================================

CREATE TABLE `user_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `domain_id` int DEFAULT NULL,
  `total_quiz_taken` int DEFAULT '0',
  `total_quiz_passed` int DEFAULT '0',
  `average_score` decimal(5,2) DEFAULT '0.00',
  `time_spent` int DEFAULT '0',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `domain_id` (`domain_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- TABLE: search_index
-- ========================================

CREATE TABLE `search_index` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entity_type` enum('course','question','domain') COLLATE utf8mb4_general_ci NOT NULL,
  `entity_id` int NOT NULL,
  `keywords` text COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_keywords` (`keywords`(250))
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- DONNÉES DE BASE
-- ========================================

-- Domaines (cohérents avec le frontend)
INSERT INTO `domains` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Python', 'Cours et exercices sur Python', NOW()),
(2, 'Linux', 'Tout sur l\'utilisation et l\'administration de Linux', NOW()),
(3, 'Cisco', 'Réseaux et configurations Cisco', NOW()),
(4, 'Huawei', 'Réseaux et équipements Huawei', NOW()),
(5, 'Intelligence Artificielle', 'Intelligence Artificielle et apprentissage automatique', NOW());

-- Note: Le frontend accepte aussi "IA" mais utilise "Intelligence Artificielle" pour le mapping

-- Utilisateurs de test
INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'esdras', 'TOH', 'toh27@gmail.com', 'nevrose27', 'user', NOW()),
(2, 'Admin', 'Admin', 'admin@example.com', 'admin123', 'admin', NOW());

-- Cours Linux (exemples avec level correct)
INSERT INTO `courses` (`id`, `domain_id`, `level`, `title`, `description`, `content`, `duration`, `lessons`, `created_at`) VALUES
(1, 2, 'beginner', 'Introduction à Linux', 
 'Apprenez les bases de Linux : navigation, commandes essentielles, gestion des fichiers',
 'Linux est un système d\'exploitation open-source basé sur Unix. Il est utilisé pour les serveurs, le développement et les systèmes embarqués.\r\n\r\nStructure des fichiers :\r\n- / : racine\r\n- /home : répertoires des utilisateurs\r\n- /etc : fichiers de configuration\r\n- /var : fichiers variables (logs, mails)\r\n- /bin et /usr/bin : commandes et programmes\r\n\r\nCommandes de navigation et gestion des fichiers :\r\n- ls : lister les fichiers\r\n- cd : changer de répertoire\r\n- pwd : afficher le chemin courant\r\n- mkdir : créer un répertoire\r\n- rm : supprimer un fichier\r\n- cp : copier un fichier\r\n- mv : déplacer ou renommer un fichier\r\n- touch : créer un fichier vide\r\n- cat, head, tail : afficher le contenu des fichiers\r\n\r\nGestion des utilisateurs :\r\n- whoami : utilisateur courant\r\n- id : UID et GID\r\n- passwd : changer mot de passe\r\n\r\nPermissions :\r\n- ls -l : voir les permissions\r\n- chmod : modifier les permissions\r\n- chown : changer propriétaire\r\n\r\nGestion des paquets (Ubuntu/Debian) :\r\n- apt update : mettre à jour la liste des paquets\r\n- apt install : installer un paquet\r\n- apt upgrade : mettre à jour les paquets installés\r\n\r\nRéseau de base :\r\n- ping : tester la connectivité\r\n- ifconfig : voir l\'adresse IP\r\n- ssh user@ip : se connecter à un serveur\r\n\r\nAstuces utiles :\r\n- history : historique des commandes\r\n- clear : nettoyer l\'écran\r\n- uname -a : informations système',
 '4h', 12, NOW()),

(2, 2, 'intermediate', 'Linux Intermédiaire',
 'Approfondissez vos connaissances Linux : scripts, services, réseau avancé',
 'Redirections et Pipes :\r\n- > : redirige la sortie vers un fichier (écrase)\r\n- >> : ajoute la sortie à un fichier\r\n- < : redirige l\'entrée depuis un fichier\r\n- | : pipe, envoie la sortie d\'une commande vers une autre\r\n\r\nFiltres et traitement de texte :\r\n- grep : rechercher un mot\r\n- awk : manipuler les colonnes\r\n- sed : remplacer du texte\r\n- uniq, sort, cut : trier, filtrer, extraire\r\n\r\nGestion avancée des utilisateurs et groupes :\r\n- /etc/passwd : informations des utilisateurs\r\n- /etc/shadow : mots de passe chiffrés\r\n- adduser, userdel, usermod -aG : gérer comptes et groupes\r\n\r\nServices et processus :\r\n- systemctl start/stop/status : gérer les services\r\n- pstree : visualiser les processus hiérarchiquement\r\n- bg, fg : gérer tâches en arrière-plan\r\n\r\nPlanification des tâches :\r\n- crontab -e : éditer tâches planifiées\r\n- crontab -l : lister tâches\r\n- at : exécuter tâche ponctuelle\r\n\r\nRéseau :\r\n- ip addr, route -n : interfaces et route\r\n- ss -tuln : connexions réseau\r\n- nslookup : tester DNS\r\n- traceroute : tracer chemin réseau\r\n\r\nSystème et stockage :\r\n- df, du -sh : espace disque\r\n- mount, umount : monter/démonter disque\r\n- LVM : pvcreate, vgcreate, lvcreate\r\n\r\nShell scripting :\r\n- Variables : VAR=$(commande)\r\n- Boucles : for, while, terminées par done\r\n- Gestion erreurs : trap\r\n- Débogage : bash -x script.sh',
 '6h', 18, NOW()),

(3, 2, 'advanced', 'Linux Avancé',
 'Maîtrisez Linux : sécurité, virtualisation, kernel, monitoring',
 'Sécurité et gestion utilisateurs :\r\n- /etc/sudoers : privilèges sudo\r\n- faillog : tentatives de connexion échouées\r\n- usermod -L user : verrouiller compte\r\n- fail2ban : protection SSH\r\n- ufw : configuration firewall simplifiée\r\n\r\nRéseau avancé :\r\n- tcpdump : capturer trafic réseau\r\n- nmap : scanner ports\r\n- rsync : transfert fiable de fichiers\r\n- ssh -L : transfert de ports locaux\r\n- iperf : tester bande passante\r\n\r\nSystèmes de fichiers & stockage avancé :\r\n- lsblk -f : type FS\r\n- LVM : pvcreate, vgcreate, lvcreate\r\n- resize2fs : redimensionner FS\r\n- /etc/fstab : montage automatique\r\n\r\nProcessus & performance :\r\n- renice, nice : priorité processus\r\n- SIGKILL : terminer immédiatement\r\n- iotop : usage disque par processus\r\n- vmstat : statistiques CPU/mémoire\r\n\r\nScripting & automatisation avancé :\r\n- Variables : VAR=$(commande)\r\n- Boucles et conditionnelles avancées\r\n- trap, set -e, débogage bash -x\r\n\r\nVirtualisation & conteneurs :\r\n- Docker : docker ps, docker pull, docker run -d\r\n- KVM/QEMU : virsh list, virsh snapshot-create-as\r\n\r\nKernel & compilation :\r\n- make : compiler à partir de Makefile\r\n- modprobe, lsmod, rmmod : gérer modules kernel\r\n- /proc/sys : paramètres modifiables à chaud\r\n\r\nMonitoring & logs :\r\n- journalctl -f : logs en temps réel\r\n- last, who : connexions\r\n- quota : usage disque par utilisateur\r\n- lsof -p PID : fichiers ouverts par processus\r\n\r\nDivers & optimisation :\r\n- xz : compression avancée\r\n- time : mesurer performances commandes\r\n- locate, which : rechercher fichiers et exécutables\r\n- ldd, strace, ltrace : analyser programmes',
 '10h', 25, NOW());

-- Questions d'exemple (avec level standardisé)
INSERT INTO `questions` (`id`, `domain_id`, `level`, `question`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `explanation`) VALUES
(1, 2, 'easy', 'Quelle commande affiche la liste des fichiers dans un répertoire ?', 'cd', 'ls', 'pwd', 'cat', 'option_b', 'La commande ls liste les fichiers dans le répertoire courant.');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

