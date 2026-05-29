# Sistema de APIs e Fallback do Global Solution FIAP

## Visão Geral

Este projeto implementa um sistema robusto de integração com múltiplas APIs meteorológicas e de satélite, com um sistema de fallback inteligente que garante que a aplicação nunca quebre, mesmo quando as externas falharem.

## APIs Principais

### 1. OpenWeather API

**Endpoint:** `https://api.openweathermap.org/data/2.5`

**Chave de API:** `VITE_OPENWEATHER_API_KEY`

#### Funcionalidades:
- **Clima Atual:** Fetch de dados meteorológicos em tempo real
  - Temperatura, sensação térmica
  - Umidade, velocidade do vento
  - Visibilidade, pressão atmosférica
  - Condições climáticas (chuva, nuvens, etc.)
  - Precipitação da última hora
  - Coordenadas: latitude/longitude

- **Previsão:** Dados forecast para 8 horas
  - Chuva por período de 3 horas
  - Temperatura prevista
  - Cálculo de risco baseado em chuva + vento

#### Estrutura de Dados:
```typescript
interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  visibility: number;
  pressure: number;
  condition: string;
  rain_1h: number;
  uv: number;
}
```

#### Sistema de Fallback:
- Retorna `null` se a API key não estiver configurada
- Trata erros de rede e respostas HTTP não-sucesso
- Gera dados simulados baseados na cidade selecionada
- Dados simulados incluem variação realista baseada no seed da cidade

### 2. NASA Earthdata (GIBS)

**Endpoint:** `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best`

#### Funcionalidades:
- **Camadas de Satélite:**
  - MODIS Terra - Cor Real: Imagem verdadeira do satélite
  - VIIRS Suomi NPP: Reflectância corrigida
  - Nuvens - Temperatura: Temperatura do topo das nuvens

- **Tiles de Precipitação:**
  - Integração com OpenWeather Map tiles
  - Camada semi-transparenta sobre o mapa

#### Sistema de Fallback:
- Usa data de ontem como padrão (imagens não são live)
- Retorna `null` se API key não estiver disponível
- Imagens são carregadas com cache e otimização

### 3. INMET (Instituto Nacional de Meteorologia)

**Endpoint:** `https://apiprevmet3.inmet.gov.br/avisos/ativos`

#### Funcionalidades:
- **Alertas Meteorológicos:**
  - Fetch de alertas ativos do INMET
  - Mapeamento de severidade (crítico, alto, médio, baixo)
  - Classificação por tipo de evento
  - Probabilidades de risco calculadas

#### Sistema de Fallback:
- Retorna `null` em caso de erro de rede
- Gera alertas simulados se API falhar
- Alertas simulados são atualizados a cada 15 segundos
- Dados simulados incluem variação de localização e tipo

## Sistema de Fallback Inteligente

### Estratégia de Fallback

1. **Verificação Prévia:** Antes de chamar APIs, verifica se as chaves estão configuradas
2. **Tratamento de Erros:** Try/catch em todas as chamadas externas
3. **Dados Simulados:** Geração de dados realistas quando APIs falham
4. **Atualização Contínua:** Sistema de polling para manter dados atualizados

### Geração de Dados Simulados

#### Weather Data:
```typescript
function generateWeatherData(city: string) {
  const seed = city.charCodeAt(0);
  return {
    temp: 18 + (seed % 15),
    feels_like: 16 + (seed % 12),
    humidity: 60 + (seed % 35),
    wind_speed: 5 + (seed % 20),
    visibility: 5 + (seed % 10),
    pressure: 1005 + (seed % 20),
    condition: ["Tempestade", "Chuva Forte", "Nublado", "Parcialmente Nublado", "Limpo"][seed % 5],
    rain_1h: seed % 5 > 2 ? (seed % 30) + 5 : 0,
    uv: seed % 8,
  };
}
```

#### Forecast Data:
```typescript
function generateForecast() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    rain: Math.max(0, Math.sin(i * 0.3) * 30 + Math.random() * 20 + 10),
    temp: 20 + Math.sin(i * 0.25) * 8 + Math.random() * 3,
    risk: Math.max(0, Math.sin(i * 0.3) * 50 + Math.random() * 30 + 20),
  }));
}
```

#### Alertas Simulados:
- Tipos: ENCHENTE, DESLIZAMENTO, TEMPESTADE, CHUVA INTENSA
- Níveis: medium, low (para evitar falsos positivos)
- Probabilidades: 15-55%
- Localizações: Cidades variadas do Brasil

## Arquitetura de Serviços

### Estrutura de Pastas:
```
src/app/services/
├── weather.ts      # Serviço de clima e previsão
├── satellite.ts    # Serviço de imagens de satélite
└── alerts.ts      # Serviço de alertas meteorológicos
```

### Padrões de Implementação:

1. **Funções Assíncronas com Fallback:**
   - Todas as funções retornam `null` em caso de falha
   - Tratamento consistente de erros
   - Sem lançamento de exceções

2. **Tipagem Forte:**
   - Interfaces TypeScript para todos os dados
   - Validação de tipos em tempo de compilação
   - Documentação inline

3. **Cache e Otimização:**
   - Imagens de satélite com cache
   - Atualização periódica (60 segundos para clima)
   - Debouncing em atualizações rápidas

## Monitoramento e Logs

### Indicadores Visuais:
- Indicador "LIVE" para imagens de satélite
- Status de carregamento com spinners
- Cores indicando status das APIs
- Timestamps de última atualização

### Sistema de Alertas:
- Central de alertas com classificação por severidade
- Probabilidades calculadas dinamicamente
- Fontes identificadas (INMET, IA + NASA, etc.)
- Atualização automática a cada 15 segundos

## Considerações de Performance

1. **Lazy Loading:** Carregamento dinâmico de bibliotecas (Leaflet)
2. **Memoização:** Evita recálculos desnecessários
3. **Virtualização:** Listas roláveis otimizadas
4. **Cache de Imagens:** Evita downloads repetidos

## Configuração de Ambiente

Variáveis necessárias no `.env`:
```
VITE_OPENWEATHER_API_KEY=sua_chave_aqui
```

## Melhores Práticas Implementadas

1. **Defensivo Programming:** Sempre assume que APIs podem falhar
2. **User Experience:** Interface responsiva mesmo sem dados externos
3. **Data Integrity:** Validação de todos os dados recebidos
4. **Error Boundaries:** Componentes isolados para evitar quebras em cascata

## Conclusão

O sistema implementa uma arquitetura resiliente que combina:
- Múltiplas fontes de dados para redundância
- Fallback inteligente com dados realistas
- Tratamento de erros robusto
- Experiência de usuário consistente

Garante que a aplicação funcione 100% do tempo, mesmo com falhas parciais ou totais das APIs externas.