# Oak Studio 3D — Portal de Envio de Arquivos

Sistema web simples para o projeto de **Extensão Universitária**, permitindo que clientes locais enviem arquivos de modelagem 3D com conformidade à **LGPD**.

## Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express + SQLite

## Início rápido

```bash
# 1. Configurar ambiente
cp .env.example backend/.env

# 2. Backend
cd backend
npm install
npm run migrate
npm run dev

# 3. Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

Abra **http://localhost:5173**

## Área administrativa

- Login: http://localhost:5173/admin
- E-mail: `admin@oakstudio.com`
- Senha: `senha123`

Kanban de pedidos + lista de clientes (cadastro automático no envio do site).

## Estrutura

```
├── frontend/     # Interface React
├── backend/      # API Node.js
├── docs/         # Documentação
└── tests/        # Testes
```

## Documentação

Ver [docs/envio-arquivos.md](docs/envio-arquivos.md)
