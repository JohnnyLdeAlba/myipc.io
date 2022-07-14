import createMMProvider from "./MetaMask/createMMProvider";
import createWCProvider from "./WalletConnect/createWCProvider";
import createSubscriptionService from "../SubscriptionService"

class t_multi_wallet_connect {

  mm_provider;
  wc_provider;
  subscriptions;

  constructor() {

    this.mm_provider = null;
    this.wc_provider = null;
    this.subscriptions = null;
  }

  async initialize() {

    this.mm_provider = createMMProvider();
    this.wc_provider = createWCProvider();

    if (this.subscriptions == null)
      this.subscriptions = createSubscriptionService();
    
    this.subscriptions.createSubscription("connect");
    this.subscriptions.createSubscription("disconnect");
    this.subscriptions.createSubscription("sessionUpdate");

    this.mm_provider.subscriptions = this.subscriptions;
    this.wc_provider.subscriptions = this.subscriptions;

    await this.mm_provider.initialize();
    await this.wc_provider.initialize();
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

  setDefaultChainId(defaultChainId) {

    if (typeof defaultChainId == "undefined")
      defaultChainId = "0x1";

    this.defaultChainId = defaultChainId;
  }

  // Need providers to handle their own translations.
  getChainName(chainId) {

    switch (chainId) {

      // Meta Mask definitions.
      case "0x1": return "Ethereum";

      // WalletConnect definitions.
      case 1: return "Ethereum";
    }

    return "Unknown";
  }

  isMobile() {
    
    if (/Mobi/i.test(navigator.userAgent))
      return true;

    return false;
  }

  mobileConnect() {

    if (this.isMobile()) {

      if (this.mm_provider.mobileConnect())
        return true;
      else
        this.wc_provider.connect();
    }

    return true;
  }

  autoConnect(session) {

    switch (session.providerName) {

      case 'MetaMask': {

        this.mm_provider.autoConnect(session);
        break;
      }

      default: {

        this.wc_provider.autoConnect(session);
        break;
      }
    }

  }

  connect(id) {

    switch (id) {

      case 'METAMASK': {

        if (this.isMobile())
          this.mm_provider.mobileConnect();
        else
          this.mm_provider.connect();

        break;
      }

      default: {

        this.wc_provider.connect()
        break;
      }
    }
  }

  disconnect() {

    this.mm_provider.disconnect();
    this.wc_provider.disconnect();

    this.chainId = null;
    this.account = null;
  }

  isConnected() {

    if (this.mm_provider.isConnected())
      return true
    else if (this.wc_provider.isConnected())
      return true;

    return false;
  }

  getAccountDetails() {

    const f = (providerName, chainId, account) => {

      const chainName = this.getChainName(chainId);

      return {

        providerName: providerName,
        chainId: chainId,
        chainName: chainName,
        account: account
      }
    }

    if (this.mm_provider.isConnected())
      return this.mm_provider.getAccountDetails(f);

    else if (this.wc_provider.isConnected())
      return this.wc_provider.getAccountDetails(f);

    return false;
  }
}

export default function createMWProvider() {
  return new t_multi_wallet_connect();
}
