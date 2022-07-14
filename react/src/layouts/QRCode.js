import React from 'react';
import { styled } from "@mui/material/styles";

import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';

import Stack from '@mui/material/Stack';

import T from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import InputBase from '@mui/material/InputBase';
import Button from '@mui/material/Button';

import QRScanner from 'qr-scanner';

import MainContainer from '../com/Container';
import IPCCard from '../cards/IPCCard';
import IPCLib from '../lib/IPCLib';
import IPCEng from '../lib/IPCEng';
import IPCUILib from '../lib/IPCUI';
import WalletUI from '../lib/IPCWalletUI';
import IPCInstance from '../lib/IPCInstance';

import config from '../config';

function uploadButtonClick() {
  document.getElementById('file_selector').click();
}

async function fileSelected(event, instance) {

  const file = event.target.files[0];
  if (!file) return;

  instance.showBackdrop(true);

  let address = await QRScanner.scanImage(file, { returnDetailedScanResult: true })
    .then(res => res.data)
    .catch(error => null);

  instance.showBackdrop(false);

  if (address == null) {
    instance.showAlert(
      "QR Reading Error",
      "Unable to read QR Code");

    return;
  }

  instance.route(address);
}

function addFileSelected(component) {
  return (event) => { fileSelected(event, component); };
}

export default function QRCodeLayout(props) {

  const instance = React.useContext(IPCInstance.IPCContext);

  const style = {

    container: {
      margin: '0px auto',
      padding: '16px',
      width: '100%',
      maxWidth: '600px'
    }
  };

  const Container = styled('div')(style.container);

  return (
    <MainContainer>
    <Container>
      <IPCCard caption="QR Code Reader">
        <CardContent sx={{textAlign: 'center'}}>
          <InputBase
            id="file_selector"
            type="file"
            onChange={addFileSelected(instance)}
            sx={{display: 'none'}} />
          <Button variant="contained" onClick={uploadButtonClick}>
            Upload QR Code</Button>
        </CardContent>
      </IPCCard>
    </Container>
    </MainContainer>
  );
}
