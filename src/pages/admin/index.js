import React from 'react';
import settings from "../../json/settings.json";
import RoleWrapper from "../../components/RoleWrapper";
import {
    Container,
    Title,
    Stack,
    Grid,
    NativeSelect, RingProgress, Text, Divider, Space
} from "@mantine/core";
import useFrequency from "../../modules/hooks/useFrequency";
import useUsage from "../../modules/hooks/useUsage";
import useUpdates from "../../modules/hooks/useUpdates";
import {colorScheme} from "../_app";
import {TableSort} from "../../components/mantine/TableSort";
const {frequencies} = settings;


function UsageMeter({usage}){
    let sections = Object.keys(usage);
    let dataForRings = sections.reduce((acc,section)=>{
        let sectionData = usage[section];
        let keys = Object.keys(sectionData);
        let sectionTotal = keys.reduce((acc,key)=>{
            acc += sectionData[key];
            return acc;
        },0);
        acc[section] = keys.map((key)=>{
            return {
                label:key,
                value:Math.round(sectionData[key]/sectionTotal * 100),
                color:colorScheme.random(),
                tooltip:`${key}: ${sectionData[key]}`
            }
            })
        return acc;
    },{})
    let totalUsage = sections.reduce((acc,section)=>{
        let sectionData = usage[section];
        let keys = Object.keys(sectionData);
        acc[section] = keys.reduce((acc,key)=>{
            acc += sectionData[key];
            return acc;
        },0);
        return acc;
    },{});
    totalUsage["Total Usage"] = Object.values(totalUsage).reduce((acc,value)=>{
        acc += value;
        return acc;
    },0);

    dataForRings["Total Usage"] =
        Object.keys(totalUsage).map((key)=>{
            return {
                label:key,
                value:Math.round(totalUsage[key]/totalUsage["Total Usage"] * 100),
                color:colorScheme.random(),
                tooltip:`${key}: ${totalUsage[key]}`
            }
        })
    dataForRings["Total Usage"].pop()
    sections.push("Total Usage");
    let gridWidth = 12 / sections.length;
    return (
        <Grid>
            {
                sections.map((section)=>{
                    return (
                        <Grid.Col key={section} span={gridWidth}>
                            <RingProgress
                                size={200}
                                label={<Text ta={"center"} size={"sm"}>{section}</Text>}
                                sections={dataForRings[section]}
                            />
                        </Grid.Col>
                    )
                })
            }
        </Grid>
    )
}

function UsageTable({usage}){
    const results = Object.keys(usage).map((section)=>{
         const sectionData = usage[section];
         const keys = Object.keys(sectionData);
        return keys.map((key)=>{
            return {
                section,
                key,
                value:sectionData[key]
            }
        })
    })
        .flat()
    return <TableSort
        data={results}
        />
}



const Index = () => {
    useUsage("Admin","Home")
    const frequency = useFrequency();
    const usage = useUpdates("/api/usage");



    function handleNowUpdate(key,value){
        let route = key === "weeklyGoal" ? "setGoal" : "setFrequencies";
        fetch(`${window.location.origin}/api/admin/${route}`,{
            method:"POST",
            body:JSON.stringify({value})
        })
            .then((res)=>{console.log(res)});
    }

    return (
        <RoleWrapper altRoles={"surplus director"}>
            <Container>
                <Title ta={"center"} mb={'xl'}>Admin Page</Title>
                <Stack mb={'xl'}>
                    <Grid>
                        <Grid.Col span={4}>
                            <NativeSelect
                                label={"Update Frequency"}
                                description={"This is the frequency that the data will be updated"}
                                onChange={(e)=>handleNowUpdate("frequency",e.target.value)}
                                data={frequencies}
                                value={frequency}
                            />
                        </Grid.Col>
                    </Grid>
                </Stack>
                <Title  mb={'xl'} order={2} >Usage Statistics</Title>
                <UsageMeter usage={usage}/>
                <Divider mt={'xl'} mb={'xl'}/>
                {/*<TableSort*/}
                {/*    data={*/}

                {/*    }*/}

                <UsageTable usage={usage}/>
                <Space mt={'xl'} mb={'xl'}/>
                <Space mt={'xl'} mb={'xl'}/>

            </Container>
        </RoleWrapper>
    );
};

export default Index;