<script setup lang="ts">
const route = useRoute();
const eleccionId = route.params.id as string;

const { data, pending, error } = await useAsyncGql({
    operation: 'GetCandidatosByEleccion',
    variables: { eleccionId }
});

const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 12;

const filteredCandidatos = computed(() => {
    if (!data.value?.candidatosByEleccion) return [];

    return data.value.candidatosByEleccion.filter((candidato) => {
        const query = searchQuery.value.toLowerCase();
        return candidato.nombre.toLowerCase().includes(query) ||
            candidato.partido.toLowerCase().includes(query) ||
            candidato.documento.toLowerCase().includes(query);
    });
});

const totalPages = computed(() => Math.ceil(filteredCandidatos.value.length / pageSize));

const paginatedCandidatos = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredCandidatos.value.slice(start, start + pageSize);
});

watch(searchQuery, () => { currentPage.value = 1; });
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col items-center gap-2 px-4">
            <h2 class="text-3xl font-bold text-center">Candidatos</h2>
            <p class="text-gray-600 text-center">
                Candidatos registrados para la elección.
            </p>
        </div>

        <div class="max-w-6xl w-full mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6">
                <!-- Search -->
                <div class="flex flex-col md:flex-row gap-4 mb-6">
                    <div class="flex-1 relative">
                        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input v-model="searchQuery" type="text"
                            placeholder="Buscar por nombre, partido o documento..."
                            aria-label="Buscar candidatos"
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="pending" class="text-center py-8">
                    <p class="text-gray-500">Cargando candidatos...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-8">
                    <p class="text-red-500">Error al cargar los candidatos</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredCandidatos.length === 0" class="text-center py-8">
                    <p class="text-gray-500">No se encontraron candidatos</p>
                </div>

                <!-- Candidatos Grid -->
                <div v-else>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <a v-for="candidato in paginatedCandidatos" :key="candidato.id"
                            :href="`/candidatos/${candidato.id}`"
                            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition group">
                            <div class="flex items-center gap-4">
                                <div v-if="candidato.fotoUrl"
                                    class="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img :src="candidato.fotoUrl" :alt="candidato.nombre"
                                        class="w-full h-full object-cover" />
                                </div>
                                <div v-else
                                    class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <span class="text-red-500 font-bold text-lg">
                                        {{ candidato.nombre.charAt(0) }}
                                    </span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-base font-semibold text-gray-800 group-hover:text-red-500 transition truncate">
                                        {{ candidato.nombre }}
                                    </h3>
                                    <p class="text-sm text-gray-500 truncate">{{ candidato.partido }}</p>
                                    <p class="text-xs text-gray-400 mt-1">Doc: {{ candidato.documento }}</p>
                                </div>
                            </div>
                        </a>
                    </div>

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6">
                        <button :disabled="currentPage === 1"
                            class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Página anterior"
                            @click="currentPage--">
                            ← Anterior
                        </button>
                        <span class="text-sm text-gray-600">
                            Página {{ currentPage }} de {{ totalPages }}
                        </span>
                        <button :disabled="currentPage === totalPages"
                            class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Página siguiente"
                            @click="currentPage++">
                            Siguiente →
                        </button>
                    </div>
                </div>

                <!-- Back Link -->
                <div class="mt-6">
                    <a :href="`/elecciones/${eleccionId}`"
                        class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Volver a la Elección
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
