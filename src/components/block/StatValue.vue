<template>
   <small class="text-center mr-1">{{ stat.name }}: {{ stat.current | formatShort }}</small>
</template>

<script>
export default {
    props: [ 'stat' ],
}
</script>

