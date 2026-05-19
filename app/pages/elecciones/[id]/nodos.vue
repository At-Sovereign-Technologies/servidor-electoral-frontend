<script setup lang="ts">
const route = useRoute();
const eleccionId = route.params.id as string;

const { data, pending, error } = await useAsyncGql({
    operation: 'GetNodosByEleccion',
    variables: { eleccionId }
});

const filterActivo = ref<'' | 'true' | 'false'>('');
const currentPage = ref(1);
const pageSize = 10;

const filteredNodos = computed(() => {
    if (!data.value?.nodosByEleccion) return [];

    return data.value.nodosByEleccion.filter((nodo) => {
        const matchesActivo = filterActivo.value === '' ||
            (filterActivo.value === 'true' ? nodo.activo : !nodo.activo);
        return matchesActivo;
    });
});

const totalPages = computed(() => Math.ceil(filteredNodos.value.length / pageSize));

const paginatedNodos = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredNodos.value.slice(start, start + pageSize);
});

watch(filterActivo, () => { currentPage.value = 1; });
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col items-center gap-2 px-4">
            <h2 class="text-3xl font-bold text-center">Nodos</h2>
            <p class="text-gray-600 text-center">
                Nodos de votación activa registrados para la elección.
            </p>
        </div>

        <div class="max-w-6xl w-full mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6">
                <!-- Filters -->
                <div class="flex flex-col md:flex-row gap-4 mb-6">
                    <select v-model="filterActivo" aria-label="Filtrar por estado"
                        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-700">
                        <option value="">Todos los estados</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </div>

                <!-- Loading State -->
                <div v-if="pending" class="text-center py-8">
                    <p class="text-gray-500">Cargando nodos...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-8">
                    <p class="text-red-500">Error al cargar los nodos</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredNodos.length === 0" class="text-center py-8">
                    <p class="text-gray-500">No se encontraron nodos</p>
                </div>

                <!-- Nodos List -->
                <div v-else>
                    <div class="grid gap-4">
                        <div v-for="nodo in paginatedNodos" :key="nodo.id"
                            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <div class="flex items-center gap-3">
                                        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            :class="nodo.activo ? 'bg-green-500' : 'bg-gray-300'"></span>
                                        <h3 class="text-lg font-semibold text-gray-800">
                                            Nodo #{{ nodo.id }}
                                        </h3>
                                    </div>
                                    <div class="mt-2 ml-5 text-sm text-gray-600">
                                        <p>
                                            <span class="font-medium">Estado:</span>
                                            <span :class="nodo.activo ? 'text-green-600' : 'text-gray-400'">
                                                {{ nodo.activo ? 'Activo' : 'Inactivo' }}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <NuxtLink :to="`/nodos/${nodo.id}`"
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
