<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSiteData, type Testimonial } from '~/composables/useSiteData'

definePageMeta({ layout: 'admin' })

const { testimonials, saveTestimonial, deleteTestimonial, loadAdminData } = useSiteData()
const editingId = ref<string | null>(null)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = ref({
  client_name: '',
  client_function: '',
  client_company: '',
  client_location: '',
  testimonial_text: '',
  service_type: '',
  rating: null as number | null,
  photo_url: '',
  testimonial_date: '',
  published: false,
  featured: false,
  display_order: 0
})

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = error.data
    if (typeof data === 'object' && data !== null && 'statusMessage' in data && typeof data.statusMessage === 'string') {
      return data.statusMessage
    }
  }
  return error instanceof Error && error.message ? error.message : fallback
}

const resetForm = () => {
  editingId.value = null
  form.value = {
    client_name: '',
    client_function: '',
    client_company: '',
    client_location: '',
    testimonial_text: '',
    service_type: '',
    rating: null,
    photo_url: '',
    testimonial_date: '',
    published: false,
    featured: false,
    display_order: testimonials.value.length
  }
}

const removePhoto = () => {
  if (form.value.photo_url && window.confirm('Supprimer la photo de ce témoignage ?')) {
    form.value.photo_url = ''
  }
}

const editTestimonial = (testimonial: Testimonial) => {
  editingId.value = testimonial.id
  form.value = {
    client_name: testimonial.client_name,
    client_function: testimonial.client_function || '',
    client_company: testimonial.client_company || '',
    client_location: testimonial.client_location || '',
    testimonial_text: testimonial.testimonial_text,
    service_type: testimonial.service_type || '',
    rating: testimonial.rating,
    photo_url: testimonial.photo_url || '',
    testimonial_date: testimonial.testimonial_date || '',
    published: testimonial.published,
    featured: testimonial.featured,
    display_order: testimonial.display_order
  }
}

const submit = async () => {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const cleanupWarning = await saveTestimonial({
      ...form.value,
      client_function: form.value.client_function || null,
      client_company: form.value.client_company || null,
      client_location: form.value.client_location || null,
      service_type: form.value.service_type || null,
      photo_url: form.value.photo_url || null,
      testimonial_date: form.value.testimonial_date || null,
      ...(editingId.value ? { id: editingId.value } : {})
    })
    resetForm()
    successMessage.value = cleanupWarning || 'Témoignage enregistré.'
  } catch (error) {
    console.error('Erreur d’enregistrement du témoignage:', error)
    errorMessage.value = getApiErrorMessage(error, 'Impossible d’enregistrer le témoignage.')
  } finally {
    saving.value = false
  }
}

const togglePublished = async (testimonial: Testimonial) => {
  try {
    await saveTestimonial({
      ...testimonial,
      published: !testimonial.published
    })
  } catch (error) {
    console.error('Erreur de publication du témoignage:', error)
    errorMessage.value = 'Impossible de modifier la publication.'
  }
}

const removeTestimonial = async (id: string) => {
  if (!confirm('Supprimer définitivement ce témoignage ?')) return
  try {
    const cleanupWarning = await deleteTestimonial(id)
    if (editingId.value === id) resetForm()
    successMessage.value = cleanupWarning || 'Témoignage supprimé.'
  } catch (error) {
    console.error('Erreur de suppression du témoignage:', error)
    errorMessage.value = 'Impossible de supprimer le témoignage.'
  }
}

onMounted(() => {
  void loadAdminData().catch((error: unknown) => {
    console.error('Erreur de chargement des témoignages:', error)
    errorMessage.value = 'Impossible de charger les témoignages.'
  })
})
</script>

<template>
  <div class="space-y-6">
    <header>
      <h2 class="text-xl sm:text-2xl font-black text-black">Témoignages clients</h2>
      <p class="mt-1 text-xs text-neutral-500">Gérez les avis publiés sur le site.</p>
    </header>

    <p v-if="errorMessage" class="border border-red-200 bg-red-50 p-3 text-xs text-red-800">{{ errorMessage }}</p>
    <p v-if="successMessage" role="status" class="border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{{ successMessage }}</p>

    <form class="space-y-4 border border-neutral-200 bg-white p-5" @submit.prevent="submit">
      <h3 class="font-bold text-sm">{{ editingId ? 'Modifier le témoignage' : 'Ajouter un témoignage' }}</h3>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="text-xs">Nom du client *
          <input v-model="form.client_name" required maxlength="200" class="mt-1 w-full border border-neutral-300 p-2">
        </label>
        <label class="text-xs">Fonction
          <input v-model="form.client_function" maxlength="200" class="mt-1 w-full border border-neutral-300 p-2">
        </label>
        <label class="text-xs">Entreprise
          <input v-model="form.client_company" maxlength="200" class="mt-1 w-full border border-neutral-300 p-2">
        </label>
        <label class="text-xs">Localisation
          <input v-model="form.client_location" maxlength="200" class="mt-1 w-full border border-neutral-300 p-2">
        </label>
        <label class="text-xs">Prestation
          <select v-model="form.service_type" class="mt-1 w-full border border-neutral-300 p-2">
            <option value="">Non précisée</option>
            <option value="btp">BTP</option>
            <option value="electrification">Électrification</option>
            <option value="gestion">Gestion immobilière</option>
            <option value="autre">Autre</option>
          </select>
        </label>
        <label class="text-xs">Note (1–5)
          <select v-model="form.rating" class="mt-1 w-full border border-neutral-300 p-2">
            <option :value="null">Sans note</option>
            <option v-for="rating in [1, 2, 3, 4, 5]" :key="rating" :value="rating">{{ rating }}</option>
          </select>
        </label>
        <label class="text-xs">Date
          <input v-model="form.testimonial_date" type="date" class="mt-1 w-full border border-neutral-300 p-2">
        </label>
        <label class="text-xs">Ordre d’affichage
          <input v-model.number="form.display_order" type="number" min="0" class="mt-1 w-full border border-neutral-300 p-2">
        </label>
        <div class="sm:col-span-2">
          <ImageUpload
            :model-value="form.photo_url"
            bucket="site-images"
            label="Photo du client"
            hint="Téléversez une image ou indiquez une URL externe."
            preview-size="small"
            @update:model-value="form.photo_url = $event"
          />
          <button
            v-if="form.photo_url"
            type="button"
            class="mt-2 text-xs font-semibold text-red-700 underline"
            @click="removePhoto"
          >
            Supprimer la photo
          </button>
        </div>
        <label class="text-xs sm:col-span-2">Témoignage *
          <textarea v-model="form.testimonial_text" required maxlength="5000" rows="4" class="mt-1 w-full border border-neutral-300 p-2" />
        </label>
      </div>
      <div class="flex flex-wrap gap-4 text-xs">
        <label class="flex items-center gap-2"><input v-model="form.published" type="checkbox"> Publié</label>
        <label class="flex items-center gap-2"><input v-model="form.featured" type="checkbox"> Mis en avant</label>
      </div>
      <div class="flex gap-2">
        <button type="submit" :disabled="saving" class="bg-black px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <button v-if="editingId" type="button" class="border px-4 py-2 text-xs" @click="resetForm">Annuler</button>
      </div>
    </form>

    <section class="divide-y border border-neutral-200 bg-white">
      <article v-for="testimonial in testimonials" :key="testimonial.id" class="flex flex-wrap items-start justify-between gap-4 p-4">
        <div class="max-w-3xl">
          <div class="flex flex-wrap items-center gap-2">
            <strong class="text-sm">{{ testimonial.client_name }}</strong>
            <span class="text-xs text-neutral-500">{{ testimonial.published ? 'Publié' : 'Brouillon' }}</span>
            <span v-if="testimonial.featured" class="text-xs font-semibold">Mis en avant</span>
          </div>
          <p class="mt-1 text-xs text-neutral-600">{{ testimonial.testimonial_text }}</p>
        </div>
        <div class="flex gap-2">
          <button type="button" class="border px-3 py-1 text-xs" @click="editTestimonial(testimonial)">Modifier</button>
          <button type="button" class="border px-3 py-1 text-xs" @click="togglePublished(testimonial)">
            {{ testimonial.published ? 'Dépublier' : 'Publier' }}
          </button>
          <button type="button" class="border border-red-200 px-3 py-1 text-xs text-red-700" @click="removeTestimonial(testimonial.id)">Supprimer</button>
        </div>
      </article>
      <p v-if="testimonials.length === 0" class="p-6 text-center text-xs text-neutral-500">Aucun témoignage enregistré.</p>
    </section>
  </div>
</template>
