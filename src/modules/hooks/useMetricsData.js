import {useQueries} from "@tanstack/react-query";

export default function useMetricsData(config) {
    let baseStates = {
        loadingStates: {},
        data: {}
    }
    let metricsToProcess = new Set();
    for (let metric of config) {
        let loadingGroup = metric?.loadingGroup;
        let dataUrl = metric?.dataUrl;
        if (!loadingGroup || !dataUrl) {
            console.log("Invalid Metric Config: ", metric)
            continue;
        }
        let entry = JSON.stringify({loadingGroup, dataUrl});
        metricsToProcess.add(entry);
        baseStates.loadingStates[loadingGroup] = true;
        baseStates.data[loadingGroup] = null;
    }

    return useQueries({
        queries: Array
            .from(metricsToProcess)
            .map(entry => JSON.parse(entry))
            .map((metric) => ({
                queryKey: [metric.loadingGroup],
                queryFn: async () => {
                    let metricData = await fetch(metric.dataUrl).then(res => res.json())
                    return {name: metric.loadingGroup, metricData}
                }
            })),
        combine: (results) => {
            let result = {
                loadingStates: {
                    allLoaded: !results.every(({isPending}) => !isPending),
                    anyLoaded: !results.some(({isPending}) => !isPending),
                    ...baseStates.loadingStates
                },
                data: {
                    ...baseStates.data
                }
            };

            for (let entry of results) {
                if (!entry?.data) continue;
                let {name, metricData} = entry['data'];
                result.loadingStates[name] = false;
                result.data[name] = metricData;
            }
            return result
        }

    })
}