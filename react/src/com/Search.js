import React from 'react';

import { styled } from "@mui/material/styles";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import Input from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';

import IPCUI from '../lib/IPCUI';
import IPCInstance from '../lib/IPCInstance';

import config from '../config.js';

function getDefaultStyle() {

  return {

    container: {

      position: 'relative',
      display: 'none',
      flexDirection: 'row',
      borderRadius: '16px',
      backgroundColor: '#bbbbcc',

      '&:hover': { backgroundColor: '#ccccdd' },
      '@media (min-width: 800px)': { display: 'flex' }
    },

    searchIconWrapper: {

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0px 16px 16px 0px',
      backgroundColor: '#aaaabb',
      color: '#444455'
    },

    cancelButton: {

      cursor: 'pointer',
      color: '#444455',

      '.MuiSvgIcon-root': {

        position: 'absolute',
        top: '8px',
        right: '72px'
      }
    },

    searchInput: {

      '& .MuiInputBase-input': {

        padding: '8px 38px 8px 16px',
        width: '270px',
        fontSize: '14px',
        color: '#000000',
      }
    }
  };
}

function getWideStyle() {

  return {

    container: {

      position: 'relative',
      display: 'none',
      flexDirection: 'row',
      backgroundColor: '#bbbbcc',

      '&:hover': { backgroundColor: '#ccccdd' },
      '@media (max-width: 800px)': { display: 'flex' }
    },

    searchIconWrapper: {

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#aaaabb',
      color: '#444455',

      '.MuiButton-root': {

        height: '100%',
        borderRadius: 0 }
    },

    cancelButton: {

      cursor: 'pointer',
      color: '#444455',

      '.MuiSvgIcon-root': {

        position: 'absolute',
        top: '16px',
        right: '80px'
      }
    },

    searchInput: {
      flex: 1,
      color: '#000011',

      '& .MuiInputBase-input': {

        padding: '16px 56px 16px 16px',
        width: '100%',
        fontSize: '14px',
      }
    }
  };
}

function getStyle(wide) {

  if (wide == true)
    return getWideStyle();
  else
    return getDefaultStyle();
}

function SearchInput(props) {

  const controller = props.controller;
  const ref = React.createRef();
  const [searchValue, saveSearchValue] = React.useState("");

  controller.searchRef = ref;
  controller.searchValue = searchValue;
  controller.saveSearchValue = saveSearchValue;

  return (
    <Input
      color="primary"
      type="text"
      placeholder={props.placeholder}
      value={controller.searchValue}
      onChange={props.onChange}
      onKeyPress={props.onKeyPress}
      ref={ref}
      sx={props.sx} />
  );
}

function CancelButton(props) {

  const controller = props.controller;
  const [visible, showCancelButton] = React.useState(false);
  const display = visible ? 'block' : 'none';

  controller.showCancelButton = showCancelButton;

  const CancelIconWrapper = styled('div')(props.sx);

  return (
    <CancelIconWrapper>
      <CancelIcon
        fontSize="small"
        onClick={props.onClick}
        sx={{display: display}} />
    </CancelIconWrapper>
  );
}

function _setSearchValue(value) {

  this.searchValue = value;
  this.saveSearchValue(value);

  if (typeof this.searchRef.current.value != 'undefined')
    this.searchRef.current.value = value;

  if (value == "")
    this.showCancelButton(false);
  else
    this.showCancelButton(true);
}

function getController(instance, id) {

  if (typeof instance.controller[id] == 'undefined') {

    const controller = {

      searchRef: null,
      searchValue: "",
      saveSearchValue: null,
      showCancelButton: null,

      setSearchValue: _setSearchValue
    };

    instance.controller[id] = controller;
  }

  return instance.controller[id]
}

function getSearchInputOnChange(instance, controller) {
  return (event) => {
      controller.setSearchValue(event.target.value);
  };
}

function getSearchInputOnKeyPress(instance, controller) {

  return (event) => {
    if (event.key === "Enter" || event.keyCode === 13)
      window.location.href = controller.searchValue;
  };
}

function getCancelButtonOnClick(controller) {
  return () => { controller.setSearchValue(""); };
}

function getSearchButtonOnClick(instance, controller) {
  return () => { window.location.href = controller.searchValue; };
}

function getId(id, wide) {

  if (typeof id == 'undefined') {

    if (wide == true)
      return 'IPCSearchWide';
    else
      return 'IPCSearch';
  }
  else return id;
}

export default function Search(props) {

  const instance = React.useContext(IPCInstance.IPCContext);

  const id = getId(props.id, props.wide);
  const style = getStyle(props.wide);

  const controller = getController(instance, id);

  const searchInputOnKeyPress = getSearchInputOnKeyPress(instance, controller);
  const searchInputOnChange = getSearchInputOnChange(instance, controller);
  const searchButtonOnClick = getSearchButtonOnClick(instance, controller);
  const cancelButtonOnClick = getCancelButtonOnClick(controller);

  const SearchContainer = styled('div')(style.container);
  const SearchIconWrapper = styled('div')(style.searchIconWrapper);

  return (
    <SearchContainer>
      <SearchInput
        controller={controller}
        placeholder="Search by IPC Token ID/Wallet Address"
        onChange={searchInputOnChange}
        onKeyPress={searchInputOnKeyPress}
        sx={style.searchInput} />

      <CancelButton
        controller={controller}
        onClick={cancelButtonOnClick}
        sx={style.cancelButton} />
      
      <SearchIconWrapper>
        <Button
          variant="secondary"
          onClick={searchButtonOnClick}>
          <SearchIcon />
        </Button>
      </SearchIconWrapper>
    </SearchContainer>
  );
}
