# Módulo de Envio de Arquivos — Oak Studio 3D

## Objetivo

Permitir que clientes locais enviem dados pessoais e arquivos de modelagem 3D de forma segura e transparente, com consentimento explícito conforme a LGPD antes do upload.

## Interface (landing page)

A página inicial é uma **landing page curta** com:

1. **Hero** — proposta de valor da Oak Studio 3D e CTA “Enviar meu arquivo”
2. **Como funciona** — três passos (LGPD → upload → retorno)
3. **Seção de envio** — checkbox LGPD + formulário de upload

## Fluxo do usuário

1. Acessa a landing page e rola até a seção de envio (ou clica no CTA).
2. Lê e aceita os termos de privacidade (LGPD).
3. Preenche nome, e-mail, telefone (opcional) e descrição do projeto.
4. Seleciona o arquivo 3D (STL, OBJ, 3MF, STEP, IGES ou compactado).
5. Envia o formulário.

## Cadastro automático de clientes

Ao enviar um orçamento, o sistema cria ou atualiza o cliente na tabela `clients` (chave: e-mail). O pedido inicia na coluna **Recebido** do kanban administrativo.

## API (backend)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Status da API |
| GET | `/api/privacy` | Texto dos termos LGPD |
| POST | `/api/submissions` | Upload multipart com consentimento |

### Campos do POST (multipart/form-data)

- `clientName` (obrigatório)
- `clientEmail` (obrigatório)
- `clientPhone` (opcional)
- `projectDescription` (opcional)
- `lgpdAccepted` — deve ser `"true"`
- `modelFile` — arquivo 3D

## Armazenamento

- Arquivos: `backend/uploads/` (não versionado no Git)
- Metadados: SQLite em `backend/data/oak-studio.db`
- Logs de auditoria: `backend/logs/app.log`

## Conformidade LGPD

- Consentimento explícito obrigatório antes do envio.
- Registro da data/hora do aceite (`lgpd_accepted_at`).
- Texto dos termos disponível via API e modal na interface.

## Como executar

```bash
# Backend
cd backend && npm install && npm run migrate && npm run dev

# Frontend (outro terminal)
cd frontend && npm install && npm run dev
```

Acesse: http://localhost:5173
