import styled from "styled-components"
import { colors } from "../../assets/colors"
import horizontalLogo from '../../assets/images/horizontal-little-logo.svg'
import { BodyText1, MessageTxt } from "../typography"
import { blockShadow } from "../../assets/shadows"

export default function Footer() {
    return (
        <FooterDiv>
            <img src={horizontalLogo} alt="horizontal little logo" />
            <BodyText1>2025 р. Всі права захищені.</BodyText1>
        </FooterDiv>
    )
}

const FooterDiv = styled.footer`
width: 100%;
background-color: ${colors.light};
padding: 14px 100px 16px 100px ;
${blockShadow};
position: relative;
bottom: 0;

${BodyText1} {
    color: ${colors.additional};
    padding-left: 5px;
    padding-top: 5px;
}

@media (max-width: 730px) {
    padding: 16px 24px;
    padding: 14px 24px 16px 24px ;

    img {
        width: 150px;
    }

    ${BodyText1} {
        ${MessageTxt.componentStyle.rules.join('')};
    }
}
`