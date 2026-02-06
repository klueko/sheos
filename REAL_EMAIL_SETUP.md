# 📧 Configuration Email Réel - Sheos

## ✅ Système d'Email Implémenté

J'ai implémenté un système d'envoi d'email réel avec Nodemailer ! Vous pouvez maintenant recevoir de vrais emails de confirmation.

## 🚀 Configuration Rapide

### **1. Créer le fichier .env**

Créez un fichier `.env` à la racine du projet :

```env
# Configuration Email SMTP Gmail (recommandé)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM=votre.email@gmail.com

# Base de données
DATABASE_URL=./data/sheos.db
NODE_ENV=development
```

### **2. Configuration Gmail (Recommandée)**

#### **Étapes Gmail :**
1. **Activez l'authentification à 2 facteurs** sur votre compte Gmail
2. **Générez un mot de passe d'application** :
   - Allez dans [Paramètres Google](https://myaccount.google.com/) > Sécurité
   - "Mots de passe des applications"
   - Sélectionnez "Mail" et votre appareil
   - Copiez le mot de passe généré (16 caractères)
3. **Dans le fichier .env** :
   - Remplacez `votre.email@gmail.com` par votre vraie adresse
   - Remplacez `votre_mot_de_passe_application` par le mot de passe généré

### **3. Redémarrer le serveur**

```bash
npm run dev
```

## 🧪 Test de Configuration

### **Méthode 1 : Page de test Admin**
1. Allez sur `http://localhost:5174/admin/test-email`
2. Entrez votre adresse email
3. Cliquez sur "Envoyer email de test"
4. Vérifiez votre boîte email !

### **Méthode 2 : Commande réelle**
1. Ajoutez des articles au panier
2. Allez au checkout et créez une adresse
3. Validez la commande
4. **Vous recevrez automatiquement un email !**

## 📧 Contenu de l'Email

L'email contiendra :

### **Design Professionnel**
- ✅ **En-tête** avec logo Sheos
- ✅ **Design responsive** (mobile + desktop)
- ✅ **Couleurs** cohérentes avec le site

### **Informations Complètes**
- ✅ **Détails commande** : Numéro, date, statut
- ✅ **Articles** : Nom, taille, couleur, quantité, prix
- ✅ **Résumé financier** : Sous-total, livraison, total
- ✅ **Adresse livraison** : Informations complètes
- ✅ **Prochaines étapes** : Préparation, expédition, livraison

### **Exemple de contenu**
```
🎉 Merci pour votre commande !

Bonjour Jean Dupont,

DÉTAILS DE VOTRE COMMANDE
Numéro: CMD-12345678
Date: 15 janvier 2024, 14:30
Statut: PAYÉ

ARTICLES COMMANDÉS
- Nike Air Max (Taille 42, Noir)
  Quantité: 1
  Prix: 120,00 €

RÉSUMÉ FINANCIER
Sous-total: 120,00 €
Livraison: Gratuite
TVA: Incluse
Total: 120,00 €

ADRESSE DE LIVRAISON
Jean Dupont
123 rue de la Paix
75001 Paris
France
```

## 🔧 Alternatives SMTP

### **Outlook/Hotmail**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=votre.email@outlook.com
SMTP_PASS=votre_mot_de_passe
SMTP_FROM=votre.email@outlook.com
```

### **Yahoo**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=votre.email@yahoo.com
SMTP_PASS=votre_mot_de_passe
SMTP_FROM=votre.email@yahoo.com
```

### **SendGrid (Production)**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=noreply@votre-domaine.com
```

## 🛠️ Dépannage

### **Erreur "Authentication failed"**
- ✅ Vérifiez votre mot de passe d'application Gmail
- ✅ Assurez-vous que l'authentification à 2 facteurs est activée
- ✅ Vérifiez les identifiants dans `.env`

### **Erreur "Connection timeout"**
- ✅ Vérifiez votre connexion internet
- ✅ Vérifiez les paramètres SMTP (host, port)
- ✅ Certains réseaux bloquent le port 587

### **Email non reçu**
- ✅ Vérifiez vos spams/courriers indésirables
- ✅ Vérifiez l'adresse email dans votre profil
- ✅ Consultez les logs du serveur

### **Logs de vérification**
```bash
# Succès
✅ Confirmation email sent for order CMD-12345678 to user@example.com

# Erreur
❌ Failed to send confirmation email for order CMD-12345678
```

## 📊 Fonctionnalités

### **Envoi Automatique**
- ✅ **Déclenchement** : Automatique lors du paiement
- ✅ **Délai** : 3 secondes après validation
- ✅ **Fréquence** : Une fois par commande

### **Template Professionnel**
- ✅ **HTML** : Design moderne et responsive
- ✅ **Texte** : Version texte pour tous les clients
- ✅ **Images** : Logo et mise en page
- ✅ **Couleurs** : Cohérence avec le site

### **Données Complètes**
- ✅ **Commande** : Tous les détails
- ✅ **Articles** : Informations complètes
- ✅ **Client** : Nom et email
- ✅ **Livraison** : Adresse complète

## 🎯 Résultat Final

**Une fois configuré, vous recevrez automatiquement :**

- 📧 **Email HTML professionnel** avec design responsive
- 📋 **Détails complets** de votre commande
- 🎨 **Branding Sheos** cohérent
- ⚡ **Envoi automatique** à chaque commande
- 📱 **Compatible mobile** et desktop

## 🚀 Test Immédiat

1. **Configurez .env** avec vos paramètres Gmail
2. **Redémarrez** le serveur
3. **Allez sur** `/admin/test-email`
4. **Envoyez un test** à votre email
5. **Validez une commande** pour tester l'envoi automatique

**Vous recevrez maintenant de vrais emails avec tous les détails de vos commandes !** 🎉
