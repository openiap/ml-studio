export default {
    state: {
        subscription: {},
        notifications: [],
        subscriped: false,
    },
    getters: {
        WebPushSubscription: state => state.subscription,
        WebPushNotifications: state => state.notifications,
        WebPushSubscriped: state => state.subscriped,
    },
    mutations: {
        setWebPushSubscription(state, value) {
            state.subscription = value
            state.subscriped = (value == null) ? false : true;
        },
        setWebPushNotifications(state, value) {
            state.notifications = value
        },
    },
    actions: {
        AddWebpushNotification({ commit, state }, notification) {
            commit('setWebPushNotifications', state.notifications.concat(notification))
        },
    },

}
