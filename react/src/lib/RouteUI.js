import IPCInstance from './IPCInstance';

import IPCUI from './IPCUI';
import WalletUI from './IPCWalletUI';

import config from '../config';

async function ui_get_default_route(instance, path) {

  if (path != null) {

    if (path.match(/([A-FXa-fx0-9]{1,64})$/) != null) {

      if (path.match(/^0x/) != null) {
        await WalletUI.ui_fetch_wallet_ipc_list(instance, path);
        return;
      }
      else {
        await IPCUI.ui_fetch_ipc(instance, path);
        return;
      }
    }
  }

  await IPCUI.ui_fetch_ipc(instance);
}

const RouteUI = {
  ui_get_default_route: ui_get_default_route
};

export default RouteUI;
