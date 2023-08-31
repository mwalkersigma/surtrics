import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/style.scss";
import Layout from "./layout";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale, LineController, LineElement, PointElement,
  Title,
  Tooltip
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
    CategoryScale, LinearScale,
    BarElement, Title,
    Tooltip, Legend,
    Filler, LineElement,
    DataLabels,PointElement,
    BarController, LineController
);

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return getLayout(<Component {...pageProps} />)
}
