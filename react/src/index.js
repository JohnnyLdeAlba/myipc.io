import React from 'react';
import ReactDOM from 'react-dom';

import {
  useNavigate,
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import QRCode from './layouts/QRCode.js';
import Terminal from './layouts/Terminal.js';
import DefaultRoute from './layouts/DefaultRoute.js';

import IPCLib from './lib/IPCLib.js';
import IPCEng from './lib/IPCEng.js';
import IPCInstance from './lib/IPCInstance.js';

import config from './config';
import './style.css';

const IPCContext = IPCInstance.IPCContext;

function AppRoot(props) {

  return (
    <BrowserRouter>
      <Routes>
        <Route path={config.BACKEND_ROOT} element={<DefaultRoute />}>
          <Route path=":value" element={<DefaultRoute />} />
        </Route>
        <Route path={config.BACKEND_ROOT + 'qrcode'} element={<QRCode />} />
        <Route path={config.BACKEND_ROOT + 'edeccodolphin'} element={<Terminal />} />
      </Routes>
    </BrowserRouter>
  );
}

async function main() {

  let instance = new IPCInstance.t_instance();

  const root = document.getElementById('root');

  instance.ipc = new IPCLib.t_ipc();
  instance.label_ipc = IPCLib.ipc_create_label_ipc(instance.ipc, IPCEng);

  ReactDOM.render(
    <IPCContext.Provider value={instance}>
      <AppRoot />
    </IPCContext.Provider>,
    root
  );
}

main();
