<template>
    <nav class="flex justify-between items-center px-10 py-6 border-b bg-white" role="navigation" aria-label="main navigation">
        <div class="flex items-center">
            <NuxtLink class="flex flex-col leading-tight text-left" to="/">
                <span class="text-xl font-bold text-gray-800">Sello Legítimo</span>
                <span class="text-red-500 text-xs font-semibold tracking-wide">SISTEMA ELECTORAL COLOMBIANO</span>
            </NuxtLink>
        </div>

        <div class="hidden md:flex items-center gap-6 text-sm">
            <NuxtLink class="hover:text-gray-900 text-gray-600 transition" to="/elecciones">Elecciones</NuxtLink>
        </div>
    </nav>
</template>
