class t_subscription_service {

  subscriptions;

  constructor() {
    this.subscriptions = [];
  }

  createSubscription(event_id) {
    this.subscriptions[event_id] = []; 
  }

  addSubscriber(event_id, subscriber_id, callback) {

    if (typeof this.subscriptions[event_id] == 'undefined')
      return;
    else if (typeof callback == 'undefined') {

      if (typeof this.subscriptions[event_id][subscriber_id] == 'undefined')
        return;

      delete this.subscriptions[event_id][subscriber_id];
      return
    }
    else if (typeof this.subscriptions[event_id][subscriber_id] == 'undefined')
      this.subscriptions[event_id][subscriber_id] = [];
    
    this.subscriptions[event_id][subscriber_id].push(callback);
  }

  removeSubscriber(event_id, subscriber_id) {
    this.addSubscriber(event_id, subscriber_id);
  }

  getSubscriber(event_id, subscriber_id) {

    if (typeof this.subscriptions[event_id] == 'undefined')
      return null;
    
    else if (typeof this.subscriptions[event_id][subscriber_id] == 'undefined')
      return null;

    return this.subscriptions[event_id][subscriber_id];
  }

  processSubscription(event_id, payload) {

    if (typeof this.subscriptions[event_id] == 'undefined')
      return;

    Object.values(this.subscriptions[event_id])
      .forEach((subscriber) => {

        Object.values(subscriber)
          .forEach((callback) => {

            callback(payload);
          });
      });
  }
}

export default function createSubscriptionService() {
  return new t_subscription_service;
}
