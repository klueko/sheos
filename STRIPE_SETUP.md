# Configuration Stripe pour Sheos

## 🚀 Configuration Rapide

### 1. Créer un compte Stripe
- Allez sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
- Créez votre compte Stripe

### 2. Obtenir les clés API
- Connectez-vous au [dashboard Stripe](https://dashboard.stripe.com/test/apikeys)
- Copiez votre **Secret key** (commence par `sk_test_`)
- Copiez votre **Publishable key** (commence par `pk_test_`)

### 3. Configurer les variables d'environnement
Créez un fichier `.env` à la racine du projet :

```env
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici

# Database
DATABASE_URL=./data/sheos.db

# App
NODE_ENV=development
```

### 4. Redémarrer le serveur
```bash
npm run dev
```

## 🧪 Mode Test Actuel

Si Stripe n'est pas configuré, l'application fonctionne en **mode test** :
- ✅ Pas d'erreur "Internal Server Error"
- ✅ Simulation du paiement réussi
- ✅ Redirection vers la page de succès
- ⚠️ Avertissement visible sur la page de checkout

## 💳 Cartes de Test Stripe

Une fois Stripe configuré, vous pouvez utiliser ces cartes de test :

### Paiement Réussi
- **Numéro** : `4242 4242 4242 4242`
- **Date** : N'importe quelle date future
- **CVC** : N'importe quel code à 3 chiffres

### Paiement Refusé
- **Numéro** : `4000 0000 0000 0002`
- **Date** : N'importe quelle date future
- **CVC** : N'importe quel code à 3 chiffres

## 🔧 Dépannage

### Erreur "Internal Server Error"
- ✅ **Résolu** : Messages d'erreur détaillés ajoutés
- ✅ **Résolu** : Mode test automatique si Stripe non configuré

### Erreur "Stripe not configured"
- Vérifiez que le fichier `.env` existe
- Vérifiez que les clés commencent par `sk_test_` et `pk_test_`
- Redémarrez le serveur après modification du `.env`

### Erreur "Authentication required"
- Assurez-vous d'être connecté
- Vérifiez que votre session est valide

## 📱 Webhooks (Optionnel)

Pour la production, configurez les webhooks Stripe :
- URL : `https://votre-domaine.com/api/webhooks/stripe`
- Événements : `checkout.session.completed`, `payment_intent.succeeded`

## 🚀 Passage en Production

1. Remplacez les clés de test par les clés de production
2. Configurez les webhooks
3. Testez avec de vrais petits montants
4. Mettez à jour les URLs de succès/annulation
