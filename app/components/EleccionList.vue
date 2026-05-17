<script setup lang="ts">
const { data, pending, error } = await useAsyncGql({ operation: 'GetElecciones' });
const searchQuery = ref('');

const filteredElecciones = computed(() => {
  if (!data.value?.elecciones) return [];

  return data.value.elecciones.filter((eleccion) => {
    const query = searchQuery.value.toLowerCase();
    return eleccion.nombre.toLowerCase().includes(query);
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
    <!-- Search Input -->
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar elecciones por nombre..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
      />
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
      <div
        v-for="eleccion in filteredElecciones"
        :key="eleccion.id"
        class="border bg-white border-gray-200 rounded-lg p-4 hover:shadow-md transition"
      >
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
          <NuxtLink
            :to="`/elecciones/${eleccion.id}`"
            class="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium text-sm whitespace-nowrap"
          >
            Detalles
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
