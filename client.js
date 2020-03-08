'use strict';

/**
 * Sends messages.
 */
function PublishForm(form, url) {

  function sendMessage(message) {
    fetch(url, {
      method: 'POST',
      body: message
    });
  }

  form.onsubmit = function() {
    const message = form.message.value;

    if (message) {
      form.message.value = '';
      sendMessage(message);
    }

    return false;
  };
}

/**
 * Accepts messages via long polling.
 */
function SubscribePane(elem, url) {

  function showMessage(message) {
    const messageElem = document.createElement('div');
    messageElem.append(message);
    elem.append(messageElem);
  }

  async function subscribe() {
    const response = await fetch(url);

    if (response.status === 502) {
      // Connection timeout.
      // May happen if connection has waited for too long.
      await subscribe();
    } else if (response.status !== 200) {
      // Show the message and reconnect after a second.
      showMessage(response.statusText);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await subscribe();
    } else {
      // Accept the message.
      const message = await response.text();
      showMessage(message);
      await subscribe();
    }
  }

  subscribe();
}
