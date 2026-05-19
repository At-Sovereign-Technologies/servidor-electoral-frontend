<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;

const { data, pending, error } = await useAsyncGql({
    operation: 'GetEleccion',
    variables: { id }
});

const eleccion = computed(() => data.value?.eleccion);

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex flex-col items-center gap-2 px-4">
            <h2 class="text-3xl font-bold text-center">Detalle de Elección</h2>
            <p class="text-gray-600 text-center">
                Información completa de la elección y sus entidades asociadas.
            </p>
        </div>

        <div class="max-w-4xl w-full mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6">
                <!-- Loading State -->
                <div v-if="pending" class="text-center py-8">
                    <p class="text-gray-500">Cargando elección...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-8">
                    <p class="text-red-500">Error al cargar la elección</p>
                </div>

                <!-- Not Found State -->
                <div v-else-if="!eleccion" class="text-center py-8">
                    <p class="text-gray-500">No se encontró la elección</p>
                </div>

                <!-- Detail Content -->
                <div v-else class="flex flex-col gap-8">
                    <!-- Election Info Card -->
                    <div class="border border-gray-200 rounded-lg p-6">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h3 class="text-2xl font-bold text-gray-800">{{ eleccion.nombre }}</h3>
                                <span
                                    class="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                                    {{ eleccion.tipoEleccion }}
                                </span>
                            </div>
                        </div>
                        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span class="font-medium text-gray-700">Fecha de inicio:</span>
                                <p>{{ formatDate(eleccion.fechaInicio) }}</p>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">Fecha de fin:</span>
                                <p>{{ formatDate(eleccion.fechaFin) }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Summary Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Candidatos Summary -->
                        <NuxtLink :to="`/elecciones/${id}/candidatos`"
                            class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition group">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="text-lg font-semibold text-gray-800 group-hover:text-red-500 transition">
                                    Candidatos
                                </h4>
                                <span
                                    class="bg-red-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                                    {{ eleccion.candidatos.length }}
                                </span>
                            </div>
                            <ul class="space-y-2">
                                <li v-for="candidato in eleccion.candidatos.slice(0, 3)" :key="candidato.id"
                                    class="text-sm text-gray-600 truncate">
                                    {{ candidato.nombre }} — {{ candidato.partido }}
                                </li>
                            </ul>
                            <p v-if="eleccion.candidatos.length > 3"
                                class="text-xs text-gray-400 mt-2">
                                y {{ eleccion.candidatos.length - 3 }} más…
                            </p>
                            <p v-if="eleccion.candidatos.length === 0"
                                class="text-sm text-gray-400">Sin candidatos registrados</p>
                            <p class="text-xs text-red-500 font-medium mt-3 group-hover:underline">
                                Ver todos →
                            </p>
                        </NuxtLink>

                        <!-- Puntos Summary -->
                        <NuxtLink :to="`/elecciones/${id}/puntos`"
                            class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition group">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="text-lg font-semibold text-gray-800 group-hover:text-red-500 transition">
                                    Puntos de Votación
                                </h4>
                                <span
                                    class="bg-red-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                                    {{ eleccion.puntos.length }}
                                </span>
                            </div>
                            <ul class="space-y-2">
                                <li v-for="punto in eleccion.puntos.slice(0, 3)" :key="punto.id"
                                    class="text-sm text-gray-600 truncate flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full"
                                        :class="punto.activo ? 'bg-green-500' : 'bg-gray-300'"></span>
                                    {{ punto.nombre }}
                                </li>
                            </ul>
                            <p v-if="eleccion.puntos.length > 3"
                                class="text-xs text-gray-400 mt-2">
                                y {{ eleccion.puntos.length - 3 }} más…
                            </p>
                            <p v-if="eleccion.puntos.length === 0"
                                class="text-sm text-gray-400">Sin puntos registrados</p>
                            <p class="text-xs text-red-500 font-medium mt-3 group-hover:underline">
                                Ver todos →
                            </p>
                        </NuxtLink>

                        <!-- Nodos Summary -->
                        <NuxtLink :to="`/elecciones/${id}/nodos`"
                            class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition group">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="text-lg font-semibold text-gray-800 group-hover:text-red-500 transition">
                                    Nodos
                                </h4>
                                <span
                                    class="bg-red-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                                    {{ eleccion.nodos.length }}
                                </span>
                            </div>
                            <ul class="space-y-2">
                                <li v-for="nodo in eleccion.nodos.slice(0, 3)" :key="nodo.id"
                                    class="text-sm text-gray-600 truncate flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full"
                                        :class="nodo.activo ? 'bg-green-500' : 'bg-gray-300'"></span>
                                    Nodo #{{ nodo.id }}
                                </li>
                            </ul>
                            <p v-if="eleccion.nodos.length > 3"
                                class="text-xs text-gray-400 mt-2">
                                y {{ eleccion.nodos.length - 3 }} más…
                            </p>
                            <p v-if="eleccion.nodos.length === 0"
                                class="text-sm text-gray-400">Sin nodos registrados</p>
                            <p class="text-xs text-red-500 font-medium mt-3 group-hover:underline">
                                Ver todos →
                            </p>
                        </NuxtLink>
                    </div>

                    <!-- Back Button -->
                    <div>
                        <NuxtLink to="/elecciones"
                            class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Volver a Elecciones
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
