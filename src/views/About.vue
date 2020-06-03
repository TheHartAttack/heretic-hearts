<template>
    <div class="about">
        <Logo />
        <p class="about-hh">Heretic Hearts is an alternative dating platform, created to bring members of the rock, metal, punk, goth and emo subcultures together to find romance and friendship.</p>
        <ol>
            <h2>Rules:</h2>
            <li>Don't be a dick!</li>
            <li>Users must be at least 18 years old.</li>
            <li>No illegal content.</li>
        </ol>
        <form @submit.prevent="sendMail">
            <p>If you would like to contact the site admin with issues, questions or suggestions, please send a message using the following form:</p>
            <input v-if="!currentUser.name" type="text" v-model="name" placeholder="Name">
            <input v-if="!currentUser.name" type="text" v-model="email" placeholder="Email">
            <textarea v-model="content" placeholder="Message"></textarea>
            <button type="submit">Submit</button>
            <span v-if="feedback">{{ feedback }}</span>
        </form>
        <a href="https://danhart.uk" class="dhlink" target="_blank"><DHLogo /></a>
    </div>
</template>

<script>
import Logo from '@/components/svg/Logo'
import DHLogo from '@/components/svg/DHLogo'
import db from '@/firebase/init'

export default {
    components: {
        Logo,
        DHLogo
    },
    props: {
        currentUser: {
            type: Object
        }
    },
    data(){
        return{
            name: null,
            email: null,
            content: null,
            feedback: null
        }
    },
    methods: {
        sendMail(){
            db.collection('contact').add({
                from: this.currentUser.email ? this.currentUser.email : this.email,
                replyTo: this.currentUser.email ? this.currentUser.email : this.email,
                to: 'danhart21390@gmail.com',
                message: {
                    subject: `Message from ${this.currentUser.name ? this.currentUser.name : this.name} (Heretic Hearts)`,
                    text: this.content,
                    html: `<p style="font-weight: bold">${this.content}</p>`,
                }
            }).then(() => {
                this.content = null
                this.feedback = 'Message sent!'
                setTimeout(() => {
                    this.feedback = null
                }, 5000)
            }).catch(err => {
                console.log(err)
                this.feedback = err.message
            })
            
        }
    }
}
</script>

<style lang="sass">
    .about
        display: grid
        grid-gap: 40px
        align-content: start
        min-height: calc(100% - 70px)
        color: #fff
        font-size: 16px
        line-height: 20px
        .about-hh
            margin: 0
            padding: 0 40px
        form
            display: grid
            grid-gap: 20px
            padding: 0 40px
            box-sizing: border-box
            width: 100%
            justify-items: center
            p
                font-size: 16px
                line-height: 20px
            input
                font-family: Gotham
                padding: 10px
                box-sizing: border-box
                font-size: 16px
                line-height: 20px
                outline: 0
                border: 0
                width: 100%
                border-radius: 5px
            textarea
                font-family: Gotham
                padding: 10px
                box-sizing: border-box
                font-size: 16px
                line-height: 20px
                height: 160px
                outline: 0
                border: 0
                resize: none
                width: 100%
                border-radius: 5px
        ol
            background-color: #1a1a1a
            padding: 40px 40px 40px 60px
            box-sizing: border-box
            display: grid
            justify-content: center
            h2
                margin: 0 0 20px
                font-size: 20px
            li
                text-align: left
                margin-bottom: 10px
                &:last-of-type
                    margin-bottom: 0
        .dhlink
            align-self: end
            justify-self: center
            padding: 10px
            .dhlogo
                fill: #fff
                height: 20px

</style>