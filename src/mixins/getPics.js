import firebase from 'firebase'

export default {
    methods: {
        async getPics(id){
            let pics = [null, null, null]
            let results = await firebase.storage().ref(id).listAll()
            for (const imageRef of results.items){
                let meta = await imageRef.getMetadata()
                let order = Number(meta.customMetadata.order)
                let url = await imageRef.getDownloadURL()
                pics.splice(order, 1, url)
            }
            pics = pics.filter(pic => {return pic})
            return pics
        },
        async getPic(id){
            let pic = await firebase.storage().ref().child(id).child('0_960x960').getDownloadURL()
            return pic
        }
    }
}