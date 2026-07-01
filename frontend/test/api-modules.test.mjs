import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('api.js espone funzioni torneo e partecipazione', () => {
  const api = readFileSync(join(root, 'js', 'api.js'), 'utf8');
  assert.match(api, /export async function getTournamentDettaglio/);
  assert.match(api, /export async function iscriviTorneo/);
  assert.match(api, /export async function getPartecipantiPartita/);
  assert.match(api, /export async function updateUtente/);
});
