<template>
    <header>
        <router-link to="/profile"><Profile /></router-link>
        <router-link to="/"><Icon /></router-link>
        <router-link to="/matches"><Matches /><span v-if="newMessages || newMatches" class="new-messages-matches"></span></router-link>
    </header>
</template>

<script>
import Icon from '@/components/svg/Icon'
import Matches from '@/components/svg/MatchesIcon'
import Profile from '@/components/svg/ProfileIcon'
import firebase from 'firebase'
import db from '@/firebase/init'
import {bus} from '@/main'

export default {
    components: {
        Icon,
        Matches,
        Profile
    },
    data(){
        return {
            newMessages: false,
            newMatches: false
        }
    },
    methods: {
        async checkNewMessages(){
            if (firebase.auth().currentUser){
                let newMessages = false
                let messages = await db.collection('messages').where('to', '==', firebase.auth().currentUser.uid).get()
                for (const mes of messages.docs){
                    if (mes.data().seen == false){
                        newMessages = true
                    }
                }
                this.newMessages = newMessages
            }
        },
        async checkNewMatches(){
            if (firebase.auth().currentUser){
                let newMatches = false
                let user = await db.collection('users').doc(firebase.auth().currentUser.uid).get()
                if (user.data().newMatches.length){
                    newMatches = true
                }
                this.newMatches = newMatches
            }
        }
    },
    async created(){
        this.checkNewMessages()
        this.checkNewMatches()
        bus.$on('checkMessage', async () => {
            this.checkNewMessages()
        })
        bus.$on('checkMatches', async () => {
            this.checkNewMatches()
        })
    }
}
</script>

<style lang="sass">
    header
        width: 100%
        height: 70px
        display: flex
        align-items: center
        justify-content: space-around
        a
            display: flex
            position: relative
            .profile-icon
                fill: #fff
                width: 40px
                height: 40px
            .hh-icon
                width: 50px
                height: 50px
                fill: #fff
            .messages-icon
                fill: #fff
                height: 40px
                width: 40px
            .new-messages-matches
                background-color: hsl(280, 75%, 25%)
                height: 10px
                width: 10px
                border-radius: 50%
                position: absolute
                top: 0
                right: 0
                border: 1px solid #fff
</style>