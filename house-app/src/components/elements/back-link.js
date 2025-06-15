import styled from 'styled-components'
import arrowBack from '../../assets/images/icons/arrow-back.svg'
import { MobileHeadline3, Placeholder } from '../typography'
import { colors } from '../../assets/colors'

export default function BackLink({ text, clickFunc }) {
    return (
        <TitleStyle onClick={clickFunc} className='flex items-center gap-2'>
            <img src={arrowBack} alt='arrow-back-icon' />
            <MobileHeadline3>{text}</MobileHeadline3>
        </TitleStyle>
    )
}

const TitleStyle = styled.div`
cursor: pointer;
img {
    width: 18px;
    height: 18px;
}

transition: transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1);

  &:active {
    transform: scale(0.8);
  }

${MobileHeadline3} {
    color: ${colors.main};
}

@media (max-width: 890px) {
    img {
        width: 15px;
        height: 15px;
    }
     ${MobileHeadline3} {
       font-size: 13px;
    }
}
`