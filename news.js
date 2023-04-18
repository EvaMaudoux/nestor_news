let News = (function () {

    const newsContainer = document.getElementById('display-news');
    const username = getUsernameFromUrl(window.location.href);
    const loadMorebtn = document.getElementById('load-more');
    let reload = document.getElementById('reload');
    const serverKey = "BDn_CICcdB6-9NWsLhu1M0TxaWJapXYIAbLfbmt8CJ57R3u1_j0LOCj7FaJ4he_jFXlNj80COOInb_QGgZi0uHk";

    const notificationWidget = document.getElementById('notificationWidget');
    const notificationManager = document.getElementById('notificationManager');
    const acceptNotifications = document.getElementById('acceptNotifications');
    const refuseNotifications = document.getElementById('refuseNotifications');


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
            let boxes = [...document.querySelectorAll('.container #display-news .box')];
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
                content += '<a href="' + article.pdf + '">Document</a>';
            }

            if (!article.date_publication) {
                content += '<p class="card-text text-muted">' + formatDate(new Date()) + '</p>';
            } else {
                content += '<p class="card-text text-muted">' + formatDate(article.date_publication) + '</p>';
            }

            if (article.image != null && article.image !== '') {
                content = '<img class="card-img-top" src="' + article.image + '">' + content;
            }

            content += '<button type="button" class="btn btn-secondary read-button" data-id="' + article.id + '">J\'ai lu l\'annonce</button>';

            newsDiv.innerHTML = content;
            newsContainer.appendChild(newsDiv);


            // event de click sur le bouton "message reçu"
            const readButton = document.querySelector(`[data-id="${article.id}"]`);
            if (!localStorage.getItem(`news-${article.id}-${username}`)) {
                readButton.addEventListener('click', function () {
                    const newsId = this.getAttribute('data-id');
                    markAsRead(newsId);
                    this.disabled = true;
                    this.innerHTML = 'Annonce lue';
                    readButton.style.backgroundColor = '#df8b79';
                    readButton.style.borderColor = '#df8b79';
                    localStorage.setItem(`news-${article.id}-${username}`, 'true');
                });
            } else {
                readButton.disabled = true;
                readButton.style.backgroundColor = '#df8b79';
                readButton.style.borderColor = '#df8b79';
                readButton.innerHTML = 'Annonce lue';

            }
        });
    }


    // Fonction de formatage des dates
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Date(date).toLocaleDateString('fr-FR', options);
        const formattedTime = new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return 'Publié le ' + formattedDate + ' à ' + formattedTime;
    }

    // Fonction notifiant que l'annonce a été lue (bouton "message reçu")
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

    // Le navigateur demande à l'utilisateur s'il accepte de recevoir des notifications (validation nécessaire pour la suite)
    async function askPermission(){
        const permission = await Notification.requestPermission(
            function(status) {
                console.log('Statut de la permission de notifications: ', status);
            }
        );
        // Si l'utilisateur donne sa permission, on enregistre le service worker
        if (permission === 'granted') {
            await registerServiceWorker();
        }
        if (permission === "denied") {
            console.warn("L'utilisateur n'a pas autorisé les notifications");
            return null;
        }
    }


    function showModal(modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    function hideModal(modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    document.addEventListener('DOMContentLoaded', function() {
        const permission = localStorage.getItem('notificationPermission') || Notification.permission;
        if (!localStorage.getItem('notificationsAccepted') && permission !== 'granted' && permission !== 'denied') {
            // Event de scroll pour détecter quand l'utilisateur commence à faire défiler la page
            window.addEventListener('scroll', function() {
                // Vérif si l'utilisateur a fait défiler suffisamment pour afficher l'alerte
                if (window.scrollY > 100) {
                    // Vérifier si l'alerte a déjà été affichée ou si l'utilisateur a déjà donné la permission
                    if (!localStorage.getItem('notificationAlertShown') && permission !== 'granted' && permission !== 'denied') {
                        // Créer le modal
                        const modal = document.createElement('div');
                        modal.className = 'modal fade';
                        modal.setAttribute('id', 'notificationModal');
                        modal.setAttribute('tabindex', '-1');
                        modal.setAttribute('role', 'dialog');
                        modal.setAttribute('aria-labelledby', 'notificationModalTitle');
                        modal.setAttribute('aria-hidden', 'true');
                        modal.innerHTML = `
                        <div class="modal-dialog modal-dialog-centered" role="document" style="margin-top: -5%;">
                            <div class="modal-content" style="background-color: rgba(222, 97, 59, 0.85); color: #fff">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="notificationModalTitle">Restez au courant !</h5>
                                </div>
                                <div class="modal-body">
                                    <p>Si vous souhaitez recevoir une notification dès que Nestor publie une nouvelle annonce, autorisez l'affichage des notifications.</p>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-primary" style="background-color: white; color: #de613b; border: none" id="manage-notif">Gérer mes notifications</button>
                                </div>
                            </div>
                        </div>`;

                        document.body.appendChild(modal);

                        // Afficher le modal
                        showModal(modal);

                        // Event de clic au bouton "Gérer mes notifications"
                        const manageNotifBtn = document.getElementById('manage-notif');
                        manageNotifBtn.addEventListener('click', async function() {
                            await askPermission();
                            localStorage.setItem('notificationsAccepted', true);
                            await hideModal(modal);
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
    });


    // Fonction pour fermer le widget
    function closeWidget() {
        notificationManager.style.display = 'none';
    }

    // Afficher le widget de gestion des notifications
    notificationWidget.addEventListener('click', () => {
        if (notificationManager.style.display === 'none') {
            notificationManager.style.display = 'block';
        } else {
            closeWidget();
        }
    });

    acceptNotifications.addEventListener('click', closeWidget);
    refuseNotifications.addEventListener('click', closeWidget);


    // l'utilisateur veut recevoir les notifs
    acceptNotifications.addEventListener('click', async () => {
        let permission = await Notification.requestPermission();

        // Si l'utilisateur a précédemment refusé les notifications et qu'il clique maintenant sur "Accepter"
        if (permission === 'denied') {
            // Demander à nouveau la permission
            permission = await Notification.requestPermission();
        }

        // S'abonner aux notifications seulement si la permission est accordée
        if (permission === 'granted') {
            // Vérifiez si l'utilisateur est abonné aux notifications et abonnez-le si ce n'est pas le cas.
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                const newSubscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: serverKey,
                });
                await saveSubscription(newSubscription);
            }
        }
    });

    refuseNotifications.addEventListener('click', async () => {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
            await deleteSubscription(subscription);
        }
        Notification.requestPermission().then(permission => {
            if (permission === 'denied') {
                localStorage.setItem('notificationPermission', 'denied');
            }
        });
    });




    // Si l'utilisateur autorise les notifications, abonnement de l'utilisateur aux notifications sur son navigateur actuel. ATTENTION, un utilisateur sur un navigateur A aura un abonnement différent sur un navigateur B
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

    async function deleteSubscription(subscription) {
        await fetch("unsubscribe.api.php", {
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

