import styled from "styled-components";
import Panel from "../components/elements/panel";
import MainLayout from "../components/layout/main-layout";
import { Headline1 } from "../components/typography";
import { colors } from "../assets/colors";

export default function NotFoundPage() {
    return (
        <MainLayout>
            <Body className="flex ">
                <Panel />
                <Headline1 className="px-5">Not found</Headline1>
            </Body>
        </MainLayout>
    )
}

const Body = styled.div`
color: ${colors.main};
`