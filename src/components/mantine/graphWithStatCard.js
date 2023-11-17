import React from 'react';
import {Container, Grid, Skeleton, Stack, Title} from "@mantine/core";


const GraphWithStatCard = ({isLoading, dateInput, cards, children, title, slotOne, slotTwo}) => {
    const height = 65;
    if (isLoading) {
        return <Container fluid>
            <Title ta={"center"}>{title}</Title>
            <Grid spacing={"xl"}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={3}>
                    {dateInput}
                </Grid.Col>
                <Grid.Col span={3}>{slotOne}</Grid.Col>
                <Grid.Col span={3}>{slotTwo}</Grid.Col>
            </Grid>
            <Grid spacing={"xl"}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={9}>
                    <Skeleton height={`${height}vh`} radius="md" animate={true}/>
                </Grid.Col>
                <Grid.Col span={2}>
                    <Stack>
                        {cards.map((_, i) => {
                            return <Skeleton key={i} height={`${height / 5 - 1}vh`} radius="md" animate={true}/>
                        })}
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    }
    return (
        <Container fluid>
            <Title ta={"center"}>{title}</Title>
            <Grid spacing={"xl"}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={3}>
                    {dateInput}
                </Grid.Col>
                <Grid.Col span={3}>{slotOne}</Grid.Col>
                <Grid.Col span={3}>{slotTwo}</Grid.Col>
                <Grid.Col span={2}></Grid.Col>
            </Grid>
            <Grid spacing={"xl"} style={{}}>
                <Grid.Col span={1}></Grid.Col>
                <Grid.Col span={9}>
                    <div style={{position: "relative", height: "100%", minHeight: `${height}vh`}}
                         className={"chart-container"}>
                        {children}
                    </div>
                </Grid.Col>
                <Grid.Col span={2}>
                    <Stack style={{height:"100%"}} justify={"space-between"} align={"space-between"}>
                        {cards}
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default GraphWithStatCard;