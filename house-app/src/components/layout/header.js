import styled, { css } from 'styled-components';
import horizontalLogo from '../../assets/images/horizontal-logo-1.svg';
import { colors } from '../../assets/colors';
import Button from '../buttons';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
    const location = useLocation();
    const { hash, pathname, search } = location;
    const navigate = useNavigate();

    return (
        <HeaderDiv className='flex flex-row justify-between'>
            <img src={horizontalLogo} alt='horizontal logo' />
            <div className='flex gap-4'>
                {(pathname.includes('sign-in') || pathname === '/') && <Button variant="fill" intent="" onClick={() => navigate('/sign-up')}>Зареєструватись</Button>}
                {(pathname.includes('sign-up') || pathname === '/') && <Button variant="outline" intent="login" onClick={() => navigate('/sign-in')}>Вхід</Button>}

            </div>
        </HeaderDiv>
    )
}

const HeaderDiv = styled.header`
background-color: ${colors.light};
padding: 16px 100px;

@media (max-width: 730px) {
    padding: 16px 24px;

    img {
        width: 150px;
    }
}
`