<template>
  <div class="login">
    <Logo />
    <form @submit.prevent="login">
      <h1>Login</h1>
      <input type="text" placeholder="Email" v-model="email">
      <input type="password" placeholder="Password" v-model="password">
      <button type="submit"><span v-if="!loading">Submit</span><span v-else><i class="fa fa-spinner"></i></span></button>
      <span class="feedback" v-if="feedback">{{ feedback }}</span>
    </form>
    <router-link to="/reset-password">Forgot your password?</router-link>
    <router-link to="/register">Haven't got an account yet?</router-link>
  </div>
</template>

<script>
import Logo from '@/components/svg/Logo'
import firebase from 'firebase'

export default {
  name: 'Login',
  components: {
    Logo
  },
  data(){
    return {
      email: null,
      password: null,
      feedback: null,
      loading: false
    }
  },
  methods: {
    login(){
      this.loading = true
      if (this.email && this.password){
        firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(() => {
          this.$router.push({name: 'Home'})
        }).catch(err => {
          this.loading = false
          this.feedback = err.message
        })
      } else {
        this.loading = false
        this.feedback = 'You must enter an email and password'
      }
    }
  }
}
</script>

<style lang="sass">
  .login
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
      margin-bottom: 20px

</style>