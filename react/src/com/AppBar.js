import React from 'react';

import { styled } from "@mui/material/styles";

import MUIAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';

import Search from './Search';

import getContext from '../context';

import theme from '../theme.js';
import config from '../config.js';

export function IPCLogo(props) {

  const style = ((style) => {

    if (typeof style == 'undefined') {

      return {
        marginLeft: '16px',
        width: '40px'
      };
    }
    else
      return style;

  })(props.sx);

  const Image = styled('img')(style);
  return <Image src={config.PUBLIC_ROOT + "assets/ipc-logo.svg"} alt="" />;
}

export function MyIPCLogo(props) {

  const style = ((style) => {

    if (typeof style == 'undefined') {

      return {
        marginLeft: '8px',
        width: '160px'
      };
    }
    else
      return style;

  })(props.sx);

  const Image = styled('img')(style);
  return <Image src={config.PUBLIC_ROOT + "assets/myipc-logo.svg"} alt="" />;
}

export function AppBar(props) {

  const context = getContext();

  const defcon = { visible: false, content: "DEFCON" };
  const display = defcon.visible ? 'block' : 'none';

  const style = {
    defcon: {
      display: display,
      padding: '4px 8px',
      backgroundColor: '#ffa117',
      fontFamily: 'poppins-semibold',
      fontSize: '14px',
      color: '#663c00'
    }
  };

  return (
    <MUIAppBar position="static" color="primary">
      <Box sx={style.defcon}>{defcon.content}</Box>
      <Toolbar sx={{display: 'flex', padding: '16px 8px'}}>
        <Box sx={{display: 'flex', flexDirection: 'row', flex: 1}}>
        <IconButton color="inherit" onClick={ props.toggleDrawer }>
          <MenuIcon />
        </IconButton>
        <Link href="./">
          <IPCLogo /> <MyIPCLogo />
        </Link>
       </Box>
       <Search />
      </Toolbar>
      <Search wide />
    </MUIAppBar>
  );
}
