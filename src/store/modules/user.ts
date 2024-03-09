import { register } from 'register-service-worker'
import { openiap } from "@openiap/jsapi";
import { config as jsconfig } from "@openiap/jsapi";

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
const NEW_PUBLIC_KEY = "BJX0VfOFzKGE3fGD3bZsg5bpBDjxntddGAZROR9v2_KYrZ7HRnhj_K32i5bXKqqWDK8AC_46yVJDLG5W_O2iAY8"
function registerserviceworker() {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      // console.debug("registerserviceworker::ready")
    },
    registered(registration) {
      // console.debug('registerserviceworker::Service worker has been registered.')
      registration.pushManager.getSubscription()
        .then((subscription) => {
          // If a subscription was found, return it.
          if (subscription) {
            let json = subscription.toJSON();
            // @ts-ignore
            let public_key = json.keys.p256dh;
            // if (public_key != NEW_PUBLIC_KEY) {
            //   console.debug('subscription does not match our public key !!!!');
            //   console.debug(NEW_PUBLIC_KEY)
            //   console.debug(public_key)
            //   subscription.unsubscribe().then(successful => {
            //     if (!successful) {
            //       console.debug("unsubscribe was not successful, giving up !")
            //       return;
            //     }
            //     console.debug('successful', successful);
            //     console.debug('unsubscribe successful, now subscribe with our public key');
            //     return registration.pushManager.subscribe({
            //       userVisibleOnly: true,
            //       applicationServerKey: urlBase64ToUint8Array(NEW_PUBLIC_KEY)
            //     }).then((subscription) => {
            //       console.debug('subscription, created as ', subscription);
            //       document.dispatchEvent(
            //         new CustomEvent('webpushsubscribed', { detail: subscription })
            //       )

            //     });
            //   }).catch(e => {
            //     console.debug('unsubscripe failed');
            //     console.error(e);
            //     // Unsubscription failed
            //   })
            //   return
            // }
            // console.debug('public_key', public_key);
            // console.debug('subscription already exists');
            return subscription;
          } else {
            // console.debug('registerserviceworker::no subscription, creating one');
          }
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(NEW_PUBLIC_KEY)
          });
        }).then(function (subscription) {
          if (subscription != null) {
            //Send push notification
            // console.debug('registerserviceworker::send subscription to webapp', subscription);
            document.dispatchEvent(
              new CustomEvent('webpushsubscribed', { detail: subscription })
            )
          } else {
            // console.debug('registerserviceworker::No subscription to send');
          }
        });
    },
    cached() {
      // console.debug('Content has been cached for offline use.')
    },
    updatefound() {
      // console.debug('New content is downloading.')
    },
    updated(registration) {
      // console.debug('New content is available; please refresh.')
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
    },
    offline() {
      console.error('No internet connection found. App is running in offline mode.')
    },
    error(error) {
      console.error('Error during service worker registration:', error)
    }
  })
  // }

}
export default {
  state: {
    config: { wsurl: "", domain: "", nodered_domain_schema: "", multi_tenant: false, nodered_images: [] },
    accessToken: "",
    jwt: "",
    user: {}, // new User()
    signedin: false,
    client: {}
  },
  getters: {
    Config: state => state.config,
    User: state => state.user,
    AccessToken: state => state.accessToken,
    Signedin: state => state.signedin,
    jwt: state => state.jwt,
    Client: state => state.client,
  },
  mutations: {
    setConfig(state, config) {
      state.config = config
    },
    setUser(state, user) {
      state.user = user
    },
    setAccessToken(state, accessToken) {
      state.accessToken = accessToken
    },
    setjwt(state, jwt) {
      state.jwt = jwt
    },
    setSignedin(state, status) {
      state.signedin = status
    },
    setClient(state, status) {
      state.client = status
    },
  },
  actions: {
    async GetConfig({ commit }) {
      var res = await fetch("/config.json");
      const data = await res.json();
      var res2 = await fetch(data.VUE_APP_CONFIG_URL);
      const data2 = await res2.json();
      commit('setConfig', data2);
    },
    async Signin({ commit, dispatch, getters }) {
      try {
        commit('setSignedin', false);
        await dispatch('GetConfig');

        let accessToken = getters.AccessToken;

        let config = getters.Config;
        let wsurl = config.wsurl;
        let domain = config.wsurl;
        if(wsurl == null || wsurl == "") throw new Error("No wsurl found in config.json");
        if (accessToken == null || accessToken == "") {
          console.warn("No access token found, please login first");
          return;
        }
        var client:openiap | null = null;
        if (client == null) {
          if(!wsurl.endsWith("/")) wsurl = wsurl + "/";
          if(wsurl.indexOf("ws/v2") == -1) wsurl = wsurl + "ws/v2";
          client = new openiap(wsurl, accessToken) // wsurl
          
          jsconfig.settings.DoPing = false;
          jsconfig.settings.DoDumpToConsole = false;
          jsconfig.settings.doDumpMesssages = false;

          var result = await client.connect(true);
          commit('setClient', client);
          // @ts-ignore
          if (result && result.user) {
            // @ts-ignore
            commit('setUser', result.user);
            // @ts-ignore
            commit('setjwt', result.jwt);
            // @ts-ignore
            localStorage.setItem("formioToken", result.jwt);
            commit('setSignedin', true);
            registerserviceworker()
          } else {
            console.error("Could not sign in");
            commit('setSignedin', false);
          }
        }
      } catch (error) {
        console.error(error);
        commit('setSignedin', false);
      }
    }
  }
}
