<script lang="ts">
  import { onMount } from 'svelte';
</script>

<svelte:head>
  <title>Mentions légales - Sheos</title>
  <meta name="description" content="Mentions légales du site Sheos" />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Mentions légales</h1>
      
      <div class="prose prose-lg max-w-none">
        <p class="text-sm text-gray-600 mb-8">
          <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
        </p>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">1. Éditeur du site</h2>
          <div class="bg-gray-50 p-6 rounded-lg">
            <p class="text-gray-700"><strong>Raison sociale :</strong> Sheos</p>
            <p class="text-gray-700"><strong>Forme juridique :</strong> [SARL / SAS / etc.]</p>
            <p class="text-gray-700"><strong>Capital social :</strong> [Montant]</p>
            <p class="text-gray-700"><strong>SIRET :</strong> [Numéro SIRET]</p>
            <p class="text-gray-700"><strong>RCS :</strong> [Ville du RCS] [Numéro RCS]</p>
            <p class="text-gray-700"><strong>TVA intracommunautaire :</strong> [Numéro TVA]</p>
            <br>
            <p class="text-gray-700"><strong>Siège social :</strong></p>
            <p class="text-gray-700">[Adresse complète]</p>
            <br>
            <p class="text-gray-700"><strong>Contact :</strong></p>
            <p class="text-gray-700">Email : contact@sheos.fr</p>
            <p class="text-gray-700">Téléphone : [Numéro de téléphone]</p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">2. Directeur de publication</h2>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-gray-700"><strong>Nom :</strong> [Nom du directeur]</p>
            <p class="text-gray-700"><strong>Fonction :</strong> [Directeur / Gérant / etc.]</p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">3. Hébergement du site</h2>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-gray-700"><strong>Hébergeur :</strong> [Nom de l'hébergeur]</p>
            <p class="text-gray-700"><strong>Adresse :</strong> [Adresse de l'hébergeur]</p>
            <p class="text-gray-700"><strong>Téléphone :</strong> [Téléphone de l'hébergeur]</p>
            <p class="text-gray-700"><strong>Site web :</strong> 
              <a href="[URL]" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                [URL de l'hébergeur]
              </a>
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">4. Conception et développement</h2>
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="text-gray-700"><strong>Développement :</strong> [Nom du développeur/agence]</p>
            <p class="text-gray-700"><strong>Contact :</strong> [Email de contact]</p>
            <p class="text-gray-700"><strong>Technologies utilisées :</strong> SvelteKit, TypeScript, Tailwind CSS</p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">5. Propriété intellectuelle</h2>
          <p class="text-gray-700 mb-4">
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur 
            et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour 
            les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
          <p class="text-gray-700 mb-4">
            La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est 
            formellement interdite sauf autorisation expresse du directeur de la publication.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">6. Marques et logos</h2>
          <p class="text-gray-700 mb-4">
            Les marques et logos reproduits sur ce site sont déposés par les sociétés qui en sont propriétaires.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">7. Liens hypertextes</h2>
          <p class="text-gray-700 mb-4">
            Les liens hypertextes mis en place dans le cadre du présent site web en direction d'autres 
            ressources présentes sur le réseau Internet ne sauraient engager la responsabilité de Sheos.
          </p>
          <p class="text-gray-700">
            De même, Sheos ne saurait être tenue responsable du contenu des sites qui auraient un lien 
            vers le présent site.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">8. Collecte de données personnelles</h2>
          <p class="text-gray-700 mb-4">
            Les informations recueillies font l'objet d'un traitement informatique destiné à la gestion 
            des commandes et à la relation client. Le destinataire des données est Sheos.
          </p>
          <p class="text-gray-700 mb-4">
            Conformément à la loi "informatique et libertés" du 6 janvier 1978 modifiée et au RGPD, 
            vous bénéficiez d'un droit d'accès et de rectification aux informations qui vous concernent.
          </p>
          <div class="bg-blue-50 p-4 border border-blue-200 rounded-lg">
            <p class="text-sm text-blue-800">
              <strong>Pour plus d'informations :</strong> Consultez notre 
              <a href="/legal/privacy-policy" class="underline hover:text-blue-900">
                Politique de confidentialité
              </a>
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
          <p class="text-gray-700 mb-4">
            Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
            Vous pouvez gérer vos préférences de cookies via le bandeau de consentement.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">10. Responsabilité</h2>
          <p class="text-gray-700 mb-4">
            Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour 
            à différentes périodes de l'année, mais peut toutefois contenir des inexactitudes ou des omissions.
          </p>
          <p class="text-gray-700 mb-4">
            Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien 
            vouloir le signaler par email, à l'adresse contact@sheos.fr, en décrivant le problème de la 
            manière la plus précise possible.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">11. Médiation</h2>
          <p class="text-gray-700 mb-4">
            Conformément à l'article L. 616-1 du Code de la consommation, nous proposons un dispositif 
            de médiation de la consommation.
          </p>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-gray-700"><strong>Médiateur :</strong> [Nom du médiateur]</p>
            <p class="text-gray-700"><strong>Contact :</strong> [Email du médiateur]</p>
            <p class="text-gray-700"><strong>Site :</strong> 
              <a href="[URL]" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                [URL du médiateur]
              </a>
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">12. Droit applicable</h2>
          <p class="text-gray-700">
            Le présent site et les modalités et conditions de son utilisation sont régis par le droit français, 
            quel que soit le lieu d'utilisation. En cas de contestation éventuelle, et après l'échec de toute 
            tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents 
            pour connaître de ce litige.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">13. Contact</h2>
          <div class="bg-gray-50 p-6 rounded-lg">
            <p class="text-gray-700 mb-4">
              Pour toute question concernant ces mentions légales :
            </p>
            <div class="space-y-2">
              <p class="text-gray-700"><strong>Email :</strong> contact@sheos.fr</p>
              <p class="text-gray-700"><strong>Adresse :</strong> [Adresse complète]</p>
              <p class="text-gray-700"><strong>Téléphone :</strong> [Numéro de téléphone]</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</div>
