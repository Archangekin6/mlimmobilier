<script setup lang="ts">
import { useSiteData } from "~/composables/useSiteData";

const { settings, loadPublicData } = useSiteData();

await loadPublicData();

// SEO Meta configuration
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} | ${settings.value.companyName}`
      : `${settings.value.companyName} | BTP, Électrification & Gestion`;
  },
  meta: [
    {
      name: "description",
      content: `${settings.value.companyName} - BTP, électrification et gestion immobilière${settings.value.city ? ` à ${settings.value.city}` : ''}.`,
    },
    { name: "theme-color", content: "#000000" },
    { property: "og:locale", content: "fr_FR" },
    { property: "og:type", content: "website" },
  ],
  link: [{ rel: "icon", type: "image/x-icon", href: "/mlimmobilier.ico" }],
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
