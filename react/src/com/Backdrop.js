import React from 'react';
import { styled } from "@mui/material/styles";

import MUIBackdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {IPCContext} from '../lib/IPCInstance';
import config from '../config';

export default function Backdrop(props)
{
  const instance = React.useContext(IPCContext);

  let backdrop = instance.getController('Backdrop');
  let [visible, show] = React.useState(false);

  backdrop.visible = visible;
  backdrop.show = show;

  const onClick = () => {backdrop.show(false);};

  return (
    <MUIBackdrop
      open={backdrop.visible}
      onClick={onClick}
      sx={{zIndex: config.backdrop.zIndex}}>

      <CircularProgress size={60} color="secondary" />
    </MUIBackdrop>
  );
}
