# Área Administrativa — Oak Studio 3D

## Acesso

- URL: `/admin`
- Painel: `/admin/painel`
- Usuário padrão: `admin@oakstudio.com`
- Senha: `senha123`

> Altere a senha em produção criando nova migration ou atualizando o hash no banco.

## Funcionalidades

### Kanban de pedidos

Colunas do fluxo:

| Status | Significado |
|--------|-------------|
| recebido | Novo envio do site |
| analise | Em análise técnica |
| orcamento | Orçamento enviado |
| producao | Em impressão |
| concluido | Finalizado |

Arraste os cards entre colunas para atualizar o status.

### Lista de clientes

Clientes são **cadastrados automaticamente** quando enviam um orçamento no site (identificados pelo e-mail). Dados são atualizados em novos envios.

## APIs Admin

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/admin/login` | Autenticação |
| GET | `/api/admin/me` | Usuário logado |
| GET | `/api/admin/kanban` | Quadro kanban |
| PATCH | `/api/admin/submissions/:id/status` | Atualizar status |
| GET | `/api/admin/submissions/:id/file` | Download do arquivo |
| GET | `/api/admin/clients` | Lista de clientes |

Todas as rotas admin (exceto login) exigem header `Authorization: Bearer <token>`.
