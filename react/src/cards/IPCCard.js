import React from 'react';

import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import T from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

export default function Card(props) {

  const [ expanded, setExpanded ] = React.useState(true);
  const toggleExpanded = () => setExpanded(!expanded);

  const Card = Box;

  const style = {

    accordion: {
      overflow: 'hidden',
      marginBottom: '16px',
      maxWidth: '100%',
      boxShadow: '0px 5px 5px -3px rgb(0 0 0 / 20%), ' + 
                 '0px 8px 10px 1px rgb(0 0 0 / 14%), ' + 
                 '0px 3px 14px 2px rgb(0 0 0 / 12%)'
    },

    header: {
      padding: '0px 8px',
      borderRadius: '4px 4px 0px 0px',
      backgroundColor: '#444455',
      color: '#ffffff'
    },

    headerIcon: { color: '#ffffff' },

    caption: {
      fontWeight: 'bold',
      letterSpacing: '0.1em'
    },

    body: { padding: 0 }
  }

  return (
    <Card sx={ props.sx }>
      <Accordion
        expanded={ expanded }
        onChange={ toggleExpanded }
        disableGutters={ true }
        sx={ style.accordion }>

        <AccordionSummary
          expandIcon={ <ExpandMoreIcon sx={ style.headerIcon } /> }
          sx={ style.header }>

          { props.icon }
          <T variant="body1" sx={ style.caption }>{ props.caption }</T>

        </AccordionSummary>
        <AccordionDetails sx={ style.body }>
          <Divider />
          { props.children }
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}
