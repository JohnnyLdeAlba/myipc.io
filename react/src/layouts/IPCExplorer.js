import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useParams
} from "react-router-dom";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MUIContainer from "@mui/material/Container";

import Container from '../com/Container';
import IPCProfile from '../com/IPCProfile';
import IPCDNA from '../cards/IPCDNA';
import IPCAttributes from '../cards/IPCAttributes';

import IPCInstance from '../lib/IPCInstance';
import IPCUI from '../lib/IPCUI.js';

function getStyle(display) {

  return {

    box: {
      display: display,
      marginTop: '16px',
    },

    container: {
      display: 'flex',
      flexDirection: 'row',

      padding: '0px 16px 0px 16px',
      maxWidth: '1200px',

      ['@media (max-width:800px)']: {
        flexDirection: 'column'
      }
    },

    left_column: {
      boxSizing: 'border-box',
      marginRight: '16px',
      paddingBottom: '16px',
      width: '50%',

      ['@media (max-width:800px)']: {
        marginRight: 0,
        width: 'auto'
      }
    },

    right_column: {
      boxSizing: 'border-box',
      marginLeft: '16px',
      paddingBottom: '16px',
      width: '50%',

      ['@media (max-width:800px)']: {
        marginLeft: 0,
        width: 'auto'
      }
    }
  };
}

function onEffect(instance, token_id) {

  return () => {
    const controller = instance.controller['IPCExplorer'];

    if (controller.mounted == false) {
      controller.mounted = true;

      (async () => {
        await IPCUI.ui_fetch_ipc(instance, token_id);
      })();

    }

    return () => { };
  };
}

class t_ipc_explorer {

  constructor() {

    this.mounted = false;
    this.saveRefresh = null;
    this.visible = false;
    this.show = null;
  }

  update() {
    this.saveRefresh(parseInt(Math.random() * 1000));
  }
}

function getController(instance, id) {

  if (typeof instance.controller[id] == 'undefined') {

    const controller = new t_ipc_explorer();
    instance.controller[id] = controller;
  }

  return instance.controller[id];
}

export default function IPCExplorer(props) {

  const instance = React.useContext(IPCInstance.IPCContext);
  const token_id = props.tokenId;

  const controller = getController(instance, 'IPCExplorer');

  let [ refresh, saveRefresh ] = React.useState(0);
  let [ visible, show ] = React.useState(false);
  let display = visible ? 'block' : 'none';

  controller.saveRefresh = saveRefresh;
  controller.visible = visible;
  controller.show = show;

  React.useEffect(onEffect(instance, token_id));

  const style = getStyle(display);
  const LeftColumn = styled('div')(style.left_column);
  const RightColumn = styled('div')(style.right_column);

  return (
    <Container>
    <Box sx={style.box}>
      <IPCProfile instance={instance} /> 
      <MUIContainer disableGutters sx={style.container}>
        <LeftColumn>
          <IPCDNA instance={instance} />
        </LeftColumn>
        <RightColumn>
          <IPCAttributes instance={instance}  />
        </RightColumn>
      </MUIContainer>
    </Box>
    </Container>
  );
}
