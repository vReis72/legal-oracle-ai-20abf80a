
# Instruções para Atualizar o Repositório no GitHub

Este documento explica como atualizar o repositório GitHub com as alterações feitas no projeto Legal Oracle AI.

## Pré-requisitos

- Git instalado em seu computador
- Acesso ao repositório GitHub do projeto

## Passos para atualização

1. Abra um terminal ou prompt de comando

2. Navegue até o diretório do projeto:
```bash
cd caminho/para/seu-projeto
```

3. Verifique o status das alterações:
```bash
git status
```

4. Adicione todas as alterações ao staging:
```bash
git add .
```

5. Faça um commit com uma mensagem descritiva:
```bash
git commit -m "Correção do tema padrão para light e ajustes no ThemeProvider"
```

6. Envie as alterações para o GitHub:
```bash
git push origin main
```
(Substitua "main" pelo nome da sua branch principal, caso seja diferente)

7. Verifique no GitHub se as alterações foram enviadas com sucesso acessando a página do seu repositório.

## Notas importantes

- Se você estiver usando a plataforma Lovable, as alterações feitas através da interface deveriam ser commitadas automaticamente.
- Caso encontre erros ao tentar fazer push, pode ser necessário fazer um pull antes:
```bash
git pull origin main
```

## Solução de problemas comuns

### Conflitos de merge
Se você encontrar conflitos de merge:

1. Resolva os conflitos manualmente
2. Adicione os arquivos resolvidos:
```bash
git add .
```
3. Continue o merge:
```bash
git merge --continue
```

### Autenticação
Se tiver problemas de autenticação, verifique se:
- Suas credenciais do GitHub estão configuradas corretamente
- Você tem permissão para fazer push no repositório
