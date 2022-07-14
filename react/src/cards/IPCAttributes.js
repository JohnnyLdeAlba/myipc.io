import React from 'react';
import { styled } from "@mui/material/styles";

import T from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';

import IPCCard from './IPCCard.js';

import IPCLib from '../lib/IPCLib.js';
import config from '../config';

function _DiceIcon(props)
{
  let filename = config.public_url + "dice/dice-1.svg";

  if (props.value > 0 && props.value <= 6)
    filename = config.public_url + "dice/dice-" + props.value + ".svg";

  return (<img className={ props.className } src={ filename } />);
}

const DiceIcon = styled(_DiceIcon)({

  width: '24px',
  verticalAlign: 'middle'
});

const attribute_style = {
  caption: {
    flex: 1,
    padding: '6px 0px 0px 16px',
    height: '34px',
    borderWidth: '2px 0px 2px 2px',
    borderRadius: '32px 0px 0px 32px',
    backgroundColor: 'secondary.main',
    fontFamily: 'poppins-semibold',
    fontSize: '16px',
    color: '#555566',
    letterSpacing: '0.1em',
    textTransform: 'uppercase'
  },

  value: {
    padding: '6px 24px 4px 0px',
    height: '34px',
    borderWidth: '2px 2px 2px 0px',
    borderRadius: '0px 32px 32px 0px',
    backgroundColor: 'secondary.main',
    fontFamily: 'poppins-semibold',
    fontSize: '16px',
    color: '#555566',
    textTransform: 'uppercase',
    textAlign: 'center'
  }
};

function AttributeCaption(props) {

  let _attribute_style = { ...attribute_style };

  _attribute_style.caption.fontSize = '16px';
  _attribute_style.value.padding = '6px 24px 4px 0px';

  return (
    <ListItem sx={{ padding: '4px 16px 4px 0px' }}>
      <T sx={ attribute_style.caption }>{ props.label }</T>
      <T sx={ attribute_style.value }>{ props.value }</T>
    </ListItem>
  );
}

function AttributeItem(props) {

  let _attribute_style = { ...attribute_style };

  _attribute_style.caption.fontSize = '14px';
  _attribute_style.value.padding = '5px 16px 0px 0px';

  return (
    <ListItem sx={{ padding: '4px 16px 4px 0px' }}>
      <T sx={ _attribute_style.caption }>{ props.label }</T>
      <T sx={ _attribute_style.value }><DiceIcon value={ props.value } /></T>
    </ListItem>
  );
}

const _AttributeIcon = (props) => {
  return <img className={ props.className } src={ config.public_url + "attribute-icons/" + props.src } />;
}

const AttributeIcon = styled(_AttributeIcon)({
  margin: '16px 16px 16px 0px',
  width: '90px'
});

export default function IPCAttributes(props) {

  const [ expanded, setExpanded ] = React.useState(true);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const style = {
    item: { padding: '8px 0px 8px 16px'  }
  };

  let ipc = props.instance.ipc;  

  return (
    <IPCCard
      caption="Attributes"
      icon={ <SportsMartialArtsIcon
        fontSize="small"
        sx={{ marginRight: '8px' }}/> }>  
      <List disablePadding>

        <ListItem sx={ style.item } divider>
          <AttributeIcon src="strength-icon.png" />
          <List disablePadding sx={{ width: '100%' }}>
            <AttributeCaption label="Strength" value={ ipc.strength } />
            <AttributeItem label="Force" value={ ipc.force } />
            <AttributeItem label="Sustain" value={ ipc.sustain } />
            <AttributeItem label="Tolerance" value={ ipc.tolerance } />
          </List> 
        </ListItem>

        <ListItem sx={ style.item } divider>
          <AttributeIcon src="dexterity-icon.png" />
          <List disablePadding sx={{ width: '100%' }}>
            <AttributeCaption label="Dexterity" value={ ipc.dexterity } />
            <AttributeItem label="Speed" value={ ipc.speed } />
            <AttributeItem label="Precision" value={ ipc.precision } />
            <AttributeItem label="Reaction" value={ ipc.reaction } />
          </List> 
        </ListItem>

        <ListItem sx={ style.item } divider>
          <AttributeIcon src="intelligence-icon.png" />
          <List disablePadding sx={{ width: '100%' }}>
            <AttributeCaption label="Intelligence" value={ ipc.intelligence } />
            <AttributeItem label="Memory" value={ ipc.memory } />
            <AttributeItem label="Processing" value={ ipc.processing } />
            <AttributeItem label="Reasoning" value={ ipc.reasoning } />
          </List> 
        </ListItem>

        <ListItem sx={ style.item } divider>
          <AttributeIcon src="constitution-icon.png" />
          <List disablePadding sx={{ width: '100%' }}>
            <AttributeCaption label="Constitution" value={ ipc.constitution } />
            <AttributeItem label="Healing" value={ ipc.healing } />
            <AttributeItem label="Fortitude" value={ ipc.fortitude } />
            <AttributeItem label="Vitality" value={ ipc.vitality } />
          </List>  
        </ListItem>

        <ListItem sx={ style.item } >
          <AttributeIcon src="luck-icon.png" />
          <List disablePadding sx={{ width: '100%' }}>
            <AttributeCaption label="Luck" value={ ipc.luck } />
          </List> 
        </ListItem>

      </List>
  </IPCCard>);
}
