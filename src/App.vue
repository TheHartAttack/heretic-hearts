<template>
  <div id="app">
    <Header />
    <router-view v-if="loadedUser" :currentUser="currentUser" />
    <Loading v-else />
  </div>
</template>

<script>
import Header from '@/components/Header'
import firebase from 'firebase'
import db from '@/firebase/init'
import Loading from '@/components/Loading'
import getPics from '@/mixins/getPics'

export default {
  data(){
    return {
      currentUser: {},
      loadedUser: false
    }
  },
  components: {
    Header,
    Loading
  },
  mixins: [getPics],
  async created(){
    firebase.auth().onAuthStateChanged(async () => {
      if (firebase.auth().currentUser){
        let currentUser = await db.collection('users').doc(firebase.auth().currentUser.uid).get()
        this.currentUser = currentUser.data()
        this.currentUser.email = firebase.auth().currentUser.email
        this.currentUser.dateOfBirth = new Date(currentUser.data().dateOfBirth*1000).toISOString().slice(0, 10)
        let pics = await this.getPics(this.currentUser.id)
        this.currentUser.pics = pics
        this.loadedUser = true
      } else {
        this.loadedUser = true
      }
    })
  }
}
</script>

<style lang="sass">
  @font-face
    font-family: 'California'
    src: url('../public/fonts/California.otf')

  @font-face
    font-family: 'Blackletter'
    src: url('../public/fonts/MetalBlackletter.ttf')

  @font-face
    font-family: 'Gotham'
    src: url('../public/fonts/Gotham.otf')
    font-weight: bold

  @font-face
    font-family: 'Gotham'
    src: url('../public/fonts/Metropolis.otf')
    font-weight: normal

  $color: hsl(280, 75%, 25%)
  $black: #000
  $white: #fff
  $grey: #1a1a1a

  *
    margin: 0
    padding: 0
    font-family: Gotham

  body
    margin: 0
    background: #000

  #app
    font-family: Gotham
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale
    text-align: center
    background: #000
    width: 100%
    height: 100vh
    max-width: 960px
    margin: auto
    overflow-x: hidden
    user-select: none
    position: relative
    &::-webkit-scrollbar
      width: 3px
    &::-webkit-scrollbar-track
      background: #1a1a1a
    &::-webkit-scrollbar-thumb
      background: #fff

  button
    border: 0
    outline: none
    height: 50px
    width: 100px
    display: flex
    align-items: center
    justify-content: center
    background-color: hsl(280, 75%, 25%)
    border-radius: 5px
    font-size: 16px
    font-family: Gotham
    color: #fff
    cursor: pointer
    .fa-spinner
      animation: spin 1s infinite linear

</style>
