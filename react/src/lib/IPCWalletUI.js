import IPCLib from './IPCLib.js';
import IPCInstance from './IPCInstance';

import config from '../config';

function backup_get_wallet_ipc_group(database, wallet_ipc_list, page_index) {

  let wallet_ipc_group = new Array();

  let index = 0;
  let offset = page_index * config.IPC_LIST_LIMIT;

  for (index = 0; index < config.IPC_LIST_LIMIT; index++) {

    if (offset + index < wallet_ipc_list.length)
      wallet_ipc_group[index] = wallet_ipc_list[offset + index];
  }

  return wallet_ipc_group;
}

function backup_get_wallet_ipc_list(database, wallet_address, page_index) {
  
  let responce = new IPCInstance.t_responce();
  let wallet_ipc_list = new Array();

  let index = 0, x = 0;
  for (index = 0; index < database.length; index++) {

    if (database[index].owner == wallet_address)
      wallet_ipc_list[x++] = database[index];
  }

  if (wallet_ipc_list.length == 0) {

    responce.code = "WALLET_EMPTY";
    responce.alert.title = "Wallet Empty";
    responce.alert.content = "Wallet has no IPCs.";

    return responce;
  }

  let wallet_ipc_group = backup_get_wallet_ipc_group(
    database, wallet_ipc_list, page_index);

  responce.payload = {
    wallet_ipc_list: wallet_ipc_group,
    wallet_ipc_total: wallet_ipc_list.length
  }

  return responce;
}

async function fetch_from_backup_database(wallet_address, page_index)
{
  let responce = new IPCInstance.t_responce();

  let database = await fetch(config.public_url + "backup.json")
    .then(res => res.json())
    .catch(err => null);

  if (database == null) {

    responce.code = "BACKUP_DATABASE_FAILURE";
    responce.alert.title = "Fatal Error";
    responce.alert.content = "Cannot connect to primary or backup databases.";

    return responce;
  }

  responce.alert.type = "defcon3";
  responce.alert.title = "Using Backup Database";
  responce.alert.content = "Warning: Using backup database, information may be outdated.";

  responce.payload = backup_get_wallet_ipc_list(
    database, wallet_address, page_index);

  return responce;
}

function _handle_errors(result, wallet_address, page_index) {

  let responce = new IPCInstance.t_responce();

  if (result == null || result.status_label == "IPCDB_CONNECT_ERROR") {

    responce = fetch_from_backup_database(wallet_address, page_index)
    if (responce.code != "")
      return responce;

    return responce;
  }
  else if (result.status_label != "IPCDB_SUCCESS") {

    if (result.status_label == "IPCDB_WALLET_EMPTY") {

      responce.code = "WALLET_EMPTY";
      responce.alert.type = "info";
      responce.alert.title = "Wallet Empty";
      responce.alert.content = "Wallet has no IPCs.";

      return responce;
    }
    else if (result.status_label == "IPCDB_WALLETADDR_BADFORMAT" ||
      result.status_label == "IPCDB_INVALID_WALLETADDR") {

      responce.code = "INVALID_WALLET_ADDRESS";
      responce.alert.title = "Invalid Wallet Address";
      responce.alert.content = "The wallet address entered is invalid.";

      return responce;
    }
  }
  else {

    responce.payload = {
      wallet_ipc_list: result.responce.ipc_list,
      wallet_ipc_total: result.responce.ipc_total
    }
  }

  return responce;
}

async function fetch_wallet_ipc_list(wallet_address, page_index) {

  let responce = new IPCInstance.t_responce();

  if (typeof page_index == "undefined")
    page_index = 0;

    // ERROR CHECK

  let url = config.backend_url +
    "wallet_address/"+ wallet_address + 
    "/group_index/" + page_index + 
    "/group_limit/" + config.IPC_LIST_LIMIT;

  let result = await fetch(url)
    .then(res => res.json())
    .catch(err => null);

  responce = _handle_errors(
    result, wallet_address, page_index);
  return responce;
}

async function ui_fetch_wallet_ipc_list(instance, wallet_address, page_index) {

  const controller = instance.getController('Wallet');
  if (typeof controller == 'undefined') return;

  if (typeof page_index == 'undefined')
    page_index = 0;

  if (controller.page == (page_index + 1) &&
    instance.wallet_address == wallet_address) {

    controller.setPage(page_index + 1);
    controller.show(true);
    return;
  }

  let responce = new IPCInstance.t_responce();

  instance.showBackdrop(true);
  responce = await fetch_wallet_ipc_list(wallet_address, page_index);
  instance.showBackdrop(false);

  if (responce.code != "") {
    instance.showAlert(
      responce.alert.title,
      responce.alert.content,
      responce.alert.type);

    return;
  }

  if (responce.alert.type == "defcon3")
    instance.showDefcon(responce.alert.content);

  instance.wallet_address = wallet_address;
  instance.wallet_ipc_total = responce.payload.wallet_ipc_total;
  instance.wallet_ipc_list = responce.payload.wallet_ipc_list;

  controller.setPage(page_index + 1);
  controller.show(true);
}

const IPCWalletUI = {
  fetch_wallet_ipc_list: fetch_wallet_ipc_list,
  ui_fetch_wallet_ipc_list: ui_fetch_wallet_ipc_list
};

export default IPCWalletUI;
