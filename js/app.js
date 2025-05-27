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
  
  // Configurações de umidade
  const LIMITE_UMIDADE_BAIXA = 30; // Valor em porcentagem
  let ultimaUmidade = null;
  let alertaAtivo = false;
  
  // Evento de mensagem recebida
  client.on('message', function (topic, message) {
    addDebugLog(`Mensagem recebida no tópico ${topic}: ${message.toString()}`);
    const umidadeAtual = parseFloat(message.toString());
    document.getElementById("umidade").innerText = message.toString() + " %";
    
    // Atualiza a barra de progresso
    const progressBar = document.getElementById("humidity-progress");
    progressBar.style.width = `${umidadeAtual}%`;
    
    // Atualiza o valor da última umidade
    ultimaUmidade = umidadeAtual;
    
    // Verifica se a umidade está baixa
    verificarUmidade(umidadeAtual);
  });
  
  function verificarUmidade(umidade) {
    if (umidade < LIMITE_UMIDADE_BAIXA && !alertaAtivo) {
      // Mostra alerta na interface
      mostrarAlerta(`Atenção! Umidade muito baixa: ${umidade}%`);
      alertaAtivo = true;
    } else if (umidade >= LIMITE_UMIDADE_BAIXA && alertaAtivo) {
      // Remove alerta quando a umidade normalizar
      removerAlerta();
      alertaAtivo = false;
    }
  }
  
  function mostrarAlerta(mensagem) {
    // Verifica se já existe um elemento de alerta
    let alertaDiv = document.getElementById('alertaUmidade');
    if (!alertaDiv) {
        alertaDiv = document.createElement('div');
        alertaDiv.id = 'alertaUmidade';
        
        // Cria o botão de fechar
        const closeButton = document.createElement('button');
        closeButton.className = 'close-alert';
        closeButton.innerHTML = '×';
        closeButton.onclick = removerAlerta;
        
        // Cria o container da mensagem
        const messageSpan = document.createElement('span');
        messageSpan.id = 'alertaMensagem';
        
        // Adiciona os elementos ao alerta
        alertaDiv.appendChild(messageSpan);
        alertaDiv.appendChild(closeButton);
        document.body.appendChild(alertaDiv);
    }
    
    // Atualiza a mensagem sem a porcentagem
    document.getElementById('alertaMensagem').textContent = 'Atenção! Umidade muito baixa';
  }
  
  function removerAlerta() {
    const alertaDiv = document.getElementById('alertaUmidade');
    if (alertaDiv) {
      alertaDiv.remove();
    }
  }
  
  // Eventos de erro e desconexão
  client.on('error', function (err) {
    addDebugLog(`Erro na conexão: ${err}`);
    document.getElementById("status").innerText = "Status: Erro na conexão";
  });
  client.on('close', function () {
    addDebugLog('Desconectado do broker');
    document.getElementById("status").innerText = "Status: Desconectado";
  });

  function getWeatherEmoji(condition) {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('chuva') || conditionLower.includes('rain')) {
        return '🌧️';
    } else if (conditionLower.includes('nublado') || conditionLower.includes('clouds')) {
        return '☁️';
    } else if (conditionLower.includes('céu limpo') || conditionLower.includes('clear sky')) {
        return '☀️';
    } else if (conditionLower.includes('neve') || conditionLower.includes('snow')) {
        return '❄️';
    } else if (conditionLower.includes('tempestade') || conditionLower.includes('thunderstorm')) {
        return '⛈️';
    } else if (conditionLower.includes('neblina') || conditionLower.includes('mist') || conditionLower.includes('fog')) {
        return '🌫️';
    } else if (conditionLower.includes('nuvens dispersas') || conditionLower.includes('scattered clouds')) {
        return '⛅';
    } else if (conditionLower.includes('nuvens quebradas') || conditionLower.includes('broken clouds')) {
        return '☁️';
    } else if (conditionLower.includes('chuvisco') || conditionLower.includes('drizzle')) {
        return '🌦️';
    } else {
        return '⛅'; // Emoji padrão para outras condições
    }
  }

  // Variável global para armazenar a localização atual
  let currentLocation = "Campinas,BR";

  // Função para salvar a localização no localStorage
  function saveLocation(location) {
      localStorage.setItem('weatherLocation', location);
  }

  // Função para carregar a localização do localStorage
  function loadLocation() {
      const savedLocation = localStorage.getItem('weatherLocation');
      if (savedLocation) {
          currentLocation = savedLocation;
          document.getElementById('locationInput').value = savedLocation;
      }
  }

  // Adiciona event listeners para o campo de localização
  document.addEventListener('DOMContentLoaded', function() {
      // Carrega a localização salva
      loadLocation();
      
      // Adiciona evento de clique no botão de atualizar
      document.getElementById('updateLocation').addEventListener('click', function() {
          const newLocation = document.getElementById('locationInput').value.trim();
          if (newLocation) {
              currentLocation = newLocation;
              saveLocation(newLocation);
              consultarPrevisaoTempo();
          }
      });

      // Adiciona evento de tecla Enter no campo de input
      document.getElementById('locationInput').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
              const newLocation = this.value.trim();
              if (newLocation) {
                  currentLocation = newLocation;
                  saveLocation(newLocation);
                  consultarPrevisaoTempo();
              }
          }
      });
  });

  function consultarPrevisaoTempo() {
    const apiKey = "9a4bfa65c83bce23bdf5b20fcce8c0ec";
  
    const url = `https://api.openweathermap.org/data/2.5/weather`
              + `?q=${encodeURIComponent(currentLocation)}`
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
          const condicao = data.weather[0].description;
          const temperatura = Math.round(data.main.temp);
          const emoji = getWeatherEmoji(condicao);
          addDebugLog(`Clima em ${currentLocation}: ${emoji} ${condicao}, ${temperatura}°C`);
          const climaDiv = document.getElementById("clima");
          if (climaDiv) climaDiv.innerText = `Clima: ${emoji} ${condicao}, ${temperatura}°C`;
        } else {
          addDebugLog("API não retornou campo 'weather': " + JSON.stringify(data));
        }
      })
      .catch(err => {
        addDebugLog("Erro ao consultar previsão: " + err.message);
        const climaDiv = document.getElementById("clima");
        if (climaDiv) climaDiv.innerText = "Erro ao carregar previsão do tempo";
      });
  }

  // Consulta ao iniciar e a cada 15 minutos
  consultarPrevisaoTempo();
  setInterval(consultarPrevisaoTempo, 600000); // 600.000ms = 10 minutos