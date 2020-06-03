<template>
    <div class="loading"><Icon /></div>
</template>

<script>
import Icon from '@/components/svg/Icon'

export default {
    components: {
        Icon
    }
}
</script>

<style lang="sass">
.loading
    color: #fff
    font-family: Gotham
    font-weight: bold
    height: 100%
    width: 100%
    position: absolute
    top: 0
    display: flex
    align-items: center
    justify-content: center
    svg
        height: 100px
        width: 100px
        fill: #fff
        position: absolute
        animation: loading 1s ease-out infinite
</style>