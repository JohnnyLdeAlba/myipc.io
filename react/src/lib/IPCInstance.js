import React from 'react';
import config from '../config';

export const IPCContext = React.createContext();

function t_responce() {

  this.code = "";
  this.payload = null;

  this.alert = {
    type: "",
    title: "",
    content: ""
  };
}

class t_controller {

  constructor() {

    this.mounted = false;

    this.visible = false;
    this.show = (value) => {};

    this.page = 0;
    this.setPage = (value) => {};
  }
}

function t_instance() {
 
  this.components = {

    defcon: {
      content: "",
      refresh: null,
      setRefresh: null,
      visible: false,
      update: null,
      show: null,
      hide: null
    },

    alert: null,
    navigator: null
  }

  this.layouts = {
    qrcode: null,
    developers: null
  };

  this.controller = [];

  this.navigate = null;

  this.ipc = null;
  this.label_ipc = null;

  this.wallet_page = 0;
  this.wallet_address = "";
  this.wallet_ipc_total = 0;
  this.wallet_ipc_list = [];

  this.unmountAll = () => {

    for (const id in this.controller) {

      const item = this.controller[id];

      if (typeof item.mounted != 'undefined')
        item.mounted = false;
    }
  };

  this.showBackdrop = (visible) => {
    this.controller['Backdrop'].show(visible);
  };

  this.showDefcon = (content) => {};
  this.route = (url) => {};

  this.showAlert = (title, content, type) => {

    const alert = this.controller['Alert'];

    if (typeof type == 'undefined')
      type = "error";

    alert.type = type;
    alert.title = title;
    alert.content = content;

    alert.show(true); 
  };

  this.getController = (id) => {

    if (typeof this.controller[id] == 'undefined')
      this.controller[id] = new t_controller();
    
    return this.controller[id]; 
  }
}

const IPCInstance = {

  IPCContext: IPCContext,
  t_controller: t_controller,
  t_responce: t_responce,
  t_instance: t_instance,
}

export default IPCInstance;
