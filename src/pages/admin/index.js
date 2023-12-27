import React from 'react';
import RoleWrapper from "../../components/RoleWrapper";
import {
    Container,
    Title,
    Grid,
    RingProgress,
    Text,
    Divider,
    Space
} from "@mantine/core";
import useFrequency from "../../modules/hooks/useFrequency";
import useUsage from "../../modules/hooks/useUsage";
import useUpdates from "../../modules/hooks/useUpdates";
import {colorScheme} from "../_app";
import {TableSort} from "../../components/mantine/TableSort";



function UsageMeter({usage}){
    let sections = Object.keys(usage);
    let dataForRings = sections.reduce((acc,section)=>{
        let sectionData = usage[section];
        let keys = Object.keys(sectionData);
        let sectionTotal = keys.reduce((acc,key)=>{
            acc += sectionData[key];
            return acc;
        },0);
        acc[section] = keys.map((key,index)=>{
            return {
                label:key,
                value:Math.round(sectionData[key]/sectionTotal * 100),
                color:colorScheme.byIndex(index),
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
        Object.keys(totalUsage).map((key,index)=>{
            return {
                label:key,
                value:Math.round(totalUsage[key]/totalUsage["Total Usage"] * 100),
                color:colorScheme.byIndex(index),
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





    return (
        <RoleWrapper altRoles={"surplus director"}>
            <Container>
                <Title ta={"center"} mb={'xl'}>Admin Page</Title>

                <Title  mb={'xl'} order={2} >Usage Statistics</Title>
                {usage && <UsageMeter usage={usage}/>}
                <Divider mt={'xl'} mb={'xl'}/>
                {usage && <UsageTable usage={usage}/>}

                <Space mt={'xl'} mb={'xl'}/>
                <Space mt={'xl'} mb={'xl'}/>

            </Container>
        </RoleWrapper>
    );
};

export default Index;