<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;

const { data, pending, error } = await useAsyncGql({
    operation: 'GetTerminal',
    variables: { id }
});

const terminal = computed(() => data.value?.terminal);
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col items-center gap-2 px-4">
            <h2 class="text-3xl font-bold text-center">Detalle de Terminal</h2>
            <p class="text-gray-600 text-center">
                Información de la terminal de votación y sus votantes.
            </p>
        </div>

        <div class="max-w-4xl w-full mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6">
                <!-- Loading State -->
                <div v-if="pending" class="text-center py-8">
                    <p class="text-gray-500">Cargando terminal...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-8">
                    <p class="text-red-500">Error al cargar la terminal</p>
                </div>

                <!-- Not Found State -->
                <div v-else-if="!terminal" class="text-center py-8">
                    <p class="text-gray-500">No se encontró la terminal</p>
                </div>

                <!-- Detail Content -->
                <div v-else class="flex flex-col gap-8">
                    <!-- Terminal Info -->
                    <div class="border border-gray-200 rounded-lg p-6">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="w-3 h-3 rounded-full flex-shrink-0"
                                :class="terminal.activo ? 'bg-green-500' : 'bg-gray-300'"></span>
                            <h3 class="text-2xl font-bold text-gray-800">Terminal #{{ terminal.id }}</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span class="font-medium text-gray-700">Estado:</span>
                                <p :class="terminal.activo ? 'text-green-600' : 'text-gray-400'">
                                    {{ terminal.activo ? 'Activa' : 'Inactiva' }}
                                </p>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">Punto de votación:</span>
                                <p>
                                    <NuxtLink :to="`/puntos/${terminal.puntoId}`"
                                        class="text-red-500 hover:underline">
                                        {{ terminal.puntoId }}
                                    </NuxtLink>
                                </p>
                            </div>
                            <div class="md:col-span-2">
                                <span class="font-medium text-gray-700">Clave pública:</span>
                                <p class="font-mono text-xs mt-1 break-all bg-gray-50 p-2 rounded">
                                    {{ terminal.clavePublica }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Votantes Summary -->
                    <NuxtLink :to="`/terminales/${id}/votantes`"
                        class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition group">
                        <div class="flex justify-between items-center mb-3">
                            <h4 class="text-lg font-semibold text-gray-800 group-hover:text-red-500 transition">
                                Votantes
                            </h4>
                            <span class="bg-red-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                                {{ terminal.votantes.length }}
                            </span>
                        </div>
                        <ul class="space-y-2">
                            <li v-for="votante in terminal.votantes.slice(0, 5)" :key="votante.id"
                                class="text-sm text-gray-600 truncate">
                                {{ votante.nombre }} — {{ votante.documento }}
                            </li>
                        </ul>
                        <p v-if="terminal.votantes.length > 5" class="text-xs text-gray-400 mt-2">
                            y {{ terminal.votantes.length - 5 }} más…
                        </p>
                        <p v-if="terminal.votantes.length === 0" class="text-sm text-gray-400">
                            Sin votantes asignados
                        </p>
                        <p class="text-xs text-red-500 font-medium mt-3 group-hover:underline">
                            Ver todos →
                        </p>
                    </NuxtLink>

                    <!-- Back Link -->
                    <div>
                        <NuxtLink :to="`/puntos/${terminal.puntoId}/terminales`"
                            class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Volver a Terminales
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
