
# Vennflow Web Tool – Design & Interactions (Enrichi)

## Overview
Ce document détaille tous les flux, interactions, et fonctionnalités du tool Vennflow, incluant la gestion des box, des installateurs, des statuts, et tous les endpoints backend/frontend.

---

## 1. Login Page
- Saisie des identifiants
- Accès par rôle : installateur, opérateur, support, client, partenaire
- Redirection vers dashboard selon rôle

---

## 2. Dashboard
- Affiche le rôle, les actions rapides
- Navigation : gestion des box, gestion des installateurs, gestion des statuts, gestion des tokens

---

## 3. Gestion des Box
- Saisie du numéro de série Peplink
- Actions :
  - Assigner port
  - Voir statut (API `/router-status`)
  - Forcer statut logique (`/force-status`)
  - Activer box (`/activate-device`)
  - Réinitialiser statut (`/reset-device-status`)
- Affichage :
  - Statut online/offline
  - IP WAN/LAN/VLAN
  - Statut cellulaire
  - Statut logique (active, to be deployed, etc)
  - Localisation (latitude/longitude)
  - Historique des statuts

---

## 4. Gestion des Installateurs
- Liste des installateurs
- Ajout/suppression/modification
- Attribution de box à un installateur
- Suivi des interventions
- Statut d'installation (en cours, terminée, à planifier)

---

## 5. Gestion des Statuts
- Changement de statut logique pour chaque box
- Historique des changements
- Statuts possibles : active, to be deployed, en panne, en maintenance
- Actions groupées sur plusieurs box

---

## 6. Token Management
- Affichage du token, refresh token, expiry
- Refresh manuel et automatique
- Historique des tokens

---

## 7. Support Agent Interface
- Sélection des endpoints Peplink
- Actions API sur la box
- Affichage des réponses et erreurs
- Gestion automatique du refresh token sur access denied

---

## 8. Admin Panel
- Gestion des valeurs .env
- Automatisation des mises à jour
- Logs et erreurs

---

## 9. Error Handling
- Gestion des erreurs d'accès, de code, de valeurs manquantes
- Affichage des messages clairs

---

## 10. Navigation & UX
- Sidebar par rôle
- Accès conditionnel aux pages
- Indicateurs de statut et erreurs

---

## 11. API Interactions
- Frontend appelle les endpoints backend pour toutes les actions
- Backend gère le cycle de vie des tokens, la gestion des box, des installateurs, des statuts

---

## 12. Extensions Futures
- Multi-box management
- Audit log
- Notifications
- Statistiques d'installation

---

*Ce fichier doit être mis à jour à chaque ajout de fonctionnalité.*
