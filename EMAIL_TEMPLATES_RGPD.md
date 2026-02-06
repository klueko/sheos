# Templates d'emails RGPD

Ce document décrit les templates d'emails nécessaires pour les fonctionnalités RGPD.

## 📧 Templates requis

### 1. Confirmation de demande de suppression

**Template**: `data-deletion-request`
**Déclencheur**: Lorsqu'un utilisateur fait une demande de suppression de données

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Demande de suppression de données - Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Demande de suppression de données</h1>
        
        <p>Bonjour {userName},</p>
        
        <p>Nous avons bien reçu votre demande de suppression de vos données personnelles.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #007bff;">Détails de votre demande</h3>
            <p><strong>ID de la demande :</strong> {requestId}</p>
            <p><strong>Date de demande :</strong> {requestedAt}</p>
            <p><strong>Délai de traitement :</strong> {expectedProcessingTime}</p>
        </div>
        
        <h3>Prochaines étapes</h3>
        <ul>
            <li>Nous examinerons votre demande sous 30 jours maximum</li>
            <li>Vous recevrez une notification par email une fois le traitement terminé</li>
            <li>Certaines données peuvent être conservées pour respecter nos obligations légales</li>
        </ul>
        
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Sheos - Alternative & Gothic Footwear<br>
            Email: contact@sheos.fr</p>
        </div>
    </div>
</body>
</html>
```

### 2. Demande approuvée

**Template**: `data-deletion-approved`
**Déclencheur**: Lorsqu'un admin approuve une demande de suppression

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Demande de suppression approuvée</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #28a745;">Demande de suppression approuvée</h1>
        
        <p>Bonjour {userName},</p>
        
        <p>Votre demande de suppression de données a été approuvée.</p>
        
        <div style="background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #28a745;">Détails</h3>
            <p><strong>ID de la demande :</strong> {requestId}</p>
            <p><strong>Date de traitement :</strong> {processedAt}</p>
        </div>
        
        <h3>Ce qui va se passer</h3>
        <ul>
            <li>Vos données personnelles seront supprimées dans les 30 jours</li>
            <li>Certaines données légales (factures) seront conservées conformément à la loi</li>
            <li>Votre compte sera désactivé après suppression des données</li>
        </ul>
        
        <p>Vous recevrez une confirmation une fois la suppression terminée.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Sheos - Alternative & Gothic Footwear<br>
            Email: contact@sheos.fr</p>
        </div>
    </div>
</body>
</html>
```

### 3. Demande rejetée

**Template**: `data-deletion-rejected`
**Déclencheur**: Lorsqu'un admin rejette une demande de suppression

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Demande de suppression rejetée</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc3545;">Demande de suppression rejetée</h1>
        
        <p>Bonjour {userName},</p>
        
        <p>Votre demande de suppression de données a été rejetée.</p>
        
        <div style="background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc3545;">Détails</h3>
            <p><strong>ID de la demande :</strong> {requestId}</p>
            <p><strong>Date de traitement :</strong> {processedAt}</p>
            {#if adminNotes}
            <p><strong>Raison :</strong> {adminNotes}</p>
            {/if}
        </div>
        
        <h3>Pourquoi votre demande a été rejetée</h3>
        <ul>
            <li>Vous avez des commandes en cours</li>
            <li>Nous avons des obligations légales de conservation</li>
            <li>D'autres raisons légitimes s'appliquent</li>
        </ul>
        
        <p>Si vous avez des questions, contactez-nous à contact@sheos.fr</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Sheos - Alternative & Gothic Footwear<br>
            Email: contact@sheos.fr</p>
        </div>
    </div>
</body>
</html>
```

### 4. Suppression terminée

**Template**: `data-deletion-completed`
**Déclencheur**: Lorsqu'une suppression de données est terminée

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Suppression de données terminée</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #28a745;">Suppression terminée</h1>
        
        <p>Bonjour {userName},</p>
        
        <p>Vos données personnelles ont été supprimées avec succès.</p>
        
        <div style="background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #28a745;">Confirmation</h3>
            <p><strong>ID de la demande :</strong> {requestId}</p>
            <p><strong>Date de suppression :</strong> {processedAt}</p>
        </div>
        
        <h3>Données supprimées</h3>
        <ul>
            <li>Profil utilisateur</li>
            <li>Adresses de livraison</li>
            <li>Préférences de communication</li>
            <li>Données de navigation</li>
        </ul>
        
        <h3>Données conservées (obligations légales)</h3>
        <ul>
            <li>Factures (10 ans)</li>
            <li>Données fiscales</li>
            <li>Données de sécurité</li>
        </ul>
        
        <p>Merci d'avoir fait confiance à Sheos.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Sheos - Alternative & Gothic Footwear<br>
            Email: contact@sheos.fr</p>
        </div>
    </div>
</body>
</html>
```

### 5. Alerte admin - Nouvelle demande

**Template**: `admin-data-deletion-alert`
**Déclencheur**: Lorsqu'une nouvelle demande de suppression est créée

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Nouvelle demande de suppression de données</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc3545;">🚨 Nouvelle demande de suppression</h1>
        
        <div style="background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc3545;">Détails de la demande</h3>
            <p><strong>Utilisateur :</strong> {userName}</p>
            <p><strong>Email :</strong> {userEmail}</p>
            <p><strong>ID de la demande :</strong> {requestId}</p>
            <p><strong>Date de demande :</strong> {requestedAt}</p>
        </div>
        
        <h3>Action requise</h3>
        <p>Une nouvelle demande de suppression de données a été soumise et nécessite votre attention.</p>
        
        <div style="margin: 20px 0;">
            <a href="https://sheos.fr/admin/data-deletion-requests/{requestId}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Gérer la demande
            </a>
        </div>
        
        <p><strong>Délai :</strong> 30 jours maximum pour traiter cette demande</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Administration Sheos<br>
            Système de notifications RGPD</p>
        </div>
    </div>
</body>
</html>
```

## 📝 Configuration dans le système d'email

Ces templates doivent être intégrés dans votre système d'email existant. Assurez-vous que :

1. **Les variables sont correctement remplacées** :
   - `{userName}` → Nom de l'utilisateur
   - `{requestId}` → ID unique de la demande
   - `{requestedAt}` → Date de la demande
   - `{processedAt}` → Date de traitement
   - `{adminNotes}` → Notes de l'administrateur

2. **Les emails sont envoyés depuis une adresse vérifiée** :
   - `noreply@sheos.fr` pour les notifications automatiques
   - `admin@sheos.fr` pour les alertes administrateur

3. **Les emails respectent les standards anti-spam** :
   - Headers DKIM configurés
   - SPF record configuré
   - Contenu non-spam

## 🔧 Implémentation

Pour utiliser ces templates dans votre système d'email existant, modifiez la fonction `sendEmail` dans `src/lib/email/index.ts` pour supporter ces nouveaux templates.
