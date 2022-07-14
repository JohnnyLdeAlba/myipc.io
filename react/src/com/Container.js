import React from 'react';
import {useNavigate} from "react-router-dom";

import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import {MWCDialog, AccountDialog} from './MWCDialog';
import Backdrop from './Backdrop';
import Alert from './Alert';
import Navigator from './Navigator';
import Footer from './Footer';

import IPCInstance from '../lib/IPCInstance';
import getContext from '../context';
import theme from '../theme';

export default function Container(props) {

  const instance = React.useContext(IPCInstance.IPCContext);
  instance.navigate = useNavigate();

  const context = getContext();

  const [ MWCDialogVisible, showMWCDialog ] = React.useState(false);
  const [ accountDialogVisible, showAccountDialog ] = React.useState(false);

  React.useEffect(() => {

    context.removeSubscriber("openMWCDialog", "Container");
    context.removeSubscriber("openAccountDialog", "Container");

    context.addSubscriber("openMWCDialog", "Container", () => { showMWCDialog(true); });
    context.addSubscriber("openAccountDialog", "Container", () => showAccountDialog(true));
  });

  context.addSubscriber("openMWCDialog", "Container", () => { showMWCDialog(true); });
  context.addSubscriber("openAccountDialog", "Container", () => showAccountDialog(true));

  const style = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      alignContent: 'stretch',
      height: '100vh'
    },

    body: {flex: 1}
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Backdrop />
      <Alert />
      <MWCDialog state={ [ MWCDialogVisible, showMWCDialog ] }  />
      <AccountDialog state={ [ accountDialogVisible, showAccountDialog ] } />
      <Box sx={style.container}>
        <Navigator />
        <Box sx={style.body}>
          {props.children}
        </Box>
        <Footer />
      </Box>  
    </ThemeProvider>);
}

