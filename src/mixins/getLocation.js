import db from '@/firebase/init'
import axios from 'axios'

export default {
    methods: {
        async getLocation(id){
            if (navigator.geolocation){
                navigator.geolocation.getCurrentPosition(async pos => {
                    let location = {}
                    location.lat = pos.coords.latitude
                    location.lng = pos.coords.longitude
                    let town = await axios({
                        method: 'post',
                        url: 'https://europe-west2-heretic-hearts.cloudfunctions.net/getTown',
                        data: {
                            lat: pos.coords.latitude.toString(),
                            lng: pos.coords.longitude.toString()
                        }
                    })
                   location.town = town.data.results[0].address_components[0].short_name
                    await db.collection('users').doc(id).update({location: this.currentUser.location})
                }, err => console.log(err),
                {maximumAge: 60000, timeout: 3000})
            } else {
                let results = await axios.post('https://europe-west2-heretic-hearts.cloudfunctions.net/getLocByIp')
                let location = {}
                location.lat = results.data.latitude
                location.lng = results.data.longitude
                let town = await axios({
                    method: 'post',
                    url: 'https://europe-west2-heretic-hearts.cloudfunctions.net/getTown',
                    data: {
                        lat: results.data.latitude.toString(),
                        lng: results.data.longitude.toString()
                    }
                })
                location.town = town.data.results[0].address_components[0].long_name
                await db.collection('users').doc(id).update({location: this.currentUser.location})
            }
        }
    }
}

