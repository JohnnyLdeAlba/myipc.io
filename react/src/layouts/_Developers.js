import React from 'react';
import { styled } from "@mui/material/styles";

import T from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import config from '../config';

const B = styled('span')({
  fontWeight: 'bold' });

const Code = styled('div')({
  marginBottom: '16px',
  padding: '16px',
  backgroundColor: '#ccccdd',
  fontFamily: 'monospace'
});

const Comment = styled('div')({
  color: '#008800'
}); 

export default function DevelopersLayout(props) {

  const instance = props.instance;
  const layouts = instance.layouts;

  let developers = layouts.developers;
  if (developers == null) {
    developers = {
      refresh: null,
      setRefresh: null,
      visible: true,
      update: null,
      show: null,
      hide: null
    };

    layouts.developers = developers;
  }

  [developers.refresh, developers.setRefresh] = React.useState(0);

  developers.update = () => { developers.setRefresh(Math.random() * 1000); };
  developers.show = () => { instance.hideAll(); developers.visible = true; developers.update() };
  developers.hide = () => { developers.visible = false; developers.update() };

  let _display = (developers.visible == true) ? 'block' : 'none';

  const style = {
    container: {
      display: _display,
      margin: '0 auto',
      padding: '32px 16px',
      maxWidth: '1024px',
      height: '100%'
    },

    paper: {
      padding: '32px 48px',
      height: '100%'
    },

    table: { marginBottom: '16px' }
  };

  return (
    <Box sx={style.container}>
    <Paper elevation={8} sx={style.paper}>

      <div id="developers_IPCColor">
        <T variant="h5">IPCColor: Object</T>
        <Divider sx={{marginBottom: '16px'}} />

        <T paragraph={true}>IPCColor is an object representing an enumeration of indexes used to define a specific color. The actual RGBA color value can be accssed
           when IPCColor is used in conjunction with IPCRGBA.</T>

        <T variant="h6">Properties</T>
        <Divider sx={{marginBottom: '16px'}}/>

        <T>White</T>
        <T>BlueGrey</T>
        <T>MidnightBlue</T>
        <T>Blue</T>
        <T>DarkBlue</T>
        <T>BlueBlack</T>
        <T>Icy</T>
        <T>Pale</T>
        <T>Beige</T>
        <T>Golden</T>
        <T>Tan</T>
        <T>LightBrown</T>
        <T>Brown</T>
        <T>DarkBrown</T>
        <T>Obsidian</T>
        <T>Red</T>
        <T>Grey</T>
        <T>Black</T>
        <T>Ice</T>
        <T>Green</T>
        <T>ForestGreen</T>
        <T>DarkBlueGreen</T>
        <T>BlueGreen</T>
        <T>PaleGreen</T>
        <T>Purple</T>
        <T>Orange</T>
        <T>Gold</T>
        <T>Amber</T>
        <T>DarkGrey</T>
        <T>LightYellow</T>
        <T>Yellow</T>
        <T>DarkYellow</T>
        <T>Platinum</T>
        <T>Blonde</T>
        <T>Auburn</T>
        <T>DarkRed</T>
        <T>MarbledWhite</T>
        <T>MarbledBlack</T>

        <br />
        <T variant="h6">Example</T>
        <Divider sx={{marginBottom: '16px'}}/>

        <Code>
          let rgba = IPCLIb.IPCRGBA[<B>IPCLib.IPCColor.White</B>];
          <Comment>// The code above is equivalent to the following:</Comment>
          let rgba = &#123; red: 255, green: 255, blue: 255, alpha: 255 &#125;;
        </Code>

        <br /><T sx={{fontStyle: 'italic'}}>See also: IPCRGBA</T>
      </div> 

      <br />
      <div id="developers_IPCRGBA">
        <Divider textAlign="left" sx={{marginBottom: '16px'}}>
          <T variant="h5">IPCRGBA: Array</T>
        </Divider>

        <T paragraph={true}>IPCRGBA is an array of rgba objects representing a specific color.</T>

        <Code>
          let rgba = IPCLIb.IPCRGBA[<B>IPCLib.IPCColor.White</B>];
          <Comment>// The code above is equivalent to the following:</Comment>
          let rgba = &#123; red: 255, green: 255, blue: 255, alpha: 255 &#125;;
        </Code>

        <T paragraph={true} sx={{fontStyle: 'italic'}}>See also: IPCColor</T>
      </div> 

      <br />
      <div id="developers_IPCRGBA">
        <Divider textAlign="left" sx={{marginBottom: '16px'}}>
          <T variant="h5">ipc_calculate_attributes: Function</T>
        </Divider>

        <T paragraph={true}>A function that decodes an encrypted 256 keccak string and returns an array representing an IPC's attributes.</T>

        <T variant="h6">Format</T>
        <Divider sx={{marginBottom: '16px'}}/>

        <Box sx={style.code}>
            function <B>ipc_calculate_attributes</B>(
            <br /> &nbsp;&nbsp; <B>attribute_seed</B>: Keccak256 &lt;String&gt;
            <br />): Array &lt;UInt8&gt;
        </Box>

        <T variant="h6">Parameters</T>
        <Divider sx={{marginBottom: '16px'}}/>

        <T><B>attribute_seed - Keccak256 &lt;String&gt;</B></T>
        <T sx={{margin: '8px 0px 0px 16px'}}>A encrypted string representing an IPC's attrbitues.</T>

        <br /><T variant="h6">Return Values</T>
        <Divider sx={{marginBottom: '16px'}}/>

        <Paper evlevation={1} sx={style.table}>
          <Table>
            <TableRow>
              <TableCell>Array Index</TableCell>
              <TableCell>Array Property</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Array[0]</TableCell>
              <TableCell>Force</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Array[1]</TableCell>
              <TableCell>Sustain</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Array[2]</TableCell>
              <TableCell>Tolerance</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Array[3]</TableCell>
              <TableCell>Speed</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Array[4]</TableCell>
              <TableCell>Precision</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Array[5]</TableCell>
              <TableCell>Reaction</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Array[6]</TableCell>
              <TableCell>Memory</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Array[7]</TableCell>
              <TableCell>Processing</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Array[8]</TableCell>
              <TableCell>Reasoning</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Array[9]</TableCell>
              <TableCell>Healing</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Array[10]</TableCell>
              <TableCell>Fortitude</TableCell>
            </TableRow>
          </Table>
        </Paper>

        <T variant="body2" sx={{margin: '8px 0px 0px 16px'}}>Returns an array of values representing an IPC's attributes.</T>

        <Code>
          let rgba = <B>IPCLIb.IPCRGBA[</B>IPCLib.IPCColor.White<B>]</B>;
          <Comment>// The code above is equivalent to the following:</Comment>
          let rgba = &#123; red: 255, green: 255, blue: 255, alpha: 255 &#125;;
        </Code>

        <T sx={{fontStyle: 'italic'}}>See also: IPCColor</T>
      </div> 

    </Paper>
    </Box>
  );
}
