<template>
    <div class="match-profile">
        
        <div v-if="loaded" class="user">
            <div class="user-top">
                <div class="pic-num" v-if="match.pics.length > 1">
                    <span v-for="(pic, index) in match.pics" :key="index" :class="match.currentPic == index ? 'current-pic' : ''"></span>
                </div>
                <div class="pic-left-right pic-left" @click="prevPic"></div>
                <div class="pic-left-right pic-right" @click="nextPic"></div>
                <img :src="match.pics[match.currentPic]">
            </div>
            <div :class="match.toggled ? 'user-bottom open' : 'user-bottom'" @click="toggleContent">
                <div class="user-details">
                    <div><span class="user-name">{{ match.name }}</span>, <span class="user-age">{{ match.age }}</span></div>
                    <span class="user-location">{{ match.location.town }} <span class="user-distance">({{ match.location.distance }} km)</span></span>
                </div>
                <div class="user-content">{{  match.content  }}</div>
            </div>
        </div>

        <div v-if="loaded" class="back">
            <router-link :to="{name: 'Match', params: { userId: this.$route.params.id }}"><i class="fa fa-arrow-circle-left"></i></router-link>
        </div>

        <Loading v-if="!loaded" />

    </div>
</template>

<script>
//import firebase from 'firebase'
import db from '@/firebase/init'
import Loading from '@/components/Loading'
import getPics from '@/mixins/getPics'

export default {
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
    data(){
        return {
            match: {
                name: null,
                age: null,
                location: {
                    lat: null,
                    lng: null,
                    town: null,
                    distance: null
                },
                content: null,
                pics: [],
                currentPic: 0,
                toggled: false
            },
            loaded: false
        }
    },
    methods: {
        toggleContent(){
            this.match.toggled = !this.match.toggled
        },
        prevPic(){
            if (this.match.currentPic > 0){
                this.match.currentPic--
            }
        },
        nextPic(){
            if (this.match.currentPic < this.match.pics.length - 1){
                this.match.currentPic++
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
        }
    },
    async created(){
        
        let match = await db.collection('users').doc(this.$route.params.id).get()
        this.match.name = match.data().name
        this.match.age = Math.floor(((new Date()).getTime() - match.data().dateOfBirth) / (1000 * 60 * 60 * 24 * 365))
        this.match.location = match.data().location
        this.match.content = match.data().content
        this.match.location.distance = Math.floor(this.getDistance(match.data().location.lat, match.data().location.lng, this.currentUser.location.lat, this.currentUser.location.lng, 'K'))

        //Get pics
        let pics = await this.getPics(match.data().id)
        this.match.pics = pics.filter(pic => {return pic})

        this.loaded = true
    }
}
</script>

<style lang="sass">
    .match-profile
        height: calc(100% - 70px)
        .user
            height: calc(100% - 90px)
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
                animation: swipeLeft 250ms ease-in forwards
            &.right
                animation: swipeRight 250ms ease-in forwards
        .back
            height: 90px
            display: flex
            align-items: center
            justify-content: center
            a
                font-size: 48px
                padding: 10px
                color: #fff
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