<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;
const config = useRuntimeConfig();

const { data, pending, error } = await useAsyncGql({
    operation: 'GetTerminal',
    variables: { id }
});

const terminal = computed(() => data.value?.terminal);

type TerminalCredencialesResponse = {
    generarCredencialesTerminal: {
        terminalId: string
        secreto: string
        clavePublica: string
        clavePrivada: string
    }
}

const generandoCredenciales = ref(false);
const errorCredenciales = ref('');
const credencialesGeneradas = ref<TerminalCredencialesResponse['generarCredencialesTerminal'] | null>(null);

function descargarJson(nombreArchivo: string, contenido: Record<string, unknown>) {
    const blob = new Blob([JSON.stringify(contenido, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = nombreArchivo;
    anchor.click();
    URL.revokeObjectURL(url);
}

function descargarCredencialesTerminal() {
    if (!credencialesGeneradas.value) return;

    const idNumerico = Number(credencialesGeneradas.value.terminalId);
    const payload = {
        id: Number.isNaN(idNumerico) ? credencialesGeneradas.value.terminalId : idNumerico,
        secreto: credencialesGeneradas.value.secreto,
        clave_privada: credencialesGeneradas.value.clavePrivada,
        cluster_url: 'https://nodo-votacion.local/'
    };

    descargarJson(`terminal-${credencialesGeneradas.value.terminalId}.json`, payload);
}

async function generarCredencialesTerminal() {
    generandoCredenciales.value = true;
    errorCredenciales.value = '';

    try {
        const response = await $fetch<{
            data?: TerminalCredencialesResponse
            errors?: Array<{ message: string }>
        }>(config.public.GQL_HOST, {
            method: 'POST',
            body: {
                query: `
                    mutation GenerarCredencialesTerminal($terminalId: ID!) {
                        generarCredencialesTerminal(terminalId: $terminalId) {
                            terminalId
                            secreto
                            clavePublica
                            clavePrivada
                        }
                    }
                `,
                variables: { terminalId: id }
            }
        });

        if (response.errors?.length) {
            throw new Error(response.errors[0].message);
        }

        if (!response.data?.generarCredencialesTerminal) {
            throw new Error('No fue posible generar las credenciales de la terminal.');
        }

        credencialesGeneradas.value = response.data.generarCredencialesTerminal;
    } catch (mutationError) {
        errorCredenciales.value = mutationError instanceof Error
            ? mutationError.message
            : 'Error inesperado al generar las credenciales.';
    } finally {
        generandoCredenciales.value = false;
    }
}
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
                                    <a :href="`/puntos/${terminal.puntoId}`"
                                        class="text-red-500 hover:underline">
                                        {{ terminal.puntoId }}
                                    </a>
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

                    <div class="border border-red-100 bg-red-50 rounded-lg p-6">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h4 class="text-lg font-semibold text-gray-800">Credenciales de Terminal</h4>
                                <p class="text-sm text-gray-600 mt-1">
                                    Genera o regenera el secreto y el par de claves de esta terminal.
                                </p>
                            </div>
                            <button
                                class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                :disabled="generandoCredenciales"
                                @click="generarCredencialesTerminal">
                                {{ generandoCredenciales ? 'Procesando...' : (credencialesGeneradas ? 'Regenerar credenciales' : 'Generar credenciales') }}
                            </button>
                        </div>

                        <p v-if="errorCredenciales" class="text-sm text-red-600 mt-4">
                            {{ errorCredenciales }}
                        </p>

                        <div v-if="credencialesGeneradas" class="mt-4 bg-white border border-red-200 rounded p-4 space-y-3">
                            <div>
                                <p class="text-xs font-semibold text-gray-700">Secreto</p>
                                <p class="font-mono text-xs break-all text-gray-800">
                                    {{ credencialesGeneradas.secreto }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-700">Clave pública</p>
                                <p class="font-mono text-xs break-all text-gray-800">
                                    {{ credencialesGeneradas.clavePublica }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-700">Clave privada</p>
                                <p class="font-mono text-xs break-all text-gray-800">
                                    {{ credencialesGeneradas.clavePrivada }}
                                </p>
                            </div>
                            <button
                                class="mt-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition font-medium text-sm"
                                @click="descargarCredencialesTerminal">
                                Descargar JSON de Terminal
                            </button>
                        </div>
                    </div>

                    <!-- Votantes Summary -->
                    <a :href="`/terminales/${id}/votantes`"
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
                    </a>

                    <!-- Back Link -->
                    <div>
                        <a :href="`/puntos/${terminal.puntoId}/terminales`"
                            class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Volver a Terminales
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
