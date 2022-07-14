import { createTheme, styled } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'poppins, sans-serif'
  },

  palette: {
    primary: {
      main: '#444455'
    },
    secondary: {
      main: '#ccccdd'
    },

    background: {
      default: '#ccccdd'
    }
  },

  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: '#777788' },
        arrow: { color: '#777788' }
      }
    },

    MuiAccordionSummary: { 
      styleOverrides: { 
        root: { padding: 0 },
        content: { padding: 0 }
      }
    }
  }
});

export default theme;
