let push = require("../2.0/vendor/minishlink/web-push");

let vapidKeys = {
    publicKey : 'BP1NYCsbIsYbEXSeK02wBt2-H1aPPlZJNDnJzkbHhKHZTn61uNz7mn94aMNnOVDDIwAxxoLy41lVkjyf3P-Dhtc\n',
    privateKey : 'nrlkIR2505EoDPSdIuaahusxZScIgsfSfxQnkAr6AmE',
}

push.setVapidDetails('mailto:test@code.co.uk', vapidKeys.publicKey, vapidKeys.privateKey);

let sub = {
    "endpoint":"https://fcm.googleapis.com/fcm/send/fIo1-6P4j3A:APA91bH4LOZ1l5gC6L0YtFMFFNZDBVtRbpkvTNjd-Xtw8VJM6L0SclFsyaiQDLGCB4JEkxkpf5Q4fUAMDwQVzVQVZ-uELNjYFsdxRqQM3qTVsBVuntAUZu215MJr495Mwtl77EieOvfe",
    "expirationTime":null,
    "keys": {
        "p256dh":"BCeuuRFU-ByROqCu74oWfDTug7dwmvvANaH2jUAuiZUQpjVr1QYcQN-rfms-U3OSHiCVasOooTojI25U0__HUYI",
        "auth":"_PISbLRDjToUDZL59-x4xA"
    }
}

push.sendNotification(sub, 'test notif')