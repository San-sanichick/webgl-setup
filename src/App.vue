<script setup lang="ts">

    import {
        onMounted,
        ref,
        watch,
        useTemplateRef
    } from 'vue';

    import App2D from './gfx/app';


    const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
    const scale = ref(0);

    const min = 0;
    const max = 19;

    onMounted(async () =>
    {
        if (!canvas.value) return;

        const app = new App2D(canvas.value, 1500, 900);
        await app.run();
        scale.value = app.scale;

        watch(scale, (val) =>
        {
            app.scale = val + 1;
        })
    });

</script>

<template>
    <div class="w-full grid grid-cols-[max-content_max-content] gap-x-8 items-center">
        <canvas ref="canvas"></canvas>

        <div class="grid grid-rows-2 gap-y-2">
            <div class="grid grid-auto-rows">
                <span>WASD: move camera</span>
                <span>Escape: stop requestAnimationFrame</span>
                <span>P: start requestAnimationFrame</span>
                <div class="grid pt-2 grid-rows-2">
                    if stopped:
                    <span class="pl-4">F: step 1 frame forward</span>
                    <span class="pl-4">B: step 1 frame backward</span>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-x-2 items-center">
                <input
                    type="range"
                    :min="min"
                    :max="max"
                    step="0.1"
                    v-model.number="scale"
                >
                <div>{{ scale }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
