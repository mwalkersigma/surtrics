import "../styles/style.scss";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import Layout from "./layout";
import {SessionProvider} from "next-auth/react";
import {Notifications} from "@mantine/notifications";


export const colorScheme = {
    blue:'#0d6efd',
    indigo:'#6610f2',
    purple:'#6f42c1',
    pink:'#d63384',
    red:'#dc3545',
    orange:'#fd7e14',
    yellow:'#ffc107',
    green:"#198754",
    teal:'#20c997',
    cyan:'#0dcaf0',
    white:'#fff',
    gray:'#6c757d',
    grayDark:'#343a40',
    primary:'#0d6efd',
    secondary:'#6c757d',
    success:'#198754',
    info:'#0dcaf0',
    warning:'#ffc107',
    danger:'#dc3545',
    light:'#f8f9fa',
    dark:'#212529'
}


function Base({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return getLayout(<Component {...pageProps} />)
}
const theme = createTheme({
    /** Put your mantine theme override here */
});

export default function App ({ Component, pageProps : {session, ...pageProps}}){

    return(
        <MantineProvider theme={theme} defaultColorScheme="dark">
            <SessionProvider session={session}>
                <Notifications />
                <Base Component={Component} pageProps={pageProps}/>
            </SessionProvider>
        </MantineProvider>
    )
}





