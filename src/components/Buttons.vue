<template>
    <div class="buttons">
        <button class="left-no" @click="dislike"><i class="fa fa-times"></i></button>
        <button class="right-yes" @click="like"><i class="fa fa-heart"></i></button>
    </div>
</template>

<script>
import {bus} from '@/main'

export default {
    data(){
        return {
        }
    },
    methods: {
        like(){
            bus.$emit('buttonLike', true)
        },
        dislike(){
            bus.$emit('buttonDislike', true)
        }
    }
}
</script>

<style lang="sass">
    .buttons
        width: 100%
        height: 90px
        display: flex
        align-items: center
        justify-content: space-around
        button
            background-color: #111
            border-radius: 50%
            border: 2px solid #fff
            height: 70px
            width: 70px
            padding: 0
            outline: 0
            cursor: pointer
            i
                font-size: 30px
                color: #fff
            &.left-no
                i
                    font-size: 36px
</style>