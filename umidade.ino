#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// ---- CONFIG Wi-Fi ----
const char* ssid = "APEK_Workspace";
const char* password = "dreamteam";

// ---- CONFIG MQTT ----
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_topic = "matheus/sensor/umidade";
const char* mqtt_client_id = "ESP8266Client_Umidade";

// ---- SENSOR ----
const int pinSensor = A0;

// ---- Objetos Wi-Fi e MQTT ----
WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi conectado");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando ao MQTT...");
    if (client.connect(mqtt_client_id)) {
      Serial.println("conectado");
      // Publica uma mensagem de teste ao conectar
      client.publish(mqtt_topic, "ESP8266 Conectado!");
    } else {
      Serial.print("falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5s");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("\nIniciando sensor de umidade...");
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  
  // Configura o pino do sensor
  pinMode(pinSensor, INPUT);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Lê a umidade do sensor
  int leitura = analogRead(pinSensor);
  int umidade = map(leitura, 1023, 300, 0, 100);
  umidade = constrain(umidade, 0, 100);

  // Exibe no Serial Monitor
  Serial.print("Leitura bruta: ");
  Serial.print(leitura);
  Serial.print(" | Umidade do solo: ");
  Serial.print(umidade);
  Serial.println(" %");

  // Envia via MQTT
  char msg[10];
  sprintf(msg, "%d", umidade);
  if (client.publish(mqtt_topic, msg)) {
    Serial.println("Dados publicados com sucesso!");
  } else {
    Serial.println("Falha ao publicar dados!");
  }

  delay(5000); // Aguarda 5 segundos
}