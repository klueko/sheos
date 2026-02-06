<script lang="ts">
  import { onMount } from 'svelte';
</script>

<svelte:head>
  <title>Conditions Générales d'Utilisation - Sheos</title>
  <meta name="description" content="Conditions Générales d'Utilisation du site Sheos" />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Conditions Générales d'Utilisation</h1>
      
      <div class="prose prose-lg max-w-none">
        <p class="text-sm text-gray-600 mb-8">
          <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
        </p>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">1. Objet</h2>
          <p class="text-gray-700 mb-4">
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du site web 
            Sheos (ci-après "le Site") et des services proposés par Sheos (ci-après "nous", "notre", "nos").
          </p>
          <p class="text-gray-700">
            L'utilisation du Site implique l'acceptation pleine et entière des présentes CGU. 
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre Site.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">2. Identification de l'entreprise</h2>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-gray-700"><strong>Sheos</strong></p>
            <p class="text-gray-700">Email : contact@sheos.fr</p>
            <p class="text-gray-700">Téléphone : [Numéro de téléphone]</p>
            <p class="text-gray-700">Adresse : [Adresse complète]</p>
            <p class="text-gray-700">SIRET : [Numéro SIRET]</p>
            <p class="text-gray-700">TVA : [Numéro TVA]</p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">3. Définitions</h2>
          <div class="space-y-3">
            <div>
              <p class="font-medium text-gray-900">Utilisateur :</p>
              <p class="text-gray-700">Toute personne accédant et utilisant le Site</p>
            </div>
            <div>
              <p class="font-medium text-gray-900">Client :</p>
              <p class="text-gray-700">Utilisateur ayant passé une commande sur le Site</p>
            </div>
            <div>
              <p class="font-medium text-gray-900">Compte :</p>
              <p class="text-gray-700">Espace personnel créé par l'utilisateur pour accéder aux services</p>
            </div>
            <div>
              <p class="font-medium text-gray-900">Commande :</p>
              <p class="text-gray-700">Achat de produits effectué par un client</p>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">4. Accès au Site</h2>
          <p class="text-gray-700 mb-4">
            L'accès au Site est libre et gratuit. Toutefois, nous nous réservons le droit de :
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2">
            <li>Suspendre ou interrompre l'accès pour maintenance ou mise à jour</li>
            <li>Modifier ou supprimer tout contenu sans préavis</li>
            <li>Restreindre l'accès en cas d'utilisation abusive</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">6. Création de compte</h2>
          <p class="text-gray-700 mb-4">
            Pour passer une commande, vous devez créer un compte en fournissant des informations exactes et à jour.
          </p>
          <div class="bg-yellow-50 p-4 border border-yellow-200 rounded-lg">
            <p class="text-sm text-yellow-800">
              <strong>Responsabilité :</strong> Vous êtes responsable de la confidentialité de vos identifiants 
              et de toutes les activités effectuées sous votre compte.
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">7. Commandes et paiement</h2>
          
          <h3 class="text-xl font-medium text-gray-900 mb-3">7.1 Processus de commande</h3>
          <ol class="list-decimal list-inside text-gray-700 space-y-2 mb-4">
            <li>Sélection des produits et ajout au panier</li>
            <li>Vérification des informations de commande</li>
            <li>Renseignements des informations de livraison et facturation</li>
            <li>Choix du mode de paiement</li>
            <li>Confirmation et paiement</li>
          </ol>

          <h3 class="text-xl font-medium text-gray-900 mb-3">7.2 Paiement</h3>
          <p class="text-gray-700 mb-4">
            Nous acceptons les modes de paiement suivants :
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2">
            <li>Cartes bancaires (Visa, Mastercard, American Express)</li>
            <li>PayPal</li>
            <li>Virements bancaires (pour certaines commandes)</li>
          </ul>

          <h3 class="text-xl font-medium text-gray-900 mb-3">7.3 Prix</h3>
          <p class="text-gray-700 mb-4">
            Les prix affichés sont en euros TTC et incluent la TVA. Ils sont valables tant qu'ils sont 
            visibles sur le Site et peuvent être modifiés sans préavis.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">8. Livraison</h2>
          <p class="text-gray-700 mb-4">
            Les délais de livraison sont indiqués à titre indicatif et peuvent varier selon :
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2">
            <li>La disponibilité des produits</li>
            <li>La destination de livraison</li>
            <li>Les conditions météorologiques</li>
            <li>Les événements exceptionnels</li>
          </ul>
          
          <div class="bg-blue-50 p-4 border border-blue-200 rounded-lg mt-4">
            <p class="text-sm text-blue-800">
              <strong>Suivi :</strong> Un numéro de suivi vous sera communiqué par email une fois 
              votre commande expédiée.
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">9. Droit de rétractation</h2>
          <p class="text-gray-700 mb-4">
            Conformément à la réglementation en vigueur, vous disposez d'un délai de 14 jours pour 
            exercer votre droit de rétractation, à compter de la réception des produits.
          </p>
          
          <div class="bg-green-50 p-4 border border-green-200 rounded-lg">
            <h4 class="font-medium text-green-900 mb-2">Conditions de retour :</h4>
            <ul class="list-disc list-inside text-green-800 space-y-1">
              <li>Produits non portés et en parfait état</li>
              <li>Emballage d'origine conservé</li>
              <li>Étiquettes et marquages intacts</li>
              <li>Demande de retour formulée dans les délais</li>
            </ul>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">10. Garanties et responsabilité</h2>
          
          <h3 class="text-xl font-medium text-gray-900 mb-3">10.1 Garantie des produits</h3>
          <p class="text-gray-700 mb-4">
            Tous nos produits sont garantis conformes à leur description. En cas de défaut de conformité, 
            vous disposez des recours prévus par la loi.
          </p>

          <h3 class="text-xl font-medium text-gray-900 mb-3">10.2 Limitation de responsabilité</h3>
          <p class="text-gray-700 mb-4">
            Notre responsabilité ne saurait être engagée pour :
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2">
            <li>Les dommages indirects ou la perte de profits</li>
            <li>L'utilisation inappropriée des produits</li>
            <li>Les interruptions de service dues à des causes externes</li>
            <li>Les actions de tiers ou utilisateurs</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">11. Propriété intellectuelle</h2>
          <p class="text-gray-700 mb-4">
            Le Site et tous ses éléments (textes, images, logos, design) sont protégés par les droits 
            de propriété intellectuelle. Toute reproduction ou utilisation sans autorisation est interdite.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">12. Données personnelles</h2>
          <p class="text-gray-700 mb-4">
            Le traitement de vos données personnelles est régi par notre 
            <a href="/legal/privacy-policy" class="text-blue-600 hover:text-blue-800 underline">
              Politique de confidentialité
            </a>.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">13. Modification des CGU</h2>
          <p class="text-gray-700">
            Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications 
            entrent en vigueur dès leur publication sur le Site. Il vous appartient de consulter 
            régulièrement cette page.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">14. Droit applicable et juridiction</h2>
          <p class="text-gray-700 mb-4">
            Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux 
            français seront seuls compétents.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">15. Contact</h2>
          <div class="bg-gray-50 p-6 rounded-lg">
            <p class="text-gray-700 mb-4">
              Pour toute question concernant ces CGU :
            </p>
            <div class="space-y-2">
              <p class="text-gray-700"><strong>Email :</strong> contact@sheos.fr</p>
              <p class="text-gray-700"><strong>Adresse :</strong> [Adresse complète]</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</div>
