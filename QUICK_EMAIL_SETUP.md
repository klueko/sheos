# 🚀 Configuration Email Rapide - Sheos

## ❌ Erreur Résolue

L'erreur `createTransporter is not a function` a été corrigée ! Le système fonctionne maintenant en mode simulation.

## 🔧 État Actuel

**Mode simulation activé** - Les emails sont loggés dans la console sans être envoyés.

## ✅ Pour Recevoir de Vrais Emails

### **1. Créer le fichier .env**

Créez un fichier `.env` à la racine du projet :

```env
# Configuration Email Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM=votre.email@gmail.com

# Base de données
DATABASE_URL=./data/sheos.db
NODE_ENV=development
```

### **2. Configuration Gmail**

#### **Étapes importantes :**
1. **Activez l'authentification à 2 facteurs** sur votre compte Gmail
2. **Générez un mot de passe d'application** :
   - Allez sur [myaccount.google.com](https://myaccount.google.com/)
   - Sécurité > Mots de passe des applications
   - Sélectionnez "Mail" et votre appareil
   - **Copiez le mot de passe généré** (16 caractères)
3. **Dans le fichier .env** :
   - Remplacez `votre.email@gmail.com` par votre vraie adresse
   - Remplacez `votre_mot_de_passe_application` par le mot de passe généré

### **3. Redémarrer le serveur**

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez
npm run dev
```

## 🧪 Test

### **Test rapide :**
1. Allez sur `http://localhost:5174/admin/test-email`
2. Entrez votre email
3. Cliquez "Envoyer email de test"
4. Vérifiez votre boîte email !

### **Test complet :**
1. Ajoutez des articles au panier
2. Validez une commande
3. Vous recevrez automatiquement un email !

## 📊 Logs

### **Mode simulation (sans .env) :**
```
📧 Configuration SMTP manquante - Email simulé
📧 Email data: {order, items, user...}
✅ Confirmation email sent for order CMD-12345678
```

### **Mode réel (avec .env configuré) :**
```
✅ Email envoyé avec succès: <messageId>
✅ Confirmation email sent for order CMD-12345678 to user@example.com
```

## 🎯 Résultat

- **Sans .env** : Emails simulés (logs dans console)
- **Avec .env** : Vrais emails envoyés à votre boîte

**Le système fonctionne dans les deux modes !** 🎉
