#include <SPI.h>  // libraries for ethernet
#include <Ethernet.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>
#include <DHT.h>  // dht22 library
#include <DHT_U.h>
#include <SD.h>

#define DHTPIN 22      // Визначення піна, на якому підключений датчик DHT
#define DHTTYPE DHT22  // Визначення типу датчика DHT (може бути DHT11, DHT21, DHT22)
#define MQ3PIN A15

// Set the static IP address to use if the DHCP fails to assign
IPAddress ip(192, 168, 1, 104);   // 192.168.1.104
IPAddress myDns(192, 168, 1, 1);  // 192, 168, 1, 1
// Enter a MAC address for your controller below.
// Newer Ethernet shields have a MAC address printed on a sticker on the shield
byte mac[] = { 0x90, 0xA2, 0xDA, 0x10, 0xCD, 0xCE };

char server[] = "192.168.1.104";

// Initialize the Ethernet client library
// with the IP address and port of the server
// that you want to connect to (port 80 is default for HTTP):
EthernetClient ethClient;
HttpClient client = HttpClient(ethClient, ip, 5213);
DHT dht(DHTPIN, DHTTYPE);  // Ініціалізація об'єкта класу DHT, для бібліотеки DHT

// Variables to measure the speed
unsigned long beginMicros, endMicros;
unsigned long byteCount = 0;
bool printWebData = true;  // set to false for better speed measurement
const int relayPin = 26;   // Визначення піна, на якому підключений модуль реле
const int ledPin = 24;     // Визначення піна, на якому підключений світлодіод

float lastTemperature = 0.0;
float lastHumidity = 0.0;
float lastGas = 0.0;

// Порогові значення для змін
const float temperatureThreshold = 0.5;
const float humidityThreshold = 2.0;
const float gasThreshold = 5.0;

float temperature = 0;  // Зчитування температури
float humidity = 0;     // Зчитування вологості
float gasValue = 0;     // Зчитування gas value

float tempNormal = 0.0;
float humidNormal = 0.0;
float gasNormal = 0.0;

void setup() {
  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ;  // wait for serial port to connect. Needed for native USB port only
  }
  dht.begin();

  pinMode(relayPin, OUTPUT);  // Режим піна, який буде використовуватись для виведення
  pinMode(ledPin, OUTPUT);    // Режим піна, який буде використовуватись для виведення

  // start the Ethernet connection:
  Serial.println("Initialize Ethernet with DHCP:");

  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    // Check for Ethernet hardware present
    if (Ethernet.hardwareStatus() == EthernetNoHardware) {
      Serial.println("Ethernet shield was not found.  Sorry, can't run without hardware. :(");
      while (true) {
        delay(1);  // do nothing, no point running without Ethernet hardware
      }
    }
    if (Ethernet.linkStatus() == LinkOFF) {
      Serial.println("Ethernet cable is not connected.");
    }
    // try to congifure using IP address instead of DHCP:
    Ethernet.begin(mac, IPAddress(192, 168, 1, 104), myDns);
  } else {
    Serial.print("  DHCP assigned IP ");
    Serial.println(Ethernet.localIP());
  }

  Serial.println("Ethernet configured");
  Serial.print("Connecting to ");
  Serial.println(server);
  delay(2000);
  // Виконання get запиту
  client.beginRequest();
  client.get("/Account/get-normas-by-email?email=irynamertsalova@gmail.com");
  client.sendHeader("Host", server);
  client.sendHeader("User-Agent", "Arduino/1.0");
  client.endRequest();
  // Очікування відповіді
  int statusCode = client.responseStatusCode();
  String response = client.responseBody();

  DynamicJsonDocument doc(256);
  DeserializationError error = deserializeJson(doc, response);
  if (error) {
    Serial.print("Deserialization failed: ");
    Serial.println(error.f_str());
    return;  // вихід, якщо десеріалізація не вдалася
  }
  // Виведення результату
  Serial.println("-----------------------------------------------");
  Serial.print("Status code: ");
  Serial.println(statusCode);
  Serial.print("Response:");
  Serial.println(response);
  Serial.println("-----------------------------------------------");

  tempNormal = parseStringToFloat(doc["temperature"].as<String>());
  humidNormal = parseStringToFloat(doc["humidity"].as<String>());
  gasNormal = parseStringToFloat(doc["gas"].as<String>());
}

void loop() {
  temperature = dht.readTemperature();  // Зчитування температури
  humidity = dht.readHumidity();        // Зчитування вологості
  gasValue = analogRead(MQ3PIN);        // Зчитування диму

  conditionFunc(temperature, humidity, gasValue);

  bool isSignificantChange =
    abs(temperature - lastTemperature) > temperatureThreshold || abs(humidity - lastHumidity) > humidityThreshold || abs(gasValue - lastGas) > gasThreshold;

  if (isSignificantChange) {
    DynamicJsonDocument doc(256);
    doc["Temperature"] = String(temperature);
    doc["Humidity"] = String(humidity);
    doc["Gas"] = String(gasValue);
    doc["DateTime"] = "00.00.0000 00:00:00";
    doc["User"] = "503163c1-13fe-441b-bf33-4c7af8257b3d";

    String postData;
    serializeJson(doc, postData);

    String contentType = "application/json";

    client.beginRequest();
    client.post("/House/add-new-state");
    client.sendHeader("Content-Type", contentType);
    client.sendHeader("Content-Length", postData.length());
    client.sendHeader("Host", server);
    client.beginBody();
    client.print(postData);
    client.endRequest();

    int statusCode = client.responseStatusCode();
    String response = client.responseBody();
    Serial.println("-----------------------------------------------");
    Serial.print("Status code: ");
    Serial.println(statusCode);
    Serial.print("Response: ");
    Serial.println(response);
    Serial.println("-----------------------------------------------");

    lastTemperature = temperature;
    lastHumidity = humidity;
    lastGas = gasValue;
  }

  delay(10000);
}

float parseStringToFloat(String dataStr) {
  dataStr.replace(',', '.');
  float dataNormal = dataStr.toFloat();
  return dataNormal;
}

void conditionFunc(float temp, float humid, float gas) {
  if (temp > tempNormal + 2 || temp < tempNormal - 2 || humid < humidNormal - 10 || humid > humidNormal + 10) {
    //digitalWrite(relayPin, HIGH);       // Включення вентилятора
    digitalWrite(ledPin, HIGH);  // Включення світлодіода
    Serial.println("Check your data !");
    Serial.println("Something's not in your normal.");
    delay(500);
    digitalWrite(ledPin, LOW);  // Вuключення світлодіода
  } else {
    //digitalWrite(relayPin, LOW);        // Виключення вентилятора
    Serial.println("Everything's in normal period !");
  }
}