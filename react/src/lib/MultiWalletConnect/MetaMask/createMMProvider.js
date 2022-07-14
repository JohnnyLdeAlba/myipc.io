import detectEthereumProvider from '@metamask/detect-provider';

function factoryConnect(mm_provider) {

  const onChainRequest = factoryChainRequest(mm_provider);

  return (web3WalletPermissions) => {

    if (web3WalletPermissions[0]
      ?.caveats[0]
      ?.value[0]) {

      mm_provider.account = web3WalletPermissions[0]
        .caveats[0]
        .value[0];
    }

    mm_provider.provider.request({ method: 'eth_chainId' })
      .then(onChainRequest);
  };
}

function factoryChainRequest(mm_provider) {

  return (chainId) => {

    if (chainId != mm_provider.defaultChainId) {

      mm_provider.disconnect();
      return;
    }

    mm_provider.connected = true;
    mm_provider.chainId = chainId;

    mm_provider.subscriptions
      .processSubscription("connect",
        mm_provider.getAccountDetails());
  }
}

function factoryChainChanged(mm_provider) {

  return (chainId) => {

    if (chainId != mm_provider.defaultChainId) {

      mm_provider.disconnect();
      return;
    }

    mm_provider.connected = true;
    mm_provider.chainId = chainId;

    mm_provider.subscriptions
      .processSubscription("sessionUpdate",
        mm_provider.getAccountDetails());
  }
}

function factoryAccountsChanged(mm_provider) {

  return (accounts) => {

    if (accounts.length == 0) {
    
      mm_provider.disconnect();
      return;
    }

    mm_provider.account = accounts[0];

    mm_provider.subscriptions
      .processSubscription("sessionUpdate",
        mm_provider.getAccountDetails());
  };
}

function factoryError(mm_provider) {

  return (error) => {

    switch(error.code) {

      case 4001: {

        mm_provider.response = {
          code: "PROVIDER_PERMISSION_DENIED",
          payload: null
        }

        break;
      }

      default: {

        mm_provider.response = {
          code: "PROVIDER_ERROR",
          payload: error.code
        }

        break;
      }
    }
  };
}

class t_metamask {

  provider;
  providerName;
  chainId;
  defaultChainId;
  account;
  connected;
  response;

  subscriptions;

  constructor() {

    this.provider = null;
    this.providerEnabled = false;
    this.providerName = "MetaMask";
    this.chainId = null;
    this.defaultChainId = "0x1";
    this.account = null;
    this.connected = false;
    this.response = null;
  }

  setDefaultChainId(chainId) {
    this.defaultChainId = chainId;
  }

  async initialize() {

    this.disconnect();
    this.provider = await detectEthereumProvider();

    if (this.provider == null)
      return;

    const onDisconnect = () => {
      this.disconnect();
    }

    const onChainChanged = factoryChainChanged(this);
    const onAccountsChanged = factoryAccountsChanged(this);

    this.provider.on('disconnect', onDisconnect);
    this.provider.on('chainChanged', onChainChanged);
    this.provider.on('accountsChanged', onAccountsChanged);

    this.providerEnabled = true;
  }

  isProvider() { return this.providerEnabled; }

  async mobileConnect(session) {

    await this.initialize();
    if (this.provider == null)
      return;

    const onError = factoryError(this);

    const chainId = await this.provider
      .request({ method: 'eth_chainId' })
      .catch(onError);

    const accounts = await this.provider
      .request({ method: 'eth_requestAccounts' })
      .catch(onError);

    if (chainId != this.defaultChainId || accounts == null) {

      this.disconnect();
      return;
    }

    if (typeof session != 'undefined') {

      if (session.chainId != chainId || session.account != accounts[0]) {

        this.disconnect();
        return;
      }
    }

    this.connected = true;
    this.chainId = chainId;
    this.account = accounts[0];

    this.subscriptions
      .processSubscription("connect",
        this.getAccountDetails());
  }

  async autoConnect(session) {
    await this.mobileConnect(session);
  }

  async connect() {

    await this.initialize();
    if (this.provider == null)
      return;

    const onConnect = factoryConnect(this);
    const onError = factoryError(this);

    this.provider
      .request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      })
      .then(onConnect)
      .catch(onError);
  }

  disconnect() {

    this.connected = false;
    this.chainId = null;
    this.account = null;
    this.provider = null;

    this.subscriptions
      .processSubscription("disconnect",
        this.getAccountDetails());
  }

  isConnected() {

    if (this.provider == null)
      return false;

    return this.connected;
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

export default function createMMProvider() {
  return new t_metamask;
}
