
// Este script é usado pelo Railway para gerar o arquivo env-config.js
// com as variáveis de ambiente necessárias

const fs = require('fs');
const path = require('path');

// Obtém as variáveis de ambiente
const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  // Adicione outras variáveis de ambiente conforme necessário
};

// Cria o conteúdo do arquivo
const content = `
// Este arquivo foi gerado automaticamente durante o deploy
window.env = ${JSON.stringify(env)};
console.log("Variáveis de ambiente carregadas:", Object.keys(window.env).filter(k => window.env[k]).length);
`;

// Certifica-se de que o diretório public existe
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Escreve no arquivo
const filePath = path.join(publicDir, 'env-config.js');
fs.writeFileSync(filePath, content);
console.log('Arquivo env-config.js gerado em:', filePath);
console.log('Variáveis de ambiente configuradas:', 
  Object.keys(env)
    .filter(key => env[key])
    .map(key => `${key}: ${env[key].substring(0, 3)}...${env[key].slice(-3)}`)
);
