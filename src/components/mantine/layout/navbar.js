import {AppShell, NavLink, ScrollArea} from "@mantine/core";
import RoleWrapper from "../../RoleWrapper";
import {useLocalStorage, useSessionStorage} from "@mantine/hooks";






function GeneratedNavBar({page,count,keyName="",state,handleToggle}) {
    return Object
        .entries(page)
        .map(([key, value],i) => {
            let href = value?.href;
            let roles = value?.roles;
            if(href){
                const {href,roles,...rest} = value;
                if(roles){
                    return (
                        <RoleWrapper key={`${key} ${i}`} altRoles={roles} invisible>
                            <NavLink {...rest} href={href} label={key}/>
                        </RoleWrapper>
                    )
                }else{
                    return <NavLink {...rest} key={`${key} ${i}`} href={href} label={key}/>
                }
            }else{
                let linkName = `${keyName} ${key} ${count++}`;
                const {links,roles,...rest} = value;
                if(roles){
                    return (
                        <RoleWrapper key={linkName} altRoles={roles} invisible>
                            <NavLink
                                key={linkName}
                                label={key}
                                onClick={() => handleToggle(linkName)}
                                opened={state[linkName]}
                                {...rest}
                            >
                                <GeneratedNavBar count={count} keyName={key}  page={links} state={state} handleToggle={handleToggle}/>
                            </NavLink>
                        </RoleWrapper>
                    )
                }else{
                    return (
                        <NavLink
                            key={linkName}
                            label={key}
                            onClick={() => handleToggle(linkName)}
                            opened={state[linkName]}
                            {...rest}
                        >
                            <GeneratedNavBar count={count} keyName={key}  page={links} state={state} handleToggle={handleToggle}/>
                        </NavLink>
                    )
                }
            }
        })


}


function stateInit(page) {
    let temp = {}
   function createStateForPage(page,count=0,keyName="") {
        return Object
            .entries(page)
            .forEach(([key, value]) => {
                let defaultState = false;
                let href = value?.href;
                if(!href){
                    let linkName = `${keyName} ${key} ${count++}`;
                    temp[linkName] = defaultState
                    createStateForPage(value.links,count,key)
                }
            })
    }
    createStateForPage(page)
    return temp
}


export default function SurtricsNavbar ({links}) {
    let count = 0
    const [state, setState] = useSessionStorage({
        key: "navbar",
        defaultValue: stateInit(links)
    });

    const handleToggle = (key) => {
        setState((current) => ({...current, [key]: !current[key]}))
    }

    return (
        <AppShell.Navbar p="md">
            <ScrollArea>
                <GeneratedNavBar state={state} handleToggle={handleToggle} page={links} count={count}/>
            </ScrollArea>
        </AppShell.Navbar>
    )
}