# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Particuliers & Promoteurs Immobiliers (Cible Principale) :** Propriétaires de terrains ou d'immeubles à Abidjan ou dans la diaspora cherchant un constructeur fiable, un raccordement électrique sécurisé ou un gestionnaire de biens rigoureux.
- **Entreprises, PME & Industriels :** Sociétés ayant besoin de construction de sièges, de réaménagement de bureaux, d'armoires électriques industrielles (TGBT) et de contrats de maintenance technique.
- **Collectivités & Aménageurs :** Acteurs publics et privés nécessitant l'électrification de lotissements, la pose de postes transformateurs HTA/BTA et des travaux de voiries.
- **Équipe Interne ML Immobilier SARL :** Direction et éditeurs administrant le site, publiant de nouvelles réalisations et traitant les demandes de devis entrantes.

## Product Purpose

Fournir une vitrine numérique d'autorité et de confiance pour **ML Immobilier SARL**, capable de convertir les visiteurs en demandes de devis qualifiées et en échanges directs (WhatsApp, téléphone), tout en offrant un espace d'administration sécurisé garantissant l'autonomie totale de l'entreprise sur ses contenus.

## Positioning

ML Immobilier SARL se positionne comme l'interlocuteur technique unique et intégré à Abidjan pour la chaîne immobilière globale : de la première pelletée de terre (**BTP**), à l'alimentation énergétique certifiée CIE (**Électrification**), jusqu'à la rentabilité et la pérennité locative (**Gestion Immobilière**).

## Operating Context

- **Marché :** Abidjan (Côte d'Ivoire), principalement Yopougon, Cocody, Bingerville, Plateau, Songon et intérieur du pays.
- **Canaux de communication privilégiés :** WhatsApp et appels téléphoniques directs cliquables, complétés par le formulaire de chiffrage.
- **Monnaie de référence :** Franc CFA (FCFA / XOF).
- **Réglementation :** Normes du Ministère de la Construction et normes techniques de la Compagnie Ivoirienne d’Électricité (CIE).

## Capabilities and Constraints

- **Fonctionnalités V1 incluses :**
  - Site public complet en français composé de sections modulables (Accueil, Qui sommes-nous, Services BTP/Énergie/Gestion, Réalisations avec galerie, Contact & Devis, Mentions légales).
  - Formulaire de demande de devis avec sélection du besoin, budget, délai, coordonnées et protection anti-spam.
  - Bouton flottant WhatsApp avec message préconfiguré et numéros cliquables.
  - Carte interactive de localisation centrée sur le siège (Yopougon Terminus 27).
  - Espace d'administration sécurisé (`/admin`) avec authentification par rôles (Admin et Éditeur).
  - Tableau de bord avec indicateurs de suivi des devis et des réalisations.
  - Gestionnaire de devis avec statuts réactifs (*Nouveau, En cours, Devis envoyé, Terminé, Archivé*) et relance 1-clic WhatsApp.
  - CRUD complet des réalisations avec photos, dates et localisations.
  - Panneau de réglages du site pilotant en-tête, pied de page, coordonnées et textes d'accroche.
- **Contraintes & exclusions V1 :**
  - Hébergement sur plans gratuits au démarrage (Supabase / Vercel).
  - Exclu du périmètre V1 : Annonces immobilières avec moteur de recherche complexe et espace comptes locataires (évolutions futures possibles).

## Brand Commitments

- **Nom officiel :** ML Immobilier SARL
- **Siège :** Abidjan (Yopougon, Terminus 27)
- **Identité & Ton :** Solide, institutionnel, architecture contemporaine et corporate premium. Sérieux, confiance, transparence et expertise technique.
- **Palette chromatique :** Blanc dominant (#FFFFFF, #FAFAFA), gris clairs (#F5F5F5, #E5E5E5) et contrastes anthracite (#111111, #333333). Préservation des couleurs fonctionnelles légitimes (vert WhatsApp officiel #25D366, statuts de validation).

## Evidence on Hand

- **Cahier des charges Version 2.0 (26 octobre 2026)** : document officiel validé fixant le périmètre, les fonctionnalités, les technologies (Nuxt, Nuxt UI, Tailwind, Supabase) et les coûts.
- **Réalisations de référence initiales :** Immeuble R+4 à Cocody Angré, Poste HTA/BTA à Bingerville, Gérance locative à Yopougon/Marcory, Rénovation au Plateau.

## Product Principles

1. **Rassurance et transparence technique :** Chaque affirmation est appuyée par des indicateurs concrets et le respect des normes officielles.
2. **Friction zéro vers la prise de contact :** Mise en avant immédiate de WhatsApp, des numéros d'appel et d'un formulaire de devis clair et rapide.
3. **Autonomie opérationnelle complète :** L'équipe ML Immobilier SARL pilote ses chantiers, ses devis et ses réglages sans intervention technique extérieure.
4. **Fidélité au terrain abidjanais :** Contenus, localisations, terminologie et codes graphiques adaptés aux réalités de la Côte d'Ivoire.

## Accessibility & Inclusion

- Responsive natif fluide pour mobile (Android, iOS), tablette et ordinateur.
- Boutons et zones tactiles confortables (min. 44x44px).
- Contrastes chromatiques optimisés conformes WCAG AA (`text-amber-950` sur fonds dorés/ambre).
- Champs de formulaire balisés avec indications visuelles explicites des erreurs et des succès.
