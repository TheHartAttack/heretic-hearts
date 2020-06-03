<template>
    <div class="reset-password">
        <Logo />
        <form v-if="!sent" @submit.prevent="resetPassword">
            <h2>Reset Password</h2>
            <input type="text" placeholder="Email" v-model="email">
            <button>Submit</button>
            <div v-if="feedback" class="feedback">{{ feedback }}</div>
        </form>
        <div v-else class="sent">
            Check your email for the password reset link.
        </div>
        
        <router-link to="/login" class="back">Back</router-link>
    </div>
</template>

<script>
import Logo from '@/components/svg/Logo'
import firebase from 'firebase'

export default {
    name: 'ForgotPassword',
    components: {
        Logo
    },
    data(){
        return{
            email: null,
            sent: false,
            feedback: null
        }
    },
    methods: {
        async resetPassword(){
            this.feedback = null
            try {
                await firebase.auth().sendPasswordResetEmail(this.email)
                this.sent = true
            }
            catch {
                this.feedback = 'Server error.'
            }
            
        }
    }
}
</script>

<style lang="sass">
.reset-password
    box-sizing: border-box
    height: calc(100% - 70px)
    display: flex
    flex-direction: column
    align-items: center
    justify-content: flex-start
    padding: 0 40px
    form
      display: flex
      flex-direction: column
      align-items: center
      min-width: 400px
      width: 80%
      padding: 40px
      box-sizing: border-box
      flex: 1
      h2
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
    .sent
        color: #fff
        font-size: 16px
        line-height: 20px
    .back
        color: #fff
        text-decoration: none
        margin: 20px
</style>