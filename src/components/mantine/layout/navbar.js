import {AppShell, Divider, NavLink, ScrollArea, SegmentedControl} from "@mantine/core";
import RoleWrapper from "../../RoleWrapper";
import { useSessionStorage } from "@mantine/hooks";
import useAdminList from "../../../modules/hooks/useAdminList";






function GeneratedNavBar({page,count,keyName="",state,handleToggle}) {
    return Object
        .entries(page)
        .map(([key, value],i) => {
            let href = value?.href;
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
                rest.className = "subnav-link"
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
                                <GeneratedNavBar
                                    count={count}
                                    keyName={key}
                                    page={links}
                                    state={state}
                                    handleToggle={handleToggle}
                                />
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
    const [section, setSection] = useSessionStorage({
        key: "navbar-section",
        defaultValue: "Metrics"
    })
    const [state, setState] = useSessionStorage({
        key: "navbar",
        defaultValue: stateInit(links[section])
    });




    const handleToggle = (key) => {
        setState((current) => ({...current, [key]: !current[key]}))
    }
    let sections = Object.keys(links)

    return (
        <AppShell.Navbar p="md">
            <SegmentedControl
                data={sections}
                value={section}
                onChange={setSection}
                fullWidth
                mb={'2rem'}
                //variant="outline"
                //color="blue"
                //size="lg"
            />
            <Divider mb={'2rem'}/>
            <ScrollArea>
                <GeneratedNavBar state={state} handleToggle={handleToggle} page={links[section]} count={count}/>
            </ScrollArea>
        </AppShell.Navbar>
    )
}