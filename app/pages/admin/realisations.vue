<script setup lang="ts">
import { ref } from 'vue'
import ImageUpload from '~/components/common/ImageUpload.vue'
import { useSiteData, type Project } from '~/composables/useSiteData'

definePageMeta({
  layout: 'admin'
})

const { projects, addProject, updateProject, deleteProject, toggleProjectPublish } = useSiteData()

const isModalOpen = ref(false)
const isEditing = ref(false)
const currentEditId = ref('')
const saveError = ref('')
const imageUploadsInProgress = ref(0)

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = error.data
    if (typeof data === 'object' && data !== null && 'statusMessage' in data && typeof data.statusMessage === 'string') {
      return data.statusMessage
    }
  }
  return error instanceof Error && error.message ? error.message : fallback
}

const projectForm = ref({
  title: '',
  category: 'btp' as Project['category'],
  location: '',
  date: '',
  description: '',
  fullDescription: '',
  imageUrl: '',
  imageStoragePath: '',
  galleryImages: [] as Array<{ imageUrl: string; storagePath: string }>,
  published: false,
  featured: false,
  displayOrder: 0
})

const openAddModal = () => {
  isEditing.value = false
  currentEditId.value = ''
  projectForm.value = {
    title: '',
    category: 'btp',
    location: '',
    date: '',
    description: '',
    fullDescription: '',
    imageUrl: '',
    imageStoragePath: '',
    galleryImages: [],
    published: false,
    featured: false,
    displayOrder: projects.value.length
  }
  isModalOpen.value = true
}

const openEditModal = (project: Project) => {
  isEditing.value = true
  currentEditId.value = project.id
  projectForm.value = {
    title: project.title,
    category: project.category,
    location: project.location,
    date: project.date,
    description: project.description,
    fullDescription: project.fullDescription || '',
    imageUrl: project.imageUrl,
    imageStoragePath: project.imageStoragePath || '',
    galleryImages: project.galleryImages || [],
    published: project.published,
    featured: project.featured,
    displayOrder: project.displayOrder
  }
  isModalOpen.value = true
}

const removeUnusedUpload = async (storagePath: string) => {
  if (!storagePath) return
  await $fetch('/api/admin/upload', {
    method: 'DELETE',
    body: { bucket: 'project-images', storagePath }
  })
}

const persistProjectImages = async (changes: Partial<Project>) => {
  if (!isEditing.value || !currentEditId.value) return
  imageUploadsInProgress.value++
  try {
    await updateProject(currentEditId.value, changes)
  } finally {
    imageUploadsInProgress.value = Math.max(0, imageUploadsInProgress.value - 1)
  }
}

const handleCoverUploaded = async (replacement: { url: string; storagePath: string }) => {
  const previousPath = projectForm.value.imageStoragePath
  const coverIndex = projectForm.value.galleryImages.findIndex(image => image.storagePath === previousPath)
  const nextGallery = [...projectForm.value.galleryImages]
  if (coverIndex >= 0) {
    nextGallery[coverIndex] = { imageUrl: replacement.url, storagePath: replacement.storagePath }
  } else {
    nextGallery.unshift({ imageUrl: replacement.url, storagePath: replacement.storagePath })
  }

  let cleanupWarning = ''
  try {
    await persistProjectImages({
      imageUrl: replacement.url,
      imageStoragePath: replacement.storagePath,
      galleryImages: nextGallery
    })
    projectForm.value.imageUrl = replacement.url
    projectForm.value.imageStoragePath = replacement.storagePath
    projectForm.value.galleryImages = nextGallery
    if (!isEditing.value && previousPath && previousPath !== replacement.storagePath) {
      try {
        await removeUnusedUpload(previousPath)
      } catch (cleanupError) {
        console.error('Nettoyage de l’ancienne image temporaire impossible:', cleanupError)
        cleanupWarning = 'La nouvelle image est enregistrée, mais l’ancienne image temporaire n’a pas pu être supprimée.'
      }
    }
    saveError.value = cleanupWarning
  } catch (error) {
    console.error('Erreur de remplacement de l’image principale:', error)
    try {
      await removeUnusedUpload(replacement.storagePath)
    } catch (cleanupError) {
      console.error('Nettoyage de la nouvelle image impossible:', cleanupError)
    }
    saveError.value = getApiErrorMessage(error, 'Impossible de remplacer l’image du projet.')
  }
}

const addGalleryImage = async (image: { url: string; storagePath: string }) => {
  const nextGallery = [...projectForm.value.galleryImages, { imageUrl: image.url, storagePath: image.storagePath }]
  try {
    await persistProjectImages({ galleryImages: nextGallery })
    projectForm.value.galleryImages = nextGallery
    saveError.value = ''
  } catch (error) {
    console.error('Erreur d’ajout à la galerie:', error)
    try {
      await removeUnusedUpload(image.storagePath)
    } catch (cleanupError) {
      console.error('Nettoyage de la nouvelle image impossible:', cleanupError)
    }
    saveError.value = getApiErrorMessage(error, 'Impossible d’ajouter cette image à la galerie.')
  }
}

const replaceGalleryImage = async (
  storagePath: string,
  replacement: { url: string; storagePath: string }
) => {
  const isCover = projectForm.value.imageStoragePath === storagePath
  const nextGallery = projectForm.value.galleryImages.map(image =>
    image.storagePath === storagePath
      ? { imageUrl: replacement.url, storagePath: replacement.storagePath }
      : image
  )

  try {
    await persistProjectImages({
      galleryImages: nextGallery,
      ...(isCover ? { imageUrl: replacement.url, imageStoragePath: replacement.storagePath } : {})
    })
    projectForm.value.galleryImages = nextGallery
    if (isCover) {
      projectForm.value.imageUrl = replacement.url
      projectForm.value.imageStoragePath = replacement.storagePath
    }
    if (!isEditing.value) {
      try {
        await removeUnusedUpload(storagePath)
      } catch (cleanupError) {
        console.error('Nettoyage de l’ancienne image temporaire impossible:', cleanupError)
        saveError.value = 'L’image a été remplacée, mais l’ancienne image temporaire n’a pas pu être supprimée.'
        return
      }
    }
    saveError.value = ''
  } catch (error) {
    console.error('Erreur de remplacement d’une image de galerie:', error)
    try {
      await removeUnusedUpload(replacement.storagePath)
    } catch (cleanupError) {
      console.error('Nettoyage de la nouvelle image impossible:', cleanupError)
    }
    saveError.value = getApiErrorMessage(error, 'Impossible de remplacer cette image.')
  }
}

const removeGalleryImage = async (storagePath: string) => {
  const nextGallery = projectForm.value.galleryImages.filter(image => image.storagePath !== storagePath)
  const isCover = projectForm.value.imageStoragePath === storagePath

  try {
    if (isCover) {
      await persistProjectImages({
        imageUrl: '',
        imageStoragePath: '',
        galleryImages: nextGallery
      })
      projectForm.value.imageUrl = ''
      projectForm.value.imageStoragePath = ''
    } else {
      await persistProjectImages({ galleryImages: nextGallery })
    }
    if (!isEditing.value) await removeUnusedUpload(storagePath)
    projectForm.value.galleryImages = nextGallery
    saveError.value = ''
  } catch (error) {
    console.error('Erreur de suppression d’une image de galerie:', error)
    saveError.value = getApiErrorMessage(error, 'Impossible de supprimer cette image.')
  }
}

const moveGalleryImage = (index: number, direction: -1 | 1) => {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= projectForm.value.galleryImages.length) return
  const images = [...projectForm.value.galleryImages]
  ;[images[index], images[nextIndex]] = [images[nextIndex]!, images[index]!]
  projectForm.value.galleryImages = images
}

const trackImageUpload = (uploading: boolean) => {
  imageUploadsInProgress.value = Math.max(0, imageUploadsInProgress.value + (uploading ? 1 : -1))
}

const removeProjectCover = async () => {
  if (!projectForm.value.imageUrl) return
  const storagePath = projectForm.value.imageStoragePath
  if (storagePath && projectForm.value.galleryImages.some(image => image.storagePath === storagePath)) {
    await removeGalleryImage(storagePath)
    return
  }
  try {
    await persistProjectImages({ imageUrl: '', imageStoragePath: '', galleryImages: projectForm.value.galleryImages })
    projectForm.value.imageUrl = ''
    projectForm.value.imageStoragePath = ''
    if (storagePath && !isEditing.value) await removeUnusedUpload(storagePath)
    saveError.value = ''
  } catch (error) {
    console.error('Erreur de suppression de l’image principale:', error)
    saveError.value = getApiErrorMessage(error, 'Impossible de supprimer l’image principale.')
  }
}

const closeProjectModal = async () => {
  if (!isEditing.value) {
    const storagePaths = new Set([
      projectForm.value.imageStoragePath,
      ...projectForm.value.galleryImages.map(image => image.storagePath)
    ].filter(Boolean))
    try {
      await Promise.all([...storagePaths].map(removeUnusedUpload))
    } catch (error) {
      console.error('Nettoyage des images du projet annulé impossible:', error)
      saveError.value = getApiErrorMessage(error, 'Certaines images temporaires n’ont pas pu être supprimées.')
      return
    }
  }
  isModalOpen.value = false
}

const saveProject = async () => {
  if (!projectForm.value.title.trim() || !projectForm.value.description.trim()) {
    alert('Veuillez renseigner le titre et la description de la réalisation.')
    return
  }
  if (!isEditing.value && (!projectForm.value.imageUrl || !projectForm.value.imageStoragePath)) {
    alert('Ajoutez une image principale depuis le bucket des réalisations avant de créer la fiche.')
    return
  }

  saveError.value = ''
  try {
    if (isEditing.value && currentEditId.value) {
      await updateProject(currentEditId.value, { ...projectForm.value })
    } else {
      await addProject({
        ...projectForm.value,
        galleryImages: projectForm.value.galleryImages
      })
    }
    isModalOpen.value = false
  } catch (error) {
    console.error('Erreur d’enregistrement du projet:', error)
    saveError.value = getApiErrorMessage(error, 'Impossible d’enregistrer le projet. Vérifiez la connexion puis réessayez.')
  }
}

const handleDelete = async (id: string) => {
  if (confirm('Voulez-vous vraiment supprimer cette réalisation ?')) {
    try {
      await deleteProject(id)
    } catch (error) {
      console.error('Erreur de suppression du projet:', error)
      saveError.value = 'Impossible de supprimer le projet.'
    }
  }
}

const handlePublishToggle = async (project: Project) => {
  try {
    await toggleProjectPublish(project.id)
  } catch (error) {
    console.error('Erreur de publication du projet:', error)
    saveError.value = 'Impossible de modifier la publication du projet.'
  }
}

useSeoMeta({
  title: 'Gestion des Réalisations | Admin ML Immobilier SARL',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="space-y-6">
    <p v-if="saveError" class="border border-red-200 bg-red-50 p-3 text-xs text-red-800">{{ saveError }}</p>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-black tracking-tight">Réalisations & Chantiers</h2>
        <p class="text-xs text-neutral-500 mt-0.5">Créez, publiez, modifiez ou masquez vos chantiers.</p>
      </div>

      <button
        type="button"
        @click="openAddModal"
        class="inline-flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xs transition-colors"
      >
        <UIcon name="i-heroicons-plus" class="w-4 h-4 text-white" />
        <span>Nouveau Projet</span>
      </button>
    </div>

    <!-- Projects Table / Grid -->
    <div class="bg-white border border-neutral-200 rounded-xs overflow-hidden">
      <div class="p-3.5 border-b border-neutral-200 flex justify-between items-center text-xs text-neutral-500 uppercase tracking-wider font-semibold">
        <span>{{ projects.length }} projet(s) enregistré(s)</span>
      </div>

      <div v-if="projects.length === 0" class="px-6 py-12 text-center">
        <UIcon name="i-heroicons-photo" class="mx-auto mb-3 h-9 w-9 text-neutral-400" />
        <h3 class="text-sm font-bold text-neutral-900">Aucune réalisation enregistrée</h3>
        <p class="mx-auto mt-2 max-w-md text-xs text-neutral-500">
          Ajoutez vos projets ici. Ils resteront en brouillon jusqu’à leur publication.
        </p>
        <button
          type="button"
          @click="openAddModal"
          class="mt-4 inline-flex items-center gap-1.5 bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800"
        >
          <UIcon name="i-heroicons-plus" class="h-4 w-4 text-white" />
          Ajouter une réalisation
        </button>
      </div>

      <div v-else class="divide-y divide-neutral-100">
        <div
          v-for="project in projects"
          :key="project.id"
          class="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
        >
          <!-- Left: Thumbnail & Info -->
          <div class="flex items-start gap-4">
            <div class="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xs border border-neutral-200 bg-neutral-900">
              <img v-if="project.imageUrl" :src="project.imageUrl" :alt="project.title" class="w-full h-full object-cover" />
              <UIcon v-else name="i-heroicons-photo" class="m-auto h-6 w-6 text-neutral-500" />
            </div>

            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-black text-sm">{{ project.title }}</span>
                <span class="text-[9px] uppercase font-bold text-black bg-neutral-100 px-1.5 py-0.5 rounded-xs border border-neutral-300">
                  {{ project.category }}
                </span>
                <span
                  :class="project.published ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500 border border-neutral-200'"
                  class="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-xs"
                >
                  {{ project.published ? 'Publié' : 'Brouillon' }}
                </span>
                <span v-if="project.featured" class="border border-black text-black text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-xs">
                  En vedette
                </span>
              </div>

              <p class="text-xs text-neutral-600 line-clamp-1 max-w-xl">{{ project.description }}</p>

              <div v-if="project.location || project.date" class="text-[11px] text-neutral-500 flex items-center gap-4">
                <span v-if="project.location" class="flex items-center gap-1">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-neutral-400" />
                  {{ project.location }}
                </span>
                <span v-if="project.date" class="flex items-center gap-1 font-mono">
                  <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5 text-neutral-400" />
                  {{ project.date }}
                </span>
                <span v-if="project.client" class="flex items-center gap-1">
                  <UIcon name="i-heroicons-user" class="w-3.5 h-3.5 text-neutral-400" />
                  {{ project.client }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              type="button"
              @click="handlePublishToggle(project)"
              class="px-3 py-1.5 rounded-xs bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-black text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              {{ project.published ? 'Masquer' : 'Publier' }}
            </button>

            <button
              type="button"
              @click="openEditModal(project)"
              class="px-3 py-1.5 rounded-xs bg-black hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Modifier
            </button>

            <button
              type="button"
              @click="handleDelete(project.id)"
              class="p-1.5 text-neutral-400 hover:text-black rounded-xs transition-colors"
              title="Supprimer"
            >
              <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD / EDIT MODAL -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      @click.self="closeProjectModal"
    >
      <div class="bg-white border border-neutral-300 rounded-xs max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-neutral-200 pb-3">
          <h3 class="text-base font-black text-black uppercase tracking-wider">
            {{ isEditing ? 'Modifier la Réalisation' : 'Nouveau Projet' }}
          </h3>
          <button
            type="button"
            @click="closeProjectModal"
            class="text-neutral-400 hover:text-black"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveProject" class="space-y-4">
          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Titre de l'ouvrage *</label>
            <input
              v-model="projectForm.title"
              type="text"
              required
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
              placeholder="Construction Immeuble R+4"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Catégorie *</label>
              <select
                v-model="projectForm.category"
                class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
              >
                <option value="btp">BTP – Bâtiment et travaux publics</option>
                <option value="electrification">Électrification et distribution électrique</option>
                <option value="gestion">Gestion immobilière</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Localisation</label>
              <input
                v-model="projectForm.location"
                type="text"
                class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
                placeholder="Facultatif"
              />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Date de réalisation</label>
            <input
              v-model="projectForm.date"
              type="date"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none font-mono"
            />
            <p class="mt-1 text-[10px] text-neutral-500">Laissez vide si la date n’est pas connue.</p>
          </div>

          <div>
            <ImageUpload
              :model-value="projectForm.imageUrl"
              @uploaded="handleCoverUploaded"
              @delete="removeProjectCover"
              @uploading="trackImageUpload"
              label="Photo principale du projet"
              hint="Ajoutez une image, remplacez-la ou supprimez-la."
              preview-size="medium"
              :max-file-size="5"
              :disabled="imageUploadsInProgress > 0"
              bucket="project-images"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider">Galerie du projet</label>
            <ImageUpload
              model-value=""
              bucket="project-images"
              compact
              :disabled="projectForm.galleryImages.length >= 20 || imageUploadsInProgress > 0"
              label="Ajouter une image à la galerie"
              hint="Les images importées seront enregistrées dans la galerie Supabase du projet."
              @uploading="trackImageUpload"
              @uploaded="addGalleryImage"
            />
            <p v-if="projectForm.galleryImages.length >= 20" class="text-xs text-amber-700">
              La galerie est limitée à 20 images.
            </p>
            <div v-if="projectForm.galleryImages.length" class="space-y-3">
              <div
                v-for="(image, index) in projectForm.galleryImages"
                :key="image.storagePath"
                class="grid gap-3 rounded-sm border border-neutral-200 p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <ImageUpload
                  :model-value="image.imageUrl"
                  bucket="project-images"
                  compact
                  preview-size="small"
                  label="Image de galerie"
                  :disabled="imageUploadsInProgress > 0"
                  @uploading="trackImageUpload"
                  @uploaded="replaceGalleryImage(image.storagePath, $event)"
                  @delete="removeGalleryImage(image.storagePath)"
                />
                <div class="flex items-start gap-1">
                  <button
                    type="button"
                    :disabled="index === 0"
                    class="rounded-sm border px-2 py-1 text-xs disabled:opacity-40"
                    :aria-label="`Déplacer l’image ${index + 1} vers le haut`"
                    @click="moveGalleryImage(index, -1)"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    :disabled="index === projectForm.galleryImages.length - 1"
                    class="rounded-sm border px-2 py-1 text-xs disabled:opacity-40"
                    :aria-label="`Déplacer l’image ${index + 1} vers le bas`"
                    @click="moveGalleryImage(index, 1)"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Ordre d’affichage</label>
            <input
              v-model.number="projectForm.displayOrder"
              type="number"
              min="0"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Courte description *</label>
            <textarea
              v-model="projectForm.description"
              rows="2"
              required
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
              placeholder="Résumé des travaux réalisés..."
            ></textarea>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Détails techniques complets</label>
            <textarea
              v-model="projectForm.fullDescription"
              rows="3"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
              placeholder="Détails techniques, structures, postes installés..."
            ></textarea>
          </div>

          <div class="flex items-center gap-6 pt-1 text-xs text-neutral-800">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="projectForm.published" class="rounded-none text-black" />
              <span>Publié sur le site</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="projectForm.featured" class="rounded-none text-black" />
              <span>En vedette à l'accueil</span>
            </label>
          </div>

          <div class="pt-3 border-t border-neutral-200 flex justify-end gap-2">
            <button
              type="button"
              @click="closeProjectModal"
              class="px-4 py-2 rounded-xs text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-black"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="imageUploadsInProgress > 0"
              class="bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-xs text-xs uppercase tracking-wider transition-colors"
            >
              {{ imageUploadsInProgress ? 'Téléversement en cours…' : (isEditing ? 'Enregistrer' : 'Créer le projet') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
