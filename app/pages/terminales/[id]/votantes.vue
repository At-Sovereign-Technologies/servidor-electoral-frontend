<script setup lang="ts">
const route = useRoute();
const terminalId = route.params.id as string;

const { data, pending, error } = await useAsyncGql({
    operation: 'GetVotantesByTerminal',
    variables: { terminalId }
});

const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;

const filteredVotantes = computed(() => {
    if (!data.value?.votantesByTerminal) return [];

    return data.value.votantesByTerminal.filter((votante) => {
        const query = searchQuery.value.toLowerCase();
        return votante.nombre.toLowerCase().includes(query) ||
            votante.documento.toLowerCase().includes(query);
    });
});

const totalPages = computed(() => Math.ceil(filteredVotantes.value.length / pageSize));

const paginatedVotantes = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredVotantes.value.slice(start, start + pageSize);
});

watch(searchQuery, () => { currentPage.value = 1; });
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col items-center gap-2 px-4">
            <h2 class="text-3xl font-bold text-center">Votantes</h2>
            <p class="text-gray-600 text-center">
                Votantes asignados a la terminal de votación.
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
                            placeholder="Buscar por nombre o documento..."
                            aria-label="Buscar votantes"
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="pending" class="text-center py-8">
                    <p class="text-gray-500">Cargando votantes...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-8">
                    <p class="text-red-500">Error al cargar los votantes</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredVotantes.length === 0" class="text-center py-8">
                    <p class="text-gray-500">No se encontraron votantes</p>
                </div>

                <!-- Votantes List -->
                <div v-else>
                    <div class="grid gap-4">
                        <div v-for="votante in paginatedVotantes" :key="votante.id"
                            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold text-gray-800">{{ votante.nombre }}</h3>
                                    <div class="mt-2 text-sm text-gray-600 space-y-1">
                                        <p>
                                            <span class="font-medium">Documento:</span> {{ votante.documento }}
                                        </p>
                                    </div>
                                </div>
                                <NuxtLink :to="`/votantes/${votante.id}`"
                                    class="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium text-sm whitespace-nowrap">
                                    Detalles
                                </NuxtLink>
                            </div>
                        </div>
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
                    <NuxtLink :to="`/terminales/${terminalId}`"
                        class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Volver a la Terminal
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>
