import plusIcon from '../../assets/images/icons/plus-icon.svg'
import minusIcon from '../../assets/images/icons/minus-icon.svg'
import { Headline3, MobileHeadline3, SubHeadline1 } from '../typography'
import styled from 'styled-components'
import { colors } from '../../assets/colors'
import { inputShadow } from '../../assets/shadows'
import { useState } from 'react'

export default function NumberCounter({ name, text, value, setValue, measureUnit, index, maxValue }) {
    const [changed, setChanged] = useState('not');

    const changeValue = (type, index) => {
        setChanged('yes');
        if (value + index <= maxValue) {
            if (type === 'plus') {
                setValue(value + index);
            }
        }
        if (value - index >= index) {
            if (type === 'minus') {
                setValue(value - index);
            }
        }
    }

    return (
        <ItemStyle>
            <Headline3>{text}</Headline3>
            <span className='flex w-full items-center gap-0.5'><NumberItemStyle id={name} className='flex justify-between items-center' $changed={changed}>
                <span onClick={() => changeValue('minus', index)}><img src={minusIcon} alt='minus-icon' width={20} height={20} /></span>
                <SubHeadline1>{value}</SubHeadline1>
                <span onClick={() => changeValue('plus', index)}><img src={plusIcon} alt='plus-icon' width={20} height={20} /></span>
            </NumberItemStyle>
                <SubHeadline1>{measureUnit}</SubHeadline1></span>
        </ItemStyle>
    )
}

const NumberItemStyle = styled.span`
width: 130px;
height: 50px;
padding: 15px;
background-color: ${colors.lighter};
border: 1px solid ${colors['light-green']};
border-radius: 30px;
${inputShadow};

${SubHeadline1} {
    color: ${props => props.$changed === 'not' ? `${colors['light-green']}` : `${colors.main}`};
    width: 100%;
    text-align: center;
    height: 20px;
    transition: color 0.1s ease-in-out;
}
span {
transition: transform 100ms cubic-bezier(0.25, 0.1, 0.25, 1);

  &:active {
    transform: scale(0.85);
  }
}
`

const ItemStyle = styled.span`
${Headline3} {
    color: ${colors.main};
    padding-bottom: 8px;
}
${SubHeadline1} {
    width: 25px;
    padding-bottom: 0;
}

@media (max-width: 742px) {
${NumberItemStyle} {
    width: 120px;
}
${Headline3} {
 ${MobileHeadline3.componentStyle.rules.join('')};   
}

}
`