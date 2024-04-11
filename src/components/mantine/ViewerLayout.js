import {Container, Grid, Skeleton, Title} from "@mantine/core";
import React from "react";

export default function ViewerLayout({children, isLoading, title}) {
    if( isLoading )return (
        <Grid w={'100%'}>
            <Grid.Col span={12}>
                <Title>{title}</Title>
            </Grid.Col>
            <Grid.Col span={12}>
                <Skeleton height={600} />
            </Grid.Col>
        </Grid>
    )
    return (
        <Container fluid>
            <Grid w={'100%'}>
                <Grid.Col span={12}>
                    <Title>{title}</Title>
                </Grid.Col>
                <Grid.Col w={'100%'} span={12}>
                    {children}
                </Grid.Col>
            </Grid>
        </Container>

    )
}