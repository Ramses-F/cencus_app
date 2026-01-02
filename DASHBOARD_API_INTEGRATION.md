# 📊 Dashboard - Intégration des APIs

## Vue d'ensemble

Le dashboard a été connecté aux APIs backend pour afficher des données réelles en temps réel.

## 🔗 APIs Intégrées

### 1. `getStats()` - Statistiques du recensement

```typescript
const response = await getStats();
```

**Données récupérées :**
- `totalRecords` : Nombre total de ménages recensés
- `totalInhabitants` : Nombre total d'habitants
- `totalChildren` : Nombre total d'enfants/jeunes

**Affichage :**
- Carte "Total des Ménages"
- Carte "Total des Habitants"
- Carte "Jeunesse (moins de 18 ans)"

### 2. `getAllRecords()` - Enregistrements récents

```typescript
const response = await getAllRecords({ page: 1, limit: 5 });
```

**Données récupérées :**
- `_id` : Identifiant unique
- `familyName` : Nom de famille
- `lotNumber` : Numéro de lot
- `inhabitants` : Nombre d'habitants
- `createdAt` : Date de création

**Affichage :**
- Section "Activité Récente"
- Liste des 5 derniers enregistrements
- Calcul automatique du temps écoulé

## 📝 Fonctionnalités Ajoutées

### Chargement des Données

```typescript
useEffect(() => {
    loadStats();
    loadRecentRecords();
}, []);
```

Les données sont chargées automatiquement au montage du composant.

### Actualisation Manuelle

```typescript
const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadRecentRecords()]);
    displayToast('success', 'Actualisé', 'Les données ont été mises à jour.');
};
```

L'utilisateur peut actualiser les données via le bouton refresh.

### Calcul du Temps Écoulé

```typescript
const getTimeAgo = (date: Date) => {
    // Retourne : "à l'instant", "il y a X minutes", etc.
};
```

Conversion automatique des dates en format lisible.

## 🎨 États de l'Interface

### État de Chargement

```tsx
{loading && (
    <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Chargement des données...</p>
    </div>
)}
```

Indicateur visuel pendant les requêtes API.

### État Vide

```tsx
{activities.length === 0 && (
    <div className="text-center py-8 text-gray-500">
        <p>Aucune activité récente</p>
    </div>
)}
```

Message si aucun enregistrement n'est trouvé.

### Gestion des Erreurs

```typescript
try {
    await loadStats();
} catch (error) {
    displayToast('error', 'Erreur', 'Impossible de charger les statistiques');
}
```

Notifications toast en cas d'erreur.

## 🔍 Logs de Debug

Console du navigateur (F12) :

```
📊 Chargement des statistiques...
✅ Statistiques reçues: {totalRecords: 10, totalInhabitants: 45, ...}
📝 Chargement des enregistrements récents...
✅ Enregistrements reçus: [{...}, {...}, ...]
```

## 📊 Format des Données

### Statistiques

```typescript
interface Stats {
    households: number;        // totalRecords
    householdsChange: number;  // % de changement (fixe pour l'instant)
    inhabitants: number;       // totalInhabitants
    inhabitantsChange: number; // % de changement
    youth: number;            // totalChildren
    youthChange: number;      // % de changement
    regions: number;          // Nombre de régions (fixe)
}
```

### Activités

```typescript
interface Activity {
    id: string;              // _id de l'enregistrement
    type: string;           // Type d'activité ('add', 'update', etc.)
    icon: string;           // Icône Lucide
    iconColor: string;      // Couleur de l'icône
    title: string;          // Titre de l'activité
    description: string;    // Description détaillée
    timestamp: string;      // Date ISO
    timeAgo: string;        // "il y a X minutes"
}
```

## 🚀 Prochaines Améliorations

- [ ] Calcul réel des pourcentages de changement (comparaison avec période précédente)
- [ ] Filtres par date/région dans les activités récentes
- [ ] Graphiques de tendances
- [ ] Actualisation automatique toutes les X minutes
- [ ] WebSocket pour les mises à jour en temps réel
- [ ] Cache des données pour optimiser les performances

## 🧪 Tests

### Test Manuel

1. Démarrer le backend : `cd census_backend && node server.js`
2. Démarrer le frontend : `cd census_app && npm run dev`
3. Se connecter : `admin@census.gov` / `password123`
4. Vérifier les statistiques s'affichent
5. Vérifier les activités récentes s'affichent
6. Cliquer sur "Actualiser" et vérifier le toast

### Vérifier les APIs

```bash
# Test de l'API stats
curl http://localhost:5000/api/census/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test de l'API records
curl "http://localhost:5000/api/census/records?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 Documentation Associée

- `/census_backend/API_DOCUMENTATION.md` - Documentation complète de l'API
- `/census_app/lib/api/census.ts` - Services API frontend
- `/census_app/lib/api/config.ts` - Configuration API

---

**Date de création** : 2 janvier 2026  
**Version** : 1.0.0  
**Auteur** : GitHub Copilot
