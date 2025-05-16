
// Este script é usado pelo Railway para gerar o arquivo env-config.js
// com as variáveis de ambiente necessárias

const fs = require('fs');

// Obtém as variáveis de ambiente
const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  // Adicione outras variáveis de ambiente conforme necessário
};

// Cria o conteúdo do arquivo
const content = `
// Este arquivo foi gerado automaticamente durante o deploy
window.env = ${JSON.stringify(env)};
`;

// Escreve no arquivo
fs.writeFileSync('./public/env-config.js', content);
console.log('Arquivo env-config.js gerado com sucesso!');
