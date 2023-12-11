import React, {useState} from "react";
import {useSession} from "next-auth/react";
import {Group, Title} from "@mantine/core";
import useUpdates from "../../../modules/hooks/useUpdates";
import {TableSort} from "../../../components/mantine/TableSort";
import CustomRangeMenu from "../../../components/mantine/customRangeMenu";
import useUsage from "../../../modules/hooks/useUsage";





const SurplusNotableEvents = () => {
    useUsage("Metrics","UserErrors-RangeView-table")
    const {data,status} = useSession();
    const [dateRange, setDateRange] = useState([new Date(), new Date()]) // [start, end]
    const [startDate,endDate] = dateRange;
    const name = data?.user?.name
    const errors = useUpdates('/api/views/errors',{name,startDate,endDate});

    let isLoggedIn = status !== 'unauthenticated';

    if(!isLoggedIn) return (<>You must be logged in to view this page</>)

    if(!errors.length > 0) return (<>
        <Group justify={'space-between'}>
            <Title> Surplus User Errors </Title>
            <CustomRangeMenu
                label={'Date Range'}
                subscribe={setDateRange}
                defaultValue={dateRange}
            />
        </Group>
        <p>
            Loading...
            <br/>
            (If this message persists, there may be no errors in the selected date range)
        </p>
    </>)

    return (
        <>
            <Group justify={'space-between'} mb={'xl'}>
                <Title > Surplus User Errors </Title>
                <CustomRangeMenu
                    label={'Date Range'}
                    subscribe={setDateRange}
                    defaultValue={dateRange}
                />
            </Group>

            <TableSort
                data={
                    errors?.map((error) => {
                        return {
                            id: error.id,
                            date: error.transaction_date,
                            error_type: error.transaction_reason,
                            error_message: error.transaction_note,
                        }
                    })
                }
            />
        </>)
};

export default SurplusNotableEvents;