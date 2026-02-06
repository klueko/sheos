# 📧 Configuration Email Utilisateur - Sheos

## ✅ Bonne Nouvelle !

Le système est **déjà configuré** pour envoyer les emails à l'adresse de l'utilisateur connecté ! Voici comment ça fonctionne :

## 🔄 Fonctionnement Automatique

### **1. Commande Réelle**
Quand un utilisateur valide une commande :
1. **Système récupère** l'email de l'utilisateur connecté depuis la base de données
2. **Envoie automatiquement** l'email à `user.email`
3. **Aucune configuration** supplémentaire nécessaire

### **2. Code de Récupération Email**
```typescript
// Dans les APIs d'envoi d'email
const { user } = await db
  .select({
    email: users.email,
    firstName: users.firstName,
    lastName: users.lastName
  })
  .from(orders)
  .innerJoin(users, eq(orders.userId, users.id))
  .where(eq(orders.id, orderId));

// Email envoyé à user.email
const emailData = {
  to: user.email,  // ✅ Email de l'utilisateur connecté
  subject: `Confirmation de commande - ${order.orderNumber}`,
  // ... autres données
};
```

## 🧪 Test avec Email Utilisateur

### **Page de Test Améliorée**
- **URL** : `/admin/test-email`
- **Fonctionnalité** : Peut utiliser l'email de l'utilisateur connecté
- **Option** : Case à cocher "Utiliser mon email connecté"

### **API de Test Flexible**
```typescript
// Si email fourni : utilise cet email
// Si pas d'email mais utilisateur connecté : utilise user.email
let targetEmail = email || locals.user?.email;
```

## 📊 Flux Complet

### **1. Utilisateur Connecté**
```
Utilisateur → Valide Commande → Email automatique à user.email
```

### **2. Test Manuel**
```
Admin → /admin/test-email → Choisir email → Test envoyé
```

### **3. Test avec Email Connecté**
```
Admin Connecté → /admin/test-email → Coche "Utiliser mon email" → Test à user.email
```

## 🔧 Configuration Nécessaire

### **Seule Configuration Requise : SMTP**
```env
# Fichier .env à la racine
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM=votre.email@gmail.com
```

### **Pas de Configuration Email Utilisateur**
- ✅ **Automatique** : Récupération depuis la base de données
- ✅ **Dynamique** : Chaque utilisateur reçoit à son email
- ✅ **Sécurisé** : Pas d'email hardcodé

## 🎯 Test Complet

### **1. Configurez SMTP**
Créez le fichier `.env` avec vos paramètres Gmail

### **2. Testez avec un Utilisateur**
1. **Connectez-vous** avec un compte utilisateur
2. **Ajoutez des articles** au panier
3. **Validez une commande**
4. **Vérifiez votre email** - vous devriez recevoir la confirmation !

### **3. Testez l'Admin**
1. **Allez sur** `/admin/test-email`
2. **Cochez** "Utiliser mon email connecté"
3. **Cliquez** "Envoyer email de test"
4. **Vérifiez votre email** admin !

## 📋 Vérifications

### **✅ Déjà Implémenté**
- Récupération email utilisateur depuis DB
- Envoi automatique à `user.email`
- Support multi-utilisateurs
- Test avec email utilisateur connecté

### **🔧 À Configurer**
- Variables SMTP dans `.env`
- Mot de passe d'application Gmail

## 🚀 Résultat

**Le système envoie déjà les emails aux bonnes adresses !**

- **Utilisateur A** → Email à `userA@example.com`
- **Utilisateur B** → Email à `userB@example.com`
- **Admin** → Peut tester avec son email connecté

**Il suffit de configurer le fichier `.env` pour que les emails soient envoyés réellement !** 🎉
