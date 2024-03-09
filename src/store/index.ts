import { createStore } from 'vuex'
import user from './modules/user'
// import webpush from './modules/webpush'
import pagestate from './modules/pagestate'

export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    //  webpush, 
    user,pagestate
  }
})
