import {Chart} from "react-chartjs-2";
import React from "react";

import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    Colors
} from "chart.js";

import {colorScheme} from "../pages/_app";
import {useMantineColorScheme} from "@mantine/core";
import {mergeAdvanced} from "object-merge-advanced";

import DataLabels from "chartjs-plugin-datalabels";
import annotationPlugin from 'chartjs-plugin-annotation';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    LineElement,
    DataLabels,
    PointElement,
    annotationPlugin,
    Colors
);

export default function BaseChart ({stacked,config,data,events,customColors}) {
    const {colorScheme:mantineColorScheme} = useMantineColorScheme();
    const theme = mantineColorScheme === "dark" ? colorScheme['white'] : colorScheme['dark'];
    let options = {
        devicePixelRatio: 4,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels:{
                display: false,
            },
            colors: {
                enabled: true,
                forceOverride: true
            },
            legend: {
                position: 'top',
                color: theme,
                labels:{
                    color: theme + "A",
                }
            },
        },
        scales:{
            y: {
                min: 0,
                ticks: {
                    color: theme + "A"
                },
                grid: {
                    color: theme + "3"
                }
            },
            x:{
                ticks: {
                    color: theme + "A"
                },
                grid: {
                    color: theme + "3"
                }
            }
        }
    };
    if(stacked){
        options.interaction = {
            mode: 'index',
            intersect: false,
        }
    }
    if(events){
        options.plugins = mergeAdvanced(options.plugins,{
            annotation: {
                annotations: events,
            }
        })
    }
    if(config?.plugins?.annotation){
        console.log("config",config.plugins.annotation)

    }
    if(customColors){
        options.plugins.colors.forceOverride = false;
    }

    options = mergeAdvanced(options,config);
    console.log("options",options.plugins.annotation)
    // console.log(JSON.stringify(config,null,2))
    // console.log(JSON.stringify(options,null,2))
    return (
        <Chart data={data} options={options} />
    )
}