
/**
 * Hook para leitura de arquivos
 */

/**
 * Lê o conteúdo de um arquivo como texto
 * @param file Arquivo a ser lido
 * @returns Promise com o conteúdo do arquivo
 */
export const readFileContent = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        let content = event.target.result as string;
        
        // Para PDFs, fazemos uma limpeza básica para melhorar a extração
        if (file.name.toLowerCase().endsWith('.pdf')) {
          console.log("Limpando conteúdo de PDF para melhor processamento");
          // Remover caracteres nulos que podem prejudicar o processamento
          content = content.replace(/\0/g, ' ');
          // Normalizar quebras de linha
          content = content.replace(/\r\n/g, '\n');
        }
        
        resolve(content);
      } else {
        reject(new Error("Falha ao ler o arquivo"));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    
    // Para arquivos PDF, tentamos como texto primeiro
    reader.readAsText(file);
  });
};

/**
 * Cria uma promise que rejeita após um timeout
 * @param timeout Tempo limite em milissegundos
 * @returns Promise que rejeita após o timeout
 */
export const createTimeoutPromise = (timeout: number): Promise<never> => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Tempo limite excedido")), timeout);
  });
};
