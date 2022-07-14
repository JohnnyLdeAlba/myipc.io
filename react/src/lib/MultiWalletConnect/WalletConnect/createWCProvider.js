import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

function factoryConnect(wc_provider) {

  return (error, payload) => {

    if (error) {

      wc_provider.responce = {
        code: "PROVIDER_CONNECT_FAILED",
        payload: null
      };

      return;
    }

    const { accounts, chainId } = payload.params[0];

    if (chainId != wc_provider.defaultChainId) {

      wc_provider.disconnect();
      return;
    }

    wc_provider.chainId = chainId;
    wc_provider.account = accounts[0];

    wc_provider.subscriptions
      .processSubscription("connect",
        wc_provider.getAccountDetails());

    wc_provider.responce = {

      code: 0,
      payload: {
        accounts: accounts,
        payload: payload
      }

    };
  };
}

function factorySessionUpdate(wc_provider) {

  return (error, payload) => {
      
    if (error) {

      wc_provider.responce = {
        code: "PROVIDER_SESSION_UPDATE_FAILED",
        payload: null
      };

      return;
    }

    const { accounts, chainId } = payload.params[0];

    wc_provider.chainId = chainId;
    wc_provider.account = accounts[0];

    wc_provider.subscriptions
      .processSubscription("sessionUpdate",
        wc_provider.getAccountDetails());

    wc_provider.responce = {

      code: 0,
      payload: {
        accounts: accounts,
        payload: payload
      }
    };
  };
}

function factoryDisconnect(wc_provider) {

  return (error, payload) => {

    if (error) {

     wc_provider.responce = {
        code: "PROVIDER_DISCONNECT_FAILED",
        payload: null
      };

      return;
    }

    wc_provider.subscriptions
      .processSubscription("disconnect",
        wc_provider.getAccountDetails());

    wc_provider.responce = {
      code: 0,
      payload: null
    };
  };
}

class t_wallet_connect {

  providerName;
  chainId;
  defaultChainId;
  account;
  provider;  
  responce;

  subscriptions;

  constructor() {

    this.provider = null;
    this.providerName = "WalletConnect";
    this.chainId = null;
    this.defaultChainId = 1;
    this.account = null;
    this.responce = null;
  }

  setDefaultChainId(chainId) {
    this.defaultChainId = chainId;
  }

  initialize() {

    this.provider = new WalletConnect({
      bridge: "https://bridge.walletconnect.org",
      qrcodeModal: QRCodeModal
    });

    const onConnect = factoryConnect(this);
    const onSessionUpdate = factorySessionUpdate(this);
    const onDisconnect = factoryDisconnect(this);

    this.provider.on("connect", onConnect);
    this.provider.on("session_update", onSessionUpdate);
    this.provider.on("disconnect", onDisconnect);
  }

  autoConnect(session) {

    if (this.provider == null)
      this.initialize();

    if (!this.isConnected())
      return;

    if (typeof session != 'undefined') {

      if (session.chainId != this.defaultChainId) {

        this.disconnect();
        return;
      }
    }

    const wc_provider = this;

    this.subscriptions.addSubscriber(
      "sessionUpdate", "wcAutoConnect", () => {

      wc_provider.subscriptions.removeSubscriber(
        "sessionUpdate", "wcAutoConnect");

      if (session.account != wc_provider.account) {

        this.disconnect();
        return;
      }
    });

    this.provider.updateSession({
      chainId: session.chainId,
      accounts: [ session.account ]
    });
  }

  connect() {

    if (this.provider == null)
      this.initialize();

    if (this.provider.connected)
      this.disconnect();

    let intervalId = setInterval(() => { 

      if (this.provider == null ||
          this.provider?.connected == false) {

        this.provider = null;
        this.initialize();
        this.provider.createSession();

        clearInterval(intervalId);
      }

    }, 5);
  }

  disconnect() {

    if (this.provider?.connected)
      this.provider.killSession();

    this.chainId = null;
    this.account = null;
    this.provider = null;
  }

  isConnected() {

    if (this.provider)
      return this.provider.connected ? true : false;

    return false;
  }

  getAccountDetails(f) {

    if (typeof f == 'undefined') {

      return {

        providerName: this.providerName,
        chainId: this.chainId,
        account: this.account
      }
    }

    return f(
      this.providerName,
      this.chainId,
      this.account
    );
  }
}

export default function createWCProvider() {
  return new t_wallet_connect;
}
