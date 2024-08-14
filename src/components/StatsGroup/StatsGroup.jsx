import {Text} from '@mantine/core';
import classes from './StatsGroup.module.css';


export function StatsGroup({data}) {
    const stats = data.map((stat) => (
        <div key={stat.title} className={classes.stat}>
            <Text className={classes.count}>{stat.stats}</Text>
            <Text className={classes.title}>{stat.title}</Text>
            <Text className={classes.description}>{stat.description}</Text>
        </div>
    ));
    return <div className={classes.root}>{stats}</div>;
}