<template>
    <div>
        <b-progress :max="processSize">
            <b-progress-bar v-for="(amount, name) in processContent" :key="name" :value="amount" :variant="name"></b-progress-bar>
        </b-progress>
    </div>
</template>

<script>
export default {
    props: [ 'processContent', 'processSize' ],
}
</script>

