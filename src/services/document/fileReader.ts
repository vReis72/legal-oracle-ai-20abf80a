
/**
 * Utilitários para leitura de diferentes formatos de arquivo
 */

/**
 * Lê o conteúdo de um arquivo como texto
 * @param file Arquivo a ser lido
 * @returns Promise com o conteúdo do arquivo
 */
export const readFileContent = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    // Timeout aumentado para 60 segundos para arquivos maiores
    const timeoutId = setTimeout(() => {
      reader.abort();
      reject(new Error("Tempo limite excedido ao ler o arquivo"));
    }, 60000);
    
    reader.onload = (event) => {
      clearTimeout(timeoutId);
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Falha ao ler o arquivo"));
      }
    };
    
    reader.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error("Erro ao ler o arquivo"));
    };
    
    reader.onabort = () => {
      clearTimeout(timeoutId);
      reject(new Error("Leitura do arquivo abortada"));
    };
    
    try {
      reader.readAsText(file);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
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
