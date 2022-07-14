import React from 'react';

import {styled} from '@mui/material/styles';
import Backdrop from '@mui/material/Backdrop';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import LinkIcon from '@mui/icons-material/Link';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

import theme from '../theme.js';

import getContext from '../context';
import { getController } from '../controller';

import config from '../config';

import IPCInstance from '../lib/IPCInstance';

const IPCContext = IPCInstance.IPCContext;

function getSubProp() {

  return { 
  
    paperProps: {
      sx:{
        paddingTop: 0,
        width: '70%',
        height: '100vh',
        backgroundColor: 'primary.main',

        [ theme.breakpoints.up('sm') ]:{
          width: '320px'
        }
      }
    },

    sliderProps: {
      appear: true,
      easing: 'ease-in'
    },

    TypographyProps: {
      sx: {
        fontFamily: 'poppins-semibold',
        color: 'secondary.main'
      }
    }
  };
}

export function MenuItem(props) {

  const subProp = getSubProp();

  return (
    <ListItem button onClick={ props.onClick } sx={ props.sx }>
      <ListItemIcon>
        { props.icon }
      </ListItemIcon>
      <ListItemText primaryTypographyProps={ subProp.TypographyProps }>
        { props.label }
      </ListItemText>
    </ListItem>
  );
}

export function MenuItemAccount() {

  const context = getContext();
  const connected = context.mwc_provider.isConnected();

  const [ connectVisible, showConnect ] = React.useState(!connected);
  const subProp = getSubProp();

  const onAccountClick = (event) => {
    context.processSubscription("openAccountDialog");
  }

  const onDisconnectClick = (event) => {

    context.mwc_provider.disconnect();
    showConnect(true);

    event.stopPropagation();
  }

  const onConnectClick = (event) => {
    context.processSubscription("openMWCDialog");
  }

  if (connectVisible) {

    return (
      <MenuItem
        label="Connect Wallet"
        icon={ <LoginIcon color="secondary" fontSize="small" /> }
        onClick={ onConnectClick }
      />
    );
  }

  else {

    return (<>
      <MenuItem
        label="Account"
        icon={ <AccountBoxIcon color="secondary" fontSize="small" /> }
        onClick={ onAccountClick }
      />
      <MenuItem
        label="Disconnect Wallet"
        icon={ <LogoutIcon color="secondary" fontSize="small" /> }
        onClick={ onDisconnectClick }
      />
    </>);
  }
}

function Icon(props) {

  const Image = styled('img')({
    width: '24px'
  });

  return <Image src={config.PUBLIC_ROOT + props.url} />;
}

export function AccountDialog(props) {

  const context = getContext();
  const [ visible, show ] = props.state;

  const { providerName, chainId, account } = context.mwc_provider.getAccountDetails();

  const chainName = "Ethereum";

  const style = {

    backdrop: {
      padding: '16px',
      zIndex: config.walletConnect.zIndex
    },

    card: {
      width: '100%',

      '@media (min-width: 700px)': {
        width: '600px'
      }
    },

    listItemHeader: {
      fontSize: '18px',
      textAlign: 'center'
    },

    listItemText: { fontWeight: 'bold' },

    secondaryText: {
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    }
  };

  const onBackdropClick = (event) => { show(false); };
  const onDialogClick = (event) => { event.stopPropagation(); };

  return (
    <Backdrop open={ visible } onClick={ onBackdropClick } sx={style.backdrop}>
      <Card onClick={onDialogClick} sx={style.card}>

        <List>
          <ListItem disablePadding divider sx={style.listItemHeader}>
            <ListItemText
              disableTypography
              primary="Connected Account"
              sx={style.listItemText} />
          </ListItem>

          <ListItem>
            <ListItemIcon>
            {
              providerName == "MetaMask" ? 
                <Icon url="icons/metamask.webp" /> :
                <Icon url="icons/walletconnect.webp" />
            }
            </ListItemIcon>
            <ListItemText
              primary="Wallet Provider"
              secondary={providerName}
              sx={style.listItemText} />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <LinkIcon /> 
            </ListItemIcon>
            <ListItemText
              primary="Chain"
              secondary={chainName}
              sx={style.listItemText} />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <AccountBalanceWalletIcon /> 
            </ListItemIcon>
            <ListItemText
              primary="Wallet Address"
              secondary={account}
              secondaryTypographyProps={ { sx: style.secondaryText  } }
              sx={style.listItemText} />
          </ListItem>
        </List>
      </Card>
    </Backdrop>
  );
}

function MetaMaskMenuItem() {

  const context = getContext();
  const mwc_provider = context.mwc_provider;

  if (mwc_provider.isMobile()) {

    if (!mwc_provider.mm_provider.isProvider())
      return <></>;
  }

  const style = {
    listItemText: { fontWeight: 'bold' }
  };

  const onClick = () => {
    context.mwc_provider.connect("METAMASK");   
  };

  return (
    <ListItemButton onClick={ onClick }>
      <ListItemIcon>
        <Icon url="icons/metamask.webp" /> 
      </ListItemIcon>
      <ListItemText
        disableTypography
        primary="MetaMask"
        sx={ style.listItemText }
      />
    </ListItemButton>
  );
}



export function MWCDialog(props) {

  const context = getContext();
  const [ visible, show ] = props.state;

  const style = {

    backdrop: {
      padding: '16px',
      zIndex: config.walletConnect.zIndex
    },

    card: {
      width: '100%',

      '@media (min-width: 600px)': {
        width: '400px'
      }
    },

    listItemHeader: {
      fontSize: '18px',
      textAlign: 'center'
    },

    listItemText: { fontWeight: 'bold' }
  };

  const onClickBackdrop = () => { show(false); };

  const onWCConnectClick = () => {
    context.mwc_provider.connect("WALLETCONNECT");   
  };

  return (
    <Backdrop open={ visible } onClick={ onClickBackdrop } sx={ style.backdrop }>
      <Card sx={ style.card }>

        <List component="nav">
          <ListItem disablePadding divider sx={style.listItemHeader}>
            <ListItemText
              disableTypography
              primary="Connect Wallet"
              sx={style.listItemText} />
          </ListItem>

          <MetaMaskMenuItem />

          <ListItemButton onClick={ onWCConnectClick }>
            <ListItemIcon>
              <Icon url="icons/walletconnect.webp" /> 
            </ListItemIcon>
            <ListItemText
              disableTypography
              primary="Wallet Connect"
              sx={style.listItemText} />
          </ListItemButton>
        </List>
      </Card>
    </Backdrop>
  );
}
