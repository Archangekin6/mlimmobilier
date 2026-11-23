<script setup lang="ts">
import { ref } from 'vue'
import { useSiteData, type Project } from '~/composables/useSiteData'

definePageMeta({
  layout: 'admin'
})

const { projects, addProject, updateProject, deleteProject, toggleProjectPublish } = useSiteData()

const isModalOpen = ref(false)
const isEditing = ref(false)
const currentEditId = ref('')
const saveError = ref('')

const projectForm = ref({
  title: '',
  category: 'btp' as Project['category'],
  location: '',
  date: '',
  description: '',
  fullDescription: '',
  client: '',
  imageUrl: '',
  imageStoragePath: '',
  galleryImages: [] as Array<{ imageUrl: string; storagePath: string }>,
  published: true,
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
    client: '',
    imageUrl: '',
    imageStoragePath: '',
    galleryImages: [],
    published: true,
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
    client: project.client || '',
    imageUrl: project.imageUrl,
    imageStoragePath: project.imageStoragePath || '',
    galleryImages: project.galleryImages || [],
    published: project.published,
    featured: project.featured,
    displayOrder: project.displayOrder
  }
  isModalOpen.value = true
}

const setProjectImageUrl = (url: string) => {
  projectForm.value.imageUrl = url
  projectForm.value.imageStoragePath = ''
}

const addGalleryImage = (image: { url: string; storagePath: string }) => {
  projectForm.value.galleryImages.push({ imageUrl: image.url, storagePath: image.storagePath })
}

const removeGalleryImage = (storagePath: string) => {
  projectForm.value.galleryImages = projectForm.value.galleryImages.filter(image => image.storagePath !== storagePath)
}

const saveProject = async () => {
  if (!projectForm.value.title || !projectForm.value.location) {
    alert('Veuillez renseigner au moins le titre et la localisation du projet.')
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
    saveError.value = 'Impossible d’enregistrer le projet. Vérifiez la connexion puis réessayez.'
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

      <div class="divide-y divide-neutral-100">
        <div
          v-for="project in projects"
          :key="project.id"
          class="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
        >
          <!-- Left: Thumbnail & Info -->
          <div class="flex items-start gap-4">
            <div class="w-20 h-16 rounded-xs overflow-hidden bg-neutral-900 shrink-0 border border-neutral-200">
              <img :src="project.imageUrl" :alt="project.title" class="w-full h-full object-cover" />
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
                  {{ project.published ? 'Publié' : 'Masqué' }}
                </span>
                <span v-if="project.featured" class="border border-black text-black text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-xs">
                  En vedette
                </span>
              </div>

              <p class="text-xs text-neutral-600 line-clamp-1 max-w-xl">{{ project.description }}</p>

              <div class="text-[11px] text-neutral-500 flex items-center gap-4">
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-neutral-400" />
                  {{ project.location }}
                </span>
                <span class="flex items-center gap-1 font-mono">
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
      @click.self="isModalOpen = false"
    >
      <div class="bg-white border border-neutral-300 rounded-xs max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-neutral-200 pb-3">
          <h3 class="text-base font-black text-black uppercase tracking-wider">
            {{ isEditing ? 'Modifier la Réalisation' : 'Nouveau Projet' }}
          </h3>
          <button
            type="button"
            @click="isModalOpen = false"
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
                <option value="btp">BTP & Construction</option>
                <option value="electrification">Électrification & Réseaux</option>
                <option value="gestion">Gestion Immobilière</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Localisation *</label>
              <input
                v-model="projectForm.location"
                type="text"
                required
                class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
                placeholder="Abidjan - Cocody Angré"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Année</label>
              <input
                v-model="projectForm.date"
                type="text"
                class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none font-mono"
                placeholder="Année du projet"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Maître d'ouvrage</label>
              <input
                v-model="projectForm.client"
                type="text"
                class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
                placeholder="Client privé..."
              />
            </div>
          </div>

          <div>
            <ImageUpload
              :model-value="projectForm.imageUrl"
              @update:model-value="setProjectImageUrl"
              @uploaded="projectForm.imageStoragePath = $event.storagePath"
              label="Photo principal du projet"
              hint="Téléchargez une photo de haute qualité depuis votre ordinateur ou collez une URL"
              previewSize="medium"
              maxFileSize="5"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider">Galerie du projet</label>
            <ImageUpload
              model-value=""
              bucket="project-images"
              label="Ajouter une image à la galerie"
              hint="Les images importées seront enregistrées dans la galerie Supabase du projet."
              @uploaded="addGalleryImage"
            />
            <div v-if="projectForm.galleryImages.length" class="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div v-for="image in projectForm.galleryImages" :key="image.storagePath" class="relative">
                <img :src="image.imageUrl" alt="" class="h-20 w-full border border-neutral-200 object-cover">
                <button
                  type="button"
                  class="absolute right-1 top-1 bg-white px-2 py-1 text-[10px]"
                  @click="removeGalleryImage(image.storagePath)"
                >
                  Retirer
                </button>
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
              @click="isModalOpen = false"
              class="px-4 py-2 rounded-xs text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-black"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-xs text-xs uppercase tracking-wider transition-colors"
            >
              {{ isEditing ? 'Enregistrer' : 'Créer le projet' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
