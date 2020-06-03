import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home'
import Login from '@/views/Login'
import Register from '@/views/Register'
import Profile from '@/views/Profile'
import Matches from '@/views/Matches'
import Match from '@/views/Match'
import MatchProfile from '@/views/MatchProfile'
import ResetPassword from '@/views/ResetPassword'
import About from '@/views/About'
import firebase from 'firebase'
import db from '@/firebase/init'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true,
      requiresProfile: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/matches',
    name: 'Matches',
    component: Matches,
    meta: {
      requiresAuth: true,
      requiresProfile: true
    }
  },
  {
    path: '/match/:id',
    name: 'Match',
    component: Match,
    meta: {
      requiresAuth: true,
      requiresMatch: true
    }
  },
  {
    path: '/match/:id/profile',
    name: 'MatchProfile',
    component: MatchProfile,
    meta: {
      requiresAuth: true,
      requiresMatch: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresNoAuth: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      requiresNoAuth: true
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      requiresNoAuth: true
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {

  let user = firebase.auth().currentUser
  let redirect = false

  if (to.matched.some(rec => rec.meta.requiresNoAuth)){
    if (!user){
      next()
    } else {
      redirect = true
      next({name: 'Profile'})
    }
  }

  if (to.matched.some(rec => rec.meta.requiresAuth)){
    if (user){
      next()
    } else {
      redirect = true
      next({name: 'Login'})
    }
  }

  if (user && to.matched.some(rec => rec.meta.requiresProfile)){
    db.collection('users').where('id', '==', user.uid).get().then(snapshot => {
      snapshot.forEach(doc => {
        let userData = doc.data()
        firebase.storage().ref(userData.id).listAll().then(async results => {
          if (userData.name && userData.dateOfBirth && userData.gender && userData.prefs.length && results.items.length){
            next()
          } else {
            redirect = true
            next({name: 'Profile'})
          }
        })
      })
    }).catch(err => {
      console.log(err)
    })
  }

  if (user && to.matched.some(rec => rec.meta.requiresMatch)){
    let areUsersMatched = new Promise(resolve => {
      db.collection('users').doc(user.uid).get().then(userDoc => {
        db.collection('users').doc(to.params.id).get().then(matchDoc => {
          let userData = userDoc.data()
          let matchData = matchDoc.data()
          if (userData.likes.includes(to.params.id) && matchData.likes.includes(user.uid)){
            resolve(true)
          } else {
            resolve(false)
          }
        })
      })
    })
    areUsersMatched.then(result => {
      if (result){
        next()
      } else {
        redirect = true
        next({name: 'Matches'})
      }
    })
  }

  if (redirect == false){
    next()
  }
  
})

export default router
