<template>
    <div class="matched-user-container">
        <div v-if="loaded" class="matched-user">
            <router-link :to="{name: 'MatchProfile', params: { userId: matchedUser.id }}" class="match-header">
                <div class="match-image" :style="{'background-image': 'url('+matchedUser.pic+')'}"></div>
                <div>
                    <h2>{{ matchedUser.name }}, <span class="age">{{ matchedUser.age }}</span></h2>
                    <h3>{{ matchedUser.location }}</h3>
                </div>
            </router-link>
            <div class="chat">
                <div v-chat-scroll class="messages">
                    <div v-for="(message, index) in messages" :key="index" :class="['message', message.to == currentUser.id ? 'left' : 'right']">
                        <div v-if="message.date != previousMessageDate(index)" :class="['message-date', index == 0 ? 'first' : '']">
                            {{ message.date }}
                            </div>
                        <div v-if="message.time != previousMessageTime(index) || message.from != previousMessageFrom(index)" class="message-time">
                            {{ message.time }}
                        </div>
                        <div class="message-content">
                            <a :href="message.image" v-if="message.image" target="_blank" download :class="message.content ? 'margin-bottom' : ''">
                                <img :src="message.image">
                            </a>
                            <span>{{ message.content }}</span>
                        </div>
                    </div>
                    <span class="no-messages" v-if="!messages.length">You matched with <span class="name">{{ matchedUser.name }}</span>! Start chatting...</span>
                </div>
                <form @submit.prevent="sendMessage">
                    <div class="message-pic-container">
                        <label for="message-pic">
                            <div v-if="newMessagePicTemp" :style="{'background-image': 'url('+newMessagePicTemp+')'}" class="preview" @click.prevent="removeMessagePic()"><i class="fa fa-times"></i></div>
                            <span v-else-if="newMessagePicUpload">{{ newMessagePicUpload }}%</span>
                            <i v-else class="fa fa-image"></i>
                        </label>
                        <input type="file" accept="image/*" id="message-pic" @change="addImageToMessage">
                    </div>
                    <textarea v-model="newMessage" placeholder="Send a message..." @keyup.enter.exact="sendMessage"></textarea>
                    <button><i class="fa fa-arrow-right"></i></button>
                </form>
            </div>
        </div>
        <Loading v-else />
    </div>
</template>

<script>
import firebase from 'firebase'
import db from '@/firebase/init'
import moment from 'moment'
import Loading from '@/components/Loading'
import {bus} from '@/main'
import getPics from '@/mixins/getPics'

export default {
    data(){
        return {
            loaded: false,
            matchedUser: {
                id: null,
                name: null
            },
            messages: [],
            newMessage: null,
            newMessagePic: null,
            newMessagePicTemp: null,
            newMessagePicUpload: null
        }
    },
    components: {
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
        sendMessage(){
            if (this.newMessage || this.newMessagePic){
                db.collection('messages').add({
                    to: this.$route.params.id,
                    from: this.currentUser.id,
                    content: this.newMessage,
                    image: this.newMessagePic,
                    time: Date.now(),
                    seen: false
                }).then(() => {
                    this.newMessage = null
                    this.newMessagePic = null
                    this.newMessagePicTemp = null
                })
            }
        },
        sortMessages(messages){
            return messages.sort((a, b) => {
                if (a.timestamp > b.timestamp) {
                    return 1
                } else if (a.timestamp < b.timestamp) {
                    return -1
                } else {
                    return 0
                }
            })
        },
        previousMessageTime(index){
            let previousIndex = index - 1
            if (previousIndex >= 0){
                return this.messages[previousIndex].time
            } else {
                return 0
            }
        },
        previousMessageDate(index){
            let previousIndex = index - 1
            if (previousIndex >= 0){
                return this.messages[previousIndex].date
            } else {
                return 0
            }
        },
        previousMessageFrom(index){
            let previousIndex = index - 1
            if (previousIndex >= 0){
                return this.messages[previousIndex].from
            } else {
                return this.messages[index].from
            }
        },
        addImageToMessage(){
            let imageData = event.target.files[0]
            let metaData = {customMetadata: {
                from: this.currentUser.id,
                to: this.$route.params.id,
                time: Date.now()
            }}
            const storageRef = firebase.storage().ref().child(this.currentUser.id).child('messagePics').child(imageData.name).put(imageData, metaData)
            storageRef.on('state_changed', snapshot => {
                //Upload percentages
                let uploaded = (snapshot.bytesTransferred/snapshot.totalBytes)*100
                this.newMessagePicUpload = Math.floor(uploaded)
            }, err => console.log(err.message),
            () => {
                storageRef.snapshot.ref.getDownloadURL().then(url => {
                    this.newMessagePicTemp = url
                    this.newMessagePic = imageData.name
                    this.newMessagePicUpload = null 
                    this.feedback = null
                }).catch(err => console.log(err))
            })
        },
        removeMessagePic(){
            this.newMessagePic = null
            this.newMessagePicTemp = null
        }
    },
    async created(){

        //Get matched user data
        let matchData = await db.collection('users').doc(this.$route.params.id).get()
        let imgUrl = await this.getPic(this.$route.params.id)
        this.matchedUser = {
            name: matchData.data().name,
            age: Math.floor(((new Date()).getTime() - matchData.data().dateOfBirth) / (1000 * 60 * 60 * 24 * 365)),
            location: matchData.data().location.town,
            pic: imgUrl
        }

        //Messages
        db.collection('messages').where('to', '==', this.currentUser.id).onSnapshot(snapshot => {
            for (let change of snapshot.docChanges()){
                if (change.doc.data().from == this.$route.params.id && change.type == 'added'){
                    if (change.doc.data().image){
                        firebase.storage().ref().child(this.$route.params.id).child('messagePics').child(change.doc.data().image.replace(/(.+)(\..{3,4})/g, '$1_960x960$2')).getDownloadURL().then(image => {
                            this.messages.push({
                                from: change.doc.data().from,
                                to: change.doc.data().to,
                                content: change.doc.data().content,
                                image: image,
                                timestamp: change.doc.data().time,
                                time: moment(change.doc.data().time).format('HH:mm'),
                                date: moment(change.doc.data().time).format('Do MMM YYYY')
                            })
                            this.messages = this.sortMessages(this.messages)
                        })
                    } else {
                        this.messages.push({
                            from: change.doc.data().from,
                            to: change.doc.data().to,
                            content: change.doc.data().content,
                            image: null,
                            timestamp: change.doc.data().time,
                            time: moment(change.doc.data().time).format('HH:mm'),
                            date: moment(change.doc.data().time).format('Do MMM YYYY')
                        })
                        this.messages = this.sortMessages(this.messages)
                    }
                    
                    db.collection('messages').doc(change.doc.id).update({
                        seen: true
                    }).then(() => {
                        bus.$emit('checkMessages', '')
                    })
                }
            }
        })

        db.collection('messages').where('from', '==', this.currentUser.id).onSnapshot(snapshot => {
            for (let change of snapshot.docChanges()){
                if (change.doc.data().to == this.$route.params.id && change.type == 'added'){
                    if (change.doc.data().image){
                        firebase.storage().ref().child(this.currentUser.id).child('messagePics').child(change.doc.data().image.replace(/(.+)(\..{3,4})/g, '$1_960x960$2')).getDownloadURL().then(image => {
                            this.messages.push({
                                from: change.doc.data().from,
                                to: change.doc.data().to,
                                content: change.doc.data().content,
                                image: image,
                                timestamp: change.doc.data().time,
                                time: moment(change.doc.data().time).format('HH:mm'),
                                date: moment(change.doc.data().time).format('Do MMM YYYY')
                            })
                            this.messages = this.sortMessages(this.messages)
                        })
                    } else {
                        this.messages.push({
                            from: change.doc.data().from,
                            to: change.doc.data().to,
                            content: change.doc.data().content,
                            image: null,
                            timestamp: change.doc.data().time,
                            time: moment(change.doc.data().time).format('HH:mm'),
                            date: moment(change.doc.data().time).format('Do MMM YYYY')
                        })
                        this.messages = this.sortMessages(this.messages)
                    }
                }
            }
        })

        this.loaded = true
        db.collection('users').doc(this.currentUser.id).update({
            newMatches: firebase.firestore.FieldValue.arrayRemove(this.$route.params.id)
        }).then(() => {
            bus.$emit('checkMatches', '')
        })

    }
}
</script>

<style lang="sass">

.matched-user-container
    height: calc(100% - 70px)
    width: 100%
    .matched-user
        height: 100%
        .match-header
            text-decoration: none
            padding: 20px
            display: grid
            grid-template-columns: 100px 1fr
            grid-gap: 20px
            justify-content: center
            align-items: center
            h2
                color: #fff
                font-size: 24px
                font-family: Gotham
                font-weight: 700
                margin: 0 0 10px
                .age
                    font-size: 20px
            h3
                color: #fff
                font-size: 16px
                font-family: Gotham
                font-weight: 400
                margin: 0
            .match-image
                background-size: cover
                background-position: center
                height: 100px
                width: 100%
                border-radius: 10px
                border: 1px solid #fff
                box-sizing: border-box
        .chat
            height: calc(100% - 140px)
            display: grid
            grid-template-rows: 1fr 50px
            background-color: #1a1a1a
            .messages
                grid-row: 1/2
                display: flex
                flex-direction: column
                overflow: scroll
                overflow-x: hidden
                padding: 10px 20px
                box-sizing: border-box
                &::-webkit-scrollbar
                    width: 3px
                &::-webkit-scrollbar-track
                    background: #1a1a1a
                &::-webkit-scrollbar-thumb
                    background: #fff
                .message
                    width: 100%
                    display: flex
                    flex-direction: column
                    margin-bottom: 5px
                    box-sizing: border-box
                    &.right
                        align-items: flex-end
                        .message-content
                           background-color: hsl(280, 75%, 25%)
                    &.left 
                        align-items: flex-start
                        .message-content
                            background-color: #000
                    .message-date
                        color: #fff
                        font-size: 10px
                        text-align: center
                        width: 100%
                        margin-top: 20px
                        &.first
                            margin-top: 0
                    .message-time
                        color: #fff
                        font-size: 10px
                        font-family: Gotham
                        margin: 5px 0
                    .message-content
                        padding: 10px
                        border-radius: 10px
                        color: #fff
                        font-family: Gotham
                        font-size: 16px
                        line-height: 20px
                        text-align: left
                        box-sizing: border-box
                        max-width: 75%
                        a
                            display: flex
                            width: 100%
                            height: 100%
                            &.margin-bottom
                                margin-bottom: 5px
                            img
                                width: 100%
                                border-radius: 5px
                        span
                            white-space: break-spaces
                .no-messages
                    color: #fff
                    font-size: 16px
                    padding: 40px
                    .name
                        font-weight: bold
                                
            form
                position: relative
                .message-pic-container
                    width: 50px
                    height: 100%
                    position: absolute
                    bottom: 0
                    left: 0
                    label
                        height: 100%
                        width: 100%
                        display: flex
                        align-items: center
                        justify-content: center
                        border-right: 1px solid #eee
                        cursor: pointer
                        i
                            font-size: 20px
                        span
                            font-family: Gotham
                            font-weight: bold
                            font-size: 12px
                        .preview
                            background-size: cover
                            background-position: center
                            height: 100%
                            width: 100%
                            font-size: 24px
                            display: flex
                            align-items: center
                            justify-content: center
                            color: #1a1a1a
                            &::after
                                content: ''
                                height: 100%
                                width: 100%
                                background: rgba(255, 255, 255, 0.5)
                                position: absolute
                                top: 0
                                left: 0
                            i
                                z-index: 1
                    input
                        display: none
                textarea
                    grid-row: 2/3
                    border: 0
                    outline: 0
                    padding: 15px 60px
                    font-family: Gotham
                    font-size: 16px
                    line-height: 20px
                    font-weight: lighter
                    resize: none
                    height: 100%
                    width: 100%
                    box-sizing: border-box
                button
                    background-color: #fff
                    color: #1a1a1a
                    border: 0
                    outline: 0
                    padding: 0
                    font-size: 24px
                    height: 100%
                    width: 50px
                    position: absolute
                    bottom: 0
                    right: 0
                    border-left: 1px solid #eee
                    cursor: pointer
    .loading
        height: calc(100% - 70px)
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