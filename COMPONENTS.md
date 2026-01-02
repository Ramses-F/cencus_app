# Census Data Platform - Component Architecture

## Structure des Composants

### Composants Réutilisables

#### `app/components/Sidebar.tsx`
Composant de navigation latérale partagé entre toutes les pages du dashboard.

**Fonctionnalités :**
- Navigation avec highlight de la page active
- Logo et branding
- Profil utilisateur avec initiales
- Bouton de déconnexion
- Responsive avec fermeture sur mobile
- Menu hamburger sur petits écrans

**Props :**
- `user`: Objet utilisateur (email, name, role, token)
- `isOpen`: État d'ouverture de la sidebar (boolean)
- `onClose`: Fonction de fermeture (callback)

**Navigation Items :**
- Dashboard (`/dashboard`)
- Add Record (`/add_page`)
- Import Data (`/import_page`)
- Population
- Households
- Regions
- Analytics
- Reports
- Settings

#### `app/components/DashboardLayout.tsx`
Layout wrapper qui gère l'authentification et la structure globale.

**Fonctionnalités :**
- Vérification automatique de l'authentification
- Chargement des icônes Lucide
- Gestion de l'état de la sidebar
- Overlay mobile pour fermer la sidebar
- Bouton hamburger responsive
- Loading state pendant la vérification auth
- Redirection automatique si non authentifié

**Usage :**
```tsx
import DashboardLayout from '../components/DashboardLayout';

export default function MyPage() {
    return (
        <DashboardLayout>
            {/* Votre contenu ici */}
        </DashboardLayout>
    );
}
```

### Pages Utilisant les Composants

#### `/dashboard`
Page principale du tableau de bord avec statistiques et activités récentes.

#### `/add_page`
Formulaire d'ajout de nouvelles entrées au recensement.

#### `/import_page`
Page d'importation en masse de données depuis des fichiers CSV ou Excel.

**Fonctionnalités :**
- Drag & drop de fichiers
- Support CSV, XLS, XLSX (max 10MB)
- Validation en temps réel des enregistrements
- Barre de progression pendant l'importation
- Statistiques détaillées (total, valides, invalides)
- Gestion des erreurs avec messages d'aide
- Interface responsive complète

## Architecture

```
app/
├── components/
│   ├── Sidebar.tsx          # Navigation latérale réutilisable
│   └── DashboardLayout.tsx  # Layout avec auth et structure
├── dashboard/
│   └── page.tsx            # Page dashboard (utilise DashboardLayout)
├── add_page/
│   └── page.tsx            # Page formulaire (utilise DashboardLayout)
├── import_page/
│   └── page.tsx            # Page d'importation CSV/Excel (utilise DashboardLayout)
├── page.tsx                # Page de login
├── layout.tsx              # Root layout
└── globals.css             # Styles globaux
```

## Avantages de cette Architecture

1. **DRY (Don't Repeat Yourself)** : Le code de la sidebar et du layout n'est écrit qu'une seule fois
2. **Maintenance Facile** : Modifier la sidebar ou le menu se fait en un seul endroit
3. **Cohérence** : Toutes les pages partagent la même navigation et structure
4. **Responsive** : Comportement mobile géré centralement
5. **Sécurité** : Vérification d'authentification centralisée dans DashboardLayout

## Ajouter une Nouvelle Page

Pour créer une nouvelle page utilisant le layout commun :

```tsx
'use client';

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function MyNewPage() {
    return (
        <DashboardLayout>
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Titre de Ma Page
                    </h2>
                </div>
            </header>

            <div className="p-4 sm:p-6 lg:px-8">
                {/* Votre contenu ici */}
            </div>
        </DashboardLayout>
    );
}
```

## Personnalisation

### Modifier le Menu de Navigation

Éditez `app/components/Sidebar.tsx` et modifiez le tableau `navItems` :

```tsx
const navItems = [
    { href: '/dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { href: '/ma-nouvelle-page', icon: 'star', label: 'Ma Page' },
    // ... autres items
];
```

### Modifier le Style de la Sidebar

Les classes Tailwind dans `Sidebar.tsx` peuvent être modifiées pour changer :
- Largeur : `w-64` (actuellement 16rem)
- Couleurs : `bg-white`, gradients, etc.
- Animations : `transition-transform duration-300`

## Technologies Utilisées

- **Next.js 16** : Framework React
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling utilitaire
- **Lucide Icons** : Bibliothèque d'icônes
- **React Hooks** : useState, useEffect, useRouter
