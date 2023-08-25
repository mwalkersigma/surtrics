import React, {useEffect, useRef, useState} from 'react';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    Title,
    Tooltip
} from "chart.js";
import DataLabels from "chartjs-plugin-datalabels";
import Container from "react-bootstrap/Container";
import {Bar} from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    LineElement,
    DataLabels
);
const options = {
    plugins: {
        legend: {
            position: "top",
            align: "center",
            labels: {
                boxWidth: 20,
                usePointStyle: true,
                pointStyle: "circle",
            },
            title: {
                text: "Weekly Increments",
                display: true,
                color: "#000",
                font: {
                    size: 30,
                }
            }
        },
        scales: {
            xAxis: {
                display: false
            },
            yAxis: {
                max: 1
            }
        },
        elements: {
            bar: {
                barPercentage: 0.5,
                categoryPercentage: 0.5,
            }
        },
        datalabels: {
            color: "#FFF",
            display: (context) => context.dataset.data[context.dataIndex] > 0,
            font: {
                weight: "bold",
            },
            formatter: Math.round
        }
    }
}

function colorize(ctx) {
    const increments = ctx?.parsed?.y;
    const goal = 483;
    return increments < goal ? "#d00d0d" : "#00ad11";
}


function WeeklyView() {
    const [weekData, setWeekData] = useState([])
    const intervalRef = useRef(null);

    const getTransactions = () => {
        return fetch(`${window.location.origin}/api/views/weeklyView`)
            .then((response) => response.json())
            .then((data) => setWeekData(data));
    }
    useEffect(() => {
        getTransactions()
            .catch((error) => console.log(error))

        intervalRef.current = setInterval(getTransactions, 1000 * 60)

        return () => clearInterval(intervalRef.current)

    }, [])



    const data = weekData.length > 0 && {
        labels: weekData?.map(({transaction_date}) => (transaction_date.split("T")[0])),
        datasets: [
            {
                label: "Days",
                data: weekData?.map(({count}) => (count)),
                backgroundColor: colorize,
                barThickness: 75,
                borderRadius: 10,
            },
        ]
    };

    return (
        <main>
            <Container>
                {weekData.length > 0 && <Bar data={data} height={150} options={options}/>}
            </Container>
        </main>
    )
}

export default WeeklyView;