function GetKey(key, defaultvalue) {
  return localStorage.getItem(key) || defaultvalue;
}
function SetKey(key, value) {
  if(value == null || value == "") {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
  
}

export default {
  state: {
    cache: new Map()
  },
  mutations: {
    setCache(state, { key, value }) {
      state.cache.set(key, value)
    },
    getCache(state, key) {
      return state.get(key) || GetKey(key, null)
    }
  },
  actions: {
    PageStateGet(context, { key, defaultvalue }) {
      return GetKey(key, defaultvalue)
    },
    PageStateSet(context, { key, value }) {
      context.commit('setCache', { key, value })
      SetKey(key, value)
    },
    loadStoredState(context) {
      for (var i = 0; i < localStorage.length; i++) {
        context.commit('setCache', { key: localStorage.key(i), value: localStorage.getItem(localStorage.key(i) as any) })
      }

      // localStorage.forEach((key, value) => {
      //     context.commit('setCache', key, value)
      // })
    },
  },
  getters: {
    Cache: (state) => state.cache,
  },
}
