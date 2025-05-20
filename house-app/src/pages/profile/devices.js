import { useEffect, useState } from "react";
import connection from "../../signalRService";
import Button from "../../components/buttons";
import { BodyText1, Headline2, Headline3 } from "../../components/typography";
import MainLayout from "../../components/layout/main-layout";

export default function DevicesTest() {
    const [text, setText] = useState("");
    const [key, setKey] = useState("");
    const [isConfirmed, setIsConfirmed] = useState("");

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

    useEffect(() => {
        const init = async () => {
            await startConnection();
            console.log("Connection ID:", connection.connectionId);
        };
        init();

        const handler = (data) => {
            setText(`Пристрій: ${data.deviceId} | HardwareId: ${data.hardwareId}}`);
            console.log("Device", data.deviceId, "HardwareId", data.hardwareId, "Message", data.message);
        };

        connection.on("DevicePaired", handler);

        return () => {
            connection.off("DevicePaired", handler); // чистимо підписку
        };
    }, []);

    async function getParsingToken() {
        const response = await fetch("http://192.168.1.103:8080/Account/get-pairing-token", {
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
    }

    async function IsConfirmedConnect(choice) {
        const response = await fetch(`http://192.168.1.103:8080/Account/is-confirmed-connect?isConfirmed=${choice}`, {
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
        setIsConfirmed(`Код: ${data.status}, інформація: ${data.message}`);
    }

    return (
        <MainLayout className="p-6">
            <Button onClick={getParsingToken}>Додати новий пристрій</Button>
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
                <Button onClick={()=>IsConfirmedConnect(true)}>Підтвердити</Button>
            </>}
            {isConfirmed && <BodyText1>{isConfirmed}</BodyText1>}
        </MainLayout>
    );
}
