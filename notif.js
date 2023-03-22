let Notif = ( function(){

    const form = document.querySelector('#add-news-form');

    function initialize() {

    }
         /*
           NOTIFICATIONS
        */


    // Event de click sur le "submit" du form de l'ajout d'une annonce
    // Si la date de publication est supérieure, la notif sera envoyée à la date et heure précisée dans le champ "date_publication"
    form.addEventListener('submit', function(event) {

        const publishDate = new Date(document.getElementById('date-publication').value);
        console.log(publishDate);
        const currentDate = new Date();
        const timeToPublish = publishDate.getTime() - currentDate.getTime();
        console.log(currentDate.getTime());

        setTimeout(function() {
            sendNotification();
        }, timeToPublish);
    });





    // Fonction d'envoi de notification
    async function sendNotification() {

        navigator.serviceWorker.ready.then(function(registration) {
            let options = {
                icon: ('nestor.png'),
                body: 'Nestor a une nouvelle info pour toi.',
            };
            registration.showNotification('Nouvelle annonce!', options);
        });
    }



return {
    init: initialize
};
})();
