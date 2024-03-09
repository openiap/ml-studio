// console.debug('service-worker.js 5');
var workbox = workbox || null;
self.__precacheManifest = [].concat(self.__precacheManifest || []);
if (workbox) workbox.precaching.suppressWarnings();
// https://github.com/vuejs/vue-cli/issues/5119
// workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

if (workbox) workbox.precaching.precacheAndRoute(self.__WB_MANIFEST, {});
//Web Push Notifications//
let click_open_url = '';
self.addEventListener('push', function (event) {
    let push_message = event.data.json()
    var notification = push_message.notification;
    if (notification == null) notification = push_message;
    console.debug('service worker received push', notification);
    var options = {};
    var title = notification.title;
    if (notification) {
        click_open_url = notification.url;
        options = {
            body: notification.body,
            icon: notification.icon,
            image: notification.image,
            tag: 'alert'
        };
    } else {
        if (title == null) title = 'No payload';
        options = {
            body: 'No notification payload',
            tag: 'alert'
        };
    }
    self.clients.matchAll().then(function (all) {
        all.forEach(function (client) {
            client.postMessage({ type: "webpush", data: notification });
        });
    });
    event.waitUntil(self.registration.showNotification(notification.title, options));
});
self.addEventListener('message', (event) => {
    // maybe do this ? https://dev.to/drbragg/handling-service-worker-updates-in-your-vue-pwa-1pip
    // console.debug('service worker received Message: ', event.data);
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
})

self.addEventListener('notificationclick', function (event) {
    console.debug('service worker, notification click: ', event.notification.tag);
    const clickedNotification = event.notification;
    clickedNotification.close();
    // if click_open_url is string
    if (click_open_url && typeof click_open_url === 'string') {
        if (click_open_url) {
            var targetUrl = null;
            try {
                targetUrl = new URL(click_open_url);
            } catch (error) {
            }
            if (targetUrl != null) {
                event.waitUntil(clients.matchAll({ type: 'window' }).then(function (clientList) {
                    var matchFound = false;
                    for (var client of clientList) {
                        var clientUrl = new URL(client.url);
                        if (clientUrl.host === targetUrl.host && 'focus' in client) {
                            client.navigate(click_open_url);
                            client.focus();
                            noMatch = true;
                        }
                    }
                    if (!matchFound) {
                        event.waitUntil(clients.openWindow(click_open_url));
                    }
                }));
            } else {
                event.waitUntil(clients.openWindow(click_open_url));
            }
            // const promiseChain = clients.openWindow(click_open_url);
            // event.waitUntil(promiseChain);
        }
    }
});

self.addEventListener('fetch', function (event) {
    event.respondWith(async function () {
        try {
            var res = await fetch(event.request);
            var cache = await caches.open('cache');
            cache.put(event.request.url, res.clone());
            return res;
        }
        catch (error) {
            return caches.match(event.request);
        }
    }());
});
