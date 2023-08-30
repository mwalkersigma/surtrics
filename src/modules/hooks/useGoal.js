


/*
Goals are going to be checked once a day,
they will be set from the admin menu and from there everyday at 5am the system will check if
the goal has be updated
 */


import {useEffect, useRef, useState} from "react";

async function getGoal () {
    return await fetch(`${window.location.origin}/api/getGoal`)
        .then(res => res.json())
}
function isCorrectTime () {
    return new Date().getHours() === 5;
}

export default function useGoal () {
    const [goal,setGoal] = useState(0);
    const intervalRef = useRef(null);
    useEffect(() => {
        const getGoalData = async () => {
            const { goal } = await getGoal();
            setGoal(goal);
        }
        getGoalData()
            .catch((error) => console.log(error))

        intervalRef.current = setInterval(async () => {
            if(isCorrectTime()){
                const { goal } = await getGoal();
                setGoal(goal);
            }
        }, 1000 * 60)
        return () => clearInterval(intervalRef.current)


    }, []);
    return goal
}