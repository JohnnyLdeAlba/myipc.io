import React from 'react';

import MUIAlert from '@mui/material/Alert';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import {IPCContext} from '../lib/IPCInstance'

function getClickListener(alert) {
  return (() => { alert.show(false); });
}

class t_alert {

  constructor() {

    this.visible = false;
    this.setVisible = null;

    this.type = "error";
    this.title = "";
    this.content = "";
  }

  show(visible) {
    
    if (visible == false) {

      this.type = "error";
      this.title = "";
      this.content = "";
    }

    this.setVisible(visible);
  } 
}

function getController(instance, id) {

  if (typeof instance.controller[id] == 'undefined') {
  
    const controller = new t_alert;
    instance.controller[id] = controller;
  }

  return instance.controller[id];
}

export default function Alert(props) {

  const instance = React.useContext(IPCContext);

  const alert = getController(instance, 'Alert');
  const [visible, setVisible] = React.useState(false);

  alert.visible = visible;
  alert.setVisible = setVisible;

  if (alert.type == "")
    alert.type = "error";

  return (
    <Dialog
      open={alert.visible}
      fullWidth={true}
      onClick={getClickListener(alert)}>

      <DialogTitle>
        {alert.title}
      </DialogTitle>

      <DialogContent>
        <MUIAlert severity={alert.type}>{alert.content}</MUIAlert>
      </DialogContent>
      <DialogActions>
        <Button onClick={getClickListener(alert)}>Got it!</Button>
      </DialogActions>
    </Dialog>
  );
}
