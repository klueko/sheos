# 📧 Configuration Email - Sheos

## 🚀 Configuration Rapide

Pour recevoir de vrais emails de confirmation, vous devez configurer un service SMTP.

### **1. Option Gmail (Recommandée pour les tests)**

#### **Configuration Gmail**
1. Activez l'authentification à 2 facteurs sur votre compte Gmail
2. Générez un mot de passe d'application :
   - Allez dans Paramètres Google > Sécurité
   - Mots de passe des applications
   - Générez un mot de passe pour "Mail"

#### **Variables d'environnement**
Créez un fichier `.env` à la racine du projet :

```env
# Configuration SMTP Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM=votre.email@gmail.com

# Autres variables existantes
DATABASE_URL=./data/sheos.db
NODE_ENV=development
```

### **2. Option Outlook/Hotmail**

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=votre.email@outlook.com
SMTP_PASS=votre_mot_de_passe
SMTP_FROM=votre.email@outlook.com
```

### **3. Option Yahoo**

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=votre.email@yahoo.com
SMTP_PASS=votre_mot_de_passe
SMTP_FROM=votre.email@yahoo.com
```

## 🔧 Services Professionnels

### **SendGrid (Recommandé pour la production)**

1. Créez un compte sur [SendGrid](https://sendgrid.com/)
2. Générez une clé API
3. Configurez :

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre_cle_api_sendgrid
SMTP_FROM=noreply@votre-domaine.com
```

### **Mailgun**

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre_mot_de_passe_mailgun
SMTP_FROM=noreply@votre-domaine.com
```

## 🧪 Test de Configuration

### **1. Vérifier les variables d'environnement**
```bash
# Dans votre terminal
echo $SMTP_USER
echo $SMTP_HOST
```

### **2. Tester l'envoi d'email**
1. Ajoutez des articles au panier
2. Validez une commande
3. Vérifiez votre boîte email !
4. Consultez les logs du serveur

### **3. Logs de vérification**
```bash
# Logs de succès
✅ Confirmation email sent for order CMD-12345678 to user@example.com

# Logs d'erreur
❌ Failed to send confirmation email for order CMD-12345678 to user@example.com
```

## 🛠️ Dépannage

### **Erreur "Authentication failed"**
- Vérifiez votre mot de passe d'application (Gmail)
- Assurez-vous que l'authentification à 2 facteurs est activée
- Vérifiez les identifiants dans `.env`

### **Erreur "Connection timeout"**
- Vérifiez votre connexion internet
- Vérifiez les paramètres SMTP (host, port)
- Certains réseaux bloquent le port 587

### **Email non reçu**
- Vérifiez vos spams/courriers indésirables
- Vérifiez l'adresse email dans votre profil
- Consultez les logs du serveur pour les erreurs

### **Port bloqué**
Essayez le port 465 (SSL) :
```env
SMTP_PORT=465
# Et dans le code, changez secure: true
```

## 📋 Contenu de l'Email

L'email contiendra :
- ✅ **En-tête** avec logo et titre
- ✅ **Détails de la commande** (numéro, date, statut)
- ✅ **Articles commandés** (nom, taille, couleur, quantité, prix)
- ✅ **Résumé financier** (sous-total, livraison, total)
- ✅ **Adresse de livraison** complète
- ✅ **Prochaines étapes** (préparation, expédition, livraison)
- ✅ **Design responsive** (mobile + desktop)

## 🎨 Personnalisation

### **Modifier le template**
Éditez le fichier `src/lib/email/index.ts` :
- Couleurs dans les styles CSS
- Texte des messages
- Structure HTML
- Logo et branding

### **Ajouter des champs**
Modifiez l'interface `EmailData` pour ajouter :
- Numéro de téléphone
- Méthode de paiement
- Remises appliquées
- Informations de livraison

## 🔒 Sécurité

### **Bonnes pratiques**
- ✅ Ne jamais commiter le fichier `.env`
- ✅ Utiliser des mots de passe d'application
- ✅ Limiter les permissions SMTP
- ✅ Surveiller les logs d'envoi

### **Production**
- Utilisez un service professionnel (SendGrid, Mailgun)
- Configurez SPF, DKIM, DMARC
- Surveillez les taux de livraison
- Implémentez la gestion des bounces

## 🚀 Déploiement

### **Variables d'environnement de production**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=noreply@sheos.com
```

### **Vérification post-déploiement**
1. Testez un envoi d'email
2. Vérifiez la délivrabilité
3. Surveillez les logs
4. Configurez les alertes d'erreur

---

## ✅ Résultat Final

Une fois configuré, vous recevrez automatiquement :
- 📧 **Email HTML** avec design professionnel
- 📱 **Version responsive** pour mobile
- 📋 **Détails complets** de la commande
- 🎨 **Branding personnalisé** Sheos

**L'email sera envoyé automatiquement à chaque commande validée !** 🎉
