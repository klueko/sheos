<script lang="ts">
  import { onMount } from 'svelte';
</script>

<svelte:head>
  <title>Politique de confidentialité - Sheos</title>
  <meta name="description" content="Politique de confidentialité de Sheos - Protection et gestion de vos données personnelles" />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Politique de confidentialité</h1>
      
      <div class="prose prose-lg max-w-none">
        <p class="text-sm text-gray-600 mb-8">
          <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
        </p>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p class="text-gray-700 mb-4">
            Chez Sheos, nous nous engageons à protéger votre vie privée et vos données personnelles. 
            Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et 
            protégeons vos informations personnelles conformément au Règlement Général sur la Protection 
            des Données (RGPD) et à la loi française applicable.
          </p>
          <p class="text-gray-700">
            En utilisant notre site web et nos services, vous acceptez les pratiques décrites dans cette politique.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">2. Responsable du traitement</h2>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-gray-700"><strong>Sheos</strong></p>
            <p class="text-gray-700">Email : contact@sheos.fr</p>
            <p class="text-gray-700">Téléphone : [Numéro de téléphone]</p>
            <p class="text-gray-700">Adresse : [Adresse complète]</p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">3. Données collectées</h2>
          
          <h3 class="text-xl font-medium text-gray-900 mb-3">3.1 Données collectées automatiquement</h3>
          <ul class="list-disc list-inside text-gray-700 mb-4">
            <li>Adresse IP et informations de connexion</li>
            <li>Type de navigateur et système d'exploitation</li>
            <li>Pages visitées et durée de visite</li>
            <li>Cookies et technologies similaires (avec votre consentement)</li>
          </ul>

          <h3 class="text-xl font-medium text-gray-900 mb-3">3.2 Données fournies volontairement</h3>
          <ul class="list-disc list-inside text-gray-700 mb-4">
            <li>Informations de compte (nom, email, téléphone)</li>
            <li>Informations de commande et de facturation</li>
            <li>Adresses de livraison et de facturation</li>
            <li>Préférences de communication</li>
            <li>Commentaires et évaluations</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">4. Finalités du traitement</h2>
          <div class="space-y-4">
            <div class="border-l-4 border-blue-500 pl-4">
              <h4 class="font-medium text-gray-900">Exécution du contrat</h4>
              <p class="text-gray-700">Traitement et livraison de vos commandes, gestion de votre compte client</p>
            </div>
            <div class="border-l-4 border-green-500 pl-4">
              <h4 class="font-medium text-gray-900">Intérêt légitime</h4>
              <p class="text-gray-700">Amélioration de nos services, sécurité du site, prévention de la fraude</p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4">
              <h4 class="font-medium text-gray-900">Consentement</h4>
              <p class="text-gray-700">Marketing direct, cookies analytiques, communications promotionnelles</p>
            </div>
            <div class="border-l-4 border-orange-500 pl-4">
              <h4 class="font-medium text-gray-900">Obligation légale</h4>
              <p class="text-gray-700">Conservation des données de facturation, conformité fiscale</p>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">5. Cookies et technologies similaires</h2>
          <p class="text-gray-700 mb-4">
            Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences 
            de cookies à tout moment via le bandeau de consentement ou les paramètres de votre navigateur.
          </p>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Cookies nécessaires</h4>
              <p class="text-sm text-gray-700">Essentiels au fonctionnement du site (panier, authentification)</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Cookies fonctionnels</h4>
              <p class="text-sm text-gray-700">Améliorent les fonctionnalités et préférences utilisateur</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Cookies analytiques</h4>
              <p class="text-sm text-gray-700">Nous aident à comprendre l'utilisation du site</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Cookies marketing</h4>
              <p class="text-sm text-gray-700">Personnalisent les publicités et communications</p>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">6. Partage des données</h2>
          <p class="text-gray-700 mb-4">
            Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations avec :
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Prestataires de services :</strong> Transporteurs, processeurs de paiement, services d'email</li>
            <li><strong>Autorités légales :</strong> En cas d'obligation légale ou de demande judiciaire</li>
            <li><strong>Partenaires commerciaux :</strong> Uniquement avec votre consentement explicite</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">7. Sécurité des données</h2>
          <div class="bg-blue-50 p-6 rounded-lg">
            <h3 class="font-medium text-blue-900 mb-3">Mesures de sécurité mises en place :</h3>
            <ul class="list-disc list-inside text-blue-800 space-y-2">
              <li>Chiffrement SSL/TLS pour toutes les transmissions</li>
              <li>Stockage sécurisé avec chiffrement des données sensibles</li>
              <li>Accès restreint aux données personnelles</li>
              <li>Audits de sécurité réguliers</li>
              <li>Formation du personnel sur la protection des données</li>
            </ul>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">8. Durée de conservation</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="border border-gray-300 px-4 py-2 text-left">Type de données</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Durée de conservation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-gray-300 px-4 py-2">Données de compte actif</td>
                  <td class="border border-gray-300 px-4 py-2">Durée du compte + 3 ans</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 px-4 py-2">Données de commande</td>
                  <td class="border border-gray-300 px-4 py-2">10 ans (obligation légale)</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 px-4 py-2">Données marketing</td>
                  <td class="border border-gray-300 px-4 py-2">3 ans sans interaction</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 px-4 py-2">Cookies analytiques</td>
                  <td class="border border-gray-300 px-4 py-2">13 mois maximum</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">9. Vos droits</h2>
          <p class="text-gray-700 mb-4">
            Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
          </p>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div class="border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">Droit d'accès</h4>
              <p class="text-sm text-gray-700">Obtenir une copie de vos données personnelles</p>
            </div>
            <div class="border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">Droit de rectification</h4>
              <p class="text-sm text-gray-700">Corriger des données inexactes ou incomplètes</p>
            </div>
            <div class="border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">Droit à l'effacement</h4>
              <p class="text-sm text-gray-700">Demander la suppression de vos données</p>
            </div>
            <div class="border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">Droit à la limitation</h4>
              <p class="text-sm text-gray-700">Limiter le traitement de vos données</p>
            </div>
            <div class="border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">Droit à la portabilité</h4>
              <p class="text-sm text-gray-700">Récupérer vos données dans un format structuré</p>
            </div>
            <div class="border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">Droit d'opposition</h4>
              <p class="text-sm text-gray-700">Vous opposer au traitement pour des raisons légitimes</p>
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-sm text-yellow-800">
              <strong>Pour exercer vos droits :</strong> Contactez-nous à contact@sheos.fr ou utilisez 
              les fonctionnalités de gestion des données dans votre compte utilisateur.
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">10. Transferts internationaux</h2>
          <p class="text-gray-700 mb-4">
            Vos données peuvent être transférées vers des pays situés en dehors de l'Union européenne. 
            Dans ce cas, nous nous assurons que des garanties appropriées sont en place, notamment :
          </p>
          <ul class="list-disc list-inside text-gray-700">
            <li>Décision d'adéquation de la Commission européenne</li>
            <li>Clauses contractuelles types approuvées par la Commission</li>
            <li>Certification ou codes de conduite approuvés</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">11. Mineurs</h2>
          <p class="text-gray-700">
            Notre site n'est pas destiné aux mineurs de moins de 16 ans. Nous ne collectons pas 
            sciemment de données personnelles de mineurs sans le consentement parental. Si vous 
            pensez qu'un mineur nous a fourni des données, contactez-nous immédiatement.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">12. Modifications de cette politique</h2>
          <p class="text-gray-700">
            Nous pouvons modifier cette politique de confidentialité pour refléter les changements 
            dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires. 
            Nous vous informerons de tout changement significatif par email ou via une notification 
            sur notre site.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">13. Contact et réclamations</h2>
          <div class="bg-gray-50 p-6 rounded-lg">
            <p class="text-gray-700 mb-4">
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :
            </p>
            <div class="space-y-2">
              <p class="text-gray-700"><strong>Email :</strong> contact@sheos.fr</p>
              <p class="text-gray-700"><strong>Adresse :</strong> [Adresse complète]</p>
            </div>
            
            <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-800">
                <strong>Réclamation auprès de la CNIL :</strong> Si vous estimez que vos droits ne sont pas 
                respectés, vous pouvez introduire une réclamation auprès de la Commission Nationale de 
                l'Informatique et des Libertés (CNIL) : 
                <a href="https://www.cnil.fr" class="underline" target="_blank" rel="noopener noreferrer">
                  www.cnil.fr
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</div>
