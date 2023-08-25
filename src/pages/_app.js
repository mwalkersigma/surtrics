import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from "./layout";
export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return getLayout(<Component {...pageProps} />)
}
