/*
let Notif = (function () {

    function initialize() {
        // popup de permission pour les notifications
        let permission = document.getElementById('push-permission')
        if (
            (!permission)
            // || (Notification.permission !== 'default')
        ) return;

        const button = document.createElement('button')
        button.innerText = 'Recevoir notifications'
        permission.appendChild(button)
        button.addEventListener('click', askPermission)
    }


    async function askPermission(){
        const permission = await Notification.requestPermission(
            function(status) {
                console.log('Statut de la permission de notifications: ', status);
            }
        );
        if(permission === 'granted') {
            await registerServiceWorker();
        }
    }

    async function registerServiceWorker () {
        // await = la variable attend d'abord le retour de la fonction qui suit
        const serverKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        const registration = await navigator.serviceWorker.register('sw-notifications.js', { scope: 'notifications' })
        let subscription = await registration.pushManager.getSubscription();

        // S'il n'y a pas d'abonnement pour cet utilisateur, on en crée un
        if(!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: serverKey,
            })

        }
        await saveSubscription(subscription);
    }

    async function saveSubscription(subscription) {
        await fetch("subscribe.api.php", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(subscription)
        });
    }

    async function sendNotification(title, options) {
        navigator.serviceWorker.ready.then(function(registration) {
            registration.showNotification(title, options);
        });
    }


    return {
        init: initialize
    };
})();
*/