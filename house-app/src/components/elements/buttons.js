import styled, { css } from "styled-components";
import { colors } from "../../assets/colors";
import { BodyText1, MobileTextBtn } from "../typography";
import { shadowBtn } from "../../assets/shadows";
import userIcon from '../../assets/images/icons/user-icon.svg'

export default function Button({ variant, intent, onClick, disabled, isLoginIcon = false, children }) {
    return (
        <FillButtonStyle className="flex items-center justify-center" disabled={disabled} $isActive={disabled} $variant={variant} $intent={intent} onClick={onClick}>
            {isLoginIcon && <img src={userIcon} alt="user icon login" width={14} height={16} className="mr-2" />}
            <BodyText1>{children}</BodyText1>
        </FillButtonStyle>
    )
}

const FillButtonStyle = styled.button`
padding: 16px 32px;
background-color: ${props => (props.$isActive && props.$intent === 'save' && props.$variant != 'outline') ? `${colors["light-green"]}` : props.$variant === 'outline' ? 'transparent' : props.$intent === 'save' ? `${colors.accent}` : `${colors.main}`};
border: 2px solid ${props => props.$isActive ? `${colors["light-green"]}` :(props.$variant === 'outline' && props.$intent === 'login') ? `${colors.main}` : props.$intent === 'save' ? `${colors.accent}` : `transparent`};
color: ${props => (props.$isActive && props.$variant === 'outline') ? `${colors["light-green"]}` : (props.$variant === 'outline' && props.$intent === 'save') ? `${colors.accent}` : props.$variant === 'outline' ? `${colors.main}` : `${colors.light}`};
border-radius: 30px;
${shadowBtn};
transition: transform 100ms cubic-bezier(0.25, 0.1, 0.25, 1);

  &:active {
    transform: scale(0.95);
  }
    

  @media (max-width: 730px) {
    padding: 16px 24px;
    ${BodyText1} {
      ${MobileTextBtn.componentStyle.rules.join('')};
    }

    img {
      width: 10px !important;
    }
  }
`