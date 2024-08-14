import React from 'react';
import {useQuery} from "@tanstack/react-query";
import GraphWithStatCard from "../../../components/mantine/graphWithStatCard";
import {TableSort} from "../../../components/tableSort/tableSort";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import {subDays} from "date-fns";
import {Divider, Space, Tabs, Text} from "@mantine/core";
import BaseChart from "../../../components/Chart";
import dayjs from "dayjs";

function parseData(data) {
    if (!data) return {};
    return data.reduce((acc, audit) => {
        if (!acc[audit.auditor]) {
            acc[audit.auditor] = {
                name: audit.auditor,
                itemsChecked: 0,
                itemsFoundIncorrect: 0,
                ErrorsSubmitted: 0,
            };
        }

        acc[audit.auditor].itemsChecked += audit['tote_qty'];
        acc[audit.auditor].itemsFoundIncorrect += audit['tote_qty_incorrect'];
        acc[audit.auditor].ErrorsSubmitted += audit['tote_errors'].length;

        return acc;
    }, {});

}

function getDates(data) {
    if (!data) return [];
    return data.reduce((acc, {audit_date}) => {
        let date = dayjs(new Date(audit_date)).format('MM/DD/YYYY');
        if (!acc.includes(date)) {
            acc.push(date);
        }
        return acc;
    }, []);
}

function buildGraphData(data, dates, auditors) {
    if (!data) return {};
    // data -> dates -> auditor -> value

    const results = {};

    const makeDataset = (label) => {
        return {
            label,
            type: 'bar',
            stacked: true,
            data: {}
        }
    }

    auditors.forEach(auditor => {
        results[auditor] = {
            qty: makeDataset(auditor),
            incorrect: makeDataset(auditor),
            errors: makeDataset(auditor)
        }
    });

    dates.forEach(date => {
        auditors.forEach(auditor => {
            for (let audit of data) {
                let auditDate = dayjs(new Date(audit.audit_date)).format('MM/DD/YYYY');
                if (audit.auditor === auditor && auditDate === date) {
                    if (!results[auditor].qty.data[date]) {
                        results[auditor].qty.data[date] = 0;
                        results[auditor].incorrect.data[date] = 0;
                        results[auditor].errors.data[date] = 0;
                    }
                    results[auditor].qty.data[date] += audit['tote_qty'];
                    results[auditor].incorrect.data[date] += audit['tote_qty_incorrect'];
                    results[auditor].errors.data[date] += audit['tote_errors'].length;
                }

            }
            results[auditor].qty.data = Object.values(results[auditor].qty.data);
            results[auditor].incorrect.data = Object.values(results[auditor].incorrect.data);
            results[auditor].errors.data = Object.values(results[auditor].errors.data);
        });
    });


    return results;


}


const ByAuditor = () => {
    const [dateRange, setDateRange] = React.useState([subDays(new Date(), 7), new Date()]);
    const [start, end] = dateRange;
    const {data, isPending} = useQuery({
        queryKey: ['audits', start, end],
        queryFn: async () => {
            return await fetch('/api/dataEntry/audit/search?startDate=' + start.toISOString() + '&endDate=' + end.toISOString())
                .then(res => res.json())
        }
    });
    console.log(data)
    let tableData = parseData(data);
    let users = Object.keys(tableData);

    let graphLabels = getDates(data);
    let graphDataSets = buildGraphData(data, graphLabels, users);

    console.log(graphLabels)
    console.log(graphDataSets)


    return (
        <GraphWithStatCard
            title={'Audits By Auditor'}
            dateInput={
                <CustomRangeMenu
                    label={'Date Range'}
                    subscribe={setDateRange}
                    defaultValue={dateRange}
                    mb={'xl'}
                />
            }
            noBorder
        >
            <Tabs h={'40vh'} defaultValue={'quantity'}>
                <Tabs.List>
                    <Tabs.Tab value={'quantity'}>Quantity</Tabs.Tab>
                    <Tabs.Tab value={'incorrect'}>Incorrect</Tabs.Tab>
                    <Tabs.Tab value={'errors'}>Errors</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel h={'100%'} value={'quantity'}>
                    <BaseChart
                        data={{
                            labels: graphLabels,
                            datasets: Object.values(graphDataSets).map(({qty}) => qty)
                        }}
                        config={{
                            scales: {
                                y: {
                                    min: 0,
                                    max: Math.max(...Object.values(graphDataSets).map(({qty}) => Math.max(...qty.data))) * 1.4,
                                }
                            }
                        }}
                    />
                </Tabs.Panel>
                <Tabs.Panel h={'100%'} value={'incorrect'}>
                    <BaseChart
                        data={{
                            labels: graphLabels,
                            datasets: Object.values(graphDataSets).map(({incorrect}) => incorrect)
                        }}
                        config={{
                            scales: {
                                y: {
                                    min: 0,
                                    max: Math.max(...Object.values(graphDataSets).map(({incorrect}) => Math.max(...incorrect.data))) * 1.4,
                                }
                            }
                        }}
                    />
                </Tabs.Panel>
                <Tabs.Panel h={'100%'} value={'errors'}>
                    <BaseChart
                        data={{
                            labels: graphLabels,
                            datasets: Object.values(graphDataSets).map(({errors}) => errors)
                        }}
                        config={{
                            scales: {
                                y: {
                                    min: 0,
                                    max: Math.max(...Object.values(graphDataSets).map(({errors}) => Math.max(...errors.data))) * 1.4,
                                }
                            }
                        }}
                    />
                </Tabs.Panel>
            </Tabs>
            <Space mb={'xl'}/>
            <Divider size={0} variant={'dashed'} mb={'3rem'}/>
            <Divider size={1} variant={'dashed'} mb={'2.4rem'}/>
            {Object.keys(tableData).length > 0 ? <TableSort
                noSearch
                data={Object.values(tableData)}
                loading={isPending}
            /> : <Text>No Data found for the date range</Text>}


        </GraphWithStatCard>
    );
};

export default ByAuditor;