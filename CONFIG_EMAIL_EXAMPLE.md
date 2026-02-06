# 📧 Exemple de Configuration Email

## Fichier .env à créer

Créez un fichier `.env` à la racine du projet avec ce contenu :

```env
# Configuration Email SMTP
# Pour recevoir de vrais emails de confirmation

# Option Gmail (recommandée pour les tests)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM=votre.email@gmail.com

# Option Outlook
# SMTP_HOST=smtp-mail.outlook.com
# SMTP_PORT=587
# SMTP_USER=votre.email@outlook.com
# SMTP_PASS=votre_mot_de_passe
# SMTP_FROM=votre.email@outlook.com

# Option SendGrid (pour la production)
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=votre_cle_api_sendgrid
# SMTP_FROM=noreply@votre-domaine.com

# Base de données
DATABASE_URL=./data/sheos.db

# Application
NODE_ENV=development

# Stripe (optionnel)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Instructions Gmail

1. **Activez l'authentification à 2 facteurs** sur votre compte Gmail
2. **Générez un mot de passe d'application** :
   - Allez dans Paramètres Google > Sécurité
   - Mots de passe des applications
   - Générez un mot de passe pour "Mail"
3. **Remplacez dans .env** :
   - `votre.email@gmail.com` par votre vraie adresse Gmail
   - `votre_mot_de_passe_application` par le mot de passe généré

## Test

1. Redémarrez le serveur : `npm run dev`
2. Ajoutez des articles au panier
3. Validez une commande
4. Vérifiez votre boîte email !

## Logs

Surveillez les logs du serveur :
- ✅ Succès : `Confirmation email sent for order CMD-12345678 to user@example.com`
- ❌ Erreur : `Failed to send confirmation email`
