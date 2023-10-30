


/*
Goals are going to be checked once a day,
they will be set from the admin menu, and from there every day at 5am the system will check if
the goal has been updated
 */


import {useEffect, useRef, useState} from "react";


async function getGoal () {
    return await fetch(`${window.location.origin}/api/admin/goal`)
        .then(res => res.json())
}
async function getGoalForDate (date) {
    return await fetch(`${window.location.origin}/api/admin/goal`,{
        method:"POST",
        body:JSON.stringify(date)
    })
        .then(res => res.json())

}
function roundUp(num){
    return Math.ceil(num/10)*10;
}
function isCorrectTime () {
    return new Date().getHours() === 5;
}

export default function useGoal (options) {
    const [goal,setGoal] = useState(0);
    const intervalRef = useRef(null);
    options = JSON.stringify(options || {});

    useEffect(() => {
        let effectOptions = JSON.parse(options);
        function updateGoal(amount){
            if(effectOptions?.['round'] === false) return setGoal(amount);
            return setGoal(roundUp(amount/5));
        }
        let goalFunc = effectOptions?.date ? getGoalForDate : getGoal;
        goalFunc(effectOptions)
            .then(({goal_amount}) => updateGoal(goal_amount))
            .then(()=>{
                intervalRef.current = setInterval(async () => {
                    if(isCorrectTime()) {
                        let {goal_amount} = await goalFunc(effectOptions);
                        updateGoal(goal_amount)
                    }
                }, 1000 * 60)
            })
            .catch((error) => console.log(error));
        return () => clearInterval(intervalRef.current);
    }, [options]);
    return goal
}