
let News = (function () {

    const newsContainer = document.getElementById('news-container');
    const username = getUsernameFromUrl(window.location.href);
    let loadMorebtn = document.getElementById('load-more');
    let reload = document.getElementById('reload');

    function initialize() {

        if (window.location.href.indexOf('ak') === -1) {
            return;
        }

        // Enregistrement du Service Worker qui s'occupe de l'interface offline
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw-offline.js', { scope: 'offline/' })
                .then(function(registration) {
                    console.log('Service Worker registration successful with scope: ', registration.scope);
                }).catch(function(error) {
                console.log('Service Worker registration failed: ', error);
            });
        } else {
            console.log('Service Worker are not supported.');
        }

        registerServiceWorker();

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

        const button = document.createElement('button')
        button.innerText = 'Recevoir notifications'
        permission.appendChild(button)
        button.addEventListener('click', askPermission)
    }


    /* EVENTS */

    // bouton lire plus d'annonces
    let currentItem = 10;
    loadMorebtn.addEventListener('click', () => {
        let boxes = [...document.querySelectorAll('.container #news-container .box')];
        for (let i = currentItem; i < currentItem + 10; i++ ) {
            boxes[i].style.display = 'block';
        }
        currentItem += 10;
    });

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


    async function askPermission(){
        const permission = await Notification.requestPermission();
        if(permission === 'granted') {
            await registerServiceWorker();
        }
    }


    async function registerServiceWorker () {
        // await = la variable attend d'abord le retour de la fonction qui suit
        const applicationServerKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        const registration = await navigator.serviceWorker.register('sw-notifications.js', { scope: 'notifications' })
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey,
            })
        } else {
            console.log(JSON.stringify(subscription));
        }
        await saveSubscription(subscription);
    }

    async function saveSubscription(subscription) {
            await fetch("notification.api.php", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: subscription.toJSON(),
        });
    }


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


    return {
        init: initialize
    };
})();


