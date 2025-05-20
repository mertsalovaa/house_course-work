import styled from "styled-components";
import Footer from "./footer";
import Header from "./header";
import { colors } from "../../assets/colors";
import Loader from "../loader";

export default function MainLayout({loaderState, children}) {
    return (
        <MainDiv className="">
            <Loader loading={loaderState}/>
            <Header />
            {children}
            <Footer />
        </MainDiv>
    )
}

const MainDiv = styled.div`
min-height: 100vh;
background-color: ${colors.light};
display: flex;
flex-direction: column;
justify-content: space-between;
`
