import React from 'react';
import {Container, Grid, Paper, Skeleton, Stack, Title} from "@mantine/core";


const GraphWithStatCard = ({isLoading, dateInput, cards, children, title, slotOne, slotTwo}) => {
    const height = 65;
    if (isLoading) {
        return <Container fluid>
            <Title mb={"md"} ta={"center"}>{title}</Title>
            <Grid spacing={"xl"}>
                {cards?.length > 0 && (
                    <>
                        <Grid.Col span={1}></Grid.Col>
                        <Grid.Col span={3}>
                            {dateInput}
                        </Grid.Col>
                        <Grid.Col span={3}>{slotOne}</Grid.Col>
                        <Grid.Col span={3}>{slotTwo}</Grid.Col>
                        <Grid.Col span={2}></Grid.Col>
                    </>
                )}
                {(cards?.length === 0 || !cards) && (
                    <>
                        <Grid.Col span={4}>
                            {dateInput}
                        </Grid.Col>
                        <Grid.Col span={4}>{slotOne}</Grid.Col>
                        <Grid.Col span={4}>{slotTwo}</Grid.Col>
                    </>
                )}
            </Grid>
            <Grid spacing={"xl"}>
                {
                    cards?.length > 0 &&
                    <>
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
                    </>
                }
                {
                    (cards?.length === 0 || !cards) &&
                    <Grid.Col span={12}>
                        <Skeleton height={`${height}vh`} radius="md" animate={true}/>
                    </Grid.Col>
                }


            </Grid>
        </Container>
    }
    return (
        <Container fluid>
            <Title mb={"md"} ta={"center"}>{title}</Title>
            <Grid spacing={"xl"}>
                {cards?.length > 0 && (
                    <>
                        <Grid.Col span={1}></Grid.Col>
                        <Grid.Col span={3}>
                            {dateInput}
                        </Grid.Col>
                        <Grid.Col span={3}>{slotOne}</Grid.Col>
                        <Grid.Col span={3}>{slotTwo}</Grid.Col>
                        <Grid.Col span={2}></Grid.Col>
                    </>
                )}
                {(cards?.length === 0 || !cards) && (
                    <>
                        <Grid.Col span={4}>
                            {dateInput}
                        </Grid.Col>
                        <Grid.Col span={4}>{slotOne}</Grid.Col>
                        <Grid.Col span={4}>{slotTwo}</Grid.Col>
                    </>
                )}
            </Grid>
            <Grid spacing={"xl"} style={{}}>
                {
                    cards?.length > 0 &&
                    <>
                        <Grid.Col span={1}></Grid.Col>
                        <Grid.Col span={9}>
                            <Paper style={{height: "100%", minHeight: `${height}vh`}} radius={"md"} shadow={"md"} p={5} withBorder>
                                {children}
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <Stack style={{height:"100%"}} justify={"space-between"} align={"space-between"}>
                                {cards}
                            </Stack>
                        </Grid.Col>
                    </>
                }
                {
                    (cards?.length === 0 || !cards) &&
                    <Grid.Col span={12}>
                        <Paper style={{height: "100%", minHeight: `${height}vh`}} radius={"md"} shadow={"md"} p={5} withBorder>
                            {children}
                        </Paper>
                    </Grid.Col>
                }
            </Grid>
        </Container>
    );
};

export default GraphWithStatCard;