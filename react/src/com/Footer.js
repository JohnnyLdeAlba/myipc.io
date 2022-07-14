import T from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

export default function IPCFooter(props)
{
  const style = {
    footer: {
      display: 'flex',
      flexDirection: 'right',
      padding: '24px',
      backgroundColor: 'primary.main'
    },

    version: {
      flex: 1,
      fontFamily: 'poppins-semibold',
      color: 'secondary.main'
    },

    copyright: {
      fontFamily: 'poppins-semibold',
      color: 'secondary.main',
    }
  }; 

  return (
    <Box sx={ style.footer }>
      <T sx={ style.version }>Version 2.22</T>
      <T component={ Link } href="https://www.playchemy.com" sx={ style.copyright }>
        Playchemy © 2022
      </T>
    </Box>
  );
}
