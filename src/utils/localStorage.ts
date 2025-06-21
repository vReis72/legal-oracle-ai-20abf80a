
/**
 * Utilitários para gerenciar o localStorage
 */
export class LocalStorageUtils {
  /**
   * Limpa todo o conteúdo do localStorage
   */
  static clearAll(): void {
    try {
      localStorage.clear();
      console.log('LocalStorage limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }

  /**
   * Remove itens específicos por prefixo
   */
  static clearByPrefix(prefix: string): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
      console.log(`Itens com prefixo "${prefix}" removidos do localStorage`);
    } catch (error) {
      console.error(`Erro ao remover itens com prefixo "${prefix}":`, error);
    }
  }

  /**
   * Lista todos os itens do localStorage para debug
   */
  static listAll(): void {
    try {
      console.log('Conteúdo atual do localStorage:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          console.log(`${key}:`, value?.substring(0, 100) + (value && value.length > 100 ? '...' : ''));
        }
      }
    } catch (error) {
      console.error('Erro ao listar localStorage:', error);
    }
  }

  /**
   * Obtém o tamanho aproximado do localStorage em bytes
   */
  static getStorageSize(): number {
    let total = 0;
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Erro ao calcular tamanho do localStorage:', error);
    }
    return total;
  }

  /**
   * Limpa itens específicos do projeto
   */
  static clearProjectData(): void {
    try {
      // Remove documentos
      this.clearByPrefix('eco_documents');
      // Remove configurações de usuário
      this.clearByPrefix('user_settings');
      // Remove tema
      localStorage.removeItem('app-theme');
      // Remove outros dados específicos do projeto se houver
      console.log('Dados do projeto limpos com sucesso');
    } catch (error) {
      console.error('Erro ao limpar dados do projeto:', error);
    }
  }
}

// Função de conveniência para uso rápido no console
(window as any).clearLocalStorage = () => {
  LocalStorageUtils.clearAll();
  window.location.reload();
};

(window as any).listLocalStorage = () => {
  LocalStorageUtils.listAll();
};

(window as any).clearProjectData = () => {
  LocalStorageUtils.clearProjectData();
  window.location.reload();
};
