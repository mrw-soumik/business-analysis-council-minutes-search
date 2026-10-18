// Generates the BPMN 2.0 XML files (with DI coordinates) from the models.
// Usage: node bpmn/build-bpmn.mjs   (run from the tools folder)
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toBpmnXml } from './lib/writer.mjs';
import { currentState } from './models/current-state.mjs';
import { futureState } from './models/future-state.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../../diagrams');
mkdirSync(outDir, { recursive: true });

const targets = [
  ['current-state.bpmn', currentState],
  ['future-state.bpmn', futureState]
];

for (const [file, model] of targets) {
  const xml = toBpmnXml(model);
  writeFileSync(resolve(outDir, file), xml, 'utf8');
  console.log(`wrote diagrams/${file} (${model.nodes.length} nodes, ${model.sequenceFlows.length} sequence flows, ${model.messageFlows.length} message flows)`);
}
