<script setup lang="ts">
const route = useRoute();
const eleccionId = route.params.id as string;

const { data, pending, error } = await useAsyncGql({
    operation: 'GetPuntosByEleccion',
    variables: { eleccionId }
});

const searchQuery = ref('');
const filterActivo = ref<'' | 'true' | 'false'>('');
const currentPage = ref(1);
const pageSize = 10;

const filteredPuntos = computed(() => {
    if (!data.value?.puntosByEleccion) return [];

    return data.value.puntosByEleccion.filter((punto) => {
        const query = searchQuery.value.toLowerCase();
        const matchesSearch = punto.nombre.toLowerCase().includes(query);
        const matchesActivo = filterActivo.value === '' ||
            (filterActivo.value === 'true' ? punto.activo : !punto.activo);
        return matchesSearch && matchesActivo;
    });
});

const totalPages = computed(() => Math.ceil(filteredPuntos.value.length / pageSize));

const paginatedPuntos = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredPuntos.value.slice(start, start + pageSize);
});

watch([searchQuery, filterActivo], () => { currentPage.value = 1; });
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col items-center gap-2 px-4">
            <h2 class="text-3xl font-bold text-center">Puntos de Votación</h2>
            <p class="text-gray-600 text-center">
                Puntos de votación registrados para la elección.
            </p>
        </div>

        <div class="max-w-6xl w-full mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6">
                <!-- Search and Filters -->
                <div class="flex flex-col md:flex-row gap-4 mb-6">
                    <div class="flex-1 relative">
                        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input v-model="searchQuery" type="text"
                            placeholder="Buscar puntos por nombre..."
                            aria-label="Buscar puntos de votación"
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <select v-model="filterActivo" aria-label="Filtrar por estado"
                        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-700">
                        <option value="">Todos los estados</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </div>

                <!-- Loading State -->
                <div v-if="pending" class="text-center py-8">
                    <p class="text-gray-500">Cargando puntos de votación...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-8">
                    <p class="text-red-500">Error al cargar los puntos de votación</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredPuntos.length === 0" class="text-center py-8">
                    <p class="text-gray-500">No se encontraron puntos de votación</p>
                </div>

                <!-- Puntos List -->
                <div v-else>
                    <div class="grid gap-4">
                        <div v-for="punto in paginatedPuntos" :key="punto.id"
                            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <div class="flex items-center gap-3">
                                        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            :class="punto.activo ? 'bg-green-500' : 'bg-gray-300'"></span>
                                        <h3 class="text-lg font-semibold text-gray-800">{{ punto.nombre }}</h3>
                                    </div>
                                    <div class="mt-2 ml-5 text-sm text-gray-600 space-y-1">
                                        <p>
                                            <span class="font-medium">Latitud:</span> {{ punto.latitud }}
                                            <span class="mx-2">|</span>
                                            <span class="font-medium">Longitud:</span> {{ punto.longitud }}
                                        </p>
                                        <p>
                                            <span class="font-medium">Estado:</span>
                                            <span :class="punto.activo ? 'text-green-600' : 'text-gray-400'">
                                                {{ punto.activo ? 'Activo' : 'Inactivo' }}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <NuxtLink :to="`/puntos/${punto.id}`"
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
                    <NuxtLink :to="`/elecciones/${eleccionId}`"
                        class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Volver a la Elección
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>
