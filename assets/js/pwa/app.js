---
layout: compress
permalink: '/app.js'
---

if ('serviceWorker' in navigator) {
    /* Registering Service Worker */
    navigator.serviceWorker.register('{{ "/sw.js" | relative_url }}')
        .then(registration => {

            /* A worker is already waiting from a previous visit — apply it silently */
            if (registration.waiting && navigator.serviceWorker.controller) {
                registration.waiting.postMessage('SKIP_WAITING');
            }

            /* When a new version is found, activate it transparently once installed */
            registration.addEventListener('updatefound', () => {
                registration.installing.addEventListener('statechange', () => {
                    if (registration.waiting && navigator.serviceWorker.controller) {
                        registration.waiting.postMessage('SKIP_WAITING');
                    }
                });
            });
        });

    let refreshing = false;

    /* The new worker has taken control — reload once to load the new version */
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}
