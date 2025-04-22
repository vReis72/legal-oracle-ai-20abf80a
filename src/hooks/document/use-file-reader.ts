
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
    
    // Timeout para evitar que a leitura fique presa
    const timeoutId = setTimeout(() => {
      reader.abort();
      reject(new Error("Timeout ao ler o arquivo"));
    }, 30000); // Reduzimos para 30 segundos para evitar esperas longas
    
    reader.onload = (event) => {
      clearTimeout(timeoutId);
      if (event.target?.result) {
        let content = '';
        
        try {
          content = event.target.result as string;
          
          // Para PDFs, fazemos uma limpeza agressiva
          if (file.name.toLowerCase().endsWith('.pdf')) {
            console.log("Limpando conteúdo de PDF para melhor processamento");
            
            // Remover caracteres nulos que podem prejudicar o processamento
            content = content.replace(/\0/g, ' ');
            
            // Normalizar quebras de linha
            content = content.replace(/\r\n/g, '\n');
            
            // Remover caracteres de controle e bytes estranhos que podem vir em PDFs
            content = content.replace(/[\x01-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
            
            // Substituir sequências longas de espaços por um único espaço
            content = content.replace(/\s{2,}/g, ' ');
            
            // NOVO: Limitar o tamanho do conteúdo para evitar problemas
            if (content.length > 10000) {
              console.log(`Limitando conteúdo do PDF de ${content.length} para 10000 caracteres`);
              content = content.substring(0, 10000);
            }
          }
          
          resolve(content);
        } catch (error) {
          console.error("Erro ao processar conteúdo:", error);
          // Em caso de erro, entregamos o conteúdo limitado e limpo
          resolve(content.substring(0, 5000).replace(/[^\x20-\x7E]/g, ' '));
        }
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
      // Para PDFs e outros arquivos, tentamos como texto
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
