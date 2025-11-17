# 🔧 Corrections de la Base de Données

## 📋 Problèmes identifiés et corrigés

### 1. **Table `courses` - Niveaux incohérents**
   - ❌ **Avant** : `level` ENUM('beginner','intermediate','advanced') mais les données avaient `level = ''` (vide)
   - ✅ **Après** : `level` ENUM('beginner','intermediate','advanced') avec données correctes
   - ✅ **Ajouté** : Champs `description`, `duration`, `lessons` pour correspondre au frontend

### 2. **Table `questions` - Niveaux incohérents**
   - ❌ **Avant** : `level` VARCHAR(50) avec valeurs comme 'Debutant' (majuscule)
   - ✅ **Après** : `level` ENUM('easy','intermediate','advanced') standardisé
   - 📝 **Note** : Le frontend utilise 'easy' mais accepte aussi 'beginner' via mapping

### 3. **Table `quiz_results` - Niveaux incohérents**
   - ❌ **Avant** : `level` VARCHAR(50) avec valeurs variées
   - ✅ **Après** : `level` ENUM('easy','intermediate','advanced') standardisé
   - ✅ **Corrigé** : `score` changé de INT à DECIMAL(5,2) pour les pourcentages

### 4. **Table `domains` - Nom "IA"**
   - ✅ **Corrigé** : Utilisation de "Intelligence Artificielle" (le frontend accepte aussi "IA" via mapping)

## 🗂️ Fichiers créés

1. **`database_corrected.sql`** : Base de données complète et corrigée
2. **`backend_courses_endpoint.js`** : Endpoints backend pour les cours
3. **`CORRECTIONS_DATABASE.md`** : Ce document

## 📥 Installation

### Étape 1 : Importer la base de données corrigée
```bash
mysql -u root -p certification_platform < database_corrected.sql
```

### Étape 2 : Ajouter les endpoints backend
Copiez le contenu de `backend_courses_endpoint.js` dans votre fichier `server.js` ou `app.js`

## 🔄 Mapping des niveaux

### Frontend → Backend
- `debutant` → `beginner` ou `easy`
- `intermediaire` → `intermediate`
- `avance` → `advanced`

### Backend → Frontend
- `beginner` → `easy` / `debutant`
- `intermediate` → `intermediate` / `intermediaire`
- `advanced` → `advanced` / `avance`

## ✅ Vérifications

Après import, vérifiez que :
1. ✅ Les domaines s'affichent dans la page Cours
2. ✅ Les cours s'affichent selon le domaine et le niveau sélectionnés
3. ✅ Les questions s'affichent correctement dans les examens
4. ✅ Les résultats de quiz sont enregistrés avec les bons niveaux

## 📊 Structure des tables principales

### `courses`
- `id` : INT (PK)
- `domain_id` : INT (FK vers domains)
- `level` : ENUM('beginner','intermediate','advanced')
- `title` : VARCHAR(255)
- `description` : TEXT (nouveau)
- `content` : TEXT
- `duration` : VARCHAR(50) (nouveau)
- `lessons` : INT (nouveau)

### `questions`
- `id` : INT (PK)
- `domain_id` : INT (FK vers domains)
- `level` : ENUM('easy','intermediate','advanced')
- `question` : TEXT
- `option_a`, `option_b`, `option_c`, `option_d` : TEXT
- `correct_answer` : VARCHAR(5)
- `explanation` : TEXT

### `quiz_results`
- `id` : INT (PK)
- `user_id` : INT (FK vers users)
- `domain_id` : INT (FK vers domains)
- `level` : ENUM('easy','intermediate','advanced')
- `score` : DECIMAL(5,2) (corrigé de INT)
- `passed` : TINYINT(1)
- `certificate_url` : TEXT

## 🚀 Prochaines étapes

1. Importer `database_corrected.sql` dans votre MySQL
2. Ajouter les endpoints de `backend_courses_endpoint.js` à votre backend
3. Redémarrer votre serveur backend
4. Tester l'affichage des domaines et cours dans le frontend

