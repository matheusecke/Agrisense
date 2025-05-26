// Toggle do Debug Log
document.getElementById('toggleDebug').addEventListener('click', function() {
  const debugContainer = document.getElementById('debugContainer');
  const button = document.getElementById('toggleDebug');
  debugContainer.classList.toggle('hidden');
  button.textContent = debugContainer.classList.contains('hidden') ? 'Mostrar Debug Log' : 'Ocultar Debug Log';
});

// Função para adicionar logs na tela
function addDebugLog(message) {
    const debugDiv = document.getElementById('debug');
    const timestamp = new Date().toLocaleTimeString();
    debugDiv.innerHTML += `[${timestamp}] ${message}<br>`;
    // Mantém apenas as últimas 10 mensagens
    const lines = debugDiv.innerHTML.split('<br>');
    if (lines.length > 11) {
      debugDiv.innerHTML = lines.slice(-11).join('<br>');
    }
  }
  
  // Função para enviar mensagem de teste
  function enviarMensagemTeste() {
    const mensagem = "TESTE_" + new Date().toLocaleTimeString();
    client.publish('matheus/sensor/umidade', mensagem, function(err) {
      if (!err) {
        addDebugLog(`Mensagem de teste enviada: ${mensagem}`);
      } else {
        addDebugLog(`Erro ao enviar mensagem de teste: ${err}`);
      }
    });
  }
  
  // Configuração do cliente MQTT
  const clientId = "clientId-" + Math.random().toString(16).substr(2, 8);
  const host = "wss://broker.emqx.io:8084/mqtt";
  
  addDebugLog(`Tentando conectar ao broker: ${host}`);
  
  // Conecta ao broker
  const client = mqtt.connect(host, {
    clientId: clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  });
  
  // Evento de conexão
  client.on('connect', function () {
    addDebugLog('Conectado ao broker MQTT');
    document.getElementById("status").innerText = "Status: Conectado";
  
    // Inscreve no tópico
    client.subscribe('matheus/sensor/umidade', function (err) {
      if (!err) {
        addDebugLog('Inscrito no tópico matheus/sensor/umidade');
      } else {
        addDebugLog(`Erro ao se inscrever: ${err}`);
      }
    });
  });
  
  // Evento de mensagem recebida
  client.on('message', function (topic, message) {
    addDebugLog(`Mensagem recebida no tópico ${topic}: ${message.toString()}`);
    document.getElementById("umidade").innerText = message.toString() + " %";
  });
  
  // Eventos de erro e desconexão
  client.on('error', function (err) {
    addDebugLog(`Erro na conexão: ${err}`);
    document.getElementById("status").innerText = "Status: Erro na conexão";
  });
  client.on('close', function () {
    addDebugLog('Desconectado do broker');
    document.getElementById("status").innerText = "Status: Desconectado";
  });

  function consultarPrevisaoTempo() {
    const cidade = "São Paulo";      // ou "Campinas,BR" se ambíguo
    const apiKey = "9a4bfa65c83bce23bdf5b20fcce8c0ec";   // sua chave válida
  
    const url = `https://api.openweathermap.org/data/2.5/weather`
              + `?q=${encodeURIComponent(cidade)}`
              + `&appid=${apiKey}&units=metric&lang=pt_br`;
  
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.weather && data.weather.length > 0) {
          const condicao    = data.weather[0].description;
          const temperatura = Math.round(data.main.temp);
          addDebugLog(`Clima: ${condicao}, ${temperatura}°C`);
          const climaDiv = document.getElementById("clima");
          if (climaDiv) climaDiv.innerText = `Clima: ${condicao}, ${temperatura}°C`;
        } else {
          addDebugLog("API não retornou campo 'weather': " + JSON.stringify(data));
        }
      })
      .catch(err => {
        addDebugLog("Erro ao consultar previsão: " + err.message);
      });
  }

  // Consulta ao iniciar e a cada 15 minutos
  consultarPrevisaoTempo();
  setInterval(consultarPrevisaoTempo, 60000); // 3600.000ms = 1 hora