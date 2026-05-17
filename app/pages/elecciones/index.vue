<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col items-center gap-2 px-4">
            <h2 class="text-3xl font-bold text-center">Elecciones</h2>
            <p class="text-gray-600 text-center">
                Aquí puedes ver y gestionar las elecciones en el sistema electoral colombiano.
            </p>
        </div>
        <div class="max-w-4xl w-full mx-auto">
            <EleccionList />
        </div>
    </div>
</template>
