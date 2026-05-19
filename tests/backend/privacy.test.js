import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('LGPD consent validation', () => {
  it('rejects submission when lgpdAccepted is not true', () => {
    const lgpdAccepted = 'false';
    const valid = lgpdAccepted === 'true';
    assert.equal(valid, false);
  });

  it('accepts submission when lgpdAccepted is true', () => {
    const lgpdAccepted = 'true';
    const valid = lgpdAccepted === 'true';
    assert.equal(valid, true);
  });
});

describe('Allowed file extensions', () => {
  const ALLOWED = new Set([
    '.stl', '.obj', '.3mf', '.step', '.stp',
    '.iges', '.igs', '.zip', '.rar', '.7z',
  ]);

  it('allows STL files', () => {
    assert.ok(ALLOWED.has('.stl'));
  });

  it('rejects unknown extensions', () => {
    assert.ok(!ALLOWED.has('.exe'));
  });
});
