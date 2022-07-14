import React from 'react';
import { styled } from "@mui/material/styles";

import T from '@mui/material/Typography';
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import IPCLib from '../lib/IPCLib';
import IPCEng from '../lib/IPCEng';

import config from '../config';

function getStyle() {

  return {
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
}

export default function WalletItem(props) {

  const ipc = props.ipc;
  const label_ipc = IPCLib.ipc_create_label_ipc(ipc, IPCEng);

  const style = getStyle();

  return (
      <Box sx={style.card_wrapper}>
      <Card onClick={props.onClick} sx={style.card}>
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


