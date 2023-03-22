
let News = (function () {

    const newsContainer = document.getElementById('news-container');
    const username = getUsernameFromUrl(window.location.href);
    let loadMorebtn = document.getElementById('load-more');
    let reload = document.getElementById('reload');
    const form = document.querySelector('#add-news-form');


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
        axios.get('news.api.php')
            .then(response => {
                let news = response.data;

                displayNews(news);
                localStorage.setItem('news', JSON.stringify(news));

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


        // popup de permission pour les notifications
        let permission = document.getElementById('push-permission')
        if (
            (!permission)
            // || (Notification.permission !== 'default')
        ) return;

        const button = document.createElement('button');
        button.innerText = 'Recevoir notifications';
        button.style.color = '#de613b';
        button.style.border = '2px solid #de613b';
        button.style.margin = '1rem';
        button.style.padding = '.5rem';
        permission.appendChild(button);
        button.addEventListener('click', askPermission);

    }


    /* EVENTS */

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


    // reload.addEventListener('click', sendNotification);

    // bouton refresh
    reload.addEventListener('click', () => {
         window.location.reload();
    })



    // Event hors ligne (pas besoin d'actualiser la page)
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

    // Event en ligne (pas besoin d'actualiser la page)
    window.addEventListener('online', () => {
        // l'utilisateur est devenu en ligne
        const offlineMessage = document.querySelector('div');
        if (offlineMessage) {
            offlineMessage.remove();
        }
    });


    /* METHODS */

    // récupère le code d'accès dans l'URL
    function getUsernameFromUrl(url) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get('ak') || '';
    }

    // affiche les news sur la page news.view
    function displayNews(news) {
        newsContainer.innerHTML = '';

        news.forEach(article => {
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

            content += '<p class="card-text text-muted">' + article.date_publication + '</p>';

            if (article.image != null && article.image !== '') {
                content = '<img class="card-img-top" src="' + article.image + '">' + content;
            }

            content += '<button type="button" class="btn btn-secondary read-button" data-id="' + article.id + '">Lu</button>';

            newsDiv.innerHTML = content;
            newsContainer.appendChild(newsDiv);


            // event click sur le bouton lu
            const readButton = document.querySelector(`[data-id="${article.id}"]`);
            if (!localStorage.getItem(`news-${article.id}-${username}`)) {
                readButton.addEventListener('click', function () {
                    const newsId = this.getAttribute('data-id');
                    markAsRead(newsId);
                    this.disabled = true;
                    this.innerHTML = 'Annonce lue';
                    localStorage.setItem(`news-${article.id}-${username}`, 'true');
                });
            } else {
                readButton.disabled = true;
                readButton.innerHTML = 'Annonce lue';
            }
        });
    }


    // Marque l'annonce comme lue
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
        NOTIFICATIONS
     */

    // Demande à l'utilisateur s'il accepte de recevoir des notifications (nécessaire)
    async function askPermission(){
        const permission = await Notification.requestPermission(
            function(status) {
                console.log('Statut de la permission de notifications: ', status);
            }
        );
        if (permission === 'granted') {
            await registerServiceWorker();
        }
        if (permission === "denied") {
            console.warn("L'utilisateur n'a pas autorisé les notifications");
            return null;
        }
    }

    // S'il accepte, abonnement de l'utilisateur aux notifications pour un tel navigateur. S'il change de navigateur, nouvel abonnement
    async function registerServiceWorker () {
        const serverKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        const registration = await navigator.serviceWorker.register('sw.js')
        let subscription = await registration.pushManager.getSubscription();

        // S'il n'y a pas d'abonnement pour cet utilisateur, on en crée un
        if(!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: serverKey,
            })
        }
        // Sauvegarde du dernier abonnement en base de données. On sauvegarde les subscriptions pour pouvoir envoyer une notif à tous les abonnements
        await saveSubscription(subscription);
    }

    // Fonction permettant de sauvegarder les abo en BD
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

