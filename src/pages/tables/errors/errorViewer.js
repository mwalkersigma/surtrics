import React from "react";
import {useSession} from "next-auth/react";
import {Group, Title} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import useUpdates from "../../../modules/hooks/useUpdates";
import {TableSort} from "../../../components/mantine/TableSort";





const SurplusNotableEvents = () => {
    const {data} = useSession();
    const [dateRange, setDateRange] = React.useState([new Date(), new Date()]) // [start, end]
    const [startDate,endDate] = dateRange;
    const name = data?.user?.name
    const errors = useUpdates('/api/views/errors',{name,startDate,endDate});

    if(!errors.length > 0) return (<>
        <Group justify={'space-between'}>
            <Title> Surplus User Errors </Title>
            <DatePickerInput
                type={'range'}
                placeholder={'Start Date'}
                value={dateRange}
                onChange={setDateRange}
                label={'Date Range'}
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
                <DatePickerInput
                    type={'range'}
                    placeholder={'Start Date'}
                    value={dateRange}
                    onChange={setDateRange}
                    label={'Date Range'}
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