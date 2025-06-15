import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const connection = new HubConnectionBuilder()
  .withUrl("http://192.168.1.104:8080/hubs/pairing", {
    accessTokenFactory: () => localStorage.getItem("token") // або інше джерело токена
  })
  .withAutomaticReconnect()
  .configureLogging(LogLevel.Information)
  .build();

export default connection;