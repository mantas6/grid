<template>
    <div>
        <b-alert variant="primary" :show="movedCount < 3">
            <small class="d-md-none"><b>Swipe</b> on the grid to move</small>
            <small class="d-none d-md-block">Click on <b>arrows</b> or use <b>WASD</b> to move</small>
        </b-alert>
        <b-alert variant="success" :show="movedCount >= 3 && movedCount < 10">
            <small>Collect <b>green</b> stuff to survive! Head <b>up</b> or <b>down</b> for higher level of loot!</small>
        </b-alert>
        <b-alert variant="warning" :show="movedCount >= 10 && movedCount < 15">
            <small>Collect items marked in <b>$</b> sign. Some of them can be used on the <b>enviroment</b> or other <b>players</b> by throwing them!</small>
        </b-alert>
    </div>
</template>

<script>
export default {
    props: [ 'movedCount' ],
}
</script>

