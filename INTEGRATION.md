# 🔗 Intégration Frontend-Backend

## ✅ Configuration Complète

### 1. **Services API créés** (`/lib/api/`)

#### `config.ts`
- Configuration de base (URL API, endpoints)
- Gestion des headers (auth, content-type)
- Types TypeScript pour les réponses

#### `auth.ts`
- `login()` - Connexion utilisateur
- `register()` - Inscription
- `logout()` - Déconnexion
- `isAuthenticated()` - Vérifier si connecté
- `getCurrentUser()` - Obtenir utilisateur connecté

#### `census.ts`
- `createRecord()` - Créer un enregistrement
- `getAllRecords()` - Liste avec pagination/filtres
- `getRecordById()` - Récupérer par ID
- `updateRecord()` - Mettre à jour
- `deleteRecord()` - Supprimer
- `getStats()` - Statistiques
- `importRecords()` - Import en masse

### 2. **Configuration Environnement**

Fichier `.env.local` créé :
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. **Nouvelle Page de Login**

`/app/login/page.tsx` - Page moderne avec :
- ✅ Connexion à l'API backend
- ✅ Validation en temps réel
- ✅ Gestion des erreurs
- ✅ Messages de succès/erreur
- ✅ Loading states
- ✅ Remember me
- ✅ Design moderne et responsive

## 🚀 Utilisation

### Dans les composants :

```typescript
import { login, createRecord, getAllRecords, getStats } from '@/lib/api';

// Connexion
const result = await login({ email, password });
if (result.success) {
  // Redirection
  router.push('/dashboard');
}

// Créer un enregistrement
const record = await createRecord({
  lotNumber: 'A123',
  familyName: 'Dupont',
  responsibleName: 'Jean Dupont',
  contact: '+225 0123456789',
  inhabitants: 5,
  children: 2
});

// Récupérer les enregistrements avec pagination
const records = await getAllRecords({ page: 1, limit: 10 });

// Statistiques
const stats = await getStats();
```

## 📝 Prochaines Étapes

### Modifier les pages existantes :

1. **`/app/add_page/page.tsx`** - Utiliser `createRecord()`
2. **`/app/dashboard/page.tsx`** - Utiliser `getAllRecords()` et `getStats()`
3. **`/app/analytics/page.tsx`** - Utiliser `getStats()`
4. **`/app/import_page/page.tsx`** - Utiliser `importRecords()`

## 🧪 Test

1. **Démarrer le backend** :
```bash
cd census_backend
npm start
```

2. **Démarrer le frontend** :
```bash
cd census_app
npm run dev
```

3. **Tester la connexion** :
- Aller sur `http://localhost:3000/login`
- Email: `admin@census.gov`
- Password: `password123`

## 🔒 Sécurité

- ✅ Mots de passe hachés avec bcrypt
- ✅ Token sauvegardé dans sessionStorage
- ✅ Headers Authorization automatiques
- ✅ Validation côté frontend et backend

## 🛠️ Structure Finale

```
census_app/
├── lib/
│   └── api/
│       ├── config.ts      # Configuration API
│       ├── auth.ts        # Services auth
│       ├── census.ts      # Services census
│       └── index.ts       # Export global
├── app/
│   ├── login/
│   │   └── page.tsx       # ✅ Nouvelle page login
│   ├── add_page/
│   │   └── page.tsx       # À modifier
│   ├── dashboard/
│   │   └── page.tsx       # À modifier
│   ├── analytics/
│   │   └── page.tsx       # À modifier
│   └── import_page/
│       └── page.tsx       # À modifier
├── .env.local             # Configuration
└── .env.example          # Exemple config
```

Veux-tu que je modifie maintenant les autres pages pour utiliser l'API ? 🚀
