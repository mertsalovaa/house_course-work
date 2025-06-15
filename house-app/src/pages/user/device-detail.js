import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import BackLink from "../../components/elements/back-link";
import Panel from "../../components/elements/panel";
import MainLayout from "../../components/layout/main-layout";
import { BodyBlock } from "./devices";
import { useEffect, useState } from "react";
import { BodyText1, Headline2, Headline3, MobileHeadline2, MobileHeadline3, Placeholder, SubHeadline1 } from "../../components/typography";
import styled from "styled-components";
import { colors } from "../../assets/colors";
import moment from "moment";
import 'moment/locale/uk';
import userIcon from '../../assets/images/icons/user-icon.svg'
import useDeviceStateHub from "../../useDeviceStateHub";

function isOnline(lastUpdate) {
    if (!lastUpdate) return false;
    const last = moment(lastUpdate);
    const now = moment();
    const diffMs = now.diff(last, 'milliseconds');
    return diffMs <= 5 * 60 * 1000; // 5 хвилин
}

export default function DeviceDetails() {
    const navigate = useNavigate();
    const [loaderState, setLoaderState] = useState(false);
    const [device, setDevice] = useState({});
    const [lastData, setLastData] = useState({});
    const [now, setNow] = useState(moment());
    const [lastUpdate, setLastUpdate] = useState(null);
    const params = useParams();

    moment.locale('uk');

    async function getDeviceById(id) {
        setLoaderState(true);
        try {
            const response = await fetch(`http://192.168.1.104:8080/Account/get-device-by-id?id=${id}`, {
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
            setDevice(data);
            getLastDeviceDataById(data.id);

        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setTimeout(() => setLoaderState(false), 500);
        }
    }

    async function getLastDeviceDataById(deviceId) {
        setLoaderState(true);
        try {
            const response = await fetch(`http://192.168.1.104:8080/House/get-last-data?deviceId=${deviceId}`, {
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
            if (response.status === 204) {
                console.log("no content");
                setLastData("none")
                return;
            }
            const data = await response.json();
            setLastData(data);
            setLastUpdate(data.dateTime);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            console.log(lastData);
            setTimeout(() => setLoaderState(false), 500);
        }
    }

    useDeviceStateHub((newState) => {
        setLoaderState(true);
        if (newState.deviceId === device.id) {
            setLastUpdate(newState.timestamp);
        }
        setTimeout(() => setLoaderState(false), 500);
    });

    useEffect(() => {
        getDeviceById(params.id);

        const interval = setInterval(() => {
            setNow(moment());
        }, 10000);
        return () => clearInterval(interval);
    }, [])

    return (
        <MainLayout loaderState={loaderState}>
            <div className="flex w-full">
                <Panel />
                <BodyBlock className="flex items-start flex-col gap-8 !py-0 mb-6">
                    <BackLink text={"Назад"} clickFunc={() => { navigate('/user/devices') }} />
                    <DetailBodyBlock className="w-full flex flex-wrap items-start gap-2 justify-between">
                        <DetailBlock className="flex flex-col gap-6">
                            <SubHeadline1>Основна інформація</SubHeadline1>
                            <Headline2>{device.displayName}</Headline2>
                            <span className="flex items-start gap-4"><BodyText1>ID вашого пристрою:</BodyText1><Headline3>{device.hardwareId}</Headline3></span>
                            <span className="flex items-start gap-4"><BodyText1>Дата додавання пристрою:</BodyText1><Headline3>{device.dataOfCreating === null ? "немає даних" : moment(device.dataOfCreating).format('DD.MM.YYYY LT')}</Headline3></span>
                            <span className="flex items-start gap-4"><BodyText1>Остання активність:</BodyText1><Headline3>{lastUpdate ? moment(lastUpdate).format('DD.MM.YYYY LT') : "немає даних"}</Headline3></span>
                            <span className="flex items-start gap-4"><BodyText1>Статус:</BodyText1><Headline3 className={isOnline(lastUpdate) ? 'text-green-600' : 'text-red-600'}>{isOnline(lastUpdate) ? "🟢 Онлайн" : "🔴 Офлайн"}</Headline3></span>
                            <span className="pt-4 flex flex-col gap-4 sm:!gap-2"><div className="flex items-center gap-2 *:text-wrap font-semibold"><img src={userIcon} alt="user-icon" /><BodyText1 style={{ color: `${colors.main}` }}>Власник(-ця):</BodyText1></div><BodyText1 className="text-wrap">{device.email}</BodyText1></span>

                        </DetailBlock>
                        <DetailBlock className="flex flex-col gap-6">
                            <SubHeadline1>Додаткова інформація</SubHeadline1>
                            <Headline3>Останні показники</Headline3>
                            {lastData === "none" ? <BodyText1>Дані відсутні.</BodyText1> : <><span className="flex items-start gap-4"><BodyText1>Температура:</BodyText1><Headline3>{lastData.temperature} *C</Headline3></span>
                                <span className="flex items-start gap-4"><BodyText1>Вологість:</BodyText1><Headline3>{lastData.humidity} %</Headline3></span>
                                <span className="flex items-start gap-4"><BodyText1>Газ:</BodyText1><Headline3>{lastData.gas}</Headline3></span>
                                <span className="flex items-start gap-4"><BodyText1>Стан:</BodyText1><Headline3>{lastData.status}</Headline3></span>
                            </>}
                        </DetailBlock>
                    </DetailBodyBlock>
                </BodyBlock>
            </div>
        </MainLayout>
    )
}

const DetailBlock = styled.div`
border: 1px solid ${colors["light-green"]};
border-radius: 30px;
padding: 40px;

${Headline2}, ${Headline3} {
    color: ${colors.main};
}

${BodyText1} {
    color: ${colors.additional};
}

span {
    width: 100%;
    flex: 1 1 0;
    flex-wrap: wrap;
    justify-content: space-between;
transition: all 0.4s ease-in-out;

img {
    width: 18px;
    height: 16px;
}
& > * {
    flex-shrink: 0;
width: 47%;
padding-bottom: 0;
}
}


${SubHeadline1} {
    width: 100%;
    color: ${colors.accent};
    border-bottom: 1px solid ${colors.accent};
    padding-bottom: 10px;
    padding-left: 2px;
}
`

const DetailBodyBlock = styled.div`
flex: 1 1 0;
transition: all 0.4s ease-in-out;
& > ${DetailBlock} {
width: 48%;
}

@media (max-width: 840px) {
    ${DetailBlock} {
        width: 90%;
        gap: 16px;
        span {
        gap: 16px;
        & > * {
        width: 47%;
    }
}
    }
}
@media (max-width: 605px) {
    ${DetailBlock} {
        width: 100%;
        gap: 16px;
        span {
        gap: 4px;
        & > * {
        width: 100%;
    }}
    }
}
@media (max-width: 1023px) {
    span {
        gap: 4px;
        & > * {
            width: 100%;
        }
    }
    
}
`

