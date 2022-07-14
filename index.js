const fs = require('fs').promises;

const express = require("express");
const server = express();
const web3 = require("web3");

const httpProxy = require('http-proxy');
const apiProxy = httpProxy.createProxyServer();

const reactServer = 'http://127.0.0.1:3000';

const psql = require("./lib/psql.js");
const IPCDBLib = require("./lib/ipcdb-lib.js");

const config = require("./react/src/config.js");

async function callTokenId(req, res) {

  let session = await IPCDBLib.ipcdb_connect();
  if (session == psql.PSQL_FAILED) {

    res.send(JSON.stringify({ 
      status_label: "IPCDB_CONNECT_ERROR" }));

    return;
  }

  let token_id = req.params.token_id;
  if (token_id.match(/^\d+$/) == null) {

    res.send(JSON.stringify({ 
      status_label: "IPCDB_BAD_TOKENID" }));

    session.client.end();
    return;
  }

  token_id = parseInt(token_id);
  if (token_id == 0) {

    res.send(JSON.stringify({ 
      status_label: "IPCDB_BAD_TOKENID" }));

    session.client.end();
    return;
  }

  let ipc = await IPCDBLib.ipcdb_select_ipc(session, token_id);
  if (ipc == null) {

    ipc = await IPCDBLib.ipcdb_web3_adddb_ipc(session, token_id);
    if (ipc == null) {

      res.send(JSON.stringify({ 
        status_label: "IPCDB_IPC_NOTFOUND" }));

        session.client.end();
        return;
      }
  }
  else await IPCDBLib.ipcdb_web3_updatedb_ipc(session, ipc);

  session.client.end();
  res.send(JSON.stringify({status_label: "IPCDB_SUCCESS", responce: ipc}));
};

async function callIPCId(req, res) {

  let session = await IPCDBLib.ipcdb_connect();
  if (session == psql.PSQL_FAILED) {

    res.send(JSON.stringify({ code: "CANNOT_CONNECT_TO_DATABASE" }));
    return;
  }

  let ipc_id = req.params.ipc_id;
  if (ipc_id.match(/^\d+$/) == null) {

    res.send(JSON.stringify({ code: "BAD_IPC_ID" }));
    session.client.end();
    return;
  }

  ipc_id = parseInt(ipc_id);
  if (ipc_id == 0) {

    res.send(JSON.stringify({ code: "BAD_IPC_ID" }));
    session.client.end();

    return;
  }

  let ipc = await IPCDBLib.ipcdb_select_ipc(session, ipc_id);
  if (ipc == null) {

    ipc = await IPCDBLib.ipcdb_web3_adddb_ipc(session, ipc_id);
    if (ipc == null) {

      res.send(JSON.stringify({ code: "IPC_NOT_FOUND" }));
      session.client.end();

      return;
    }
  }
  else await IPCDBLib.ipcdb_web3_updatedb_ipc(session, ipc);

  session.client.end();
  res.send(JSON.stringify({ code: "SUCCESS", payload: ipc }));
};

async function callWalletAddress (req, res) {

  let session = await IPCDBLib.ipcdb_connect();
  if (session == psql.PSQL_FAILED) {

    res.send(JSON.stringify({ 
      status_label: "IPCDB_CONNECT_ERROR" }));

    return;
  }

  let wallet_address = req.params.wallet_address;
  if (wallet_address.match(/^(0x)?[A-Fa-f0-9]{24,256}$/) == null) {

    res.send(JSON.stringify({ 
      status_label: "IPCDB_WALLETADDR_BADFORMAT" }));

    session.client.end();
    return;
  }

  if (!web3.utils.isAddress(wallet_address)) {

    res.send(JSON.stringify({ 
      status_label: "IPCDB_INVALID_WALLETADDR" }));

    session.client.end();
    return null;
  }

  let group_index = req.params.group_index;
  let group_limit = req.params.group_limit;

  if (group_index.match(/^\d+$/) == null ||
        group_limit.match(/^\d+$/) == null) {

    res.send(JSON.stringify({ 
      status_label: "IPCDB_GROUPNUMBER_ERROR" }));

    session.client.end();
    return;
  }
  else if (group_index < 0 || group_limit <= 0) {

    res.send(JSON.stringify({ 
      status_label: "IPCDB_GROUPNEG_ERROR" }));

    session.client.end();
    return;
  }

  if (group_limit > IPCDBLib.IPCDB_GROUP_LIMIT) {

    res.send(JSON.stringify({ 
      status_label: "IPCDB_GROUPLIMIT_ERROR" }));

    session.client.end();
    return;
  }

  let ipc_list = await IPCDBLib.ipcdb_web3_wallet_ipc_list(
    session, wallet_address, group_index * group_limit, group_limit);

  if (ipc_list == null) {

    res.send(JSON.stringify({ 
      status_label: "IPCDB_WALLET_EMPTY" }));

    session.client.end();
    return;
  }
  else if (ipc_list.length == 0) {

    res.send(JSON.stringify({ 
      status_label: "IPCDB_WALLET_EMPTY" }));

        session.client.end();
        return;
    }

    session.client.end();
    res.send(JSON.stringify({status_label: "IPCDB_SUCCESS", responce: ipc_list}));
};

async function index_layout() {
  const data = await fs.readFile(config.PRODUCTION_DIR + "main.html"); 
  return data.toString('utf8');
}

async function callDefault(req, res) {

  const url = req.params[0].replace(/(.)\/$/, "$1");
  const token_id = url.match(/[0-9]+/);

  let output = await index_layout();

  output = output.replace(/%TITLE%/g, "MyIPC.io");

  output = output.replace(/%PUBLIC_ROOT%/g, "/");
  output = output.replace(/%WEBSITE_NAME%/g, "MyIPC.io");
  output = output.replace(/%DESCRIPTION%/g, "MyIPC.io is a web based Dapp that reads, decodes and displays Immortal Playable Characters (IPCs) from the Etherum blockchain.");

  output = output.replace(/%SITE_NAME%/g, "MyIPC.io");
  output = output.replace(/%PAGE_TITLE%/g, "Immortal Playable Characters that live on the Ethereum blockchain.");
  output = output.replace(/%PAGE_DESCRIPTION%/g, "MyIPC.io is a web based Dapp that reads, decodes and displays Immortal Playable Characters (IPCs) from the Etherum blockchain.");
  output = output.replace(/%PAGE_URL%/g, "https://myipc.io" + url); // FIX

  if (token_id != null)
    output = output.replace(/%PAGE_CARD%/g, "https://myipc.io/cards/" + token_id[0] + ".jpg");
  else
    output = output.replace(/%PAGE_CARD%/g, "https://myipc.io/card.jpg");

    res.send(output);
}

function main() {

  server.get(
    config.BACKEND_ROOT + 
    "token_id/:token_id", 
    callTokenId);

  // temp
  server.get(
    config.BACKEND_ROOT + 
    "ipc_id/:ipc_id", 
    callIPCId);

  server.get(
    config.BACKEND_ROOT + 
    "wallet_address/:wallet_address" +
    "/group_index/:group_index" +
    "/group_limit/:group_limit",
    callWalletAddress);

  if (config.DEVELOPMENT_MODE == 1) {

    server.all('*', (req, res) => {
      apiProxy.web(req, res, {target: reactServer});
    });
  }
  else {

    server.use(express.static(config.PRODUCTION_DIR));
    server.get('*', callDefault);
  }

  server.listen(2000);
  console.log("Starting myipc.io on port 2000...");
}

main();
