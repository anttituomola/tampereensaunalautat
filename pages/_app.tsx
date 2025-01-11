import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "components/layout/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "../styles/theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Component {...pageProps} />
        <ToastContainer />
      </Layout>
    </ThemeProvider>
  );
}

export default MyApp;
