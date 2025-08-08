
import { validateApiKey, handleApiError } from './types';

/**
 * Analyze text content with OpenAI API
 * 
 * @param text Text content to analyze
 * @param apiKey OpenAI API key
 * @returns Analyzed content from OpenAI
 */
export const analyzeWithOpenAI = async (text: string, apiKey: string, fileData?: string): Promise<string> => {
  console.log('🔬 OpenAI DocumentAnalysis: Iniciando análise');
  console.log('🔑 OpenAI DocumentAnalysis: Chave API:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.slice(-4)}` : 'NENHUMA');
  console.log('📄 OpenAI DocumentAnalysis: Tamanho do texto:', text.length);
  
  validateApiKey(apiKey);
  
  if (!text || text.trim().length === 0) {
    console.error('❌ OpenAI DocumentAnalysis: Texto vazio fornecido');
    throw new Error("Nenhum texto fornecido para análise.");
  }

  // Check if this is an OCR document
  const isOcrDocument = text.includes('[PDF_DOCUMENT_FOR_OCR_ANALYSIS:') && fileData;

  if (isOcrDocument && !text.includes('[PDF_DOCUMENT_FOR_OCR_ANALYSIS:')) {
    console.error('❌ OpenAI DocumentAnalysis: Documento OCR sem dados de arquivo');
    throw new Error("Documento para análise OCR deve incluir dados do arquivo.");
  }

  console.log('📤 OpenAI DocumentAnalysis: Preparando requisição para análise');
  if (isOcrDocument) {
    console.log('🔍 OpenAI DocumentAnalysis: Modo OCR ativado para análise de PDF');
  } else {
    console.log('📝 OpenAI DocumentAnalysis: Primeiros 200 caracteres:', text.substring(0, 200));
  }
  
  const messages: any[] = [
    {
      role: 'system',
      content: `⚖️ Você é um assistente jurídico especializado em análise de documentos processuais e jurisprudência brasileira com capacidade de OCR para ler até mesmo documentos escaneados ou com má formatação.

🎯 DIRETRIZES PRINCIPAIS:
- Analise o conteúdo integral do documento, utilizando OCR se necessário para partes escaneadas ou em formato de imagem
- Mantenha atenção especial à estrutura jurídica do documento
- Baseie-se EXCLUSIVAMENTE no conteúdo fornecido, sem adicionar informações externas
- Seja preciso, objetivo e técnico em sua análise jurídica
- Trate erros de OCR ou formatação confusa com tolerância, indicando lacunas explicitamente
- NÃO responda com frases genéricas ou vagas - foque em análise técnica e estruturada

📋 ELEMENTOS A IDENTIFICAR (quando presentes):
- Tipo do documento (sentença, acórdão, petição inicial, contestação, etc.)
- Número do processo
- Tribunal ou instância
- Nome das partes
- Nome do(s) advogado(s)
- Relator ou juiz responsável
- Data de julgamento ou despacho
- Tese ou questão jurídica central
- Fundamentos jurídicos citados (com base legal)
- Dispositivo ou conclusão da decisão

🔍 QUALIDADE DA ANÁLISE:
- Identifique com precisão dispositivos legais, prazos, partes envolvidas e argumentos centrais
- Destaque artigos e leis mencionados especificamente
- Ofereça parecer fundamentado sobre consequências, riscos ou próximos passos
- Mantenha linguagem técnico-jurídica mas clara e objetiva`
    }
  ];

  if (isOcrDocument && fileData) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: `📄 Analise este documento PDF jurídico usando OCR. Extraia e analise todo o conteúdo de forma completa e estruturada.

🎯 ESTRUTURA REQUERIDA DA RESPOSTA:

📌 **METADADOS JURÍDICOS:**
- 📂 **Tipo de Documento:** [identificar tipo]
- 🔢 **Processo:** [número do processo, se presente]
- 🏛️ **Tribunal/Instância:** [tribunal ou vara]
- ⚖️ **Juiz/Relator:** [nome do magistrado]
- 📅 **Data:** [data de julgamento/despacho]
- 👥 **Partes:** [autor(es) e réu(s)]
- 👨‍💼 **Advogados:** [se identificáveis]

📋 **RESUMO JURÍDICO:**
[Contexto do caso, pedido ou matéria em discussão, argumentos centrais de cada parte, fundamentos da decisão, resultado]

🔑 **PONTOS-CHAVE:**
[Pontos específicos que merecem atenção detalhada - dispositivos legais, decisões importantes, argumentos centrais, prazos, valores, precedentes citados, etc. Use formato de lista]

⚖️ **CONCLUSÃO/PARECER:**
[Análise fundamentada sobre o conteúdo, consequências jurídicas, riscos identificados, próximos passos possíveis, orientações práticas]

💡 **INSTRUÇÕES ESPECIAIS:**
- Se algum metadado não estiver disponível, indique "Não identificado"
- Mantenha a formatação com emojis para melhor visualização
- Use OCR para ler o documento completamente, incluindo partes escaneadas
- Foque na qualidade técnica da análise jurídica`
        },
        {
          type: 'image_url',
          image_url: {
            url: fileData
          }
        }
      ]
    });
  } else {
    messages.push({
      role: 'user',
      content: `📄 Analise o documento jurídico abaixo de forma completa e estruturada.

🎯 ESTRUTURA REQUERIDA DA RESPOSTA:

📌 **METADADOS JURÍDICOS:**
- 📂 **Tipo de Documento:** [identificar tipo]
- 🔢 **Processo:** [número do processo, se presente]
- 🏛️ **Tribunal/Instância:** [tribunal ou vara]
- ⚖️ **Juiz/Relator:** [nome do magistrado]
- 📅 **Data:** [data de julgamento/despacho]
- 👥 **Partes:** [autor(es) e réu(s)]
- 👨‍💼 **Advogados:** [se identificáveis]

📋 **RESUMO JURÍDICO:**
[Contexto do caso, pedido ou matéria em discussão, argumentos centrais de cada parte, fundamentos da decisão, resultado]

🔑 **PONTOS-CHAVE:**
[Pontos específicos que merecem atenção detalhada - dispositivos legais, decisões importantes, argumentos centrais, prazos, valores, precedentes citados, etc. Use formato de lista]

⚖️ **CONCLUSÃO/PARECER:**
[Análise fundamentada sobre o conteúdo, consequências jurídicas, riscos identificados, próximos passos possíveis, orientações práticas]

📄 **DOCUMENTO A ANALISAR:**
"""
${text}
"""

💡 **INSTRUÇÕES ESPECIAIS:**
- Se algum metadado não estiver disponível, indique "Não identificado"
- Mantenha a formatação com emojis para melhor visualização
- Foque na qualidade técnica da análise jurídica`
    });
  }

  const requestBody = {
    model: "gpt-4o",
    messages,
    temperature: 0.3,
    max_tokens: 6000
  };
  
  console.log('📤 OpenAI DocumentAnalysis: Enviando requisição:', {
    model: requestBody.model,
    messageCount: requestBody.messages.length,
    maxTokens: requestBody.max_tokens,
    temperature: requestBody.temperature,
    isOcrMode: isOcrDocument
  });
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 OpenAI DocumentAnalysis: Status da resposta:', response.status);
    console.log('📥 OpenAI DocumentAnalysis: Headers da resposta:', Object.fromEntries(response.headers.entries()));

    // Check for network errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI DocumentAnalysis: Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      await handleApiError(response);
    }

    const responseText = await response.text();
    console.log('📦 OpenAI DocumentAnalysis: Resposta bruta recebida (primeiros 200 chars):', responseText.substring(0, 200));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ OpenAI DocumentAnalysis: Erro ao fazer parse da resposta:', parseError);
      console.error('❌ OpenAI DocumentAnalysis: Resposta que causou erro:', responseText);
      throw new Error('Resposta inválida da API OpenAI - não é JSON válido');
    }
    
    console.log('📊 OpenAI DocumentAnalysis: Dados da resposta:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasFirstChoice: !!data.choices?.[0],
      hasMessage: !!data.choices?.[0]?.message,
      hasContent: !!data.choices?.[0]?.message?.content,
      usage: data.usage
    });
    
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('❌ OpenAI DocumentAnalysis: Estrutura de resposta inválida:', data);
      throw new Error("Resposta da API com estrutura inválida");
    }
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('❌ OpenAI DocumentAnalysis: Conteúdo vazio na resposta:', data.choices[0]);
      throw new Error("Resposta vazia da API");
    }
    
    console.log('✅ OpenAI DocumentAnalysis: Análise concluída com sucesso');
    console.log('📝 OpenAI DocumentAnalysis: Conteúdo da resposta (primeiros 150 chars):', content.substring(0, 150));
    console.log('📈 OpenAI DocumentAnalysis: Tokens usados:', data.usage);
    
    return content;
  } catch (error) {
    console.error('💥 OpenAI DocumentAnalysis: Falha na chamada da API:', error);
    
    // Enhance error context
    if (error instanceof Error) {
      // Network-related errors
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        console.error('🌐 OpenAI DocumentAnalysis: Erro de rede detectado');
        throw new Error("Falha de conexão com a API OpenAI. Verifique sua conexão de internet.");
      }
      throw error;
    }
    
    throw new Error("Erro desconhecido durante a análise do documento");
  }
};
