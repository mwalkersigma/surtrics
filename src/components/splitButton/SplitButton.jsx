import {ActionIcon, Button, Group, Menu, rem, Tooltip, useMantineTheme} from '@mantine/core';
import {IconChevronDown} from '@tabler/icons-react';
import classes from './SplitButton.module.css';


export function SplitButton({children, variant, color, tooltip, buttonProps, menuProps, menuItems}) {
    const theme = useMantineTheme();

    return (
        <Group wrap="nowrap" gap={0}>
            <Tooltip label={tooltip} position="top" withArrow>
                <Button
                    {...buttonProps}
                    color={color}
                    variant={variant}
                    className={classes.button}
                > {children} </Button>
            </Tooltip>
            <Menu {...menuProps} transitionProps={{transition: 'pop'}} position="bottom-end" withinPortal>
                <Menu.Target>
                    <ActionIcon
                        variant={variant}
                        color={color}
                        size={36}
                        className={classes.menuControl}
                    >
                        <IconChevronDown style={{width: rem(16), height: rem(16)}} stroke={1.5}/>
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    {
                        (menuItems && menuItems.length > 0)
                        && menuItems.map((item, index) => {
                            let itemProps = item?.itemProps ?? {};
                            let text = item?.text ?? '';
                            return (
                                <Menu.Item key={index} {...itemProps} >
                                    {text}
                                </Menu.Item>
                            )
                        })
                    }
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
}