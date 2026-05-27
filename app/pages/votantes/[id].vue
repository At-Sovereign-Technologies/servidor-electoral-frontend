<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;

const { data, pending, error } = await useAsyncGql({
    operation: 'GetVotante',
    variables: { id }
});

const votante = computed(() => data.value?.votante);
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col items-center gap-2 px-4">
            <h2 class="text-3xl font-bold text-center">Detalle de Votante</h2>
            <p class="text-gray-600 text-center">
                Información del votante registrado en el sistema.
            </p>
        </div>

        <div class="max-w-4xl w-full mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6">
                <!-- Loading State -->
                <div v-if="pending" class="text-center py-8">
                    <p class="text-gray-500">Cargando votante...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-8">
                    <p class="text-red-500">Error al cargar el votante</p>
                </div>

                <!-- Not Found State -->
                <div v-else-if="!votante" class="text-center py-8">
                    <p class="text-gray-500">No se encontró el votante</p>
                </div>

                <!-- Detail Content -->
                <div v-else class="flex flex-col gap-6">
                    <div class="border border-gray-200 rounded-lg p-6">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <span class="text-red-500 font-bold text-2xl">
                                    {{ votante.nombre.charAt(0) }}
                                </span>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-800">{{ votante.nombre }}</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span class="font-medium text-gray-700">Documento:</span>
                                <p>{{ votante.documento }}</p>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">Terminal:</span>
                                <p>
                                    <a :href="`/terminales/${votante.terminalId}`"
                                        class="text-red-500 hover:underline">
                                        Terminal #{{ votante.terminalId }}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Back Link -->
                    <div>
                        <a :href="`/terminales/${votante.terminalId}/votantes`"
                            class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Volver a Votantes
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
