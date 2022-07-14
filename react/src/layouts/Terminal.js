import React from 'react';

import { styled } from "@mui/material/styles";
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';

import Container from '../com/Container';
import Card from '../cards/IPCCard';

import getContext from '../context';

export default function Terminal(props) {

  const terminal = getContext().getTerminal();

  const style = {

    card: {
      margin: '0px auto',
      padding: '16px',
      width: '100%',
      maxWidth: '800px'
    },

    content: {
      display: 'flex',
      flexDirection: 'column-reverse',
      overflowY: 'auto',
      height: '400px',
      padding: '16px',
      backgroundColor: '#000000',
      fontFamily: 'apple2',
      fontSize: '12px',
      color: '#888888',

      wordBreak: 'break-all',
      overflowWrap: 'break-word'
    },

    hiddenInput: {
      position: 'fixed',
      top: '0px',
      left: '0px',
      zIndex: '-1'
    }
  };

  const Display = Box;
  const inputRef = React.createRef();
  const hiddenInputRef = React.createRef();

  const onKeyDown = (event) => terminal.enterKeyDown(event.key);

  const onChange = (event) => {

    terminal.extractKey(event.target.value);
    event.target.value = " ";
  }

  const onFocus = () => {

    inputRef.current.style.color = "#cccccc"; 
    terminal.focus();
  }

  const onBlur = () => {

    inputRef.current.style.color = "#666666"; 
    terminal.blur();
  }

  const onClick = () => hiddenInputRef.current.focus({ preventScroll: true });

  React.useEffect(() => {

    terminal.displayCallback = () => {
      inputRef.current.innerHTML = terminal.output;
    };

    terminal.blur();
    inputRef.current.blur();
  });

  return (
    <Container>
      <InputBase
        type="text"
        inputRef={ hiddenInputRef }
        onKeyDown={ onKeyDown }
        onChange={ onChange }
        onFocus={ onFocus }
        onBlur={ onBlur }
        sx={ style.hiddenInput }
      />
      <Card caption="Terminal" sx={ style.card }>
        <Display
          onClick={ onClick }
          ref={ inputRef }
          sx={ style.content }>
        </Display>
      </Card>
    </Container>
  );
}
