let News = (function () {

    const username = getUsernameFromUrl(window.location.href);
    const serverKey = "BDn_CICcdB6-9NWsLhu1M0TxaWJapXYIAbLfbmt8CJ57R3u1_j0LOCj7FaJ4he_jFXlNj80COOInb_QGgZi0uHk";

    const newsContainer = document.getElementById('display-news');
    const loadMorebtn = document.getElementById('load-more');
    const reload = document.getElementById('reload');

    const permission = localStorage.getItem('notificationPermission') || Notification.permission;
    const notificationWidget = document.getElementById('notificationWidget');
    const notificationManager = document.getElementById('notificationManager');
    const toggleNotifications = document.getElementById('toggleNotifications');
    const statutNotifications = document.getElementById('statutNotifications');


    function initialize() {

        // Si pas de code d'accès dans l'URL, les news ne s'affichent pas
        if (window.location.href.indexOf('ak') === -1) {
            return;
        }

        // enregistrement du service worker si le navigateur supporte les sw et les APIs PushManager et Notification
        if (navigator.serviceWorker && window.PushManager && window.Notification) {
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

        // Récupération des news en bd puis affichage dans la div "news-container" du
        axios.post('news.api.php')
            .then(response => {
                let news = response.data;
                displayNews(news);
                // console.log(news);
            })
            .catch(error => {
                console.log(error);
            });


        // Si l'utilisateur est hors ligne, petit message pour l'avertir qu'il n'est peut-être pas à jour
        if (!navigator.onLine) {
            // l'utilisateur est hors ligne
            let offlineMessage = document.createElement('div');
            offlineMessage.textContent = 'Vous êtes hors ligne. Connectez-vous à Internet pour lire les dernières annonces.';
            offlineMessage.style.color = '#de613b';
            offlineMessage.style.border = '2px solid #de613b';
            offlineMessage.style.margin = '1rem';
            offlineMessage.style.padding = '1rem';
            offlineMessage.style.textAlign = 'center';
            document.body.prepend(offlineMessage);
        }

        // Mise le texte du bouton flottant (clochette) en bah à droite de la page lors du chargement de la page
        updateButtonText();
    }



    /* PARTIE EVENTS */

    // Bouton "lire plus d'annonces" : au click, les dernières 10 annonces les plus récentes s'affichent, et ainsi de suite
    if (loadMorebtn) {
        let currentItem = 10;
        loadMorebtn.addEventListener('click', () => {
            let boxes = [...document.querySelectorAll('.container #display-news .box')];
            for (let i = currentItem; i < currentItem + 10; i++ ) {
                boxes[i].style.display = 'block';
            }
            currentItem += 10;
        });
    }

    // Bouton de refresh
    if (reload) {
        // bouton refresh
        reload.addEventListener('click', () => {
            window.location.reload();
        })
    }

    // Event d'affichage hors ligne (détection du statut hors ligne)
    window.addEventListener('offline', () => {
        // l'utilisateur est devenu hors ligne
        let offlineMessage = document.createElement('div');
        offlineMessage.textContent = 'Vous êtes hors ligne. Connectez-vous à Internet pour lire les dernières annonces.';
        offlineMessage.style.color = '#de613b';
        offlineMessage.style.border = '2px solid #de613b';
        offlineMessage.style.margin = '1rem';
        offlineMessage.style.padding = '1rem';
        offlineMessage.style.textAlign = 'center';
        document.body.prepend(offlineMessage);
    });

    // Event d'affichage en ligne (détection du statut en ligne)
    window.addEventListener('online', () => {
        // l'utilisateur est devenu en ligne
        let offlineMessage = document.querySelector('div');
        if (offlineMessage) {
            offlineMessage.remove();
        }
    });


    /* PARTIE METHODES */

    // Récupère le code d'accès (username) dans l'URL
    function getUsernameFromUrl(url) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get('ak') || '';
    }

    // Affiche les annonces publiées par l'admin
    // Balise html "display-news" remplie au fur et à mesure
    function displayNews(item) {
        newsContainer.innerHTML = '';

        item.forEach(news => {
            news.read_by = news.read_by || [];

            let newsDiv = document.createElement('div');
            newsDiv.className = 'card-body box';

            let content =
                '<h5 class="card-title">' + news.title + '</h5>' +
                '<p class="card-text">' + news.content + '</p>';

            if (news.link != null && news.link !== '') {
                content += '<a href="' + news.link + '"> ' + news.link + ' </a><br>';
            }

            if (news.pdf != null && news.pdf !== '') {
                content += '<a href="' + news.pdf + '">Télécharger le document</a>';
            }

            if (!news.date_publication) {
                content += '<p class="card-text text-muted mt-4">' + formatDate(new Date()) + '</p>';
            } else {
                content += '<p class="card-text text-muted mt-4">' + formatDate(news.date_publication) + '</p>';
            }

            if (news.image != null && news.image !== '') {
                content = '<img class="card-img-top" src="' + news.image + '">' + content;
            }

            content += '<button type="button" class="btn btn-secondary" data-id="' + news.id + '">J\'ai lu l\'annonce</button>';

            newsDiv.innerHTML = content;
            newsContainer.appendChild(newsDiv);

            // event de click sur le bouton "j'ai lu l'annonce"
            const readButton = document.querySelector(`[data-id="${news.id}"]`);
            if (!localStorage.getItem(`news-${news.id}-${username}`)) {
                readButton.addEventListener('click', function () {
                    const newsId = this.getAttribute('data-id');
                    markAsRead(newsId);
                    this.disabled = true;
                    this.innerHTML = 'Annonce lue';
                    readButton.style.color = '#c4c4c4';
                    readButton.style.backgroundColor = '#fff';
                    readButton.style.border = 'none';
                    localStorage.setItem(`news-${news.id}-${username}`, 'true');
                });
            } else {
                readButton.disabled = true;
                readButton.style.color = '#c4c4c4';
                readButton.style.backgroundColor = '#fff';
                readButton.style.border = 'none';
                readButton.innerHTML = 'Annonce lue';

            }
        });
    }

    // marque l'annonce comme "lue" par cet utilisateur
    async function markAsRead(newsId) {
        const data = new FormData();
        data.append('news_id', newsId);
        const username = getUsernameFromUrl(window.location.href);
        data.append('username', username);
        await axios.post('mark_as_read.api.php', data)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.log(error.response.data);
            });
    }

    // Formatage des dates (publié le ... à ...)
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Date(date).toLocaleDateString('fr-FR', options);
        const formattedTime = new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return 'Publié le ' + formattedDate + ' à ' + formattedTime;
    }


    /*
      PARTIE NOTIFICATIONS
     */

    // Fonction permettant de détecter le navigateur courant
    function getBrowser() {
        const userAgent = navigator.userAgent;

        if (userAgent.indexOf("Firefox") > -1) {
            return "Firefox";
        } else if (userAgent.indexOf("Chrome") > -1) {
            return "Chrome";
        } else if (userAgent.indexOf("Safari") > -1) {
            return "Safari";
        } else if (userAgent.indexOf("Edge") > -1) {
            return "Edge";
        } else {
            return "Unknown";
        }
    }

    // Etape nécessaire pour envoyer de snotifs via les services worker : l'utilisateur doit autoriser les notifs sur son navigateur
    async function askPermission(){
        const permission = await Notification.requestPermission(
            function(status) {
                console.log('Statut de la permission de notifications: ', status);
            }
        );
        // Si l'utilisateur donne sa permission, on enregistre le service worker
        if (permission === "granted") {
            await registerServiceWorker();
        }
        if (permission === "denied") {
            return null;
        }
        if(permission === "default") {
        }
    }

    // Enregistrement du service worker
    async function registerServiceWorker () {
        const registration = await navigator.serviceWorker.register('sw.js')
        // récupération des abonnements aux notificiations
        let subscription = await registration.pushManager.getSubscription();

        // Si l'utilisateur n'est pas encore abonné, création d'un nouvel abonnement (subscribe)
        if(!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                // signature pour s'authentifier au niveau du serveur push
                applicationServerKey: serverKey,
            })
        }
        await saveSubscription(subscription);
    }

    // Sauvegarde un abonnement en base de données
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


    /* Fenêtre modale qui redirige vers la fenêtre askPermission du navigateur */

    // Ouvre la fenêtre modale de askPermission
    function showModal(modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    // Ferme la fenêtre modale de askPermission
    function hideModal(modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!localStorage.getItem('notificationAlertShown') && permission !== 'granted' && permission !== 'denied') {
            // Event de scroll pour détecter quand l'utilisateur commence à faire défiler la page
            window.addEventListener('scroll', function () {
                // Vérifie si l'utilisateur a fait défiler suffisamment pour afficher la fenêtre modale
                if (window.scrollY > 100) {
                    // Vérifie si la fenêtre modale a déjà été affichée ou si l'utilisateur a déjà donné la permission
                    if (!localStorage.getItem('notificationAlertShown') && permission !== 'granted' && permission !== 'denied') {
                        // Création de la fenêtre modale
                        const firstModal = document.createElement('div');
                        firstModal.className = 'modal fade';
                        firstModal.setAttribute('id', 'notificationModal');
                        firstModal.setAttribute('tabindex', '-1');
                        firstModal.setAttribute('role', 'dialog');
                        firstModal.setAttribute('aria-labelledby', 'notificationModalTitle');
                        firstModal.setAttribute('aria-hidden', 'true');
                        firstModal.innerHTML =
                            `
                            <div class="modal-dialog modal-dialog-centered" role="document" style="margin-top: -5%;">
                                <div class="modal-content" style="background-color: rgba(222, 97, 59, 0.9); color: #fff">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="notificationModalTitle">Restez au courant !</h5>
                                    </div>
                                    <div class="modal-body">
                                        <p>Si vous souhaitez recevoir une notification dès que Nestor publie une nouvelle annonce, autorisez la réception des notifications.</p>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-primary" style="background-color: white; color: #de613b; border: none" id="manage-notif">Gérer mes notifications</button>
                                    </div>
                                </div>
                            </div>
                            `;

                        document.body.appendChild(firstModal);

                        // Ouverture de la fenêtre
                        showModal(firstModal);

                        // Event de click sur le bouton "Gérer mes notifications" de la fenêtre modale
                        const manageNotifBtn = document.getElementById('manage-notif');
                        manageNotifBtn.addEventListener('click', async function () {
                            await askPermission();
                            // Stocke l'info indiquant que l'utilisateur a interagi avec la fenêtre modale
                            localStorage.setItem('managedNotifications', true);
                            // Fermeture de la fenêtre
                            await hideModal(firstModal);
                            updateButtonText();
                        });

                        // Stocke l'info indiquant que la fenêtre modale a été affichée
                        localStorage.setItem('notificationAlertShown', true);
                    }
                }
            });

            // Event pour écouter les changements dans le localStorage
            window.addEventListener('storage', function (event) {
                if (event.key === 'notificationPermission' && event.newValue !== 'granted') {
                    localStorage.removeItem('managedNotifications');
                    localStorage.removeItem('notificationAlertShown');
                }
            });
        }
    });

    /* bouton flottant en bas à droite de l'écran qui ouvre un widget permettant à l'utilisateur de modifier sa gestion de notifications à tout moment */
    // Event click sur le bouton flottant qui affiche le widget de gestion des notifications
    notificationWidget.addEventListener('click', () => {
        const iconElement = notificationWidget.querySelector('i');

        if (notificationManager.style.display === 'none') {
            notificationManager.style.display = 'block';
            iconElement.classList.remove('icofont-notification');
            iconElement.classList.add('icofont-close-line');
        } else {
            closeWidget();
            iconElement.classList.remove('icofont-close-line');
            iconElement.classList.add('icofont-notification');
        }
    });

    // Ferme le widget
    function closeWidget() {
        notificationManager.style.display = 'none';
    }

    // Mettez à jour le texte du bouton en fonction de l'état de la permission
    function updateButtonText() {
        const permission = Notification.permission;
        if (permission === 'granted') {
            toggleNotifications.textContent = 'Bloquer les notifications';
            statutNotifications.innerText = 'autorisé';
        } else {
            toggleNotifications.textContent = 'Autoriser les notifications';
            statutNotifications.innerText = 'bloqué';
        }
    }


    // Ouverture de la fenêtre modale de modification de la permission pour les notifs
    function openPermissionModal(permission) {

        const browser = getBrowser();
        let instructions;

        switch (browser) {
            case "Firefox":
                instructions = `Cliquez sur l'icône <i class="icofont-settings"></i> à gauche de la barre de navigation pour supprimer la permission. ${permission === "granted" ? "" : "<br>Rafraichissez la page et appuyez de nouveau sur la petite clochette pour autoriser les notifications."}`;
                break;
            case "Chrome":
                instructions = `Cliquez sur l'icone <i class="icofont-unlock"></i> à gauche de la barre de navigation et ${permission === "granted" ? "bloquez" : "autorisez"} les notifications`;
                break;
            case "Safari":
                instructions = `Rendez-vous dans les paramètres de Safari v> l/'onglet sites web > l'onglet Notifications > Sélectionnez Nestor dans la liste à droite et ${permission === "granted" ? "bloquez" : "autorisez"} les notifications`;
                break;
            case "Edge":
                instructions = `Cliquez sur l'icone <i class="icofont-unlock"></i> à gauche de la barre de navigation et ${permission === "granted" ? "bloquez" : "autorisez"} les notifications`;
                break;
            default:
                instructions = `default`;
        }

        const modal = document.createElement("div");
        modal.className = "modal fade";
        modal.setAttribute("id", "notificationModal");
        modal.setAttribute("tabindex", "-1");
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-labelledby", "notificationModalTitle");
        modal.setAttribute("aria-hidden", "true");
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered" role="document" style="margin-top: -5%;">
              <div class="modal-content" style="background-color: rgba(222, 97, 59, 0.9); color: #fff">
                <div class="modal-header">
                  <h5 class="modal-title" id="notificationModalTitle">Notifications ${permission === "granted" ? "autorisées" : "bloquées"}</h5>
                  <button type="button" class="btn text-end" style="color: #fff; font-size: 1.3rem" id="btnClose">X</button>
                </div>
                <div class="modal-body">
                    <p style="font-size: 1.1rem; text-align: center">${instructions}</p>
                 </div>
              </div>
            </div>
          `;

        document.body.appendChild(modal);
        showModal(modal);

        // Event de click sur le bouton 'fermer' du modal
        const btnClose = document.getElementById('btnClose');
        btnClose.addEventListener('click',  (e) => {
            hideModal(modal);
        });
    }


    // Quand l'utilisateur clique sur le bouton, ça ferme le widget
    toggleNotifications.addEventListener('click', closeWidget);

    // Event au click du bouton "autoriser" ou "bloquer" les notifications
    toggleNotifications.addEventListener('click', async () => {
        let permission = Notification.permission;

        if (permission === 'granted') {
            openPermissionModal(permission);

        } else if (permission === 'default') {
            permission = await Notification.requestPermission();
            updateButtonText();
            if (permission === 'granted') {
                // Vérifie si l'utilisateur est abonné aux notifications et l'abonne si ce n'est pas le cas.
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (!subscription) {
                    const newSubscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: serverKey,
                    });
                    // Enregistrement de l'abonnement en base de données
                    await saveSubscription(newSubscription);
                }
            }
        } else if (permission === 'denied') {
            openPermissionModal(permission);
        }
    });

    return {
        init: initialize
    };
})();

