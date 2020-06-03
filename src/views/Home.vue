<template>
  <div class="home">
    <User :currentUser="currentUser" />
    <Buttons />
  </div>
</template>

<script>
import User from '@/components/User'
import Buttons from '@/components/Buttons'

export default {
  name: 'Home',
  data(){
    return {
    
    }
  },
  components: {
    User,
    Buttons
  },
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="sass">
  .home
    overflow: hidden
    object-fit: cover
    height: calc(100% - 70px)    
</style>
