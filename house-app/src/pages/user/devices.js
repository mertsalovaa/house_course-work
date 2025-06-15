import { useEffect, useState } from "react";
import connection from "../../signalRService";
import Button from "../../components/elements/buttons";
import { BodyText1, Headline2, Headline3, MobileBodyText1, MobileHeadline2, MobileHeadline3, MobileSubHeadline1, MobileText, Placeholder, SubHeadline1, Text } from "../../components/typography";
import MainLayout from "../../components/layout/main-layout";
import Panel from "../../components/elements/panel";
import styled from "styled-components";
import { colors } from "../../assets/colors";
import { blockShadow } from "../../assets/shadows";
import infoIcon from '../../assets/images/icons/info-icon.svg'
import { AnimatePresence, motion } from "framer-motion";
import ModalWindow from "../../components/elements/modal-window";
import doneImage from '../../assets/images/done-image.svg';
import errorImage from '../../assets/images/error-image.svg';
import moment from "moment";
import { useNavigate } from "react-router-dom";
import useDeviceStateHub from "../../useDeviceStateHub";

export default function Devices() {
    const [connectedText, setConnectedText] = useState("");
    const [key, setKey] = useState("");
    const [devices, setDevices] = useState([]);
    const [lastUpdates, setLastUpdates] = useState([]);
    const navigate = useNavigate();

    const [loaderState, setLoaderState] = useState(false);
    const [connectModalShow, setConnectModalShow] = useState(false);
    const [resultConnectShow, setResultConnectShow] = useState({ show: false, type: "error" });

    const startConnection = async () => {
        if (connection.state === "Disconnected") {
            try {
                await connection.start();
                console.log("SignalR connected");
            } catch (err) {
                console.error("SignalR Connection Error: ", err);
            }
        }
    };

    async function getDevices() {
        setLoaderState(true);

        try {
            const response = await fetch("http://192.168.1.104:8080/Account/get-devices-by-user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                },
            });

            // if (!response.ok) {
            //     const errorText = await response.text(); // Для налагодження
            //     console.error("Getting key failed:", errorText);
            //     return;
            // }
            console.log(response);
            const data = await response.json(); // 🟢 Ось тут await обов'язково
            console.log(data);
            setDevices(data);
            data.map((item) => setLastUpdates(prev => [...prev, { deviceId: item.id, lastUpdate: item.lastActivity }]))
        } catch (error) {
            console.error("Fetch error:", error);
            // if (error instanceof TypeError) {
            //     setErrorMessage("Сервер недоступний. Перевірте з’єднання або спробуйте пізніше.");
            // } else {
            //     setErrorMessage(error.message);
            // }
        } finally {
            setTimeout(() => setLoaderState(false), 500);
        }
    }

    useDeviceStateHub((newState) => {
    setLoaderState(true);

    const existingDevice = lastUpdates.find(item => item.deviceId === newState.deviceId);

    if (!existingDevice) {
        setLastUpdates(prev => [...prev, {
            deviceId: newState.deviceId,
            lastUpdate: newState.lastActivity
        }]);
    } else {
        const updatedItems = lastUpdates.map((item) => {
            if (newState.deviceId === item.deviceId) {
                return {
                    deviceId: newState.deviceId,
                    lastUpdate: newState.lastActivity,
                };
            }
            return item;
        });

        setLastUpdates(updatedItems);
    }

    setTimeout(() => setLoaderState(false), 500);
});


    useEffect(() => {
        getDevices();

        const init = async () => {
            await startConnection();
            console.log("Connection ID:", connection.connectionId);
        };
        init();

        const handler = (data) => {
            setConnectedText(data.message);
            setConnectModalShow(true);
            console.log(data.message);
        };

        connection.on("DevicePaired", handler);

        return () => {
            connection.off("DevicePaired", handler); // чистимо підписку
        };
    }, []);

    async function getParsingToken() {
        setLoaderState(true);

        try {
            const response = await fetch("http://192.168.1.104:8080/Account/get-pairing-token", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text(); // Для налагодження
                console.error("Getting key failed:", errorText);
                return;
            }

            const data = await response.text(); // 🟢 Ось тут await обов'язково
            setKey(data);
            console.log("key:", data);
        } catch (error) {
            console.error("Fetch error:", error);
            // if (error instanceof TypeError) {
            //     setErrorMessage("Сервер недоступний. Перевірте з’єднання або спробуйте пізніше.");
            // } else {
            //     setErrorMessage(error.message);
            // }
        } finally {
            setTimeout(() => setLoaderState(false), 500);
        }
    }

    async function IsConfirmedConnect(choice) {
        setConnectModalShow(false);
        setLoaderState(true);
        try {
            const response = await fetch(`http://192.168.1.104:8080/Account/is-confirmed-connect?isConfirmed=${choice}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text(); // Для налагодження
                console.error("Confirming failed:", errorText);
                return;
            }

            const data = await response.json(); // 🟢 Ось тут await обов'язково
            console.log(data);
            setResultConnectShow(prev => ({ ...prev, type: (data.status === 200) ? "done" : "error" }));
            console.log(resultConnectShow);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setTimeout(() => setLoaderState(false), 500);
            setTimeout(() => setResultConnectShow(prev => ({ ...prev, show: true })), 500);
        }
    }

    return (
        <MainLayout loaderState={loaderState}>
            <div className="flex w-screen">
                <Panel />
                <div className="flex flex-col">
                    <BodyBlock className="flex flex-wrap gap-8">
                        <AddBtnBlock onClick={() => getParsingToken()}>
                            <Headline3>Додати новий пристрій</Headline3>
                        </AddBtnBlock>
                        {devices.map((item, index) => <DeviceBlock key={item.id} className="flex flex-col" onClick={() => navigate(`/user/devices/${item.id}`)}>
                            <Headline3>{item.displayName}</Headline3>
                            <span>
                                <Text>Остання активність:</Text>
                                <BodyText1>{lastUpdates[index]?.lastUpdate === null ? "немає даних" : moment(lastUpdates[index]?.lastUpdate).format('DD.MM.YYYY LT')}</BodyText1>
                            </span>
                        </DeviceBlock>)}
                    </BodyBlock>
                    <AnimatePresence>
                        {key && <motion.div
                            key="codeblock"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <CodeBlock className="flex flex-col gap-6">
                                <span className="w-full flex items-center gap-6">
                                    <Headline3>Персональний код:</Headline3>
                                    <Headline2>{key}</Headline2>
                                </span>
                                <div className="flex flex-col gap-4">
                                    <span className="flex items-center gap-3 *:!pb-0 pb-2">
                                        <img src={infoIcon} alt="info icon" />
                                        <Headline3>Інформація</Headline3>
                                    </span>
                                    <Headline3>Щоб додати новий пристрій:</Headline3>
                                    <SubHeadline1>1. Отримайте персональний код.</SubHeadline1>
                                    <SubHeadline1>2. Введіть його за допомогою “екрана”пристрою.</SubHeadline1>
                                    <SubHeadline1>3. Отримайте повідомлення з підтвердженням “співпраці” між системами для початку роботи.</SubHeadline1>
                                </div>
                            </CodeBlock>
                        </motion.div>
                        }
                    </AnimatePresence>
                </div>
                {/* {connectedText && <><BodyText1>Пристрої на приєднання:</BodyText1><BodyText1>{connectedText}:  </BodyText1>
                        <BodyText1>Приєднати цей пристрій ?</BodyText1>
                        <Button onClick={() => IsConfirmedConnect(false)}>Скасувати</Button>
                        <Button onClick={() => IsConfirmedConnect(true)}>Підтвердити</Button>
                    </>}
                    {isConfirmed && <BodyText1>{isConfirmed}</BodyText1>} */}
                {/* <Button onClick={getParsingToken}>Додати новий пристрій</Button>
                <br />
                {key && <div className="flex items-center gap-4">
                    <Headline3>Персональний код:</Headline3>
                    <Headline2>{key}</Headline2>
                </div>
                }
                <br />


                <br />
                {text && <><BodyText1>Пристрої на приєднання:</BodyText1><BodyText1>{text}:  </BodyText1>
                    <BodyText1>Приєднати цей пристрій ?</BodyText1>
                    <Button onClick={() => IsConfirmedConnect(false)}>Скасувати</Button>
                    <Button onClick={() => IsConfirmedConnect(true)}>Підтвердити</Button>
                </>}
                {isConfirmed && <BodyText1>{isConfirmed}</BodyText1>} */}
            </div>
            <ModalWindow show={connectModalShow} isImportant={true} onClose={() => setConnectModalShow(false)} autoClose={null}>
                <Headline2>Підтвердити з’єднання</Headline2>
                <SubHeadline1>{connectedText}</SubHeadline1>
                <span className="flex justify-between items-center gap-5 w-full flex-wrap">
                    <Button onClick={() => IsConfirmedConnect(false)} variant="outline" intent="login">Відміна</Button>
                    <Button onClick={() => IsConfirmedConnect(true)}>Підтвердити</Button>
                </span>
            </ModalWindow>
            <ModalWindow show={resultConnectShow.show} isImportant={false} onClose={() => setTimeout(() => setResultConnectShow({ show: false, type: "error" }), 200)} autoClose={null}>
                <img src={resultConnectShow.type === "error" ? errorImage : doneImage} alt="state-image" />
                <SubHeadline1>{resultConnectShow.type === "error" ? "Щось пішло не так... Спробуйте ще раз!" : "Пристрій успішно додано!"}</SubHeadline1>
            </ModalWindow>
        </MainLayout >
    );
}

export const BodyBlock = styled.div`
padding: 24px 32px;
padding-right: 16px;
width: 100%;
transition: all 0.4s ease-in-out;


@media (max-width: 1170px) {
    width: 100%;
}

@media (max-width: 890px) {
    padding: 16px 24px;
    gap: 24px;

    ${Headline3} {
        ${MobileHeadline3.componentStyle.rules.join('')};
    }
    ${Headline2} {
        ${MobileHeadline2.componentStyle.rules.join('')};
    }
    ${SubHeadline1} {
        ${MobileSubHeadline1.componentStyle.rules.join('')};
    }
    ${BodyText1} {
        ${MobileText.componentStyle.rules.join('')};
    }
}
`

const CodeBlock = styled(BodyBlock)`
width: 40%;
padding-bottom: 32px;
transition: all 0.4s ease-in-out;
${Headline2} {
    color: ${colors.additional};
    border: 1px solid ${colors["light-green"]};
    background-color: ${colors.lighter};
    padding: 10px 20px;
    border-radius: 30px;
    cursor: pointer;
}
${Headline3}, ${SubHeadline1} {
    color: ${colors.main};
}
div span ${Headline3} {
    color: ${colors.additional};
}

@media (max-width: 1170px) {
    width: 50%;
}
@media (max-width: 955px) {
    width: 70%;
}
@media (max-width: 532px) {
    width: 100%;
}
`

const DeviceBlock = styled.div`
cursor: pointer;
width: 200px;
padding: 24px;
padding-right: 38px;
gap: 24px;
margin: 0;
background-color: ${colors.lighter};
border-radius: 30px;
border: 1px solid ${colors.lighter};
transition: transform 100ms cubic-bezier(0.25, 0.1, 0.25, 1);

&:active {
transform: scale(0.95);
}
span {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: ${colors.main};
}
${Headline3} {
    color: ${colors.additional};
}
${blockShadow};

@media (max-width: 890px) {
    /* ${Headline3} {
        ${MobileHeadline3.componentStyle.rules.join('')};
    } */
        padding-right: 0;
        width: 176px;
    ${Text} {
        ${MobileText.componentStyle.rules.join('')};
    }
    ${BodyText1} {
        font-size: 0.8em;
    }
}
@media (max-width: 532px) {
    span {
        flex-direction: row; 
        align-items: flex-end;
        gap: 8px;
    }
    gap: 12px;
    width: 100%;
    padding-right: 16px;
}
@media (max-width: 445px) {
    span {
        flex-direction: column; 
        align-items: flex-start;
        gap: 2px;
    }
        width: 100%;
        gap: 16px;
    }
`

const AddBtnBlock = styled(DeviceBlock)`
width: 200px;
padding: 48px 28px;
text-align: center;
transition: transform 100ms cubic-bezier(0.25, 0.1, 0.25, 1);
${Headline3} {
    color: ${colors.accent};
}

@media (max-width: 890px) {
width: 176px;
}
@media (max-width: 532px) {
    width: 100%;
    padding: 28px;
}
`