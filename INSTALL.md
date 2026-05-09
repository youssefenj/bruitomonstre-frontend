# 🚀 BruitoMonstre — Installation Frontend Next.js

## Stack utilisée
- ⚛️ **Next.js 14** (App Router)
- 🎨 **Tailwind CSS** + design system custom
- 🧩 **shadcn/ui** (Button, Card, Badge, Input — implémentés manuellement)
- 🎬 **Framer Motion** — toutes les animations
- 🎮 **Three.js** + @react-three/fiber — Monstre 3D

---

## ⚡ Installation rapide

```bash
# 1. Aller dans le dossier frontend
cd frontend

# 2. Installer les dépendances (utilise --legacy-peer-deps pour Three.js)
npm install --legacy-peer-deps

# 3. Lancer le serveur de dev
npm run dev
```

L'application tourne sur **http://localhost:3000**

> ⚠️ Le backend FastAPI doit tourner sur **http://localhost:8000**

---

## 📁 Structure du projet

```
frontend/
├── app/                        ← Next.js App Router
│   ├── layout.js               ← Layout global + fonts
│   ├── page.js                 ← Point d'entrée (Login)
│   └── globals.css             ← Styles globaux + design tokens
│
├── components/
│   ├── AppRoot.jsx             ← Routeur principal (Login → Prof/Dir)
│   ├── Login.jsx               ← Page de connexion animée
│   ├── ProfesseurLayout.jsx    ← Sidebar + navigation professeur
│   ├── DirecteurLayout.jsx     ← Sidebar + navigation directeur
│   │
│   ├── surveillance/
│   │   ├── SurveillancePanel.jsx   ← Panel principal temps réel
│   │   ├── DbMeter.jsx             ← Jauge dB avec gradient
│   │   └── Monster.jsx             ← Mascotte animée Framer Motion
│   │
│   ├── eleves/
│   │   ├── ElevesPanel.jsx         ← Liste élèves avec search
│   │   └── InscriptionModal.jsx    ← Modal inscription + enregistrement voix
│   │
│   ├── stats/
│   │   └── StatsPanel.jsx          ← Statistiques avec graphiques
│   │
│   ├── journal/
│   │   └── JournalPanel.jsx        ← Historique des alertes
│   │
│   ├── directeur/
│   │   ├── Dashboard.jsx           ← Vue d'ensemble directeur
│   │   ├── ScoresPanel.jsx         ← Classement classes
│   │   ├── AlertesPanel.jsx        ← Journal global toutes classes
│   │   └── Recompenses.jsx         ← Attribution récompenses + confettis
│   │
│   └── ui/                         ← Composants shadcn/ui custom
│       ├── button.jsx
│       ├── card.jsx
│       ├── badge.jsx
│       └── input.jsx
│
├── lib/
│   ├── api.js                  ← Appels HTTP (axios → FastAPI)
│   ├── socket.js               ← Client Socket.IO
│   └── utils.js                ← Helpers (cn, formatTime, etc.)
│
├── public/
│   └── workers/
│       └── audio-processor.worklet.js  ← AudioWorklet micro
│
├── next.config.js              ← Config Next.js + proxy backend
├── tailwind.config.js          ← Design tokens + couleurs
└── package.json                ← Dépendances
```

---

## 🔑 Comptes de démo

| Rôle | Identifiant | Mot de passe |
|------|------------|--------------|
| Professeur | `PROF-2024-001` | `Roux#4521` |
| Directeur | `directeur` | `dir2025` |

---

## 🛠️ Scripts disponibles

```bash
npm run dev      # Dev sur http://localhost:3000
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Lint ESLint
```

---

## 🎨 Design System

Le design utilise un thème sombre premium avec :
- **Background** : `#0A0F1E` (navy profond)
- **Surface** : `#111827`
- **Primary** : `#6366F1` (indigo)
- **Success** : `#10B981` (émeraude)
- **Warning** : `#F59E0B` (ambre)
- **Danger** : `#EF4444` (rouge)
- **Glassmorphism** via la classe `.glass`
- **Animations** Framer Motion sur toutes les pages
