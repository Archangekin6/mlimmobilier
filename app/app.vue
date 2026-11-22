<script setup lang="ts">
import { useSiteData } from "~/composables/useSiteData";

const { settings } = useSiteData();

// SEO Meta configuration
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} | ML Immobilier SARL`
      : "ML Immobilier SARL | BTP, Électrification & Gestion à Abidjan";
  },
  meta: [
    {
      name: "description",
      content:
        "ML Immobilier SARL - Entreprise de référence à Abidjan (Yopougon Terminus 27) pour les travaux de BTP, l’électrification haute/basse tension et la gestion immobilière sécurisée.",
    },
    { name: "theme-color", content: "#000000" },
    { property: "og:locale", content: "fr_FR" },
    { property: "og:type", content: "website" },
  ],
  link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.ico" }],
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
