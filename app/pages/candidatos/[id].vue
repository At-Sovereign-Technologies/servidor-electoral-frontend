<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;

const { data, pending, error } = await useAsyncGql({
    operation: 'GetCandidato',
    variables: { id }
});

const candidato = computed(() => data.value?.candidato);
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col items-center gap-2 px-4">
            <h2 class="text-3xl font-bold text-center">Detalle de Candidato</h2>
            <p class="text-gray-600 text-center">
                Información del candidato registrado en el sistema.
            </p>
        </div>

        <div class="max-w-4xl w-full mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6">
                <!-- Loading State -->
                <div v-if="pending" class="text-center py-8">
                    <p class="text-gray-500">Cargando candidato...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-8">
                    <p class="text-red-500">Error al cargar el candidato</p>
                </div>

                <!-- Not Found State -->
                <div v-else-if="!candidato" class="text-center py-8">
                    <p class="text-gray-500">No se encontró el candidato</p>
                </div>

                <!-- Detail Content -->
                <div v-else class="flex flex-col gap-6">
                    <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <!-- Photo -->
                        <div v-if="candidato.fotoUrl"
                            class="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <img :src="candidato.fotoUrl" :alt="candidato.nombre"
                                class="w-full h-full object-cover" />
                        </div>
                        <div v-else
                            class="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <span class="text-red-500 font-bold text-4xl">
                                {{ candidato.nombre.charAt(0) }}
                            </span>
                        </div>

                        <!-- Info -->
                        <div class="flex-1">
                            <h3 class="text-2xl font-bold text-gray-800">{{ candidato.nombre }}</h3>
                            <span
                                class="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                                {{ candidato.partido }}
                            </span>

                            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span class="font-medium text-gray-700">Documento:</span>
                                    <p>{{ candidato.documento }}</p>
                                </div>
                                <div>
                                    <span class="font-medium text-gray-700">ID de Elección:</span>
                                    <p>
                                        <NuxtLink :to="`/elecciones/${candidato.eleccionId}`"
                                            class="text-red-500 hover:underline">
                                            {{ candidato.eleccionId }}
                                        </NuxtLink>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Back Link -->
                    <div>
                        <NuxtLink :to="`/elecciones/${candidato.eleccionId}/candidatos`"
                            class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Volver a Candidatos
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
