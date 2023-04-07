let News = (function () {

    const newsContainer = document.getElementById('news-container');
    const username = getUsernameFromUrl(window.location.href);
    const loadMorebtn = document.getElementById('load-more');
    let reload = document.getElementById('reload');
    const form = document.querySelector('#add-news-form');
    const serverKey = "BDn_CICcdB6-9NWsLhu1M0TxaWJapXYIAbLfbmt8CJ57R3u1_j0LOCj7FaJ4he_jFXlNj80COOInb_QGgZi0uHk";


    function initialize() {

        // Si pas de code d'accès dans l'URL, les news ne s'affichent pas
        if (window.location.href.indexOf('ak') === -1) {
            return;
        }

        // enregistrement du service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(function(registration) {
                    console.log('Service Worker registration successful with scope: ', registration.scope);
                }).catch(function(error) {
                // Enregistrement du service worker a échoué
                console.log('Service Worker registration failed: ', error);
            });
        } else {
            console.log('Service Worker are not supported.');
        }

        // récupère les news depuis le serveur et les afficher dans la div "news-container"
        axios.post('news.api.php')
            .then(response => {
                let news = response.data;
                displayNews(news);
                // console.log(news);
            })
            .catch(error => {
                console.log(error);
            });


        // Si l'utilisateur est hors ligne, petit message pour l'avertir
        if (!navigator.onLine) {
            // l'utilisateur est hors ligne
            const offlineMessage = document.createElement('div');
            offlineMessage.textContent = 'Vous êtes hors ligne. Connectez-vous à Internet pour lire les dernières annonces.';
            offlineMessage.style.color = '#de613b';
            offlineMessage.style.border = '2px solid #de613b';
            offlineMessage.style.margin = '1rem';
            offlineMessage.style.padding = '1rem';
            offlineMessage.style.textAlign = 'center';
            document.body.prepend(offlineMessage);
        }

/*
        // popup de permission pour les notifications
        let btnPermission = document.getElementById('push-permission')

        const button = document.createElement('button');
        button.innerText = 'Recevoir notifications';
        button.style.color = '#de613b';
        button.style.border = '2px solid #de613b';
        button.style.margin = '1rem';
        button.style.padding = '.5rem';
        btnPermission.appendChild(button);

        button.addEventListener('click', askPermission);
*/
    }





    /* EVENTS */

    // Event bouton lire plus d'annonces
    if (loadMorebtn) {
        // bouton lire plus d'annonces
        let currentItem = 10;
        loadMorebtn.addEventListener('click', () => {
            let boxes = [...document.querySelectorAll('.container #news-container .box')];
            for (let i = currentItem; i < currentItem + 10; i++ ) {
                boxes[i].style.display = 'block';
            }
            console.log(loadMorebtn);
            currentItem += 10;
        });
    }

    // Event bouton rafraichir la page
    if (reload) {
        // bouton refresh
        reload.addEventListener('click', () => {
            window.location.reload();
        })
    }


    // Event affichage hors ligne (détection statut hors ligne)
    window.addEventListener('offline', () => {
        // l'utilisateur est devenu hors ligne
        const offlineMessage = document.createElement('div');
        offlineMessage.textContent = 'Vous êtes hors ligne. Connectez-vous à Internet pour lire les dernières annonces.';
        offlineMessage.style.color = '#de613b';
        offlineMessage.style.border = '2px solid #de613b';
        offlineMessage.style.margin = '1rem';
        offlineMessage.style.padding = '1rem';
        offlineMessage.style.textAlign = 'center';
        document.body.prepend(offlineMessage);
    });

    // Event affichage en ligne (détection statut en ligne)
    window.addEventListener('online', () => {
        // l'utilisateur est devenu en ligne
        const offlineMessage = document.querySelector('div');
        if (offlineMessage) {
            offlineMessage.remove();
        }
    });


    /* METHODS */

    // Fonction de récupération du code d'accès dans l'URL
    function getUsernameFromUrl(url) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get('ak') || '';
    }

    // Fonction d'affichage des annonces publiées
    function displayNews(item) {
        newsContainer.innerHTML = '';

        item.forEach(article => {
            article.read_by = article.read_by || [];

            let newsDiv = document.createElement('div');
            newsDiv.className = 'card-body box';

            let content =
                '<h5 class="card-title">' + article.title + '</h5>' +
                '<p class="card-text">' + article.content + '</p>';

            if (article.link != null && article.link !== '') {
                content += '<a href="' + article.link + '">Lien</a><br>';
            }

            if (article.pdf != null && article.pdf !== '') {
                content += '<a href="' + article.pdf + '">Document PDF</a>';
            }

            if (!article.date_publication) {
                content += '<p class="card-text text-muted">' + new Date + '</p>';
            } else {
                content += '<p class="card-text text-muted">' + article.date_publication + '</p>';
            }


            if (article.image != null && article.image !== '') {
                content = '<img class="card-img-top" src="' + article.image + '">' + content;
            }

            content += '<button type="button" class="btn btn-secondary read-button" data-id="' + article.id + '">Message reçu !</button>';

            newsDiv.innerHTML = content;
            newsContainer.appendChild(newsDiv);


            // event de click sur le bouton "message reçu"
            const readButton = document.querySelector(`[data-id="${article.id}"]`);
            if (!localStorage.getItem(`news-${article.id}-${username}`)) {
                readButton.addEventListener('click', function () {
                    const newsId = this.getAttribute('data-id');
                    markAsRead(newsId);
                    readButton.style.display = 'none';
                    localStorage.setItem(`news-${article.id}-${username}`, 'true');
                });
            } else {
                readButton.style.display = 'none';
            }
        });
    }


    // Fonction notifiant que l'annonce a été lue (boutton "message reçu")
    function markAsRead(newsId) {
        const data = new FormData();
        data.append('news_id', newsId);
        const username = getUsernameFromUrl(window.location.href);
        data.append('username', username);
        // console.log(username);
        // console.log(newsId);
        axios.post('mark_as_read.api.php', data)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.log(error.response.data);
            });
    }


    /*
        PARTIE NOTIFICATIONS
     */

    // Le navigateur demande à l'utilisateur s'il accepte de recevoir des notifications (validation éncessaire pour la suite)
    async function askPermission(){
        const permission = await Notification.requestPermission(
            function(status) {
                console.log('Statut de la permission de notifications: ', status);
            }
        );
        // Si l'utiliateur donne sa permission, on enregistre le service worker
        if (permission === 'granted') {
            await registerServiceWorker();
        }
        if (permission === "denied") {
            console.warn("L'utilisateur n'a pas autorisé les notifications");
            return null;
        }
    }

    // Pop up alert pour que l'utilisateur autorise ou bloque les notifications
    const permission = localStorage.getItem('notificationPermission') || Notification.permission;
    if (!localStorage.getItem('notificationsAccepted') && permission !== 'granted' && permission !== 'denied') {
        // Event de scroll pour détecter quand l'utilisateur commence à faire défiler la page
        window.addEventListener('scroll', function() {
            // Vérif si l'utilisateur a fait défiler suffisamment pour afficher l'alerte
            if (window.scrollY > 100) {
                // Vérifier si l'alerte a déjà été affichée ou si l'utilisateur a déjà donné la permission
                if (!localStorage.getItem('notificationAlertShown') && permission !== 'granted' && permission !== 'denied') {
                    // Afficher l'alerte
                    const notificationAlert = document.createElement('div');
                    notificationAlert.classList.add('alert', 'alert-primary', 'alert-dismissible', 'fade', 'show');
                    notificationAlert.innerHTML =`
                          <h1>Restez au courant !</h1>
                          <p>Si vous souhaitez recevoir une notification dès que Nestor publie une nouvelle annonce, autorisez l'affichage des notifications.</p>
                          <button class="btn" style="background-color: #004085; color: #ffffff" id="manage-notif">Gérer mes notifications</button>
                     `;
                    const container = document.querySelector('.container'); // Changer la sélection pour cibler le conteneur où vous voulez afficher l'alerte
                    container.insertBefore(notificationAlert, container.firstChild);

                    // Event de clic au bouton "Gérer mes notifications"
                    const manageNotifBtn = document.getElementById('manage-notif');
                    manageNotifBtn.addEventListener('click', function() {
                        askPermission();
                        localStorage.setItem('notificationsAccepted', true);
                        notificationAlert.remove();
                    });

                    // Stocker une variable indiquant que l'alerte a été affichée
                    localStorage.setItem('notificationAlertShown', true);
                }
            }
        });

        // Event pour écouter les changements dans localStorage
        window.addEventListener('storage', function(event) {
            if (event.key === 'notificationPermission' && event.newValue !== 'granted') {
                localStorage.removeItem('notificationsAccepted');
                localStorage.removeItem('notificationAlertShown');
            }
        });

        // Event pour supprimer les variables en localStorage avant de quitter la page
        window.addEventListener('beforeunload', function() {
            localStorage.removeItem('notificationsAccepted');
            localStorage.removeItem('notificationAlertShown');
        });
    }



    // S'il accepte, abonnement de l'utilisateur aux notifications sur son navigateur actuel. ATTENTION, un utilisateur sur un navigateur A aura un abonnement différent sur un navigateur B
    // Fonction d'enregistrement du service worker (appelée si permission === granted)
    async function registerServiceWorker () {
        const registration = await navigator.serviceWorker.register('sw.js')
        // Push manager permet d'abonner l'utilisateur au service de push du navigateur. Dispo a partir du service worker 'registration'
        // récupération des abonnements
        let subscription = await registration.pushManager.getSubscription();

        // Si l'utilisateur n'est pas encore abonné, création d'un nouvel abonnement (subscribe)
        if(!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                // signature pour s'authentifier au niveau du serveur push
                applicationServerKey: serverKey,
            })
        }
        // On sauvegarde en base de donnée l'abonnement
        await saveSubscription(subscription);
        // console.log(JSON.stringify(subscription));
    }


    // Fonction de sauvegarde des subscriptions en base de données
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



    return {
        init: initialize
    };
})();

