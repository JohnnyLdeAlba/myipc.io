import React from 'react';
import { styled } from "@mui/material/styles";

import T from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';

import IPCCard from './IPCCard.js';
import config from '../config';

const _DNAIcon = (props) => {

  const subrace = props.subrace;

  const table = [
    'symbol-elf.png',
    'symbol-elf-night.png',
    'symbol-elf-wood.png',
    'symbol-elf-high.png',
    'symbol-elf-sun.png',
    'symbol-elf-dark.png',

    'symbol-human.png',
    'symbol-human-mythic.png',
    'symbol-human-nordic.png',
    'symbol-human-eastern.png',
    'symbol-human-coastal.png',
    'symbol-human-southern.png',

    'symbol-dwarf.png',
    'symbol-dwarf-quarry.png',
    'symbol-dwarf-mountain.png',
    'symbol-dwarf-lumber.png',
    'symbol-dwarf-hill.png',
    'symbol-dwarf-volcano.png',

    'symbol-orc.png',
    'symbol-orc-ash.png',
    'symbol-orc-sand.png',
    'symbol-orc-plains.png',
    'symbol-orc-swamp.png',
    'symbol-orc-blood.png'
  ];

  let filename = 'symbol-orc.png';
  if (subrace >= 0 && subrace < table.length)
    filename = table[subrace];

  return (<img
    className={ props.className }
    src={ config.public_url + "race-symbols/" + filename } />);
}

const DNAIcon = styled(_DNAIcon)(
{
  margin: '8px 0px 8px 16px',
  width: '90px'
});

export default function IPCDNA(props) {

  const style = {
    label: {
      flex: 1,
      fontWeight: 'bold',
      color: 'rgba(0, 0, 0, 0.6)'
    },

    value: { fontFamily: 'poppins-semibold' }
  };

  let ipc = props.instance.ipc;  
  let label_ipc = props.instance.label_ipc;  

  return (
    <IPCCard
      caption="DNA"
      icon={ <TheaterComedyIcon
        fontSize="medium"
        sx={{ marginRight: '8px' }} /> }>

      <List>
        <ListItem divider>
          <T sx={ style.label }>Race</T>
          <T sx={style.value}>{ label_ipc.race }</T>
        </ListItem>
        <ListItem divider>
          <T sx={ style.label }>Subrace</T>
          <T sx={style.value}>{ label_ipc.subrace }</T>
          <DNAIcon subrace={ ipc.subrace } />
        </ListItem>
        <ListItem divider>
          <T sx={ style.label }>Gender</T>
          <T sx={style.value}>{ label_ipc.gender }</T>
        </ListItem>
        <ListItem divider>
          <T sx={ style.label }>Height</T>
          <T sx={style.value}>{ label_ipc.height }</T>
        </ListItem>
        <ListItem divider>
          <T sx={ style.label }>Skin Color</T>
          <T sx={style.value}>{ label_ipc.skin_color }</T>
        </ListItem>
        <ListItem divider>
          <T sx={ style.label }>Hair Color</T>
          <T sx={style.value}>{ label_ipc.hair_color }</T>
        </ListItem>
        <ListItem divider>
          <T sx={ style.label }>Eye Color</T>
          <T sx={style.value}>{ label_ipc.eye_color }</T>
        </ListItem>
        <ListItem>
          <T sx={ style.label }>Handedness</T>
          <T sx={style.value}>{ label_ipc.handedness }</T>
        </ListItem>
      </List>
    </IPCCard>
  );
}
