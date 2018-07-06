<template>
    <div>
        <small class="text-secondary">{{ items.length }} / {{ size }}</small>
        <div class="d-flex">
            <div v-for="({ name, level }, index) in items" :key="index">
                <span>{{ name }}</span>
                <span>{{ level | formatShort }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: [ 'items', 'size' ],
}
</script>
