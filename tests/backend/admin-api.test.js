import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { KANBAN_STATUSES } from '../../backend/src/db/database.js';

const API = process.env.API_URL || 'http://localhost:3001';

async function fetchJson(path, options = {}) {
  const res = await fetch(`${API}${path}`, options);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

describe('Admin API integration', { skip: !process.env.RUN_API_TESTS }, () => {
  let token;

  it('POST /api/admin/login accepts admin credentials', async () => {
    const { res, data } = await fetchJson('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@oakstudio.com',
        password: 'senha123',
      }),
    });
    assert.equal(res.status, 200);
    assert.ok(data.token);
    token = data.token;
  });

  it('GET /api/admin/kanban requires auth', async () => {
    const unauth = await fetchJson('/api/admin/kanban');
    assert.equal(unauth.res.status, 401);

    const { res, data } = await fetchJson('/api/admin/kanban', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(data.columns));
    assert.equal(data.columns.length, KANBAN_STATUSES.length);
  });

  it('GET /api/admin/clients requires auth', async () => {
    const { res, data } = await fetchJson('/api/admin/clients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(data.clients));
  });
});

describe('Kanban statuses', () => {
  it('has five pipeline stages', () => {
    assert.equal(KANBAN_STATUSES.length, 5);
    assert.deepEqual(KANBAN_STATUSES, [
      'recebido',
      'analise',
      'orcamento',
      'producao',
      'concluido',
    ]);
  });
});
