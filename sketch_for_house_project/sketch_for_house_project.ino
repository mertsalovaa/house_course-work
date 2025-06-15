#include <SPI.h>  // libraries for ethernet
#include <Ethernet.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>
#include <DHT.h>  // dht22 library
#include <DHT_U.h>
#include <SD.h>
#include <MCUFRIEND_kbv.h>
#include <TouchScreen.h>
#include <Adafruit_GFX.h>

#define DHTPIN 22      // Визначення піна, на якому підключений датчик DHT
#define DHTTYPE DHT22  // Визначення типу датчика DHT (може бути DHT11, DHT21, DHT22)
DHT dht(DHTPIN, DHTTYPE);
#define MQ2PIN A15

byte mac[] = { 0x90, 0xA2, 0xDA, 0x10, 0xCD, 0xCE };
// D8-D0-90-5B-0A-8B
IPAddress ip(192, 168, 1, 104);  // Статична IP Arduino
IPAddress dns(192, 168, 1, 1);
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress myDns(192, 168, 1, 1);

char server[] = "192.168.1.104";

EthernetClient ethClient;
IPAddress serverIp(192, 168, 1, 104);
HttpClient client = HttpClient(ethClient, serverIp, 8080);

unsigned long beginMicros, endMicros;
unsigned long byteCount = 0;

MCUFRIEND_kbv tft;
#define MINPRESSURE 200
#define MAXPRESSURE 1000

#define BLACK 0x0000
#define BROWN 0x7980
#define RED 0xF800
#define ORANGE 0xFBE0
#define YELLOW 0xFFE0
#define GREEN 0x065337
#define BLUE 0x001F
#define VIOLET 0xA81F
#define GREY 0x7BEF
#define WHITE 0xFFFF
#define CYAN 0x07FF
#define MAGENTA 0xF81F
#define LGREEN 0xAFE0

#define YP A3  // must be an analog pin
#define XM A2  // must be an analog pin
#define YM 9   // can be a digital pin
#define XP 8   // can be a digital pin

// #define YP A1
// #define XM A2
// #define YM 7
// #define XP 6

// Калібрування для LANDSCAPE
#define TS_LEFT 953
#define TS_RT 85
#define TS_TOP 923
#define TS_BOT 117

#define SCREEN_WIDTH 480
#define SCREEN_HEIGHT 320

TouchScreen ts = TouchScreen(XP, YP, XM, YM, 300);  // Підстав свої значення пінів!

// Кнопки
#define row_c 4
#define col_c 6

const char* keys[row_c][col_c] = {
  { "2", "3", "4", "6", "7", "9" },
  { "A", "B", "C", "E", "F", "X" },
  { "G", "H", "J", "K", "L", "U" },
  { "<", "N", "P", "T", "S", ">" }
};

int keyW = 60, keyH = 60;
int keyX = 20, keyY = 40;
int spacing = 10;

int pixel_x, pixel_y;
String input = "";

const String deviceId = "arduino-mega-002";

void drawFullKeyboard() {
  tft.fillScreen(BLACK);

  for (int row = 0; row < row_c; row++) {
    for (int col = 0; col < col_c; col++) {
      int x = keyX + col * (keyW + spacing);
      int y = keyY + row * (keyH + spacing);
      if (strcmp(keys[row][col], ">") == 0 || strcmp(keys[row][col], "<") == 0) {
        tft.fillRect(x, y, keyW, keyH, BLACK);
        tft.setTextColor(WHITE);
      } else {
        tft.fillRect(x, y, keyW, keyH, WHITE);
        tft.setTextColor(BLACK);
      }
      tft.drawRect(x, y, keyW, keyH, WHITE);
      tft.setCursor(x + 22, y + 20);
      tft.setTextSize(3);
      tft.print(keys[row][col]);
    }
  }
  updateInputField();  // також одразу малюємо поле вводу
}

void updateInputField() {
  tft.fillRect(0, 0, SCREEN_WIDTH, 30, BLACK);  // очищаємо попередній текст
  tft.setCursor(20, 10);
  tft.setTextSize(2);
  tft.setTextColor(WHITE);
  tft.print("TOKEH: " + input);
}

String getKey(int x, int y) {
  for (int row = 0; row < row_c; row++) {
    for (int col = 0; col < col_c; col++) {
      int bx = keyX + col * (keyW + spacing);
      int by = keyY + row * (keyH + spacing);
      if (x > bx && x < bx + keyW && y > by && y < by + keyH) {
        return keys[row][col];
      }
    }
  }
  return "";
}

const int relayPin = 26;  // Визначення піна, на якому підключений модуль реле
const int ledPin = 24;    // Визначення піна, на якому підключений світлодіод

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

// Норми
float tempNormal = 0.0;
float humidNormal = 0.0;
float gasNormal = 0.0;

void setup() {
  Serial.begin(9600);

  dht.begin();
  pinMode(relayPin, OUTPUT);  // Режим піна, який буде використовуватись для виведення
  pinMode(ledPin, OUTPUT);    // Режим піна, який буде використовуватись для виведення


  uint16_t ID = tft.readID();
  tft.begin(ID);
  tft.setRotation(1);  // LANDSCAPE
  drawFullKeyboard();

  Serial.println("Initialize Ethernet with DHCP:");
  Serial.println(Ethernet.hardwareStatus());
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    if (Ethernet.hardwareStatus() == EthernetNoHardware) {
      Serial.println("Ethernet shield was not found.  Sorry, can't run without hardware. :(");
      while (true) {
        delay(1);
      }
    }
    if (Ethernet.linkStatus() == LinkOFF) {
      Serial.println("Ethernet cable is not connected.");
    }

    Ethernet.begin(mac, ip, dns, gateway, subnet);
    Serial.println(Ethernet.localIP());
  } else {
    Serial.print("  DHCP assigned IP ");
    Serial.println(Ethernet.localIP());
  }

  Serial.println("Ethernet configured");
  Serial.print("Connecting to ");
  Serial.println(server);


  delay(2000);
}

bool confirm = false;
void loop() {
  TSPoint p = ts.getPoint();
  pinMode(XM, OUTPUT);
  pinMode(YP, OUTPUT);
  // Serial.print("Raw touch: ");
  // Serial.print(p.x);
  // Serial.print(" ");
  // Serial.print(p.y);
  // Serial.print(" ");
  // Serial.println(p.z);


  if (confirm == false) {
    if (p.z > MINPRESSURE && p.z < MAXPRESSURE) {
      pixel_x = map(p.y, TS_LEFT, TS_RT, 0, SCREEN_WIDTH);
      pixel_y = map(p.x, TS_TOP, TS_BOT, 0, SCREEN_HEIGHT);

      String key = getKey(pixel_x, pixel_y);
      if (key != "") {
        if (key == "<") {
          if (input.length() > 0)
            input.remove(input.length() - 1);
        } else if (key == ">") {
          Serial.println("PAIRING TOKEN: " + input);
          tft.fillRect(0, 0, SCREEN_WIDTH, 30, BLACK);  // очищаємо попередній текст
          tft.setCursor(20, 10);
          tft.setTextSize(2);
          tft.setTextColor(WHITE);
          tft.print("TOKEH: DONE!");

          // REQUEST START
          String contentType = "application/json";

          Serial.print("connecting to ");
          Serial.println(serverIp);
          Serial.println(ethClient.connect(serverIp, 8080));

          ethClient.connect(serverIp, 8080);

          client.beginRequest();
          client.get("/Account/is-correct-token?token=" + input + "&hardwareId=" + deviceId);
          client.sendHeader("Host", "192.168.1.104");
          client.sendHeader("User-Agent", "Arduino/1.0");
          client.sendHeader("Accept", "application/json");
          client.sendHeader("Connection", "close");
          client.endRequest();

          // if (!ethClient.connect(serverIp, 8080)) {
          //   Serial.println("❌ TCP-з’єднання не вдалося!");
          //   return;
          // }
          // Serial.println("✅ TCP-з’єднання встановлено");

          // if (!client.connected()) {
          //   Serial.println("❌ Не вдалося підключитися до сервера!");
          //   return;
          // }

          // if (client.available() == 0) {
          //   Serial.println("⚠️ Сервер нічого не відповів або запит не дійшов");
          //   return;
          // }

          int statusCode = client.responseStatusCode();
          // if (statusCode <= 0) {
          //   Serial.println("❌ No response or error");
          //   return;
          // }
          Serial.println(statusCode);
          String response = client.responseBody();
          DynamicJsonDocument doc(256);
          DeserializationError error = deserializeJson(doc, response);
          if (error) {
            Serial.print("Deserialization failed: ");
            Serial.println(error.f_str());
            return;  // вихід, якщо десеріалізація не вдалася
          }
          Serial.println(response);
          delay(2000);
          tft.fillRect(0, 0, SCREEN_WIDTH, 30, BLACK);  // очищаємо попередній текст
          tft.setCursor(20, 10);
          tft.setTextSize(2);
          tft.setTextColor(WHITE);
          tft.print(String(doc["status"].as<String>()) + " - " + doc["message"].as<String>());

          if (doc["status"].as<String>() == "200") {

            confirm = true;
          }

          Serial.println("-----------------------------------------------");
          Serial.print("Status code: ");
          Serial.println(statusCode);
          Serial.print("Response: ");
          Serial.println(response);
          Serial.println("-----------------------------------------------");
          // REQUEST END

          input = "";
          return;
        } else {
          if (input.length() < 6)  // Обмеження на довжину токена
            input += key;
        }
        delay(50);  // debounce
        updateInputField();
      }
    }
  } else {
    // Виконання get запиту
    client.beginRequest();
    client.get("/Account/get-normas-by-email?email=newuser@gmail.com");
    client.sendHeader("Host", "192.168.1.104");
    client.sendHeader("User-Agent", "Arduino/1.0");
    client.sendHeader("Accept", "application/json");
    client.sendHeader("Connection", "close");
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

    temperature = dht.readTemperature();  // Зчитування температури
    humidity = dht.readHumidity();        // Зчитування вологості
    gasValue = analogRead(MQ2PIN);        // Зчитування диму

    Serial.println(temperature);
    Serial.println(humidity);
    Serial.println(gasValue);


    conditionFunc(temperature, humidity, gasValue);

    bool isSignificantChange =
      abs(temperature - lastTemperature) > temperatureThreshold || abs(humidity - lastHumidity) > humidityThreshold || abs(gasValue - lastGas) > gasThreshold;

    if (isSignificantChange) {
      DynamicJsonDocument doc(256);
      doc["Temperature"] = String(temperature);
      doc["Humidity"] = String(humidity);
      doc["Gas"] = String(gasValue);
      // doc["DateTime"] = "00.00.0000 00:00:00";
      doc["DeviceName"] = deviceId;

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
  }
  // delay(5000);
}

float parseStringToFloat(String dataStr) {
  dataStr.replace(',', '.');
  float dataNormal = dataStr.toFloat();
  return dataNormal;
}

void conditionFunc(float temp, float humid, float gas) {
  if (temp > tempNormal + 2 || temp < tempNormal - 2 || humid < humidNormal - 10 || humid > humidNormal + 10 || gas > gasNormal - 10 || gas < gasNormal + 10) {
    digitalWrite(relayPin, HIGH);  // Включення світлодіода
    digitalWrite(ledPin, HIGH);    // Включення світлодіода
    Serial.println("Check your data !");
    Serial.println("Something's not in your normal.");
    delay(500);
    digitalWrite(relayPin, LOW);  // Вuключення світлодіода
    digitalWrite(ledPin, LOW);    // Вuключення світлодіода
  } else {
    Serial.println("Everything's in normal period !");
  }
}
