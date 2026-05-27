<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;
const config = useRuntimeConfig();

const { data, pending, error } = await useAsyncGql({
    operation: 'GetNodo',
    variables: { id }
});

const nodo = computed(() => data.value?.nodo);

type NodoSecretoResponse = {
    generarSecretoNodo: {
        nodoId: string
        secreto: string
    }
}

const generandoSecreto = ref(false);
const errorSecreto = ref('');
const secretoGenerado = ref<NodoSecretoResponse['generarSecretoNodo'] | null>(null);

async function generarSecretoNodo() {
    generandoSecreto.value = true;
    errorSecreto.value = '';

    try {
        const response = await $fetch<{
            data?: NodoSecretoResponse
            errors?: Array<{ message: string }>
        }>(config.public.GQL_HOST, {
            method: 'POST',
            body: {
                query: `
                    mutation GenerarSecretoNodo($nodoId: ID!) {
                        generarSecretoNodo(nodoId: $nodoId) {
                            nodoId
                            secreto
                        }
                    }
                `,
                variables: { nodoId: id }
            }
        });

        if (response.errors?.length) {
            throw new Error(response.errors[0].message);
        }

        if (!response.data?.generarSecretoNodo) {
            throw new Error('No fue posible generar el secreto del nodo.');
        }

        secretoGenerado.value = response.data.generarSecretoNodo;
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

                    <div class="border border-red-100 bg-red-50 rounded-lg p-6">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h4 class="text-lg font-semibold text-gray-800">Secreto del Nodo</h4>
                                <p class="text-sm text-gray-600 mt-1">
                                    Genera o regenera el secreto operativo del nodo.
                                </p>
                            </div>
                            <button
                                class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                :disabled="generandoSecreto"
                                @click="generarSecretoNodo">
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
