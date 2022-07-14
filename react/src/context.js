import createMWCProvider from "./lib/MultiWalletConnect/createMWCProvider";
import createSubscriptionService from "./lib/SubscriptionService";
import createTerminal from "./lib/Terminal";

import { getController } from "./controller";

function onConnectWallet(accountDetails) {

  sessionStorage.setItem("providerName", accountDetails.providerName);
  sessionStorage.setItem("chainId", accountDetails.chainId);
  sessionStorage.setItem("account", accountDetails.account);
}

function onDisconnectWallet() {

  sessionStorage.removeItem("providerName");
  sessionStorage.removeItem("chainId");
  sessionStorage.removeItem("account");
}

class t_context {

  terminal;
  mwc_provider;
  subscriptions;
  session;

  constructor() {

    this.terminal = null;
    this.mwc_provider = null;
    this.session = null;
    this.subscriptions = null;
  }

  initialize() {

    this.subscriptions = createSubscriptionService();

    this.mwc_provider = createMWCProvider();
    this.mwc_provider.subscriptions = this.subscriptions;
    this.mwc_provider.initialize();

    this.subscriptions.createSubscription("connect");
    this.subscriptions.createSubscription("disconnect");
    this.subscriptions.createSubscription("sessionUpdate");
    this.subscriptions.createSubscription("openMWCDialog");
    this.subscriptions.createSubscription("openAccountDialog");

    this.subscriptions.addSubscriber("connect", "context", onConnectWallet);
    this.subscriptions.addSubscriber("disconnect", "context", onDisconnectWallet);

    this.autoConnect();
  }

  getTerminal() {

    if (this.terminal == null)
      this.terminal = createTerminal();
  
    return this.terminal;
  }

  addSubscriber(event_id, subscriber_id, callback) {
    this.subscriptions.addSubscriber(event_id, subscriber_id, callback);
  }

  removeSubscriber(event_id, subscriber_id) {
    this.subscriptions.addSubscriber(event_id, subscriber_id);
  }

  processSubscription(event_id) {
    this.subscriptions.processSubscription(event_id);
  }

  getWalletProvider() {
    return this.mwc_provider;
  } 

  getSession() {

    this.session = {

      providerName: sessionStorage.getItem("providerName"),
      chainId: sessionStorage.getItem("chainId"),
      account: sessionStorage.getItem("account")
    };
  }

  autoConnect() {

    this.getSession();
    this.mwc_provider.autoConnect(this.session);
  } 
}

const context = new t_context;
context.initialize();

export default function getContext() {
  return context;
};
