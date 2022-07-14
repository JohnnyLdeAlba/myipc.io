import IPCLib from './IPCLib';
import IPCEng from './IPCEng';

import createSubscription from './SubscriptionService';

import config from '../config';
import context from '../context';

function ipc_get_randomized_token_id()
{
    let random_id = Math.random() * 12000;

    random_id+= Date.now();
    random_id = parseInt(random_id);
    random_id%= 2828;

    return random_id;;
}

function validate_token_id(token_id)
{
  token_id = token_id.toString();

  if (token_id.match(/^\d+$/) == null)
    return { code: "TOKEN_ID_NOT_A_NUMBER" };

  token_id = parseInt(token_id);
  if (token_id <= 0) {
    return { code: "TOKEN_ID_LESS_THAN_ZERO" };
  }

  return null;
}

async function fetch_from_backup_database(token_id ) {

  if (token_id == 0 || typeof token_id == "undefined")
    token_id = ipc_get_randomized_token_id();

  let response = validate_token_id(token_id);
  if (response != null)
    return response;

  const database = await fetch(config.PUBLIC_ROOT + "backup.json")
    .then(response => response.json())
    .catch(error => null);

  if (database == null)
    return { code: "CANNOT_CONNECT_TO_BACKUP_DATABASE" }
        
  token_id--;
  if (token_id >= database.length)
    return { code: "IPC_NOT_FOUND" };

  return {
    code: "SUCCESS",
    payload: database[token_id] 
  };
}

async function fetch_from_database(token_id) {

  if (token_id == 0 || typeof token_id == "undefined")
    token_id = ipc_get_randomized_token_id();

  let response = validate_token_id(token_id);
  if (response != null)
    return response;

  response = await fetch(config.BACKEND_ROOT + "ipc_id/" + token_id)
    .then(response => response.json())
    .catch(error => null);

  if (response == null || response.code == "CANNOT_CONNECT_TO_DATABASE")
    return { code: "CANNOT_CONNECT_TO_DATABASE" };
  else
    return response;

  const ipc = IPCLib.ipc_create_ipc_from_json(response.payload);

  return {
    code: "SUCCESS",
    payload: ipc
  };
}

export default async function fetchIPC(token_id, subscription) {

  if (typeof subscription == 'undefined')
    subscription = createSubscription();

  let response = await fetch_from_database(token_id);
  if (response == null || response.code == "CANNOT_CONNECT_TO_DATABASE") {

    subscription.processSubscription('switchToBackupDatabase');
    subscription.processSubscription('beginDownload');

    response = await fetch_from_backup_database(token_id);
    subscription.processSubscription('endDownload');
  }

  if (response.code != "SUCCESS")
    return response;

  const ipc = response.payload;
  const label_ipc = IPCLib.ipc_create_label_ipc(ipc, IPCEng)

  return {

    code: "SUCCESS",
    payload: {
      ipc: ipc,
      label_ipc: label_ipc
    }
  };
}
