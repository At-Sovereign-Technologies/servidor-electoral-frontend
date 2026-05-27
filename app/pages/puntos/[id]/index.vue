<script setup lang="ts">
const route = useRoute();
const puntoId = computed(() => route.params.id as string);

const config = useRuntimeConfig();

const { data, pending, error } = await useAsyncGql({
    operation: 'GetPunto',
    variables: { id: puntoId.value }
});

const punto = computed(() => data.value?.punto);
const mapEmbedUrl = computed(() => {
    if (!punto.value) return null;

    const lat = Number(punto.value.latitud);
    const lon = Number(punto.value.longitud);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

    const delta = 0.01;
    const left = lon - delta;
    const right = lon + delta;
    const top = lat + delta;
    const bottom = lat - delta;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;
});

type PuntoSecretoResponse = {
    generarSecretoPunto: {
        puntoId: string
        secreto: string
    }
}

const generandoSecreto = ref(false);
const errorSecreto = ref('');
const secretoGenerado = ref<PuntoSecretoResponse['generarSecretoPunto'] | null>(null);

function descargarJson(nombreArchivo: string, contenido: Record<string, unknown>) {
    const blob = new Blob([JSON.stringify(contenido, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = nombreArchivo;
    anchor.click();
    URL.revokeObjectURL(url);
}

function descargarCredencialesPunto() {
    if (!secretoGenerado.value) return;

    const idNumerico = Number(secretoGenerado.value.puntoId);
    const payload = {
        id: Number.isNaN(idNumerico) ? secretoGenerado.value.puntoId : idNumerico,
        secreto: secretoGenerado.value.secreto,
        parent_url: 'https://maquina-jurado.local/'
    };

    descargarJson(`punto-${secretoGenerado.value.puntoId}.json`, payload);
}

async function generarSecretoPunto() {
    generandoSecreto.value = true;
    errorSecreto.value = '';

    try {
        const response = await $fetch<{
            data?: PuntoSecretoResponse
            errors?: Array<{ message: string }>
        }>(config.public.GQL_HOST, {
            method: 'POST',
            body: {
                query: `
                    mutation GenerarSecretoPunto($puntoId: ID!) {
                        generarSecretoPunto(puntoId: $puntoId) {
                            puntoId
                            secreto
                        }
                    }
                `,
                variables: { puntoId: puntoId.value }
            }
        });

        if (response.errors?.length) {
            throw new Error(response.errors[0].message);
        }

        if (!response.data?.generarSecretoPunto) {
            throw new Error('No fue posible generar el secreto del punto.');
        }

        secretoGenerado.value = response.data.generarSecretoPunto;
    } catch (mutationError) {
        errorSecreto.value = mutationError instanceof Error
            ? mutationError.message
            : 'Error inesperado al generar el secreto.';
    } finally {
        generandoSecreto.value = false;
    }
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col items-center gap-2 px-4">
            <h2 class="text-3xl font-bold text-center">Detalle de Punto de Votación</h2>
            <p class="text-gray-600 text-center">
                Información del punto de votación y sus entidades asociadas.
            </p>
        </div>

        <div class="max-w-4xl w-full mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6">
                <!-- Loading State -->
                <div v-if="pending" class="text-center py-8">
                    <p class="text-gray-500">Cargando punto de votación...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-8">
                    <p class="text-red-500">Error al cargar el punto de votación</p>
                </div>

                <!-- Not Found State -->
                <div v-else-if="!punto" class="text-center py-8">
                    <p class="text-gray-500">No se encontró el punto de votación</p>
                </div>

                <!-- Detail Content -->
                <div v-else class="flex flex-col gap-8">
                    <!-- Punto Info -->
                    <div class="border border-gray-200 rounded-lg p-6">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="w-3 h-3 rounded-full flex-shrink-0"
                                :class="punto.activo ? 'bg-green-500' : 'bg-gray-300'"></span>
                            <h3 class="text-2xl font-bold text-gray-800">{{ punto.nombre }}</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span class="font-medium text-gray-700">Latitud:</span>
                                <p>{{ punto.latitud }}</p>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">Longitud:</span>
                                <p>{{ punto.longitud }}</p>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">Estado:</span>
                                <p :class="punto.activo ? 'text-green-600' : 'text-gray-400'">
                                    {{ punto.activo ? 'Activo' : 'Inactivo' }}
                                </p>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">Elección:</span>
                                <p>
                                    <a :href="`/elecciones/${punto.eleccionId}`"
                                        class="text-red-500 hover:underline">
                                        {{ punto.eleccionId }}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="border border-gray-200 rounded-lg p-6">
                        <div class="flex items-center justify-between gap-3 mb-4">
                            <h4 class="text-lg font-semibold text-gray-800">Ubicación del punto</h4>
                            <a
                                v-if="mapEmbedUrl"
                                :href="`https://www.openstreetmap.org/?mlat=${punto.latitud}&mlon=${punto.longitud}#map=16/${punto.latitud}/${punto.longitud}`"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-sm text-red-500 hover:underline">
                                Abrir en mapa
                            </a>
                        </div>

                        <div v-if="mapEmbedUrl" class="rounded-lg overflow-hidden border border-gray-200">
                            <iframe
                                :src="mapEmbedUrl"
                                title="Mapa del punto de votación"
                                class="w-full h-72"
                                loading="lazy" />
                        </div>
                        <p v-else class="text-sm text-gray-500">
                            No hay coordenadas válidas para mostrar el mapa.
                        </p>
                    </div>

                    <div class="border border-red-100 bg-red-50 rounded-lg p-6">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h4 class="text-lg font-semibold text-gray-800">Credenciales del Punto</h4>
                                <p class="text-sm text-gray-600 mt-1">
                                    Genera o regenera el secreto operativo del punto de votación.
                                </p>
                            </div>
                            <button
                                class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                :disabled="generandoSecreto"
                                @click="generarSecretoPunto">
                                {{ generandoSecreto ? 'Procesando...' : (secretoGenerado ? 'Regenerar secreto' : 'Generar secreto') }}
                            </button>
                        </div>

                        <p v-if="errorSecreto" class="text-sm text-red-600 mt-4">
                            {{ errorSecreto }}
                        </p>

                        <div v-if="secretoGenerado" class="mt-4 bg-white border border-red-200 rounded p-4">
                            <p class="text-xs font-semibold text-gray-700 mb-2">
                                Secreto vigente (guárdalo de forma segura):
                            </p>
                            <p class="font-mono text-xs break-all text-gray-800">
                                {{ secretoGenerado.secreto }}
                            </p>
                            <button
                                class="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition font-medium text-sm"
                                @click="descargarCredencialesPunto">
                                Descargar JSON del Punto
                            </button>
                        </div>
                    </div>

                    <!-- Summary Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Jurados Summary -->
                        <a :href="`/puntos/${puntoId}/jurados`"
                            class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition group">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="text-lg font-semibold text-gray-800 group-hover:text-red-500 transition">
                                    Jurados
                                </h4>
                                <span class="bg-red-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                                    {{ punto.jurados.length }}
                                </span>
                            </div>
                            <ul class="space-y-2">
                                <li v-for="jurado in punto.jurados.slice(0, 3)" :key="jurado.id"
                                    class="text-sm text-gray-600 truncate">
                                    {{ jurado.nombre }} — {{ jurado.usuario }}
                                </li>
                            </ul>
                            <p v-if="punto.jurados.length > 3" class="text-xs text-gray-400 mt-2">
                                y {{ punto.jurados.length - 3 }} más…
                            </p>
                            <p v-if="punto.jurados.length === 0" class="text-sm text-gray-400">
                                Sin jurados asignados
                            </p>
                            <p class="text-xs text-red-500 font-medium mt-3 group-hover:underline">
                                Ver todos →
                            </p>
                        </a>

                        <!-- Terminales Summary -->
                        <a :href="`/puntos/${puntoId}/terminales`"
                            class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition group">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="text-lg font-semibold text-gray-800 group-hover:text-red-500 transition">
                                    Terminales
                                </h4>
                                <span class="bg-red-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                                    {{ punto.terminales.length }}
                                </span>
                            </div>
                            <ul class="space-y-2">
                                <li v-for="terminal in punto.terminales.slice(0, 3)" :key="terminal.id"
                                    class="text-sm text-gray-600 truncate flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full"
                                        :class="terminal.activo ? 'bg-green-500' : 'bg-gray-300'"></span>
                                    Terminal #{{ terminal.id }}
                                </li>
                            </ul>
                            <p v-if="punto.terminales.length > 3" class="text-xs text-gray-400 mt-2">
                                y {{ punto.terminales.length - 3 }} más…
                            </p>
                            <p v-if="punto.terminales.length === 0" class="text-sm text-gray-400">
                                Sin terminales registradas
                            </p>
                            <p class="text-xs text-red-500 font-medium mt-3 group-hover:underline">
                                Ver todos →
                            </p>
                        </a>
                    </div>

                    <!-- Back Link -->
                    <div>
                        <a :href="`/elecciones/${punto.eleccionId}/puntos`"
                            class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Volver a Puntos de Votación
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
