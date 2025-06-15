import styled from "styled-components"
import mainIcon from '../../assets/images/icons/main-icon.svg'
import devicesIcon from '../../assets/images/icons/devices-icon.svg'
import profileIcon from '../../assets/images/icons/user-icon.svg'
import settingIcon from '../../assets/images/icons/setting-icon.svg'
import helpIcon from '../../assets/images/icons/help-icon.svg'
import { BodyText1, Headline3 } from "../typography"
import { colors } from "../../assets/colors"
import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

const items = [
    { id: "main", title: "Головна", icon: mainIcon },
    { id: "devices", title: "Мої пристрої", icon: devicesIcon },
    { id: "profile", title: "Мій профіль", icon: profileIcon },
    { id: "settings", title: "Налаштування", icon: settingIcon },
    { id: "help", title: "Допомога", icon: helpIcon },
]

export default function Panel() {
    const location = useLocation();
    const { hash, pathname, search } = location;
    //     const [isActive, setActive] = useState('');

    useEffect(() => {
        console.log(pathname);
    }, [location])

    return (
        <MainBlock>
            {items.map((item) =>
                <PanelItem key={item.id} to={`/user/${item.id}`} className={`flex items-center gap-3 py-3 pl-7 ${(pathname.includes(item.id) || (pathname === "/user" && item.id === "devices")) && "active-item"} `}>
                    <span></span>
                    <img src={item.icon} alt={item.title} />
                    <BodyText1>{item.title}</BodyText1>
                </PanelItem>
            )}
        </MainBlock>
    )
}

const PanelItem = styled(Link)`
cursor: pointer;
transition: transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1);

  &:active {
    transform: scale(0.95);
  }

img {
    height: 24px;
    width: 24px;
}
${BodyText1} {
    color: ${colors.additional};
}
span {
    width: 8px;
    height: 30px;
    background-color: ${colors["light-green"]};
    border: 1px solid ${colors.main};
    border-radius: 0 30px 30px 0;
    position: absolute;
    left: 0px;
    display: none;
}
`

const MainBlock = styled.div`
width: 250px;
min-height: 75vh;
transition: width 0.3s ease-in-out;
flex-shrink: 0;
/* padding-right: 24px; */
/* position: fixed;
left: 0;
top: 100px; */
border-right: 1px solid ${colors["light-green"]};
background-color: ${colors.light};

.active-item {
    span {
        display: block;
    }
    ${BodyText1} {
        ${Headline3.componentStyle.rules.join('')};
        color: ${colors.main};
        transition: font-size 0.2s ease-in-out, font-family 0.2s ease-in-out;
    }
}

@media (max-width: 730px) {
    ${BodyText1} {
        display: none;
        transition: display 0.5s ease-in-out;
    }
    ${PanelItem} {
    }
    /* padding: 10px 16px; */
    width: 70px;
    min-height: 78vh;
padding-right: 0;
    transition: width 0.5s ease-in-out, min-height 0.5s ease-in-out;
}
`
