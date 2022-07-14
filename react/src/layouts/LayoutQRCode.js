import React from 'react';
import { styled } from "@mui/material/styles";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import T from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import IPCLib from '../lib/IPCLib.js';
import IPCEng from '../lib/IPCEng.js';
import IPCUILib from '../lib/IPCUILib.js';
import IPCWalletUI from '../lib/IPCWalletUI.js';

import config from '../config';

function IPCWalletItem(props) {

  const clickHandler = props.clickHandler;

  const ipc = props.ipc;
  const label_ipc = IPCLib.ipc_create_label_ipc(ipc, IPCEng);

  const style = {
    card_wrapper: {
      width: '50%',
      '@media (min-width: 800px)': { width: '25%' },
      '@media (min-width: 1024px)': { width: '20%' },
    },

    card: {
      cursor: 'pointer',
      userSelect: 'none',

      boxSizing: 'border-box',
      margin: '8px',

      borderRadius: '12px;',
      backgroundColor: '#444455',
      boxShadow: '0px 5px 5px -3px rgb(0 0 0 / 20%), ' + 
                 '0px 8px 10px 1px rgb(0 0 0 / 14%), ' + 
                 '0px 3px 14px 2px rgb(0 0 0 / 12%)',
      color: '#ffffff',

      ':active': { backgroundColor: '#666677' }
    },

    media_wrapper: {
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'row'
    },

    content: { padding: '10px 10px 6px 10px' },
    media: { imageRendering: 'pixelated' },

    actions: {
      padding: '10px',
      border: '1px solid rgba(0,0,0,40%)',
      borderWidth: '1px 0px 0px 0px'
    }
  };

  return (
      <Box sx={style.card_wrapper}>
      <Card onClick={clickHandler(ipc.token_id)} sx={style.card}>
        <Box sx={style.media_wrapper}>
          <CardMedia
            component="img"
            image={config.public_url + "sprites/" + ipc.token_id  + ".gif"}
            sx={style.media} />
        </Box>
        <CardContent>
          <T variant="subtitle2">#{ipc.token_id}</T>
          <T variant="subtitle1" noWrap={true}>{label_ipc.name}</T>
        </CardContent>
        <CardActions sx={style.actions}>
          <T variant="subtitle2" sx={{flex: 1}}>Price</T>
          <T variant="subtitle2">{label_ipc.price}</T>
        </CardActions>
      </Card>
      </Box>
  );

}

export default function QRCodeLayout(props) {

  const instance = props.instance;
  const layouts = instance.layouts;

  let wallet_view = layouts.wallet_view;

  if (wallet_view == null) {
    wallet_view = {
      refresh: null,
      setRefresh: null,
      update: null,
      show: null,
      hide: null
    };

    layouts.wallet_view = wallet_view;
  }

  [wallet_view.refresh, wallet_view.setRefresh] = React.useState(0);

  wallet_view.update = () => { wallet_view.setRefresh(Math.random() * 1000); };
  wallet_view.show = () => { instance.hideAll(); wallet_view.visible = true; wallet_view.update(); };
  wallet_view.hide = () => { wallet_view.visible = false; wallet_view.update(); };

  let _display = (wallet_view.visible == true) ? 'flex' : 'none';

  const style = {
    container: {
      display: _display,
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
      flex: 2,
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      justifyContent: 'center'
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

  const handlePageChange = (event, page) => { IPCWalletUI.ui_fetch_wallet_ipc_list(instance, instance.wallet_address, page - 1); };
  const handleClick = (token_id) => { return () => { IPCUILib.ui_fetch_ipc(instance, token_id); } }
  const page_total = Math.ceil(instance.wallet_ipc_total/config.IPC_LIST_LIMIT);

  return (
    <Container sx={style.container}>
    <Stack sx={style.header}>
      <T variant="h5" sx={style.caption}>Viewing Wallet</T>
      <T align="center" noWrap={true}>{instance.wallet_address}</T>
    </Stack>
    <Stack direction="row" sx={style.stack}>

      { instance.wallet_ipc_list.map((ipc) => { return <IPCWalletItem clickHandler={handleClick} ipc={ipc} /> }) }

    </Stack>
    <Stack sx={style.pagination_stack}>
      <Pagination page={instance.wallet_page} count={page_total} showFirstButton showLastButton sx={style.pagination} onChange={handlePageChange} />
    </Stack>

    </Container>
  );
}
