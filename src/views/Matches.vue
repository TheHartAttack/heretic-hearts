<template>
  <div class="matches-container">
    <Logo />
    <Loading v-if="loading" />
    <div v-else-if="matches.length" class="matches">
      <div v-for="(match, index) in matches" :key="index" class="match-container">
        <router-link :to="{name: 'Match', params: {id: match.id }}" class="match">
          <div class="match-pic" :style="{'background-image': 'url('+match.pic+')'}"></div>
          <div>
            <h2>{{ match.name }}, <span class="age">{{ match.age }}</span></h2>
            <h3>{{ match.location }}</h3>
            <span v-if="match.newMessages || match.newMatch" class="new-match-messages"></span>
          </div>
        </router-link>
        <div v-if="match.remove" class="confirm-remove">
          <span>Unmatch {{ match.name }}?</span>
          <button @click="confirmRemove(match.id, index)">Yes</button>
          <button @click="match.remove = false">No</button>
        </div>
        <button class="remove" @click="removeMatch(index)"><i class="fa fa-times-circle"></i></button>
      </div>
    </div>
    <div v-else-if="!matches.length" class="no-matches">
      No matches found.
    </div>
  </div>
</template>

<script>
import Logo from '@/components/svg/Logo'
import Loading from '@/components/Loading'
import firebase from 'firebase'
import db from '@/firebase/init'
import getPics from '@/mixins/getPics'

export default {
  data(){
    return {
      matches: [],
      loading: true
    }
  },
  components: {
    Logo,
    Loading
  },
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  mixins: [getPics],
  methods: {
    removeMatch(index){
      this.matches[index].remove = true
    },
    async confirmRemove(userId, index){
      await db.collection('users').doc(this.currentUser.id).update({
        likes: firebase.firestore.FieldValue.arrayRemove(userId),
        dislikes: firebase.firestore.FieldValue.arrayUnion(userId)
      })
      this.matches.splice(index, 1)
    }
  },
  async created(){

    //Get matches
    let snapshot = await db.collection('users').where('likes', 'array-contains', this.currentUser.id).get()
    for (const doc of snapshot.docs){
      let userData = doc.data()

      //Filter users here
      if (userData.id != this.currentUser.id &&
      this.currentUser.likes.includes(userData.id) &&
      userData.likes.includes(this.currentUser.id)
      ){

        //Get users' pics
        let pic = await this.getPic(userData.id)
        //Check for new messages
        let newMessages = false
        let messages = await db.collection('messages').where('to', '==', this.currentUser.id).get()
        for (const mes of messages.docs){
          let message = mes.data()
          if (message.from == userData.id && message.seen == false){
            newMessages = true
          }
        }
        //Check for new match
        let newMatch = false
        let currentUserRef = await db.collection('users').doc(this.currentUser.id).get()
        if (currentUserRef.data().newMatches.includes(userData.id)){
          newMatch = true
        }
        //Add to user array data
        if (newMessages || newMatch){
          this.matches.unshift({
            id: userData.id,
            name: userData.name,
            age: Math.floor(((new Date()).getTime() - userData.dateOfBirth) / (1000 * 60 * 60 * 24 * 365)),
            pic: pic,
            location: userData.location.town,
            newMessages: newMessages,
            newMatch: newMatch,
            remove: false
          })
        } else {
          this.matches.push({
            id: userData.id,
            name: userData.name,
            age: Math.floor(((new Date()).getTime() - userData.dateOfBirth) / (1000 * 60 * 60 * 24 * 365)),
            pic: pic,
            location: userData.location.town,
            newMessages: newMessages,
            newMatch: newMatch,
            remove: false
          })
        }
      }
    }
    this.loading = false
  }
}
</script>

<style lang="sass">

.matches-container
  display: grid
  grid-gap: 40px
  .matches
    .match-container
      position: relative
      &:nth-of-type(2n-1)
          background-color: #1a1a1a
      .match
        display: grid
        grid-template-columns: repeat(2, 1fr)
        grid-gap: 20px
        align-items: center
        padding: 20px 40px
        position: relative
        text-decoration: none
        .match-pic
          width: 100%
          padding-bottom: 100%
          border-radius: 5px
          background-size: cover
          background-position: center
          border: 1px solid #fff
          box-sizing: border-box
        h2
          color: #fff
          font-size: 20px
          font-family: Gotham
          font-weight: 700
          margin: 0 0 10px
        h3
          color: #fff
          font-size: 16px
          font-family: Gotham
          font-weight: normal
          margin: 0
        .new-match-messages
          color: #fff
          font-family: Gotham
          background-color: hsl(280, 75%, 25%)
          border-radius: 50%
          border: 1px solid #fff
          height: 8px
          width: 8px
          display: inline-flex
          align-items: center
          justify-content: center
          margin-top: 10px
          font-size: 10px
          font-weight: bold
      .remove
        border-radius: 100%
        border: 0
        outline: 0
        height: 30px
        width: 30px
        color: #fff
        position: absolute
        top: 0px
        right: 0px
        background: unset
        display: flex
        align-items: center
        justify-content: center
        padding: 0
        i
          font-size: 20px
      .confirm-remove
        background-color: rgba(0, 0, 0, 0.95)
        padding: 40px
        display: grid
        grid-template-columns: repeat(2, 1fr)
        grid-gap: 20px
        width: 100%
        height: 100%
        position: absolute
        top: 0
        box-sizing: border-box
        justify-items: center
        span
          color: #fff
          grid-column: 1/3
        button
          padding: 20px
          background-color: hsl(280, 75%, 25%)
          border: 0
          border-radius: 5px
          outline: 0
          color: #fff
          font-family: Gotham
          font-size: 16px
          font-weight: 700
  .no-matches
        color: #fff
        font-family: Gotham
        font-weight: bold
        height: calc(50vh - 125px)
        width: 100%
        position: relative
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