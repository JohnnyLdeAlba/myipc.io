import React from 'react';

import { styled } from "@mui/material/styles";

import T from '@mui/material/Typography';
import Box from "@mui/material/Box";
import MUIContainer from "@mui/material/Container";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import Container from '../com/Container';
import WalletItem from '../com/WalletItem';

import IPCUI from '../lib/IPCUI';
import IPCWalletUI from '../lib/IPCWalletUI';
import IPCInstance from '../lib/IPCInstance';

import config from '../config';

function getStyle(display) {

  return {

    container: {

      display: display,
      flexDirection: 'column',
      margin: '16px auto',
      maxWidth: '1200px',
      height: '100%'
    },

    header: { margin: '8px 0px 16px 0px' },

    caption: {

      marginBottom: '8px',
      fontFamily: 'poppins-semibold',
      textAlign: 'center' 
    },

    stack: {
      
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },

    pagination_stack: {

      alignItems: 'center',
      marginBottom: '28px',
      fontFamily: 'poppins-semibold'
    },

    pagination: {

      '& .MuiPaginationItem-root': {

        margin: '0px',
        fontFamily: 'poppins-semibold',
        fontSize: '16px',

       '@media (min-width: 600px)': {
         margin: '0px 4px',
         fontSize: '18px'
        },

        '@media (min-width: 800px)': {
          margin: '0px 8px',
          fontSize: '18px'
        },

        '@media (min-width: 1024px)': {
          margin: '0px 24px',
          fontSize: '18px'
        }
      }
    }	
  };
}

function onEffect(instance, wallet_address) {

  return () => {

    const controller = instance.controller['Wallet'];

    if (controller.mounted == false) {
 
      controller.mounted = true;
      IPCWalletUI.ui_fetch_wallet_ipc_list(
        instance, wallet_address, 0);
    }

    return () => {};
  }
}

function getIPCOnClick(instance, token_id) {
  return () => { window.location.href = token_id; };
}

function getOnPageChange(instance) {

  return (event, page) => {
    IPCWalletUI.ui_fetch_wallet_ipc_list(
      instance, instance.wallet_address, page - 1);
  }
}

function getIPCWalletItem(instance) {

  if (typeof instance.wallet_ipc_list == 'undefined')
    return <></>;

  return (instance.wallet_ipc_list.map(ipc =>
    <WalletItem
      key={ipc.token_id}
      ipc={ipc}
      onClick={getIPCOnClick(instance, ipc.token_id)}
  />));
}

function getPageTotal(instance) {
  return Math.ceil(instance.wallet_ipc_total/config.IPC_LIST_LIMIT);
}

export default function IPCWallet(props) {

  const instance = React.useContext(IPCInstance.IPCContext);
  const controller = instance.getController('Wallet');
  const wallet_address = props.walletAddress;

  const [visible, show] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const display = visible ? 'flex' : 'none';

  controller.visible = visible;
  controller.show = show;
  controller.setPage = setPage;

  React.useEffect(onEffect(instance, wallet_address));

  const onPageChange = getOnPageChange(instance);
  const pageTotal = getPageTotal(instance);

  const style = getStyle(display);

  return (
    <Container>
      <MUIContainer sx={style.container}>

        <Stack sx={style.header}>
          <T variant="h5" sx={style.caption}>Viewing Wallet</T>
          <T align="center" noWrap={true}>{instance.wallet_address}</T>
        </Stack>

        <Box sx={style.stack}>{getIPCWalletItem(instance)}</Box>

        <Stack sx={style.pagination_stack}>
          <Pagination
            page={page}
            count={pageTotal}
            onChange={onPageChange}
            showFirstButton
            showLastButton
            sx={style.pagination} />
        </Stack>

      </MUIContainer>
    </Container>
  );
}
