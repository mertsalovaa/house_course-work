import styled from "styled-components";
import { colors } from "../../assets/colors";
import { blockShadow } from "../../assets/shadows";
import { Headline1, Headline2, Headline3, MobileHeadline1, MobileHeadline2, MobileHeadline3, MobileSubHeadline1, SubHeadline1 } from "../typography";
import Button from "../elements/buttons";


export function AuthForm({ headline, subHeadline, clickFunction, btnText, isSignUp = false, children }) {
    return (
        <MainDiv>
            <Headline1>{headline}</Headline1>
            {isSignUp && <SubHeadline1 className="text-center pt-3 pb-8">{subHeadline}</SubHeadline1>}
            <SignFormStyle>
                {!isSignUp && <SubHeadline1>{subHeadline}</SubHeadline1>}
                {children}

                {!isSignUp && (
                    <Button variant="fill" intent="save" onClick={clickFunction}>
                        {btnText}
                    </Button>
                )}
            </SignFormStyle>
        </MainDiv>
    )
}

export const SignInForm = styled.div`
border-top: 1px solid ${colors["light-green"]};
`

const SignFormStyle = styled.div`
width: 45%;
background-color: ${colors.lighter};
border: 1px solid ${colors["light-green"]};
padding : 50px 40px;
margin-top: 24px;
border-radius: 30px;
${blockShadow};

div {
    gap: 60px;
    flex-wrap: wrap;
    

    & > * {
    flex: 1 1 230px; 
    min-width: 230px; 
    }
}

button {
 float: right;
}

@media (max-width: 1335px) {
    width: 60%; }
@media (max-width: 1045px) {
    width: 75%; }
@media (max-width: 890px) {
    width: 90%; }
@media (max-width: 730px) {
    width: 80%;
        padding: 24px 32px;
        margin-top: 16px;
    div { 
        gap: 16px;
        & > * {
        flex: 1 1 100%; 
        min-width: 100%;
        ${Headline3} {
            ${MobileHeadline3.componentStyle.rules.join('')};
        }
        }}
        img {
            height: 19px;
            width: 20px;
        }
}
@media (max-width: 525px) {
width: 90%;
}
`

const MainDiv = styled.div`
    padding-top: 24px;
    margin-bottom: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
${Headline1}, ${Headline2} {
    color: ${colors.main};
}
${SubHeadline1} {
    color: ${colors.additional};
    width: 70%;
    padding-bottom: 8px;

}

@media (max-width: 1335px) {
    ${SubHeadline1} {
        width: 80%;
    }
}
@media (max-width: 890px) {
    ${SubHeadline1} {
        width: 70%;
    }
}
@media (max-width: 730px) {
${Headline1} {
     ${MobileHeadline1.componentStyle.rules.join('')};
}
${Headline2} {
     ${MobileHeadline2.componentStyle.rules.join('')};
}
${SubHeadline1} {
            ${MobileSubHeadline1.componentStyle.rules.join('')};
}
}

`

export default SignFormStyle;