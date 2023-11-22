import {Grid, Skeleton, Title} from "@mantine/core";
import React from "react";

export default function ViewerLayout({children, isLoading, title}) {
    if( isLoading )return (
        <Grid>
            <Grid.Col span={12}>
                <Title>{title}</Title>
            </Grid.Col>
            <Grid.Col span={12}>
                <Skeleton height={600} />
            </Grid.Col>
        </Grid>
    )
    return (
        <Grid>
            <Grid.Col span={12}>
                <Title>{title}</Title>
            </Grid.Col>
            <Grid.Col span={12}>
                {children}
            </Grid.Col>
        </Grid>
    )
}