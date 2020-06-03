<template>
  <div class="register">
    <Logo />
    <form @submit.prevent="signup">
        <h1>Register</h1>
        <input type="text" placeholder="Email" v-model="email">
        <input type="password" placeholder="Password" v-model="password">
        <div class="age-gdpr">
            <label for="checkbox">I am at least 18 years old, and I consent<br>to my data being stored and processed.</label><input type="checkbox" id="checkbox" v-model="checked" required>
        </div>
        <button type="submit"><span v-if="!loading">Submit</span><span v-else><i class="fa fa-spinner"></i></span></button>
        <span class="feedback" v-if="feedback">{{ feedback }}</span>
    </form>
    <router-link to="/login">Already have an account?</router-link>
  </div>
</template>

<script>
import Logo from '@/components/svg/Logo'
import db from '@/firebase/init'
import firebase from 'firebase'

export default {
  name: 'Register',
  components: {
    Logo
  },
  data(){
    return {
      email: null,
      password: null,
      feedback: null,
      checked: false,
      loading: false
    }
  },
  methods: {
    signup(){
        this.loading = true

        if (!this.checked){
            this.feedback = 'You must check the age verification/data consent box.'
            return
        } else {
            this.feedback = null
        }

        if (this.email && this.password){
            firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(cred => {
                
                db.collection('users').doc(cred.user.uid).set({
                    id: cred.user.uid,
                    name: null,
                    dateOfBirth: null,
                    dateOfRegistration: Date.now(),
                    location: {},
                    content: null,
                    gender: null,
                    likes: [],
                    dislikes: [],
                    newMatches: [],
                    prefs: [],
                    distance: 0,
                    premium: false
                }).then(() => {
                    this.$router.push({name: 'Home'})
                }).catch(err => {
                    console.log(err)
                    this.feedback = err.message
                    this.loading = false
                })
                
            }).catch(err => {
                console.log(err)
                this.feedback = err.message
                this.loading = false
            })
        } else {
            this.feedback = 'You must enter an email and password'
            this.loading = false
        }
    }
  }
}
</script>

<style lang="sass">
    @keyframes spin
        from
            transform: rotate(0deg)
        to
            transform: rotate(360deg)

    .register
        box-sizing: border-box
        height: calc(100% - 70px)
        display: flex
        flex-direction: column
        align-items: center
        justify-content: flex-start
        form
            display: flex
            flex-direction: column
            align-items: center
            justify-content: center
            min-width: 400px
            width: 80%
            padding: 40px
            box-sizing: border-box
            flex: 1
            .age-gdpr
                font-size: 10px
                color: #fff
                margin-bottom: 20px
                display: grid
                grid-template-columns: 1fr 16px
                grid-gap: 10px
                align-items: center
                justify-content: center
                cursor: pointer
                label
                    cursor: pointer
                input
                    margin: 0
                    height: 16px
                    width: 16px
                    cursor: pointer
            h1
                color: #fff
                font-family: Gotham
                font-weight: lighter
                font-size: 24px
                margin: 0 0 20px
            input
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
            .feedback
                color: #fff
                margin: 20px 0
        a
            color: #fff
            text-decoration: none
            font-family: Gotham
            padding: 10px

</style>