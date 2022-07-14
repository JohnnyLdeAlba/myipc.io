import React from 'react';

import {styled} from '@mui/material/styles';

import Drawer from "@mui/material/Drawer";
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import QRCodeIcon from '@mui/icons-material/QrCode';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import { AppBar, IPCLogo, MyIPCLogo } from './AppBar';

import { MenuItemAccount } from './MWCDialog';

import IPCInstance from '../lib/IPCInstance';
import getContext from '../context';

import theme from '../theme.js';
import config from '../config.js';

class t_navigator {

  constructor() {
  
    this.open = false;
    this.saveOpen = null;
    this.defcon = {

      visible: false,
      show: null
    };
  }

  toggle() { this.saveOpen(!this.open); }
}

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

export function getController(instance, id) {

  if (typeof instance.controller[id] == 'undefined') {

    const controller = new t_navigator();
    instance.controller[id] = controller;
  }

  return instance.controller[id];
}

function initialize(instance) {

  if (typeof instance.controller['menuItemLogin'] == 'undefined') {
    instance.getController('menuItemLogin').visible = true;
  }

  if (typeof instance.controller['menuItemLogout'] == 'undefined') {
    instance.getController('menuItemLogout').visible = false;
  }
}

export default function Navigator(props) {

  const context = getContext();
  const [ open, openDrawer ] = React.useState(false);

  const toggleDrawer = () => openDrawer(!open);  
  const subProp = getSubProp();

  return (
    <>
    <AppBar toggleDrawer={ toggleDrawer } />
    <Drawer
      variant="temporary"
      open={ open }
      PaperProps={subProp.paperProps}
      SlideProps={subProp.sliderProps}
      onClick={ toggleDrawer }>

      <List>

        <ListItem
          href="/" component={ Link }
          sx={{ 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'row'
          }}>
          <IPCLogo sx={{width: '40px'}} />
          <MyIPCLogo />
        </ListItem>

        <ListItem href="/" component={Link} button>
          <ListItemIcon>
            <PersonSearchIcon color="secondary" fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={subProp.TypographyProps}>
            IPC Explorer
          </ListItemText>
        </ListItem>

        <ListItem href="QRCode" component={Link} button>
          <ListItemIcon>
            <QRCodeIcon color="secondary" fontSize="small" />
          </ListItemIcon>
            <ListItemText primaryTypographyProps={subProp.TypographyProps}>
            Scan QR Code
          </ListItemText>
        </ListItem>

        <ListItem href="https://twitter.com/playchemy" component={Link} button>
          <ListItemIcon>
            <TwitterIcon color="secondary" fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={subProp.TypographyProps}>
            Twitter
          </ListItemText>
        </ListItem>

        <ListItem href="https://www.facebook.com/IPCMrE" component={Link} button>
          <ListItemIcon>
            <FacebookIcon color="secondary" fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={subProp.TypographyProps}>
            Facebook
          </ListItemText>
        </ListItem>

        <MenuItemAccount />

      </List>
    </Drawer>
    </>
  );
}
