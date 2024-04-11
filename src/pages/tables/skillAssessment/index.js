import React, {useState} from "react";
import {useSession} from "next-auth/react";
import {Container, Group, Paper, Title} from "@mantine/core";
import useUpdates from "../../../modules/hooks/useUpdates";
import {TableSort} from "../../../components/mantine/TableSort";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import useUsage from "../../../modules/hooks/useUsage";
import {subDays} from "date-fns";
import {LineChart} from "@mantine/charts";
import dayjs from "dayjs";


const SurplusNotableEvents = () => {
    useUsage("Metrics", "UserSkillAssessment-RangeView-table")
    const {data, status} = useSession();
    const [dateRange, setDateRange] = useState([subDays(new Date(), 30), new Date()]) // [start, end]
    const [startDate, endDate] = dateRange;
    const name = data?.user?.name
    const skillAssessments = useUpdates('/api/views/skillAssessment', {
        name,
        startDate,
        endDate
    });
    let isLoggedIn = status !== 'unauthenticated';

    if (!isLoggedIn) return (<>You must be logged in to view this page</>)



    return (
        <>
            <Group justify={'space-between'} mb={'xl'}>
                <Title> My Assessments </Title>
                <CustomRangeMenu
                    label={'Date Range'}
                    subscribe={setDateRange}
                    defaultValue={dateRange}
                />
            </Group>
            {skillAssessments.length === 0 && <>
                <p>
                    Loading...
                    <br/>
                    (If this message persists, there may be no errors in the selected date range)
                </p>
            </>}
            {skillAssessments.length > 0 && <>
                <Paper withBorder my={'lg'} pr={'2rem'} py={'2rem'}>
                    <LineChart
                        h={300}
                        data={skillAssessments
                            .sort((a, b) => new Date(a['transaction_date']) - new Date(b['transaction_date']))
                            .map((error) => ({
                                    date: dayjs(new Date(error['transaction_date'])).format("MM-DD-YYYY"),
                                    score: error.score,
                                })
                            )
                        }
                        dataKey={'date'}
                        withLegend
                        series={[
                            {name:'score', color: 'blue',},
                        ]}

                    />
                </Paper>
                <TableSort
                    noDisplay={["id"]}
                    data={
                        skillAssessments?.map((error) => {
                            return {
                                id: error.id,
                                date: error['transaction_date'],
                                assessment_notes: error['transaction_note'],
                                score: error.score,
                            }
                        })
                    }
                />
            </>}
        </>)
};

export default SurplusNotableEvents;