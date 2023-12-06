import React, {forwardRef, useEffect, useState} from 'react';
import {Group, Menu, Paper, ScrollArea, Stack} from "@mantine/core";
import {DatePicker, DatePickerInput} from "@mantine/dates";
import {
    addDays,
    lastDayOfMonth,
    lastDayOfYear,
    setDay,
    startOfMonth,
    startOfYear,
    subDays,
    subMonths,
    subYears
} from "date-fns";
import findStartOfWeek from "../../modules/utils/findSundayFromDate";
import {useClickOutside} from "@mantine/hooks";

const presets = [
    {
        title: "Today",
        value: [new Date(), new Date()]
    },
    {
        title: "Yesterday",
        value: [subDays(new Date(), 1), subDays(new Date(), 1)]
    },
    {
        title: "This Week",
        value: [findStartOfWeek(new Date()), new Date()]
    },
    {
        title: "Last Week",
        value: [subDays(findStartOfWeek(new Date()), 7), subDays(findStartOfWeek(new Date()),1)]
    },
    {
        title: "This Month",
        value: [setDay(new Date(),1), new Date()]
    },
    {
        title: "Last Month",
        value: [startOfMonth(subMonths(new Date(),1)), lastDayOfMonth(subMonths(new Date(),1))]
    },
    {
        title: "This Year",
        value: [startOfYear(new Date()), new Date()]
    },
    {
        title: "Last Year",
        value: [startOfYear(subYears(new Date(),1)), lastDayOfYear(subYears(new Date(),1))]
    },
]


const DateMenu = ({subscribe,defaultValue}) => {
    const [opened, setOpened] = useState(false);
    const ref = useClickOutside(() => setOpened(false));
    const [dateRange, setDateRange] = useState(defaultValue || [new Date(), new Date()]) // [start, end]


    useEffect(() => {
        if(subscribe){
            subscribe(dateRange)
        }
    }, [dateRange]);

    function CustomPicker (props) {

        const {refs, ...rest} = props;
        return (
            <Paper {...rest}>
                <DatePicker
                    ref={refs}
                    label="Date"
                    type={'range'}
                    placeholder={'Start Date'}
                    value={dateRange}
                    onChange={setDateRange}
                />
            </Paper>
        )
    }

    function PresetItem ({title,handleClick}) {
        return <Menu.Item onClick={(e)=>{
            e.preventDefault();
            setOpened(!opened)
            handleClick();
        }}>
            {title}
        </Menu.Item>
    }
    return (
        <div>
            <Menu opened={opened}>
                <Menu.Target>
                    <DatePickerInput readOnly value={dateRange} type={'range'} onClick={()=>setOpened(!opened)}>{opened ? "close" : "open"} menu </DatePickerInput>
                </Menu.Target>
                <Menu.Dropdown ref={ref} label="Dropdown">
                    <Group justify={'flex-start'} align={'flex-start'}>
                        <ScrollArea>
                            <Menu.Label>Presets</Menu.Label>
                            {presets.map((preset,i) => {
                                return <PresetItem key={i} title={preset.title} handleClick={()=>setDateRange(preset.value)}/>
                            })}
                        </ScrollArea>
                        <Stack justify={'flex-start'} align={'flex-start'}>
                            <Menu.Label>Custom Range Selector</Menu.Label>
                            <Menu.Item component={forwardRef(function CustomForwardedPicker (props, ref) {return <CustomPicker {...props} refs={ref} />})}/>
                        </Stack>
                    </Group>
                </Menu.Dropdown>
            </Menu>
        </div>
    );
};

export default DateMenu;