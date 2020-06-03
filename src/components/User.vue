<template>
    <div class="users-container">
        <div v-if="noUsers" class="no-user">
            No users in your search area.
        </div>
        <div v-else-if="users[0]" class="users">
            <div :class="['user', swipe ? swipe : '']" v-swiping="swipeHandler" ref="user">
                <div class="user-top">
                    <div class="pic-num" v-if="users[0].pics.length > 1">
                        <span v-for="(pic, index) in users[0].pics" :key="index" :class="users[0].currentPic == index ? 'current-pic' : ''"></span>
                    </div>
                    <div class="pic-left-right pic-left" @click="prevPic"></div>
                    <div class="pic-left-right pic-right" @click="nextPic"></div>
                    <img :src="users[0].pics[users[0].currentPic]">
                </div>
                <div :class="users[0].toggled ? 'user-bottom open' : 'user-bottom'" @click="toggleContent">
                    <div class="user-details">
                        <div><span class="user-name">{{ users[0].name }}</span>, <span class="user-age">{{ users[0].age }}</span></div>
                        <span class="user-location">{{ users[0].location.town }} <span class="user-distance">({{ users[0].location.distance }} km)</span></span>
                    </div>
                    <div class="user-content">{{  users[0].content  }}</div>
                </div>
            </div>
            <div v-if="users[1]" :class="['user-next', {'transition': swipe}]">
                <div class="user-top">
                    <div class="pic-num" v-if="users[1].pics.length > 1">
                        <span v-for="(pic, index) in users[1].pics" :key="index" :class="users[1].currentPic == index ? 'current-pic' : ''"></span>
                    </div>
                    <div class="pic-left-right pic-left" @click="prevPic"></div>
                    <div class="pic-left-right pic-right" @click="nextPic"></div>
                    <img :src="users[1].pics[users[1].currentPic]">
                </div>
                <div :class="users[1].toggled ? 'user-bottom open' : 'user-bottom'" @click="toggleContent">
                    <div class="user-details">
                        <div><span class="user-name">{{ users[1].name }}</span>, <span class="user-age">{{ users[1].age }}</span></div>
                        <span class="user-location">{{ users[1].location.town }} <span class="user-distance">({{ users[1].location.distance }} km)</span></span>
                    </div>
                    <div class="user-content">{{  users[1].content  }}</div>
                </div>
            </div>
            <div v-if="matched" class="matched">
                <span class="iam">Match!</span>
                <div class="matched-users">
                    <div :style="{'background-image': 'url('+currentUser.pics[0]+')'}"></div>
                    <div :style="{'background-image': 'url('+users[0].pics[0]+')'}"></div>
                </div>
                <router-link v-if="false" :to="{name: 'Match', params: {id: users[0].id }}" class="message-match">Message</router-link>
            </div>
        </div>
        <Loading v-else />
    </div>
</template>

<script>
import Loading from '@/components/Loading'
import firebase from 'firebase'
import db from '@/firebase/init'
import axios from 'axios'
import Hammer from 'hammerjs'
import {bus} from '@/main'
import getPics from '@/mixins/getPics'

export default {
    data(){
        return {
            users: [],
            swipe: null,
            matched: false,
            noUsers: false,
            dragging: false,
            lastPosX: 0,
            lastPosY: 0,
            feedback: null
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
        swipeHandler(e){
            let el = this.$refs.user
            if (!this.dragging){
                this.dragging = true
                this.lastPosX = el.offsetLeft
                this.lastPosY = el.offsetTop
            }
            let posX = e.deltaX + this.lastPosX
            let posY = e.deltaY + this.lastPosY
            el.style.left = posX + 'px'
            el.style.top = posY + 'px'
            if (e.isFinal) {
                if (posX >= 100){
                    //Swipe right
                    el.animate([{top: posY+'px'}, {top: '0px'}], {duration: 250, easing: 'ease-out', direction: 'normal'})
                    el.animate([{left: posX+'px'}, {left: '100%'}], {duration: 250, easing: 'ease-out', direction: 'normal'})
                    el.style.top = '0px'
                    el.style.left = '100%'
                    this.like()
                } else if (posX <= -100){
                    //Swipe left
                    el.animate([{top: posY+'px'}, {top: '0px'}], {duration: 250, easing: 'ease-out', direction: 'normal'})
                    el.animate([{left: posX+'px'}, {left: '-100%'}], {duration: 250, easing: 'ease-out', direction: 'normal'})
                    el.style.top = '0px'
                    el.style.left = '-100%'
                    this.dislike()
                } else {
                    //Reset
                    this.lastPosX = 0
                    this.lastPosY = 0
                    el.style.top = 'unset'
                    el.style.left = 'unset'
                    el.animate([{top: posY+'px'}, {top: '0px'}], {duration: 250, easing: 'ease-out', direction: 'normal'})
                    el.animate([{left: posX+'px'}, {left: '0px'}], {duration: 250, easing: 'ease-out', direction: 'normal'})
                }
                this.dragging = false
            }
        },
        toggleContent(){
            this.users[0].toggled = !this.users[0].toggled
        },
        prevPic(){
            if (this.users[0].currentPic > 0){
                this.users[0].currentPic--
            }
        },
        nextPic(){
            if (this.users[0].currentPic < this.users[0].pics.length - 1){
                this.users[0].currentPic++
            }
        },
        getDistance(lat1, lon1, lat2, lon2, unit) {
            if ((lat1 == lat2) && (lon1 == lon2)) {
                return 0;
            }
            else {
                var radlat1 = Math.PI * lat1/180;
                var radlat2 = Math.PI * lat2/180;
                var theta = lon1-lon2;
                var radtheta = Math.PI * theta/180;
                var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                if (dist > 1) {
                    dist = 1;
                }
                dist = Math.acos(dist);
                dist = dist * 180/Math.PI;
                dist = dist * 60 * 1.1515;
                if (unit=="K") { dist = dist * 1.609344 }
                if (unit=="N") { dist = dist * 0.8684 }
                return dist;
            }
        },
        async like(button){
            if (!this.swipe){
                if (button){
                    this.swipe = 'right-button'
                } else {
                    this.swipe = 'right'
                }
                let likedUser = this.users[0].id
                //If not already liked
                if (!this.currentUser.likes.includes(likedUser)){
                    //Add to local likes array
                    this.currentUser.likes.push(likedUser)
                    //Add to server likes array
                    await db.collection('users').doc(this.currentUser.id).update({likes: firebase.firestore.FieldValue.arrayUnion(likedUser)})
                    //Check if both users liked each other, add to newMatches on server if true
                    let liked = await db.collection('users').doc(likedUser).get()
                    if (liked.data().likes.includes(this.currentUser.id)){
                        await db.collection('users').doc(this.currentUser.id).update({
                            newMatches: firebase.firestore.FieldValue.arrayUnion(likedUser)
                        })
                        await db.collection('users').doc(likedUser).update({
                            newMatches: firebase.firestore.FieldValue.arrayUnion(this.currentUser.id)
                        })
                        this.matched = true
                        setTimeout(() => {
                            bus.$emit('checkMatches', '')
                            this.users.shift()
                            let el = this.$refs.user
                            if (el){
                                el.style.left = 'unset'
                                el.style.top = 'unset'
                            }
                            this.swipe = null
                            this.matched = false
                            if (!this.users[0]){
                                this.noUsers = true
                            }
                        }, 2500)
                    } else {
                        setTimeout(() => {
                            this.users.shift()
                            let el = this.$refs.user
                            if (el){
                                el.style.left = 'unset'
                                el.style.top = 'unset'
                            }
                            this.swipe = null
                            if (!this.users[0]){
                                this.noUsers = true
                            }
                        }, 250)
                    } 
                }
            }
        },
        async dislike(button){
            if (!this.swipe){
                if (button){
                    this.swipe = 'left-button'
                } else {
                    this.swipe = 'left'
                }
                let dislikedUser = this.users[0].id
                if (!this.currentUser.dislikes.includes(dislikedUser)){
                    this.currentUser.dislikes.push(dislikedUser)
                    await db.collection('users').doc(this.currentUser.id).update({dislikes: firebase.firestore.FieldValue.arrayUnion(dislikedUser)})
                }
                setTimeout(() => {
                    this.users.shift()
                    let el = this.$refs.user
                    el.style.left = 'unset'
                    el.style.top = 'unset'
                    this.swipe = null
                    if (!this.users[0]){
                        this.noUsers = true
                    }
                }, 250)
            }
        }
    },
    directives: {
        'swiping': {
            bind: function(el, binding) {
                if (typeof binding.value === 'function') {
                    const mc = new Hammer(el, {
                        inputClass: Hammer.TouchInput
                    })
                    mc.get('pan').set({
                        direction: Hammer.DIRECTION_ALL,
                        threshold: 0
                    })
                    mc.on('pan', binding.value)
                }
            }
        }
    },
    async created(){
        //Update current user's location
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(async pos => {
                this.currentUser.location.lat = pos.coords.latitude.toString()
                this.currentUser.location.lng = pos.coords.longitude.toString()
                let town = await axios({
                    method: 'post',
                    url: 'https://europe-west2-heretic-hearts.cloudfunctions.net/getTown',
                    data: {
                        lat: this.currentUser.location.lat,
                        lng: this.currentUser.location.lng
                    }
                })
                this.currentUser.location.town = town.data.results[0].address_components[0].short_name
                await db.collection('users').doc(this.currentUser.id).update({location: this.currentUser.location})
            }, err => console.log(err),
            {maximumAge: 60000, timeout: 3000})
        } else {
            let results = await axios.post('https://europe-west2-heretic-hearts.cloudfunctions.net/getLocByIp')
            this.currentUser.location.lat = results.data.latitude.toString()
            this.currentUser.location.lng = results.data.longitude.toString()
            let town = await axios({
                method: 'post',
                url: 'https://europe-west2-heretic-hearts.cloudfunctions.net/getTown',
                data: {
                    lat: this.currentUser.location.lat,
                    lng: this.currentUser.location.lng
                }
            })
            this.currentUser.location.town = town.data.results[0].address_components[0].long_name
            await db.collection('users').doc(this.currentUser.id).update({location: this.currentUser.location})
        }

        //Get users
        let snapshot = await db.collection('users').get()
        for (const doc of snapshot.docs){
            let userData = doc.data()
            let distance = Math.floor(this.getDistance(userData.location.lat, userData.location.lng, this.currentUser.location.lat, this.currentUser.location.lng, 'K'))

            //Filter users here
            if (userData.id != this.currentUser.id &&
            !this.currentUser.likes.includes(userData.id) &&
            !this.currentUser.dislikes.includes(userData.id) &&
            (distance <= this.currentUser.distance || this.currentUser.distance == 0) &&
            (distance <= userData.distance || userData.distance == 0) &&
            this.currentUser.prefs.includes(userData.gender) &&
            userData.prefs.includes(this.currentUser.gender)){

                //Get users' pics
                let pics = await this.getPics(userData.id)

                //Add to user array data
                this.users.push({
                    id: userData.id,
                    name: userData.name,
                    age: Math.floor(((new Date()).getTime() - userData.dateOfBirth) / (1000 * 60 * 60 * 24 * 365)),
                    pics: pics,
                    location: {
                        distance: distance,
                        town: userData.location.town
                    },
                    content: userData.content,
                    toggled: false,
                    currentPic: 0
                })
            }
        }
        if (this.users.length){
            this.noUsers = false
        } else {
            this.noUsers = true
        }
        bus.$off('like')
        bus.$off('dislike')
        bus.$on('buttonLike', this.like)
        bus.$on('buttonDislike', this.dislike)
    }
}
</script>

<style lang="sass">
    @keyframes loading
        from
            height: 100px
            width: 100px
            opacity: 1
        to
            height: 125px
            width: 125px
            opacity: 0
    
    @keyframes swipeLeft
        from
            left: 0
        to
            left: -150%

    @keyframes swipeRight
        from
            right: 0
        to
            right: -150%

    @keyframes matched
        0%
            transform: scale(0)
            opacity: 0
        10%
            transform: scale(1)
            opacity: 1
        90%
            transform: scale(1)
            transform-origin: 100% 0
            top: 0
            opacity: 1
        100%
            transform: scale(0)
            transform-origin: 100% 0
            top: -90px
            opacity: 0
        
    .users-container
        height: calc(100% - 90px)
        overflow: hidden
        .users
            height: 100%
            position: relative
            display: flex
            align-items: center
            justify-content: center
            .user
                height: 100%
                width: 100%
                position: relative
                display: flex
                flex-direction: column
                align-items: center
                justify-content: flex-start
                overflow: hidden
                border-radius: 10px
                z-index: 2
                .user-top
                    min-height: 100%
                    width: 100%
                    position: relative
                    display: flex
                    align-items: center
                    justify-content: center
                    img
                        height: 100%
                        width: 100%
                        object-fit: cover
                    .pic-left-right
                        height: 100%
                        width: 12.5%
                        min-width: 50px
                        position: absolute
                        top: 0
                        &.pic-left
                            left: 0
                        &.pic-right
                            right: 0
                    .pic-num
                        width: calc(100% - 20px)
                        display: flex
                        position: absolute
                        top: 10px
                        span
                            flex: 1
                            height: 4px
                            margin: 0 5px
                            border-radius: 2px
                            background-color: rgba(0, 0, 0, 0.125)
                            &.current-pic
                                background-color: rgba(0, 0, 0, 0.25)
                .user-bottom
                    position: relative
                    top: -110px
                    min-height: calc(100% + 20px)
                    width: 100%
                    padding: 40px 20px
                    box-sizing: border-box
                    color: #fff
                    line-height: 24px
                    font-size: 16px
                    font-weight: lighter
                    font-family: Gotham
                    transition: all 250ms ease-in-out
                    cursor: pointer
                    .user-details
                        font-weight: bold
                        font-size: 32px
                        width: 100%
                        color: #fff
                        text-shadow: #000 0px 0px 2px, #000 0px 0px 2px, #000 0px 0px 2px, #000 0px 0px 2px, #000 0px 0px 2px, #000 0px 0px 2px
                        box-sizing: border-box
                        margin-bottom: 20px
                        padding-bottom: 20px
                        border-bottom: 1px solid #fff
                        .user-age
                            font-size: 28px
                            font-weight: lighter
                        .user-location
                            font-size: 16px
                            .user-distance
                                font-size: 14px
                                font-weight: lighter
                    &.open
                        top: -100%
                        background: rgba(0, 0, 0, 0.75)
                &.left
                    
                    right: -150%
                    transition: 250ms ease-out
                &.left-button
                    animation: swipeLeft 250ms ease-in forwards
                &.right
                    left: -150%
                    transition: 250ms ease-out
                &.right-button
                    animation: swipeRight 250ms ease-in forwards
            .user-next
                @extend .user
                position: absolute
                top: 0
                z-index: 1
                height: 90%
                width: 90%
                opacity: 0
                transition: all 250ms ease-in
                &.transition
                    opacity: 1
                    height: 100%
                    width: 100%
            .matched
                position: absolute
                top: 0
                color: #fff
                height: 100%
                width: 100%
                background-color: #000
                display: grid
                align-items: center
                grid-template-rows: 2fr 2fr 1fr
                font-family: Gotham
                font-weight: bold
                font-size: 16px
                padding: 20px
                box-sizing: border-box
                z-index: 3
                animation: matched 2500ms ease-out forwards
                .matched-users
                    display: grid
                    grid-template-columns: repeat(2, 1fr)
                    grid-gap: 20px
                    div
                        width: 100%
                        height: 0
                        padding-bottom: 100%
                        border-radius: 5px
                        background-size: cover
                        background-position: center
                        box-sizing: border-box
                        border: 1px solid #fff
                .iam
                    font-family: California
                    font-size: 96px
                    font-weight: lighter
                    font-style: italic
                    transform: rotate(-16deg)
                    
    .no-user
        color: #fff
        font-family: Gotham
        font-weight: bold
        height: 100%
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