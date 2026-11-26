<script setup lang="ts">
import { ref } from 'vue'
import ImageUpload from '~/components/common/ImageUpload.vue'
import {
  useSiteData,
  type Project,
  type ProjectCreateInput,
  type ProjectUpdateInput
} from '~/composables/useSiteData'

definePageMeta({
  layout: 'admin'
})

const { projects, addProject, updateProject, deleteProject, toggleProjectPublish } = useSiteData()

const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const currentEditId = ref('')
const saveError = ref('')
const saveSuccess = ref('')
const imageUploadsInProgress = ref(0)
const pendingUploadPaths = ref(new Set<string>())
const coverImageChanged = ref(false)

const projectForm = ref({
  title: '',
  category: 'btp' as Project['category'],
  location: '',
  description: '',
  imageUrl: '',
  imageStoragePath: '',
  featured: false
})

const categoryLabels: Record<Project['category'], string> = {
  btp: 'BTP – Bâtiment et travaux publics',
  electrification: 'Électrification et distribution électrique',
  gestion: 'Gestion immobilière'
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = error.data
    if (typeof data === 'object' && data !== null && 'statusMessage' in data && typeof data.statusMessage === 'string') {
      return data.statusMessage
    }
  }
  return error instanceof Error && error.message ? error.message : fallback
}

const resetMessages = () => {
  saveError.value = ''
  saveSuccess.value = ''
}

const openAddModal = () => {
  isEditing.value = false
  currentEditId.value = ''
  projectForm.value = {
    title: '',
    category: 'btp',
    location: '',
    description: '',
    imageUrl: '',
    imageStoragePath: '',
    featured: false
  }
  pendingUploadPaths.value = new Set()
  coverImageChanged.value = false
  resetMessages()
  isModalOpen.value = true
}

const openEditModal = (project: Project) => {
  isEditing.value = true
  currentEditId.value = project.id
  projectForm.value = {
    title: project.title,
    category: project.category,
    location: project.location,
    description: project.description,
    imageUrl: project.imageUrl,
    imageStoragePath: project.imageStoragePath || '',
    featured: project.featured
  }
  pendingUploadPaths.value = new Set()
  coverImageChanged.value = false
  resetMessages()
  isModalOpen.value = true
}

const removeUnusedUpload = async (storagePath: string) => {
  if (!storagePath) return
  const result = await $fetch<{ removed: boolean; referenced: boolean; message: string }>('/api/admin/upload', {
    method: 'DELETE',
    body: { bucket: 'project-images', storagePath }
  })
  if (!result.removed && !result.referenced && result.message !== 'Aucune suppression nécessaire.') {
    throw new Error(result.message || 'Impossible de supprimer le fichier temporaire.')
  }
}

const handleCoverUploaded = async (uploaded: { url: string; storagePath: string }) => {
  if (!uploaded.url || !uploaded.storagePath) {
    throw new Error('Le téléversement ne contient pas de référence exploitable.')
  }

  const previousPath = projectForm.value.imageStoragePath
  pendingUploadPaths.value.add(uploaded.storagePath)
  projectForm.value.imageUrl = uploaded.url
  projectForm.value.imageStoragePath = uploaded.storagePath
  coverImageChanged.value = true
  saveError.value = ''

  if (previousPath && previousPath !== uploaded.storagePath && pendingUploadPaths.value.has(previousPath)) {
    try {
      await removeUnusedUpload(previousPath)
      pendingUploadPaths.value.delete(previousPath)
    } catch (error) {
      console.error('Nettoyage de l’ancienne image temporaire impossible:', error)
      saveError.value = getApiErrorMessage(error, 'La nouvelle photo est prête, mais une ancienne image temporaire n’a pas pu être supprimée.')
    }
  }
}

const handleCoverDeleted = async () => {
  const storagePath = projectForm.value.imageStoragePath
  if (storagePath && pendingUploadPaths.value.has(storagePath)) {
    await removeUnusedUpload(storagePath)
    pendingUploadPaths.value.delete(storagePath)
  }
  projectForm.value.imageUrl = ''
  projectForm.value.imageStoragePath = ''
  coverImageChanged.value = true
  saveError.value = ''
}

const trackImageUpload = (uploading: boolean) => {
  imageUploadsInProgress.value = Math.max(0, imageUploadsInProgress.value + (uploading ? 1 : -1))
}

const closeProjectModal = async () => {
  if (isSaving.value || imageUploadsInProgress.value > 0) return

  try {
    await Promise.all([...pendingUploadPaths.value].map(removeUnusedUpload))
    pendingUploadPaths.value.clear()
    isModalOpen.value = false
  } catch (error) {
    console.error('Nettoyage des images temporaires impossible:', error)
    saveError.value = getApiErrorMessage(error, 'Certaines images temporaires n’ont pas pu être supprimées.')
  }
}

const saveProject = async () => {
  if (isSaving.value || imageUploadsInProgress.value > 0) return
  resetMessages()

  const form = projectForm.value
  if (!form.title.trim() || !form.description.trim()) {
    saveError.value = 'Renseignez le titre et la courte description de la réalisation.'
    return
  }
  if (!isEditing.value && (!form.imageUrl || !form.imageStoragePath)) {
    saveError.value = 'Téléversez la photo principale et attendez la fin du téléversement avant l’enregistrement.'
    return
  }
  if (form.imageUrl && coverImageChanged.value && !form.imageStoragePath) {
    saveError.value = 'La photo sélectionnée ne possède pas de référence Storage valide.'
    return
  }

  isSaving.value = true
  try {
    if (isEditing.value && currentEditId.value) {
      const update: ProjectUpdateInput = {
        title: form.title.trim(),
        category: form.category,
        location: form.location.trim(),
        description: form.description.trim(),
        featured: form.featured
      }
      if (coverImageChanged.value) {
        update.imageUrl = form.imageUrl || null
        update.imageStoragePath = form.imageStoragePath || null
      }
      await updateProject(currentEditId.value, update)
      saveSuccess.value = 'La réalisation a été modifiée.'
    } else {
      const input: ProjectCreateInput = {
        title: form.title.trim(),
        category: form.category,
        location: form.location.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl,
        imageStoragePath: form.imageStoragePath,
        featured: form.featured
      }
      await addProject(input)
      saveSuccess.value = 'La réalisation a été enregistrée et publiée.'
    }
    pendingUploadPaths.value.clear()
    isModalOpen.value = false
  } catch (error) {
    console.error('Erreur d’enregistrement de la réalisation:', error)
    saveError.value = getApiErrorMessage(error, 'Impossible d’enregistrer la réalisation. Vérifiez la connexion puis réessayez.')
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id: string) => {
  if (!window.confirm('Voulez-vous vraiment supprimer cette réalisation ?')) return
  resetMessages()
  try {
    await deleteProject(id)
    saveSuccess.value = 'La réalisation a été supprimée.'
  } catch (error) {
    console.error('Erreur de suppression du projet:', error)
    saveError.value = getApiErrorMessage(error, 'Impossible de supprimer cette réalisation.')
  }
}

const handlePublishToggle = async (project: Project) => {
  resetMessages()
  try {
    await toggleProjectPublish(project.id)
    saveSuccess.value = project.published
      ? 'La réalisation a été dépubliée.'
      : 'La réalisation a été publiée.'
  } catch (error) {
    console.error('Erreur de publication du projet:', error)
    saveError.value = getApiErrorMessage(error, 'Impossible de modifier la publication du projet.')
  }
}

useSeoMeta({
  title: 'Gestion des Réalisations | Admin ML Immobilier SARL',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="space-y-6">
    <p v-if="saveSuccess" role="status" class="border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
      {{ saveSuccess }}
    </p>
    <p v-if="saveError" role="alert" class="border border-red-200 bg-red-50 p-3 text-xs text-red-800">
      {{ saveError }}
    </p>

    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 class="text-xl font-black tracking-tight text-black sm:text-2xl">Réalisations & Chantiers</h2>
        <p class="mt-0.5 text-xs text-neutral-500">Gérez les projets présentés sur le site.</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-xs bg-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800"
        @click="openAddModal"
      >
        <UIcon name="i-heroicons-plus" class="h-4 w-4 text-white" />
        <span>Nouvelle réalisation</span>
      </button>
    </div>

    <div class="overflow-hidden rounded-xs border border-neutral-200 bg-white">
      <div class="flex items-center justify-between border-b border-neutral-200 p-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        <span>{{ projects.length }} réalisation(s) enregistrée(s)</span>
      </div>

      <div v-if="projects.length === 0" class="px-6 py-12 text-center">
        <UIcon name="i-heroicons-photo" class="mx-auto mb-3 h-9 w-9 text-neutral-400" />
        <h3 class="text-sm font-bold text-neutral-900">Aucune réalisation enregistrée</h3>
        <p class="mx-auto mt-2 max-w-md text-xs text-neutral-500">
          Ajoutez une réalisation. Elle sera publiée automatiquement après son enregistrement.
        </p>
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-1.5 bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800"
          @click="openAddModal"
        >
          <UIcon name="i-heroicons-plus" class="h-4 w-4 text-white" />
          Ajouter une réalisation
        </button>
      </div>

      <div v-else class="divide-y divide-neutral-100">
        <div
          v-for="project in projects"
          :key="project.id"
          class="flex flex-col items-start justify-between gap-4 p-4 transition-colors hover:bg-neutral-50 sm:p-5 md:flex-row md:items-center"
        >
          <div class="flex min-w-0 items-start gap-4">
            <div class="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xs border border-neutral-200 bg-neutral-100">
              <img v-if="project.imageUrl" :src="project.imageUrl" :alt="project.title" class="h-full w-full object-cover">
              <UIcon v-else name="i-heroicons-photo" class="m-auto h-6 w-6 text-neutral-500" />
            </div>
            <div class="min-w-0 space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-bold text-black">{{ project.title }}</span>
                <span class="rounded-xs border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-black">
                  {{ categoryLabels[project.category] }}
                </span>
                <span
                  :class="project.published ? 'bg-black text-white' : 'border border-neutral-200 bg-neutral-100 text-neutral-500'"
                  class="rounded-xs px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                >
                  {{ project.published ? 'Publié' : 'Dépublié' }}
                </span>
                <span
                  :class="project.featured ? 'border-black text-black' : 'border-neutral-200 text-neutral-500'"
                  class="rounded-xs border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                >
                  {{ project.featured ? 'En vedette' : 'Pas en vedette' }}
                </span>
              </div>
              <p class="line-clamp-1 max-w-xl text-xs text-neutral-600">{{ project.description }}</p>
              <p v-if="project.location" class="flex items-center gap-1 text-[11px] text-neutral-500">
                <UIcon name="i-heroicons-map-pin" class="h-3.5 w-3.5 text-neutral-400" />
                {{ project.location }}
              </p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2 self-end md:self-center">
            <button
              type="button"
              class="rounded-xs border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-neutral-200"
              @click="handlePublishToggle(project)"
            >
              {{ project.published ? 'Dépublier' : 'Publier' }}
            </button>
            <button
              type="button"
              class="rounded-xs bg-black px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800"
              @click="openEditModal(project)"
            >
              Modifier
            </button>
            <button
              type="button"
              class="rounded-xs p-1.5 text-neutral-400 transition-colors hover:text-black"
              title="Supprimer"
              aria-label="Supprimer la réalisation"
              @click="handleDelete(project.id)"
            >
              <UIcon name="i-heroicons-trash" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-xs sm:p-6"
      @click.self="closeProjectModal"
    >
      <div class="max-h-[90vh] w-full max-w-xl space-y-5 overflow-y-auto rounded-xs border border-neutral-300 bg-white p-5 sm:p-6">
        <div class="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-black">
              {{ isEditing ? 'Modifier la réalisation' : 'Nouvelle réalisation' }}
            </h3>
            <p class="mt-1 text-[11px] text-neutral-500">
              Toute nouvelle réalisation est publiée après son enregistrement.
            </p>
          </div>
          <button
            type="button"
            :disabled="isSaving || imageUploadsInProgress > 0"
            class="text-neutral-400 hover:text-black disabled:opacity-40"
            aria-label="Fermer"
            @click="closeProjectModal"
          >
            <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="saveProject">
          <div>
            <label for="project-title" class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-black">
              Titre de l’ouvrage *
            </label>
            <input
              id="project-title"
              v-model="projectForm.title"
              type="text"
              maxlength="200"
              required
              class="w-full rounded-xs border border-neutral-300 bg-white px-3 py-2 text-xs text-black focus:border-black focus:outline-none"
              placeholder="Titre de la réalisation"
            >
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label for="project-category" class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-black">
                Catégorie *
              </label>
              <select
                id="project-category"
                v-model="projectForm.category"
                required
                class="w-full rounded-xs border border-neutral-300 bg-white px-3 py-2 text-xs text-black focus:border-black focus:outline-none"
              >
                <option value="btp">BTP – Bâtiment et travaux publics</option>
                <option value="electrification">Électrification et distribution électrique</option>
                <option value="gestion">Gestion immobilière</option>
              </select>
            </div>
            <div>
              <label for="project-location" class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-black">
                Localisation
              </label>
              <input
                id="project-location"
                v-model="projectForm.location"
                type="text"
                maxlength="200"
                class="w-full rounded-xs border border-neutral-300 bg-white px-3 py-2 text-xs text-black focus:border-black focus:outline-none"
                placeholder="Facultatif"
              >
            </div>
          </div>

          <div>
            <ImageUpload
              v-model="projectForm.imageUrl"
              :on-upload-complete="handleCoverUploaded"
              :on-delete-complete="handleCoverDeleted"
              :disabled="imageUploadsInProgress > 0 || isSaving"
              label="Photo principale du projet *"
              hint="Sélectionnez une image depuis votre ordinateur. Elle est téléversée dans le bucket des réalisations."
              preview-size="medium"
              accepted-formats="image/jpeg,image/png,image/webp,image/gif,image/avif"
              :max-file-size="5"
              bucket="project-images"
              @uploading="trackImageUpload"
            />
            <p class="mt-1 text-[10px] text-neutral-500">
              JPG, PNG, WebP, GIF ou AVIF — 5 Mo maximum. Obligatoire à la création; une suppression est possible en modification.
            </p>
            <p v-if="coverImageChanged && projectForm.imageStoragePath" class="mt-1 text-[10px] text-neutral-600">
              La photo est prête; son association sera enregistrée avec la réalisation.
            </p>
          </div>

          <div>
            <label for="project-description" class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-black">
              Courte description *
            </label>
            <textarea
              id="project-description"
              v-model="projectForm.description"
              rows="3"
              maxlength="5000"
              required
              class="w-full rounded-xs border border-neutral-300 bg-white px-3 py-2 text-xs text-black focus:border-black focus:outline-none"
              placeholder="Décrivez brièvement la réalisation."
            />
          </div>

          <label class="flex cursor-pointer items-center gap-2 pt-1 text-xs text-neutral-800">
            <input v-model="projectForm.featured" type="checkbox" class="rounded-none text-black">
            <span>Mettre en vedette à l’accueil</span>
          </label>

          <div class="flex justify-end gap-2 border-t border-neutral-200 pt-3">
            <button
              type="button"
              :disabled="isSaving || imageUploadsInProgress > 0"
              class="rounded-xs px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-black disabled:opacity-40"
              @click="closeProjectModal"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isSaving || imageUploadsInProgress > 0"
              class="rounded-xs bg-black px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ isSaving ? 'Enregistrement…' : 'Enregistrer la réalisation' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
