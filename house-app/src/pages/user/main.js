import { useEffect, useState } from "react";
import SplineChart from "../../components/elements/chart";
import MainLayout from "../../components/layout/main-layout";
import useDeviceStateHub from "../../useDeviceStateHub";
import Panel from "../../components/elements/panel";
import styled from "styled-components";
import { BodyText1, Headline1, Headline3, SubHeadline1 } from "../../components/typography";
import { colors } from "../../assets/colors";
import arrow from '../../assets/images/icons/arrow-down.svg';

export default function MainUserPage() {
    const [loaderState, setLoaderState] = useState(false);
    const [devices, setDevices] = useState([]);
    const [tempStates, setTempStates] = useState([]);
    const [tempHeadline, setTempHeadline] = useState("");
    const [humidStates, setHumidStates] = useState([]);
    const [gasStates, setGasStates] = useState([]);
    const [humidHeadline, setHumidHeadline] = useState("");

    const [selectedDevice, setSelectedDevice] = useState(devices[0]?.id);

    useDeviceStateHub((newState) => {
        setLoaderState(true);
        getDataStatesByDeviceId(selectedDevice);
        setTimeout(() => setLoaderState(false), 500);
    });

    async function getDataStatesByDeviceId(id) {
        setLoaderState(true);
        try {
            const response = await fetch(`http://192.168.1.104:8080/House/get-states-by-device-id?deviceId=${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text(); // Для налагодження
                console.error("Getting key failed:", errorText);
                return;
            }

            const data = await response.json();
            console.log(data); // 🟢 Ось тут await обов'язково
            const temps = data.map((item) => ({
                x: new Date(item.dateTime).toISOString(),
                y: parseFloat(item.temperature)
            }));
            setTempStates(temps);

            const humids = data.map((item) => ({
                x: new Date(item.dateTime).toISOString(),
                y: parseFloat(item.humidity)
            }));
            setHumidStates(humids);

            const gas = data.map((item) => ({
                x: new Date(item.dateTime).toISOString(),
                y: parseFloat(item.gas)
            }));
            setGasStates(gas);

            // { x: new Date(2017, 0), y: 25060 }
            console.log("key:", temps);
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

    useEffect(() => {
        getDevices();
        async function getDevices() {
            setLoaderState(true);
            try {
                const response = await fetch(`http://192.168.1.104:8080/Account/get-devices-by-user`, {
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

                const data = await response.json(); // 🟢 Ось тут await обов'язково

                setDevices(data);
                // { x: new Date(2017, 0), y: 25060 }
                console.log("key:", data);
                getDataStatesByDeviceId(data[0].id);
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
    }, [])

    return (
        <MainLayout >
            <div className="flex w-full">
                <Panel />
                <BodyMainBlock className="flex items-start justify-between flex-wrap w-full">
                    <div className="w-1/5 *:pt-2">
                        <Headline3>Розпочніть свою роботу!</Headline3>
                        <SubHeadline1>Оберіть пристрій для детального перегляду даних</SubHeadline1>
                        <select
                            value={selectedDevice}
                            onChange={e => { setSelectedDevice(e.target.value); getDataStatesByDeviceId(e.target.value) }}
                        >
                            {devices.map((item) =>
                                <option value={item.id}>{item.displayName}</option>
                            )}
                        </select>
                        {tempStates.length === 0 && <Headline3>Показники цього пристрою відсутні. Будь ласка, оберіть інший.</Headline3>}
                    </div>
                    <ChartMainBlock className="flex gap-4 flex-wrap">
                        <SplineChart data={tempStates} chartId={"chart-temperature"} headline={"Температура"} />
                        <SplineChart data={humidStates} chartId={"chart-humidity"} headline={"Вологість"} />
                        <SplineChart data={gasStates} chartId={"chart-gas"} headline={"Якість повітря"} />
                    </ChartMainBlock>
                </BodyMainBlock>
            </div>
        </MainLayout >
    )
}

const BodyMainBlock = styled.div`
width: 83.5%;
padding-left: 16px;

color: ${colors.main};
select {
    
    border-radius: 30px;
    padding: 16px 25px;
    margin: 10px 0;
    padding-right: 30px;
    border: 1px solid ${colors["light-green"]};
    -webkit-appearance: none !important;
-moz-appearance: none !important;
outline-color: ${colors.additional};

background-size: 13px;
background-image: url(${arrow});
  background-repeat: no-repeat;
  background-position: calc(100% - 14px) center;
  ${BodyText1.componentStyle.rules.join('')};
} 
`

const ChartMainBlock = styled.div`
width: 80%;
`