#include <MCUFRIEND_kbv.h>
#include <TouchScreen.h>
#include <Adafruit_GFX.h>
#include <SPI.h>  // libraries for ethernet
#include <Ethernet.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

byte mac[] = { 0x90, 0xA2, 0xDA, 0x10, 0xCD, 0xCE };
// D8-D0-90-5B-0A-8B
IPAddress ip(192, 168, 1, 104);  // Статична IP Arduino
IPAddress dns(192, 168, 1, 1);
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress myDns(192, 168, 1, 1);

char server[] = "192.168.1.103";

EthernetClient ethClient;
IPAddress serverIp(192, 168, 1, 103);
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

const String deviceId = "arduino-mega-001";

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

void setup() {
  Serial.begin(9600);
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

void loop() {
  TSPoint p = ts.getPoint();
  pinMode(XM, OUTPUT);
  pinMode(YP, OUTPUT);

  if (Ethernet.linkStatus() == LinkOFF) {
    Serial.println("❌ Ethernet кабель не підключено!");
    return;
  }

  // if (!ethClient.connect(serverIp, 8080)) {
  //   Serial.println("❌ TCP-з’єднання не вдалося!");
  //   return;
  // }
  // Serial.println("✅ TCP-з’єднання встановлено");

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
        client.sendHeader("Host", "192.168.1.103");
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
        String response = client.responseBody();

        DynamicJsonDocument doc(256);
        DeserializationError error = deserializeJson(doc, response);
        if (error) {
          Serial.print("Deserialization failed: ");
          Serial.println(error.f_str());
          return;  // вихід, якщо десеріалізація не вдалася
        }
        delay(2000);
        tft.fillRect(0, 0, SCREEN_WIDTH, 30, BLACK);  // очищаємо попередній текст
        tft.setCursor(20, 10);
        tft.setTextSize(2);
        tft.setTextColor(WHITE);
        tft.print(String(doc["status"].as<String>()) + " - " + doc["message"].as<String>());

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
        if (input.length() < 7)  // Обмеження на довжину токена
          input += key;
      }
      delay(300);  // debounce
      updateInputField();
    }
  }
}
