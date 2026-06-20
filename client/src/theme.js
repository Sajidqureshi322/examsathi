import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#C68B59',
      light: '#E6CCB2',
      dark: '#7F5539',
      contrastText: '#1A110B',
    },
    secondary: {
      main: '#E07A5F',
      light: '#F2A18F',
      dark: '#B04D36',
      contrastText: '#FFFFFF',
    },
    success: { main: '#2ECC71' },
    warning: { main: '#F39C12' },
    error: { main: '#E74C3C' },
    background: {
      default: '#0B0806',
      paper: '#171310',
    },
    text: {
      primary: '#F5EBE0',
      secondary: '#BCAAA4',
    },
    divider: '#2D221B',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)' },
      },
    },
  },
});

export default theme;
