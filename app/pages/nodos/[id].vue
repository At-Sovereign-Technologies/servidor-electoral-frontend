<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;

const { data, pending, error } = await useAsyncGql({
    operation: 'GetNodo',
    variables: { id }
});

const nodo = computed(() => data.value?.nodo);
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col items-center gap-2 px-4">
            <h2 class="text-3xl font-bold text-center">Detalle de Nodo</h2>
            <p class="text-gray-600 text-center">
                Información del nodo de votación activa.
            </p>
        </div>

        <div class="max-w-4xl w-full mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6">
                <!-- Loading State -->
                <div v-if="pending" class="text-center py-8">
                    <p class="text-gray-500">Cargando nodo...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-8">
                    <p class="text-red-500">Error al cargar el nodo</p>
                </div>

                <!-- Not Found State -->
                <div v-else-if="!nodo" class="text-center py-8">
                    <p class="text-gray-500">No se encontró el nodo</p>
                </div>

                <!-- Detail Content -->
                <div v-else class="flex flex-col gap-6">
                    <div class="border border-gray-200 rounded-lg p-6">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="w-3 h-3 rounded-full flex-shrink-0"
                                :class="nodo.activo ? 'bg-green-500' : 'bg-gray-300'"></span>
                            <h3 class="text-2xl font-bold text-gray-800">Nodo #{{ nodo.id }}</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span class="font-medium text-gray-700">Estado:</span>
                                <p :class="nodo.activo ? 'text-green-600' : 'text-gray-400'">
                                    {{ nodo.activo ? 'Activo' : 'Inactivo' }}
                                </p>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">Elección:</span>
                                <p>
                                    <a :href="`/elecciones/${nodo.eleccionId}`"
                                        class="text-red-500 hover:underline">
                                        {{ nodo.eleccionId }}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Back Link -->
                    <div>
                        <a :href="`/elecciones/${nodo.eleccionId}/nodos`"
                            class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Volver a Nodos
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
