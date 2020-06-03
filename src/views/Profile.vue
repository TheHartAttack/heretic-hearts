<template>
  <div class="profile">

    <Logo />

    <span class="feedback" v-if="feedback">{{ feedback }}</span>

    <form @submit.prevent="saveProfile" class="details">
      <div class="pics">
        <div>
          <label for="pic1">
            <div v-if="newPic1" :style="{'background-image': 'url('+newPic1+')'}"></div>
            <div v-else-if="currentUser.pics[0]" :style="{'background-image': 'url('+currentUser.pics[0]+')'}"></div>
            <i v-else-if="!pic1Upload" class="fa fa-plus-circle"></i>
            <span v-if="pic1Upload">{{ pic1Upload }}%</span>
          </label>
          <input type="file" accept="image/*" id="pic1" @change="uploadImage(0)">
        </div>
        <div>
          <label for="pic2">
            <div v-if="newPic2" :style="{'background-image': 'url('+newPic2+')'}"></div>
            <div v-else-if="currentUser.pics[1]" :style="{'background-image': 'url('+currentUser.pics[1]+')'}"></div>
            <i v-else-if="!pic2Upload" class="fa fa-plus-circle"></i>
            <span v-if="pic2Upload">{{ pic2Upload }}%</span>
          </label>
          <input type="file" accept="image/*" id="pic2" @change="uploadImage(1)">
        </div>
        <div>
          <label for="pic3">
            <div v-if="newPic3" :style="{'background-image': 'url('+newPic3+')'}"></div>
            <div v-else-if="currentUser.pics[2]" :style="{'background-image': 'url('+currentUser.pics[2]+')'}"></div>
            <i v-else-if="!pic3Upload" class="fa fa-plus-circle"></i>
            <span v-if="pic3Upload">{{ pic3Upload }}%</span>
          </label>
          <input type="file" accept="image/*" id="pic3" @change="uploadImage(2)">
        </div>
      </div>
      <input type="text" placeholder="Name" v-model="currentUser.name">
      <textarea maxlength="256" placeholder="About" v-model="currentUser.content"></textarea>
      <div class="dob">
        <h2>Date of birth:</h2>
        <select v-model="dateOfBirthDay">
          <option selected="true" disabled="disabled">Day</option>
          <option v-for="index in 31" :key="index" :value="index">{{index}}</option>
        </select>
        <select v-model="dateOfBirthMonth">
          <option selected="true" disabled="disabled">Month</option>
          <option value="01">Jan</option>
          <option value="02">Feb</option>
          <option value="03">Mar</option>
          <option value="04">Apr</option>
          <option value="05">May</option>
          <option value="06">Jun</option>
          <option value="07">Jul</option>
          <option value="08">Aug</option>
          <option value="09">Sep</option>
          <option value="10">Oct</option>
          <option value="11">Nov</option>
          <option value="12">Dec</option>
        </select>
        <select v-model="dateOfBirthYear">
          <option selected="true" disabled="disabled">Year</option>
          <option v-for="index in 100" :key="index" :value="index + currentYear - 100">{{index + currentYear - 100}}</option>
        </select>
      </div>
      <div class="gender">
        <h2>I am...</h2>
        <div><input type="radio" name="gender" id="male" value="male" v-model="currentUser.gender"><label for="male">Male</label></div>
        <div><input type="radio" name="gender" id="female" value="female" v-model="currentUser.gender"><label for="female">Female</label></div>
        <div><input type="radio" name="gender" id="nonbinary" value="nonbinary" v-model="currentUser.gender"><label for="nonbinary">Nonbinary</label></div>
      </div>
      <div class="prefs">
        <h2>Interested in...</h2>
        <div><input type="checkbox" name="prefs" id="prefs-male" value="male" v-model="currentUser.prefs"><label for="prefs-male">Male</label></div>
        <div><input type="checkbox" name="prefs" id="prefs-female" value="female" v-model="currentUser.prefs"><label for="prefs-female">Female</label></div>
        <div><input type="checkbox" name="prefs" id="prefs-nonbinary" value="nonbinary" v-model="currentUser.prefs"><label for="prefs-nonbinary">Nonbinary</label></div>
      </div>
      <div class="distance">
        Within
        <select v-model="currentUser.distance">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="0">any</option>
        </select>
        km
      </div>
      <button type="submit"><span v-if="!saving">Save</span><span v-else><i class="fa fa-spinner"></i></span></button>
    </form>

    <div class="footer">
      <button @click="logout"><span v-if="!loggingOut">Logout</span><span v-else><i class="fa fa-spinner"></i></span></button>
      <button @click="deleteConfirm = true">Delete</button>
    </div>

    <div class="delete" v-if="deleteConfirm">
        <h2 v-if="!deleteComplete">Delete account?</h2>
        <p v-if="!deleteComplete">Your account and attached data will be permanently deleted.</p>
        <form v-if="!deleteComplete" @submit.prevent="deleteAccount">
          <input type="password" v-model="deleteConfirmPassword" placeholder="Password">
          <button @click.prevent="deleteConfirm = false">Cancel</button>
          <button>Delete</button>
        </form>
        <span v-if="deleteComplete">Account deleted.</span>
    </div>

  </div>
</template>

<script>
import firebase from 'firebase'
import Logo from '@/components/svg/Logo'
import db from '@/firebase/init'
import moment from 'moment'
import axios from 'axios'

export default {
  data(){
    return {
      saving: false,
      feedback: null,
      loggingOut: false,
      deleteConfirm: false,
      deleteComplete: false,
      deleteConfirmPassword: null,
      pic1Upload: null,
      pic2Upload: null,
      pic3Upload: null,
      newPic1: null,
      newPic2: null,
      newPic3: null,
      dateOfBirthDay: null,
      dateOfBirthMonth: null,
      dateOfBirthYear: null,
      currentYear: null
    }
  },
  methods: {
    logout(){
      this.loggingOut = true
      firebase.auth().signOut().then(() => {
        this.$router.push({name: 'Login'})
      }).catch(err => {
        console.log(err)
      })
    },
    async saveProfile(){
      this.saving = true
      await db.collection('users').doc(this.currentUser.id).update({
        name: this.currentUser.name,
        content: this.currentUser.content,
        dateOfBirth: this.currentUser.dateOfBirth,
        gender: this.currentUser.gender,
        prefs: this.currentUser.prefs,
        distance: this.currentUser.distance
      })
      this.saving = false
    },
    async deleteAccount(){
      if (this.deleteConfirmPassword){

        //Reauthenticate before deletion
        let reauth = firebase.auth().currentUser.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, this.deleteConfirmPassword))

        let deleteMessagesTo = new Promise(resolve => {
          db.collection('messages').where('to', '==', this.currentUser.id).get().then(messages => {
            for (const mes in messages.docs){
              mes.delete()
            }
            resolve()
          })
        })
        let deleteMessagesFrom = new Promise(resolve => {
          db.collection('messages').where('from', '==', this.currentUser.id).get().then(messages => {
            for (const mes in messages.docs){
              mes.delete()
            }
            resolve()
          })
        })

        Promise.all([
          reauth,
          deleteMessagesTo,
          deleteMessagesFrom
        ]).then(() => {
          firebase.auth().currentUser.delete()
        }).then(() => {
          this.deleteComplete = true
          this.$router.push({name: 'Login'})
        })
      }
    },
    uploadImage(num){

      //Delete existing image
      if (this.currentUser.pics[num]){
        let desertRef = firebase.storage().refFromURL(this.currentUser.pics[num])
        desertRef.delete().catch(err => console.log(err))
      }

      let imageData = event.target.files[0]
      let metaData = {customMetadata: {user: this.currentUser.id, order: num}}

      const storageRef = firebase.storage().ref(`${this.currentUser.id}/${num.toString()}`).put(imageData, metaData)
      storageRef.on('state_changed', snapshot => {

        //Upload percentages
        let uploaded = (snapshot.bytesTransferred/snapshot.totalBytes)*100
        if (num == 0){this.pic1Upload = Math.floor(uploaded)}
        else if (num == 1){this.pic2Upload = Math.floor(uploaded)}
        else if (num == 2){this.pic3Upload = Math.floor(uploaded)}

      }, err => console.log(err.message),
      () => {
        storageRef.snapshot.ref.getDownloadURL().then(url => {  

          //Temporarily display full image before resize
          if (num == 0){this.newPic1 = url}
          if (num == 1){this.newPic2 = url}
          if (num == 2){this.newPic3 = url}

          let resizedUrl = url.replace(/(heretic-hearts\.appspot\.com\/.\/\w+)(\.)/g, '$1_960x960$2')
          this.currentUser.pics.splice(num, 1, resizedUrl)          
          this.feedback = null
          this.pic1Upload = null
          this.pic2Upload = null
          this.pic3Upload = null

        }).catch(err => console.log(err))
      })
    }
  },
  components: {
    Logo
  },
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  watch: {
    dateOfBirthDay: function(data){
      let date = {
        year: this.dateOfBirthYear,
        month: this.dateOfBirthMonth-1,
        day: data
      }
      this.currentUser.dateOfBirth = moment(date).valueOf()
    },
    dateOfBirthMonth: function(data){
      let date = {
        year: this.dateOfBirthYear,
        month: data-1,
        day: this.dateOfBirthDay
      }
      this.currentUser.dateOfBirth = moment(date).unix()
    },
    dateOfBirthYear: function(data){
      let date = {
        year: data,
        month: this.dateOfBirthMonth-1,
        day: this.dateOfBirthDay
      }
      this.currentUser.dateOfBirth = moment(date).unix()
    }
  },
  async created(){
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(async pos => {
          this.currentUser.location.lat = pos.coords.latitude
          this.currentUser.location.lng = pos.coords.longitude
          let town = await axios({
              method: 'post',
              url: 'https://europe-west2-heretic-hearts.cloudfunctions.net/getTown',
              data: {
                  lat: pos.coords.latitude.toString(),
                  lng: pos.coords.longitude.toString()
              }
          })
          this.currentUser.location.town = town.data.results[0].address_components[0].short_name
          await db.collection('users').doc(this.currentUser.id).update({location: this.currentUser.location})
      }, err => console.log(err),
      {maximumAge: 60000, timeout: 3000})
    } else {
      let results = await axios.post('https://europe-west2-heretic-hearts.cloudfunctions.net/getLocByIp')
      this.currentUser.location.lat = results.data.latitude
      this.currentUser.location.lng = results.data.longitude
      let town = await axios({
          method: 'post',
          url: 'https://europe-west2-heretic-hearts.cloudfunctions.net/getTown',
          data: {
              lat: results.data.latitude.toString(),
              lng: results.data.longitude.toString()
          }
      })
      this.currentUser.location.town = town.data.results[0].address_components[0].long_name
      await db.collection('users').doc(this.currentUser.id).update({location: this.currentUser.location})
    }

    this.currentYear = Number(moment().format('YYYY'))
    this.dateOfBirthDay = moment(this.currentUser.dateOfBirth).format('D')
    this.dateOfBirthMonth = moment(this.currentUser.dateOfBirth).format('MM')
    this.dateOfBirthYear = moment(this.currentUser.dateOfBirth).format('YYYY')
  }
}
</script>

<style lang="sass">
  .profile
    display: grid
    grid-gap: 40px
    .feedback
      display: block
      color: #fff
      font-family: Gotham
      font-weight: lighter
      font-size: 14px
      margin: 40px auto
    .loading
      color: #fff
      font-family: Gotham
      font-weight: bold
      height: calc(50vh - 110px)
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
    .details
      display: flex
      flex-direction: column
      align-items: center
      min-width: 80%
      width: 100%
      padding: 0 40px
      box-sizing: border-box
      .pics
        width: 100%
        display: grid
        padding: 0 0 40px
        margin: 0 40px 40px
        grid-template-columns: repeat(3, 1fr)
        grid-gap: 20px
        border-bottom: 1px solid #fff
        input
          display: none
        label
          height: 0px
          width: 100%
          padding-top: 50%
          padding-bottom: 50%
          display: flex
          align-items: center
          justify-content: center
          background-color: #1a1a1a
          border-radius: 5px
          box-sizing: border-box
          position: relative
          overflow: hidden
          border: 1px solid #fff
          cursor: pointer
          i
            font-size: 32px
            color: #fff
          div
            height: 100%
            width: 100%
            position: absolute
            background-size: cover
            background-position: center
            background-repeat: no-repeat
          span
            color: #fff
            font-family: Gotham
            font-weight: lighter
            position: absolute
            width: 100%
            height: 100%
            display: flex
            align-items: center
            justify-content: center
            background: rgba(0, 0, 0, 0.5)
      input, textarea
        margin-bottom: 20px
        padding: 10px
        box-sizing: border-box
        width: 100%
        border-radius: 5px
        border: 0
        outline: 0
        font-size: 20px
        font-family: Gotham
        font-weight: bold
      textarea
        height: 240px
        resize: none
        overflow: auto
      .gender, .prefs
        display: grid
        grid-template-columns: repeat(3, 1fr)
        grid-gap: 10px
        width: 100%
        padding: 30px 0 40px
        border-top: 1px solid #fff
        h2
          font-family: Gotham
          font-weight: lighter
          grid-column: 1/4
          color: #fff
          font-size: 20px
          line-height: 20px
          margin: 0px
        label
          font-size: 16px
          font-family: Gotham
          font-weight: lighter
          flex: 1
          height: 50px
          background-color: #333
          color: #fff
          border-radius: 5px
          display: flex
          align-items: center
          justify-content: center
          cursor: pointer
        input[type=date]
          width: 100%
        input[type=radio], input[type=checkbox]
          display: none
          &:checked + label
            background-color: hsl(280, 75%, 25%)
      .dob
        width: 100%
        border-top: 1px solid #fff
        padding: 30px 0 40px
        margin-top: 20px
        display: grid
        grid-template-columns: repeat(3, 1fr)
        grid-gap: 20px
        h2
          font-family: Gotham
          font-weight: lighter
          grid-column: 1/4
          color: #fff
          font-size: 20px
          line-height: 20px
          margin: 0 0 10px
        select
          padding: 10px
          font-size: 16px
          font-weight: bold
          outline: 0
          border: 0
      .distance
        color: #fff
        font-family: Gotham
        font-weight: lighter
        font-size: 20px
        select
          padding: 5px
          margin: 0 10px
          font-size: 20px
          outline: 0
          font-weight: bold
          font-family: Gotham
          color: #000
      button
        margin-top: 40px

    .footer
      padding: 40px
      border-top: 2px solid #fff
      display: grid
      grid-gap: 20px
      grid-template-columns: repeat(2, 1fr)
      justify-items: center
      box-sizing: border-box

    .delete
      height: 100%
      width: 100%
      max-height: 800px
      max-width: 480px
      position: fixed
      top: 0
      background-color: rgba(0, 0, 0, 0.95)
      color: #fff
      display: flex
      flex-direction: column
      align-items: center
      justify-content: center
      padding: 40px
      box-sizing: border-box
      h2
        margin: 0 0 20px
      p
        margin: 0 0 20px
      form
        display: grid
        grid-template-columns: repeat(2, 1fr)
        grid-gap: 20px
        input
          grid-column: 1/3
          padding: 10px
          box-sizing: border-box
          width: 100%
          border-radius: 5px
          border: 0
          outline: 0
          font-size: 20px
          font-family: Gotham
          font-weight: bold
       
</style>