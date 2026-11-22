---
name: ML Immobilier SARL
description: Vitrine d'ingénierie BTP, électrification HTA/BTA et gestion de patrimoine — Direction artistique contemporaine corporate premium (Blanc dominant, structure architecturale, couleurs fonctionnelles préservées)
colors:
  primary: "#111111"
  primary-dark: "#000000"
  surface: "#FFFFFF"
  surface-subtle: "#FAFAFA"
  surface-muted: "#F5F5F5"
  surface-card: "#FFFFFF"
  border: "#E5E5E5"
  border-subtle: "#F0F0F0"
  border-dark: "#333333"
  text-primary: "#111111"
  text-secondary: "#333333"
  text-muted: "#737373"
  text-inverse: "#FFFFFF"
  functional:
    whatsapp: "#25D366"
    whatsapp-hover: "#20BA59"
    success: "#059669"
    success-subtle: "#ECFDF5"
    success-border: "#A7F3D0"
    warning: "#D97706"
    warning-subtle: "#FFFBEB"
    warning-border: "#FDE68A"
    error: "#DC2626"
    error-subtle: "#FEF2F2"
    error-border: "#FECACA"
    info: "#2563EB"
    info-subtle: "#EFF6FF"
    info-border: "#BFDBFE"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.025em"
rounded:
  none: "0px"
  xs: "3px"
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverse}"
    hoverBackground: "{colors.primary-dark}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
    fontSize: "0.8125rem"
    fontWeight: 600
    letterSpacing: "0.05em"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    hoverBackground: "{colors.surface-muted}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-whatsapp:
    backgroundColor: "{colors.functional.whatsapp}"
    textColor: "{colors.text-inverse}"
    hoverBackground: "{colors.functional.whatsapp-hover}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "24px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    focusBorder: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

# Design System: ML Immobilier SARL

## Overview

**Direction Artistique : Architecture Contemporaine — Corporate Premium**

Le système visuel de ML Immobilier SARL reflète l'excellence des grands cabinets d'ingénierie et d'architecture contemporaine :
1. **Luminosité & Blanc Dominant** : 
   - Blanc pur (`#FFFFFF`) pour l'en-tête, les surfaces principales, les arrière-plans et les cartes.
   - Blanc cassé (`#FAFAFA`) et gris très clair (`#F5F5F5`) pour les zones d'alternance et les arrière-plans d'administration.
   - Gris clair (`#E5E5E5`) pour les bordures et les séparateurs fins.
   - Gris foncé (`#333333`) et noir anthracite (`#111111`) pour les textes, la typographie et les contrastes.
2. **Couleurs Fonctionnelles & Légitimes** :
   - Bouton WhatsApp : vert officiel de WhatsApp (`#25D366`), avec icône vectorielle officielle WhatsApp SVG.
   - États de validation et indicateurs : vert succès (`#059669`), rouge alerte/erreur (`#DC2626`), ambre modéré (`#D97706`), bleu information (`#2563EB`).
   - Réseaux sociaux : logos officiels vectoriels.
3. **Header Lumineux et Direct** :
   - Le header est blanc (`#FFFFFF`), soigné et élégant, premier élément visible du viewport.
   - Suppression définitive de toute topbar (aucun bandeau supérieur de localisation, d'heure ou de date).
4. **Formes & Border Radius Architecturaux** :
   - Arrondis discrets et maîtrisés : 3 à 6px pour les boutons et contrôles de formulaires, 4 à 8px pour les cartes et conteneurs.
   - Évitement strict des `rounded-2xl` et `rounded-3xl` pour préserver une posture institutionnelle solide.
5. **Iconographie Vectorielle Propre** :
   - Zéro emoji sur l'ensemble du site public et de l'administration.
   - Icônes de bibliothèque (HeroIcons / Lucide) homogènes en taille et épaisseur.
6. **Harmonisation Site Public & Espace Administration** :
   - L'administration partage le même univers lumineux : arrière-plans blancs et gris clairs, navigation claire, tableaux aérés, bordures fines `#E5E5E5`.
