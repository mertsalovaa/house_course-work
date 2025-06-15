import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useEffect, useRef } from "react";

export default function useDeviceStateHub(onStateReceived) {
    const connectionRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        const connection = new HubConnectionBuilder()
            .withUrl("http://192.168.1.104:8080/hubs/device-state", {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

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

        const init = async () => {
            await startConnection();
            console.log("Connection ID:", connection.connectionId);
        };

        init();

        const handler = (data) => {            
            console.log(data);
        };

        connection.on("ReceiveNewState", (data) => {
            console.log("New state received:", data);
            if (onStateReceived) onStateReceived(data);
        });

        connectionRef.current = connection;

        connection.on("ReceiveNewState", handler);

        return () => {
            connection.off("ReceiveNewState", handler); // чистимо підписку
        };
    }, [onStateReceived]);
}