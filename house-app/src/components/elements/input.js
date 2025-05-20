import { useState } from "react";
import styled from "styled-components";

import { Headline3, MessageTxt, MobileHeadline3, Placeholder } from "../typography";
import { colors } from "../../assets/colors";
import { inputShadow } from "../../assets/shadows";

import emailIcon from '../../assets/images/icons/email-icon.svg';
import eyeOpenIcon from '../../assets/images/icons/eye-open-icon.svg';
import eyeCloseIcon from '../../assets/images/icons/eye-close-icon.svg';


export default function Input({ name, value, setValue, text, placeholder, messageType, messageText, icon }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <InputBlock $messageType={messageType}>
            <Headline3>{text}</Headline3>
            <span>
                <input type={(name !== 'email' && name !== 'password') ? 'text' : name === 'email' ? "email" : showPassword ? "text" : "password"} id={name} name={name} placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} />
                <button>{name === 'password' ? <img src={showPassword ? eyeCloseIcon : eyeOpenIcon}
                    alt="eye icon"
                    onClick={() => setShowPassword((prev) => !prev)} /> : <img src={icon} alt="email icon" />}</button>
            </span>
            <MessageTxt>{messageText}</MessageTxt>
        </InputBlock>
    )
}

export function TextArea({ text, placeholder, value, setValue }) {
    return (
        <TextAreStyle>
            <Headline3>{text}</Headline3>
            <textarea placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)}></textarea>
        </TextAreStyle>
    )
}

const TextAreStyle = styled.span`
width: 100%;
textarea {
    width: 100%;
    height: 100px;
    resize: none;
    background-color: ${colors.lighter};
    color: ${colors.main};
    border: 1px solid ${colors["light-green"]};
    ${inputShadow};
    padding: 15px 20px;
    border-radius: 30px;
    ${Placeholder.componentStyle.rules.join('')}; 
    outline: none;
    caret-color: ${colors.accent};
    &:focus, &:active {
border-color: ${colors["light-green"]};
    }
}
${Headline3} {
    color: ${colors.main};
    padding-left: 5px;
    padding-bottom: 8px;
}

@media (max-width: 730px) {
${Headline3} {
 ${MobileHeadline3.componentStyle.rules.join('')};   
}
}
`

const InputBlock = styled.span`
display: flex;
flex-direction: column;
${MessageTxt} {
    padding: 7px;
    color: ${props => props.$messageType === "error" ? colors.error : props.$messageType === "success" ? colors.success : props.$messageType === "warning" ? colors.warning : "transparent"};
}
span {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${colors.lighter};
    border: 1px solid ${props => props.$messageType === "error" ? colors.error : props.$messageType === "success" ? colors.success : props.$messageType === "warning" ? colors.warning : colors["light-green"]};
    ${inputShadow};
    padding: 15px 20px;
    border-radius: 30px;
    input {
        ${Placeholder.componentStyle.rules.join('')};
        background-color: transparent;
        outline: none;
        caret-color: ${colors.accent};
        color: ${colors.main};
        width: 85%;

        &:is(:-webkit-autofill, :autofill, :-webkit-autofill:hover, :-webkit-autofill:focus, ) {
            /* background-color: ${colors.light} !important; */
            -webkit-text-fill-color: ${colors.main};
            transition: background-color 5000s ease-in-out 0s;
        }
    }
}
${Headline3} {
    color: ${colors.main};
    padding-left: 5px;
    padding-bottom: 8px;
}
`