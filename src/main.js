import Vue from 'vue'
import App from './App.vue'
import router from './router'
import firebase from 'firebase'
import VueChatScroll from 'vue-chat-scroll'

Vue.use(VueChatScroll)
Vue.config.productionTip = false

export const bus = new Vue()

let app = null;

firebase.auth().onAuthStateChanged(() => {
  if (!app){  
    app = new Vue({
      router,
      render: h => h(App)
    }).$mount('#app')
  }
})