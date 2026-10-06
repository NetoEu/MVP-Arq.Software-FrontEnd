# Validação das correções — 26/09/2026

## Executado

- Instalação das dependências em ambiente Python 3.12 limpo; `pip check` sem conflitos.
- Dez testes de regressão da API aprovados, incluindo rollback, validação, CRUD e OpenAPI.
- Sintaxe do JavaScript validada com `node --check`.
- Navegador: cadastro, edição por formulário, persistência após recarregar, data sem deslocamento de fuso e conteúdo HTML exibido como texto. Esses testes usaram um banco temporário e uma resposta ViaCEP simulada.
- Consulta real ao ViaCEP através da API, criação, edição e exclusão por HTTP aprovadas em banco temporário. O ambiente de teste precisou de `REQUESTS_CA_BUNDLE` com as autoridades já confiáveis pelo sistema Windows; a validação HTTPS permaneceu ativa.
- Tratamento de indisponibilidade externa observado na interface.
- Banco original: integridade SQLite `ok`; SHA-256 antes e depois idêntico.
- Git do backend: 42 objetos restaurados a partir do remoto, preservando HEAD, índice original em backup e arquivos locais. `git fsck --full` não reportou corrupção; há dois commits sem referência preservados.
- Ambiente virtual, caches e banco removidos apenas do índice Git; os arquivos locais foram mantidos. As remoções estão preparadas para o próximo commit.

## Validação posterior com Docker

- Docker Desktop instalado e engine Linux acessível.
- Imagens do frontend e backend construídas com sucesso pelo Compose.
- Ambos os containers iniciados nas portas 8080 e 5000.
- Frontend (`/`), Swagger, listagem de pedidos pelo proxy e consulta real ao ViaCEP pelo proxy retornaram HTTP 200.

## Limites desta validação

- Build, inicialização e proxy Docker foram validados posteriormente, conforme a seção acima. A persistência após recriação dos containers ainda deve ser conferida antes da apresentação.
- A confirmação nativa foi substituída por um diálogo na página. Cadastro, edição, busca e exclusão de um registro temporário foram validados no navegador com o novo formulário.
- Este relatório registra as verificações técnicas; os commits de entrega estão no histórico dos respectivos repositórios.
- O atendimento aos critérios de originalidade, percentual de código novo e vídeo ainda depende da preparação da entrega acadêmica.

## Antes da apresentação

Execute `docker compose up --build` na raiz do frontend, faça o checklist do README e depois `docker compose down` / `docker compose up` para confirmar a persistência. Grave o vídeo somente após essa conferência.
