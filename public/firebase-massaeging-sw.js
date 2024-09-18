importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-messaging.js');

firebase.initializeApp({
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});