import React, {useEffect, useRef, useState} from 'react';
import {Text, TextInput, Title} from "@mantine/core";


function Greeting({name, children}) {
    return <div>
        <Title> Hello {name} </Title>
        {children}
    </div>
}

function Test() {
    const [name, setName] = useState("Guest");
    const ref = useRef(null)

    useEffect(() => {
        const [first, last] = name.split(' ')
        console.log(first, last)
        if (!last) {
            ref.current = name;
            return;
        }
        ref.current = `${last}, ${first}`;
    }, [name])

    return (
        <Greeting name={ref.current}>
            <Title>
                <Text>
                    Great Grand Child
                </Text>
            </Title>
            <TextInput onChange={(e) => setName(e.target.value)}/>
        </Greeting>
    )
}

export default Test;