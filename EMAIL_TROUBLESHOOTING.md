# 🔧 Dépannage Email - Sheos

## 🚨 Problème : L'email ne s'envoie pas

Voici un guide complet pour diagnostiquer et résoudre les problèmes d'envoi d'email.

## 🔍 Diagnostic Rapide

### **1. Vérifier la Configuration**

Allez sur `http://localhost:5174/admin/email-diagnostics` pour voir l'état de votre configuration.

### **2. Logs du Serveur**

Surveillez les logs de votre serveur de développement :
```bash
npm run dev
```

Recherchez ces messages :
- ✅ `✅ Email envoyé avec succès`
- ❌ `❌ Failed to send confirmation email`
- 📧 `📧 Configuration SMTP manquante - Email simulé`

## 🛠️ Solutions par Type de Problème

### **Problème 1 : Configuration Manquante**

#### **Symptômes :**
- Message : "Configuration SMTP manquante - Email simulé"
- Pas d'email reçu
- Logs montrent simulation

#### **Solution :**
1. **Créez le fichier `.env`** à la racine du projet :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM=votre.email@gmail.com
```

2. **Redémarrez le serveur** :
```bash
npm run dev
```

### **Problème 2 : Erreur d'Authentification Gmail**

#### **Symptômes :**
- Erreur : "Authentication failed"
- Erreur : "Invalid login"
- Logs : "❌ Erreur lors de l'envoi de l'email"

#### **Solution Gmail :**
1. **Activez l'authentification à 2 facteurs** :
   - Allez sur [myaccount.google.com](https://myaccount.google.com/)
   - Sécurité > Authentification à 2 facteurs

2. **Générez un mot de passe d'application** :
   - Sécurité > Mots de passe des applications
   - Sélectionnez "Mail" et votre appareil
   - Copiez le mot de passe généré (16 caractères)

3. **Utilisez ce mot de passe** dans `SMTP_PASS` (pas votre mot de passe Gmail normal)

### **Problème 3 : Port Bloqué**

#### **Symptômes :**
- Erreur : "Connection timeout"
- Erreur : "ECONNREFUSED"
- Impossible de se connecter

#### **Solutions :**
1. **Essayez le port 465 (SSL)** :
```env
SMTP_PORT=465
# Et modifiez secure: true dans le code
```

2. **Vérifiez votre pare-feu** :
   - Port 587 et 465 doivent être ouverts
   - Certains réseaux d'entreprise bloquent ces ports

3. **Testez avec un autre fournisseur** :
```env
# Outlook
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587

# Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### **Problème 4 : Email dans les Spams**

#### **Symptômes :**
- Configuration correcte
- Logs montrent envoi réussi
- Pas d'email reçu

#### **Solutions :**
1. **Vérifiez vos spams/courriers indésirables**
2. **Ajoutez l'expéditeur à vos contacts**
3. **Vérifiez l'adresse email de destination**

## 🧪 Tests de Diagnostic

### **Test 1 : Page de Diagnostic**
```
URL: http://localhost:5174/admin/email-diagnostics
Action: Vérifier la configuration
```

### **Test 2 : API de Test**
```
URL: http://localhost:5174/admin/test-email
Action: Envoyer un email de test
```

### **Test 3 : Script Direct**
```bash
node scripts/test-email.js
```

### **Test 4 : Commande Réelle**
1. Ajoutez des articles au panier
2. Validez une commande
3. Vérifiez les logs du serveur
4. Vérifiez votre boîte email

## 📊 Messages de Log

### **Configuration Correcte :**
```
✅ Email envoyé avec succès: <messageId>
✅ Confirmation email sent for order CMD-12345678 to user@example.com
```

### **Configuration Manquante :**
```
📧 Configuration SMTP manquante - Email simulé
📧 Email data: {order, items, user...}
✅ Confirmation email sent for order CMD-12345678
```

### **Erreur de Configuration :**
```
❌ Erreur lors de l'envoi de l'email: Authentication failed
❌ Failed to send confirmation email for order CMD-12345678
```

## 🔧 Configuration Alternative

### **SendGrid (Recommandé pour Production)**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
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

## 🎯 Checklist de Vérification

### **Avant de Tester :**
- [ ] Fichier `.env` créé à la racine
- [ ] Variables SMTP configurées
- [ ] Serveur redémarré après modification `.env`
- [ ] Authentification à 2 facteurs activée (Gmail)
- [ ] Mot de passe d'application généré (Gmail)

### **Pendant le Test :**
- [ ] Logs du serveur surveillés
- [ ] Adresse email de destination correcte
- [ ] Boîte email et spams vérifiés
- [ ] Connexion internet stable

### **Après le Test :**
- [ ] Email reçu dans la boîte principale ou spams
- [ ] Logs montrent succès
- [ ] Pas d'erreur dans la console

## 🚀 Test Final

1. **Créez le fichier `.env`** avec vos paramètres Gmail
2. **Redémarrez le serveur** : `npm run dev`
3. **Allez sur** `/admin/email-diagnostics`
4. **Vérifiez** que tout est vert
5. **Envoyez un test** : `/admin/test-email`
6. **Vérifiez votre email** !

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs du serveur
2. Testez avec un autre fournisseur email
3. Vérifiez votre configuration réseau
4. Consultez la documentation de votre fournisseur SMTP

**Le système d'email devrait maintenant fonctionner !** 🎉
