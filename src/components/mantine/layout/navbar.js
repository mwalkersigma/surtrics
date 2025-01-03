import {AppShell, Box, Divider, NavLink, ScrollArea, SegmentedControl, Space} from "@mantine/core";
import RoleWrapper from "../../RoleWrapper";
import {useSessionStorage} from "@mantine/hooks";
import {useEffect} from "react";


function GeneratedNavBar({page,count,keyName="",state,handleToggle}) {
    if (page === undefined) return;
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

function depthFirstKeySearch(original, objectToCompare) {
    if (typeof original !== "object" || typeof objectToCompare !== "object") return false;
    let keys = Object.keys(original);
    let compareKeys = Object.keys(objectToCompare);
    if (keys.length !== compareKeys.length) return false;
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (objectToCompare[key] === undefined) return false;
        if (typeof original[key] === "object") {
            if (!depthFirstKeySearch(original[key], objectToCompare[key])) return false;
        }
    }
    return true;
}

function stateInit(page) {
    let temp = {}
   function createStateForPage(page,count=0,keyName="") {
       if (page === undefined) return;
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


export default function SurtricsNavbar ({links,footer}) {
    let count = 0
    let adminCount = 0
    let sections = Object.keys(links)

    const [section, setSection] = useSessionStorage({
        key: "navbar-section",
        defaultValue: sections[0]
    })
    const [state, setState] = useSessionStorage({
        key: "navbar",
        defaultValue: stateInit(links[section])
    });

    const [adminState, setAdminState] = useSessionStorage({
        key: "navbar-admin",
        defaultValue: stateInit(footer["Admin"])
    })

    useEffect(() => {
        // this is useful as multiple application use the same session storage names,
        // this prevents the navbar from messing with other applications
        let newState = stateInit(links[section])
        let hasSameKeys = depthFirstKeySearch(newState, state)
        if (!hasSameKeys) {
            setState(newState)
        }
        let newAdminState = stateInit(footer["Admin"])
        let hasSameAdminKeys = depthFirstKeySearch(newAdminState, adminState)
        if (!hasSameAdminKeys) {
            setAdminState(newAdminState)
        }
        if (!sections.includes(section)) {
            setSection(sections[0])
        }
    }, [section, links, state, setState, footer, adminState, sections, setAdminState, setSection])




    const handleToggle = (key) => {
        setState((current) => ({...current, [key]: !current[key]}))
    }
    const handleAdminToggle = (key) => {
        setAdminState((current) => ({...current, [key]: !current[key]}))
    }


    return (
        <AppShell.Navbar p="md">
            <Box mb={'md'}>
                <SegmentedControl
                    data={sections}
                    value={section}
                    onChange={setSection}
                    fullWidth
                    mb={'md'}
                />
                <Divider/>
            </Box>


            <ScrollArea>
                <GeneratedNavBar state={state} handleToggle={handleToggle} page={links[section]} count={count}/>
                <Space h={'3rem'}/>
            </ScrollArea>
            <RoleWrapper invisible altRoles={["surplus director"]}>
                <Box>
                    <Divider mb={'md'}/>
                    <GeneratedNavBar state={adminState} handleToggle={handleAdminToggle} page={footer["Admin"]} count={adminCount}/>
                </Box>
            </RoleWrapper>
        </AppShell.Navbar>
    )
}