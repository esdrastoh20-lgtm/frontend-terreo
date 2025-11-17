<template>
  <div class="privacy-page">
    <div class="privacy-card">
      <h1>Politique de confidentialité & Conditions d'utilisation</h1>
      <p class="intro">
        Merci de faire confiance à IT Learning Academy. Avant d'utiliser la plateforme,
        veuillez lire attentivement ces informations et confirmer que vous les acceptez.
      </p>

      <div class="privacy-content">
        <h2>1. Données collectées</h2>
        <p>
          Nous collectons les informations que vous fournissez lors de votre inscription
          (nom, prénom, adresse e-mail, mot de passe) ainsi que vos résultats aux examens
          et quiz afin de suivre votre progression et générer vos attestations.
        </p>

        <h2>2. Utilisation des données</h2>
        <p>
          Vos données sont utilisées uniquement pour :
        </p>
        <ul>
          <li>Gérer votre compte et votre accès à la plateforme ;</li>
          <li>Enregistrer vos résultats et générer des attestations ;</li>
          <li>Améliorer nos contenus de formation.</li>
        </ul>

        <h2>3. Confidentialité & sécurité</h2>
        <p>
          Vos informations ne sont jamais revendues. Nous mettons en place des mesures
          raisonnables pour protéger vos données et vos identifiants. Vous restez
          responsable de la confidentialité de votre mot de passe.
        </p>

        <h2>4. Vos droits</h2>
        <p>
          Vous pouvez demander la modification ou la suppression de votre compte en
          contactant le support de la plateforme.
        </p>

        <h2>5. Acceptation</h2>
        <p>
          En cochant la case ci-dessous et en cliquant sur "J'accepte", vous confirmez
          avoir lu et accepté cette politique de confidentialité et ces conditions
          d'utilisation.
        </p>
      </div>

      <div class="privacy-accept">
        <label class="checkbox-label">
          <input type="checkbox" v-model="accepted" />
          <span>J'ai lu et j'accepte la politique de confidentialité et les conditions d'utilisation.</span>
        </label>

        <div class="actions">
          <button class="btn-secondary" @click="goBack">Retour à la connexion</button>
          <button
            class="btn-primary"
            :disabled="!accepted"
            @click="acceptAndContinue"
          >
            J'accepte
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const accepted = ref(false)

const acceptAndContinue = () => {
  localStorage.setItem('privacyAccepted', 'true')
  router.push('/dashboard')
}

const goBack = () => {
  router.push('/login')
}
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.privacy-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.privacy-card h1 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #111827;
}

.intro {
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.privacy-content {
  max-height: 380px;
  overflow-y: auto;
  padding-right: 1rem;
  margin-bottom: 1.5rem;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.privacy-content h2 {
  font-size: 1.1rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.privacy-content p {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
}

.privacy-content ul {
  margin-left: 1.25rem;
  color: #4b5563;
}

.privacy-accept {
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 1rem;
}

.checkbox-label input {
  margin-top: 0.15rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #111827;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>
