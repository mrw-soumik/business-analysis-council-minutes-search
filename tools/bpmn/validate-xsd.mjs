// Validates the BPMN files against the official OMG BPMN 2.0 XML schema with xmllint.
// The schema files are downloaded once from omg.org into tools/build/omg-bpmn-xsd (not committed).
// Usage: node bpmn/validate-xsd.mjs   (run from the tools folder; needs network on first run and xmllint)
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const xsdDir = resolve(here, '../build/omg-bpmn-xsd');
const diagrams = resolve(here, '../../diagrams');
const BASE = 'https://www.omg.org/spec/BPMN/20100501/';
const SCHEMAS = ['BPMN20.xsd', 'Semantic.xsd', 'BPMNDI.xsd', 'DC.xsd', 'DI.xsd'];

mkdirSync(xsdDir, { recursive: true });
for (const name of SCHEMAS) {
  const target = resolve(xsdDir, name);
  if (existsSync(target)) continue;
  const res = await fetch(BASE + name);
  if (!res.ok) throw new Error(`Could not download ${name}: HTTP ${res.status}`);
  writeFileSync(target, Buffer.from(await res.arrayBuffer()));
  console.log(`downloaded ${name}`);
}

let failed = false;
for (const file of ['current-state.bpmn', 'future-state.bpmn']) {
  try {
    execFileSync('xmllint', ['--noout', '--nonet', '--schema', resolve(xsdDir, 'BPMN20.xsd'), resolve(diagrams, file)], { stdio: ['ignore', 'pipe', 'pipe'] });
    console.log(`OK   ${file} is valid against the OMG BPMN 2.0 schema`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${file}\n${err.stderr?.toString() || err.message}`);
  }
}
if (failed) process.exit(1);
