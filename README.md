# AgriSense: Irrigação Inteligente com ESP8266 e MQTT

## Descrição do Projeto

AgriSense é um sistema de irrigação inteligente voltado para jardinagem, hortas urbanas e pequenos produtores. O protótipo monitora a umidade do solo em tempo real e exibe ela em um dashboard, avisando o usuário quando a umidade está baixa, considerando também previsões meteorológicas para evitar regas desnecessárias.

## Principais Funcionalidades

* Leitura da umidade do solo via sensor YL‑69.
* Publicação de dados de umidade em um broker MQTT para dashboards e apps.
* Consulta periódica a uma API de previsão do tempo (OpenWeatherMap) para decisão inteligente de rega.
* Dashboard web em HTML/JavaScript para visualização em tempo real.

## Hardware Utilizado

* **Microcontrolador**: ESP8266 (NodeMCU 1.0)
* **Sensor de Umidade**: YL‑69 (com módulo comparador)

## Tecnologias e Ferramentas

* **Firmware**: Arduino IDE (C/C++)
* **Comunicação Sem Fio**: Wi‑Fi integrado do ESP8266
* **Protocolo IoT**: MQTT (com broker público `broker.emqx.io`)
* **Front‑end**: HTML, CSS, JavaScript (Paho MQTT)
* **API Tempo**: OpenWeatherMap (Current Weather)

## Como Executar

1. Clone este repositório:

   ```bash
   git clone https://github.com/matheusecke/agrisense.git
   cd agrisense
   ```
2. Abra o código do firmware no Arduino IDE (`firmware/umidade.ino`), configure sua rede Wi‑Fi e publique no tópico MQTT.
3. Substitua os valores da rede wifi, e do tópico MQTT (tanto no umidade.ino, quando no app.js)
3. No diretório, abra `index.html` em um navegador. O dashboard conecta-se automaticamente ao broker e exibe a umidade e clima.
4. Gere sua API Key em [https://openweathermap.org/api](https://openweathermap.org/api) e ajuste a variável "apiKey" em `app.js` para habilitar previsões de chuva.