function showNotification(title, body) {
  if (window.Notification && Notification.permission !== "denied") {
    Notification.requestPermission((status) => {
      // status is "granted", if accepted by user
      let n = new Notification(title, {
        body: body,
        icon: "./logo.png", // optional
      });
      setTimeout(n.close(), 4 * 1000);
    });
  }
}
