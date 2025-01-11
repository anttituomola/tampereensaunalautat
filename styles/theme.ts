import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    primary: {
      main: '#2c5282', // A deep blue that works well with saunas/water theme
      light: '#4299e1',
      dark: '#1a365d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#38a169', // A forest green as secondary color
      light: '#48bb78',
      dark: '#276749',
      contrastText: '#ffffff',
    },
    error: {
      main: '#e53e3e',
      light: '#fc8181',
      dark: '#c53030',
    },
    text: {
      primary: '#2d3748',
      secondary: '#4a5568',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '6px',
        },
      },
    },
  },
});