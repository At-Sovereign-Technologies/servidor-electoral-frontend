<script setup lang="ts">
import { TipoEleccion } from '#gql/default'

const { data, pending, error } = await useAsyncGql({ operation: 'GetElecciones' });
const searchQuery = ref('');
const selectedType = ref<TipoEleccion | ''>('');

const tipoEleccionOptions = Object.values(TipoEleccion);

const filteredElecciones = computed(() => {
    if (!data.value?.elecciones) return [];

    return data.value.elecciones.filter((eleccion) => {
        const query = searchQuery.value.toLowerCase();
        const matchesSearch = eleccion.nombre.toLowerCase().includes(query);
        const matchesType = !selectedType.value || eleccion.tipoEleccion === selectedType.value;
        return matchesSearch && matchesType;
    });
});

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
</script>

<template>
    <div class="w-full max-w-6xl mx-auto p-4">
        <div class="bg-white rounded-lg shadow-md p-6">
            <!-- Search and Filter Section -->
            <div class="flex flex-col md:flex-row gap-4 mb-6">
                <!-- Search Input -->
                <div class="flex-1 relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input v-model="searchQuery" type="text" placeholder="Buscar elecciones por nombre..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>

                <!-- Type Filter -->
                <select v-model="selectedType"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-700">
                    <option value="">Todos los tipos</option>
                    <option v-for="tipo in tipoEleccionOptions" :key="tipo" :value="tipo">
                        {{ tipo }}
                    </option>
                </select>
            </div>

            <!-- Loading State -->
            <div v-if="pending" class="text-center py-8">
                <p class="text-gray-500">Cargando elecciones...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-8">
                <p class="text-red-500">Error al cargar las elecciones</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredElecciones.length === 0" class="text-center py-8">
                <p class="text-gray-500">No se encontraron elecciones</p>
            </div>

            <!-- Elecciones List -->
            <div v-else class="grid gap-4">
                <div v-for="eleccion in filteredElecciones" :key="eleccion.id"
                    class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-800">{{ eleccion.nombre }}</h3>
                            <p class="text-sm text-gray-600 mt-1">{{ eleccion.tipoEleccion }}</p>
                            <div class="mt-3 text-sm text-gray-600 space-y-1">
                                <p>
                                    <span class="font-medium">Inicio:</span> {{ formatDate(eleccion.fechaInicio) }}
                                </p>
                                <p>
                                    <span class="font-medium">Fin:</span> {{ formatDate(eleccion.fechaFin) }}
                                </p>
                            </div>
                        </div>
                        <a :href="`/elecciones/${eleccion.id}`"
                            class="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium text-sm whitespace-nowrap">
                            Detalles
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
