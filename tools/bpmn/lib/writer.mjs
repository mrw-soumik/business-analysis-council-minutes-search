// Minimal BPMN 2.0 writer with diagram interchange (DI) coordinates.
// Models are plain objects (see ../models). Coordinates are node centres.

const SIZE = {
  startEvent: [36, 36],
  endEvent: [36, 36],
  intermediateCatchEvent: [36, 36],
  intermediateThrowEvent: [36, 36],
  exclusiveGateway: [50, 50],
  task: [100, 90],
  userTask: [100, 90],
  serviceTask: [100, 90],
  sendTask: [100, 90],
  receiveTask: [100, 90],
  manualTask: [100, 90],
  dataStoreReference: [50, 50]
};

const EXTERNAL_LABEL = new Set([
  'startEvent', 'endEvent', 'intermediateCatchEvent', 'intermediateThrowEvent',
  'exclusiveGateway', 'dataStoreReference'
]);

const ACTIVITY = new Set(['task', 'userTask', 'serviceTask', 'sendTask', 'receiveTask', 'manualTask']);

const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Rough text metrics for label boxes (bpmn-js re-flows text at render time).
const CHAR_W = 6;
const LINE_H = 14;
const LABEL_MAX_W = 90;

function wrap(text, maxWidth = LABEL_MAX_W) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (candidate.length * CHAR_W > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function labelBox(text, cx, cy) {
  const lines = wrap(text);
  const w = Math.min(LABEL_MAX_W, Math.max(...lines.map((l) => l.length * CHAR_W)));
  const h = lines.length * LINE_H;
  return { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w: Math.round(w), h };
}

function withSize(n) {
  const [w, h] = SIZE[n.type] || [100, 80];
  return { ...n, w: n.w ?? w, h: n.h ?? h };
}

function dock(n, side, offset = 0) {
  switch (side) {
    case 'l': return [n.x - n.w / 2, n.y + offset];
    case 'r': return [n.x + n.w / 2, n.y + offset];
    case 't': return [n.x + offset, n.y - n.h / 2];
    case 'b': return [n.x + offset, n.y + n.h / 2];
    default: throw new Error(`Unknown side ${side}`);
  }
}

// Orthogonal routing between two nodes, with optional explicit via points.
function route(src, tgt, r = {}) {
  const from = r.from ?? 'r';
  const to = r.to ?? 'l';
  const p0 = dock(src, from, r.fromOffset ?? 0);
  const p1 = dock(tgt, to, r.toOffset ?? 0);
  const pts = [p0];
  if (r.via) {
    pts.push(...r.via);
  } else {
    const hFrom = from === 'l' || from === 'r';
    const hTo = to === 'l' || to === 'r';
    if (hFrom && hTo) {
      if (p0[1] !== p1[1]) {
        const mx = r.midX ?? Math.round((p0[0] + p1[0]) / 2);
        pts.push([mx, p0[1]], [mx, p1[1]]);
      }
    } else if (!hFrom && !hTo) {
      if (p0[0] !== p1[0]) {
        const my = r.midY ?? Math.round((p0[1] + p1[1]) / 2);
        pts.push([p0[0], my], [p1[0], my]);
      }
    } else if (!hFrom && hTo) {
      pts.push([p0[0], p1[1]]);
    } else {
      pts.push([p1[0], p0[1]]);
    }
  }
  pts.push(p1);
  return pts.map(([x, y]) => [Math.round(x), Math.round(y)]);
}

function defaultFlowLabelCentre(pts, from) {
  const [x, y] = pts[0];
  switch (from) {
    case 'b': return [x + 22, y + 14];
    case 't': return [x + 22, y - 14];
    case 'l': return [x - 28, y - 11];
    default: return [x + 28, y - 11];
  }
}

function defaultNodeLabelCentre(n, pos) {
  const lines = wrap(n.name);
  const h = lines.length * LINE_H;
  switch (pos) {
    case 't': return [n.x, n.y - n.h / 2 - 6 - h / 2];
    case 'l': return [n.x - n.w / 2 - 50, n.y];
    case 'r': return [n.x + n.w / 2 + 50, n.y];
    default: return [n.x, n.y + n.h / 2 + 6 + h / 2];
  }
}

export function toBpmnXml(model) {
  const nodes = new Map(model.nodes.map((n) => [n.id, withSize(n)]));
  const getNode = (id) => {
    const n = nodes.get(id);
    if (!n) throw new Error(`Unknown node ${id} in ${model.id}`);
    return n;
  };

  // Validate flows reference known nodes and belong to one process.
  for (const f of model.sequenceFlows) {
    const s = getNode(f.from);
    const t = getNode(f.to);
    if (s.process !== t.process) throw new Error(`Sequence flow ${f.id} crosses processes`);
  }

  const incoming = new Map();
  const outgoing = new Map();
  for (const f of model.sequenceFlows) {
    if (!outgoing.has(f.from)) outgoing.set(f.from, []);
    if (!incoming.has(f.to)) incoming.set(f.to, []);
    outgoing.get(f.from).push(f.id);
    incoming.get(f.to).push(f.id);
  }

  const dataInputs = new Map(); // activity id -> [{assocId, propId, source}]
  const dataOutputs = new Map(); // activity id -> [{assocId, target}]
  for (const a of model.dataAssociations || []) {
    if (a.kind === 'input') {
      if (!dataInputs.has(a.to)) dataInputs.set(a.to, []);
      dataInputs.get(a.to).push({ assocId: a.id, propId: `Property_${a.to}`, source: a.from });
    } else {
      if (!dataOutputs.has(a.from)) dataOutputs.set(a.from, []);
      dataOutputs.get(a.from).push({ assocId: a.id, target: a.to });
    }
  }

  const ind = (n) => '  '.repeat(n);
  const out = [];
  out.push('<?xml version="1.0" encoding="UTF-8"?>');
  out.push(
    '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
    'xmlns:di="http://www.omg.org/spec/DD/20100524/DI" ' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    `id="Definitions_${model.id}" ` +
    'targetNamespace="https://github.com/mrw-soumik/business-analysis-council-minutes-search" ' +
    'exporter="business-analysis-council-minutes-search/tools/bpmn" exporterVersion="1.0">'
  );

  if (model.documentation) {
    // Documentation lives on the collaboration so it travels with the file.
  }

  // Collaboration
  out.push(`${ind(1)}<bpmn:collaboration id="Collaboration_${model.id}">`);
  if (model.documentation) {
    out.push(`${ind(2)}<bpmn:documentation>${esc(model.documentation)}</bpmn:documentation>`);
  }
  for (const p of model.participants) {
    const ref = p.process ? ` processRef="${p.process}"` : '';
    out.push(`${ind(2)}<bpmn:participant id="${p.id}" name="${esc(p.name)}"${ref} />`);
  }
  for (const m of model.messageFlows) {
    const name = m.name ? ` name="${esc(m.name)}"` : '';
    out.push(`${ind(2)}<bpmn:messageFlow id="${m.id}"${name} sourceRef="${m.from}" targetRef="${m.to}" />`);
  }
  out.push(`${ind(1)}</bpmn:collaboration>`);

  // Processes
  for (const p of model.participants.filter((x) => x.process)) {
    out.push(`${ind(1)}<bpmn:process id="${p.process}" name="${esc(p.processName || p.name)}" isExecutable="false">`);
    if (p.lanes && p.lanes.length) {
      out.push(`${ind(2)}<bpmn:laneSet id="LaneSet_${p.process}">`);
      for (const lane of p.lanes) {
        out.push(`${ind(3)}<bpmn:lane id="${lane.id}" name="${esc(lane.name)}">`);
        for (const n of [...nodes.values()].filter((x) => x.lane === lane.id && x.type !== 'dataStoreReference')) {
          out.push(`${ind(4)}<bpmn:flowNodeRef>${n.id}</bpmn:flowNodeRef>`);
        }
        out.push(`${ind(3)}</bpmn:lane>`);
      }
      out.push(`${ind(2)}</bpmn:laneSet>`);
    }
    for (const n of [...nodes.values()].filter((x) => x.process === p.process)) {
      const tag = `bpmn:${n.type}`;
      const name = n.name ? ` name="${esc(n.name)}"` : '';
      if (n.type === 'dataStoreReference') {
        out.push(`${ind(2)}<${tag} id="${n.id}"${name} />`);
        continue;
      }
      const inner = [];
      for (const id of incoming.get(n.id) || []) inner.push(`<bpmn:incoming>${id}</bpmn:incoming>`);
      for (const id of outgoing.get(n.id) || []) inner.push(`<bpmn:outgoing>${id}</bpmn:outgoing>`);
      if (ACTIVITY.has(n.type)) {
        for (const d of dataInputs.get(n.id) || []) {
          inner.push(`<bpmn:property id="${d.propId}" name="__targetRef_placeholder" />`);
        }
        for (const d of dataInputs.get(n.id) || []) {
          inner.push(`<bpmn:dataInputAssociation id="${d.assocId}"><bpmn:sourceRef>${d.source}</bpmn:sourceRef><bpmn:targetRef>${d.propId}</bpmn:targetRef></bpmn:dataInputAssociation>`);
        }
        for (const d of dataOutputs.get(n.id) || []) {
          inner.push(`<bpmn:dataOutputAssociation id="${d.assocId}"><bpmn:targetRef>${d.target}</bpmn:targetRef></bpmn:dataOutputAssociation>`);
        }
      }
      if (n.eventDef === 'message') inner.push(`<bpmn:messageEventDefinition id="MessageEventDefinition_${n.id}" />`);
      if (n.eventDef === 'timer') {
        inner.push(`<bpmn:timerEventDefinition id="TimerEventDefinition_${n.id}"><bpmn:timeCycle xsi:type="bpmn:tFormalExpression">${esc(n.timeCycle || 'R/P1D')}</bpmn:timeCycle></bpmn:timerEventDefinition>`);
      }
      if (inner.length) {
        out.push(`${ind(2)}<${tag} id="${n.id}"${name}>`);
        for (const line of inner) out.push(`${ind(3)}${line}`);
        out.push(`${ind(2)}</${tag}>`);
      } else {
        out.push(`${ind(2)}<${tag} id="${n.id}"${name} />`);
      }
    }
    for (const f of model.sequenceFlows.filter((x) => getNode(x.from).process === p.process)) {
      const name = f.name ? ` name="${esc(f.name)}"` : '';
      out.push(`${ind(2)}<bpmn:sequenceFlow id="${f.id}"${name} sourceRef="${f.from}" targetRef="${f.to}" />`);
    }
    for (const a of (model.annotations || []).filter((x) => getNode(x.target).process === p.process)) {
      out.push(`${ind(2)}<bpmn:textAnnotation id="${a.id}">`);
      out.push(`${ind(3)}<bpmn:text>${esc(a.text)}</bpmn:text>`);
      out.push(`${ind(2)}</bpmn:textAnnotation>`);
      out.push(`${ind(2)}<bpmn:association id="Association_${a.id}" associationDirection="None" sourceRef="${a.target}" targetRef="${a.id}" />`);
    }
    out.push(`${ind(1)}</bpmn:process>`);
  }

  // Diagram interchange
  out.push(`${ind(1)}<bpmndi:BPMNDiagram id="BPMNDiagram_${model.id}" name="${esc(model.name)}">`);
  out.push(`${ind(2)}<bpmndi:BPMNPlane id="BPMNPlane_${model.id}" bpmnElement="Collaboration_${model.id}">`);
  const bounds = (b) => `<dc:Bounds x="${Math.round(b.x)}" y="${Math.round(b.y)}" width="${Math.round(b.w)}" height="${Math.round(b.h)}" />`;
  const shape = (id, b, extra = '', label = null) => {
    out.push(`${ind(3)}<bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}"${extra}>`);
    out.push(`${ind(4)}${bounds(b)}`);
    if (label) {
      out.push(`${ind(4)}<bpmndi:BPMNLabel>`);
      out.push(`${ind(5)}${bounds(label)}`);
      out.push(`${ind(4)}</bpmndi:BPMNLabel>`);
    }
    out.push(`${ind(3)}</bpmndi:BPMNShape>`);
  };
  const edge = (id, pts, label = null) => {
    out.push(`${ind(3)}<bpmndi:BPMNEdge id="${id}_di" bpmnElement="${id}">`);
    for (const [x, y] of pts) out.push(`${ind(4)}<di:waypoint x="${x}" y="${y}" />`);
    if (label) {
      out.push(`${ind(4)}<bpmndi:BPMNLabel>`);
      out.push(`${ind(5)}${bounds(label)}`);
      out.push(`${ind(4)}</bpmndi:BPMNLabel>`);
    }
    out.push(`${ind(3)}</bpmndi:BPMNEdge>`);
  };

  for (const p of model.participants) {
    shape(p.id, p.bounds, ' isHorizontal="true"');
    for (const lane of p.lanes || []) {
      shape(lane.id, { x: p.bounds.x + 30, y: lane.y, w: p.bounds.w - 30, h: lane.h }, ' isHorizontal="true"');
    }
  }
  for (const n of nodes.values()) {
    const b = { x: n.x - n.w / 2, y: n.y - n.h / 2, w: n.w, h: n.h };
    let label = null;
    if (EXTERNAL_LABEL.has(n.type) && n.name) {
      const [cx, cy] = n.labelAt ?? defaultNodeLabelCentre(n, n.labelPos);
      label = labelBox(n.name, cx, cy);
    }
    const extra = n.type === 'exclusiveGateway' ? ' isMarkerVisible="true"' : '';
    shape(n.id, b, extra, label);
  }
  for (const a of model.annotations || []) {
    shape(a.id, { x: a.x, y: a.y, w: a.w, h: a.h });
  }
  for (const f of model.sequenceFlows) {
    const pts = route(getNode(f.from), getNode(f.to), f.route);
    let label = null;
    if (f.name) {
      const [cx, cy] = f.labelAt ?? defaultFlowLabelCentre(pts, f.route?.from ?? 'r');
      label = labelBox(f.name, cx, cy);
    }
    edge(f.id, pts, label);
  }
  for (const m of model.messageFlows) {
    const pts = m.points ?? route(getNode(m.from), getNode(m.to), m.route);
    let label = null;
    if (m.name) {
      const [cx, cy] = m.labelAt;
      label = labelBox(m.name, cx, cy);
    }
    edge(m.id, pts, label);
  }
  for (const a of model.annotations || []) {
    edge(`Association_${a.id}`, a.points);
  }
  for (const d of model.dataAssociations || []) {
    edge(d.id, d.points);
  }
  out.push(`${ind(2)}</bpmndi:BPMNPlane>`);
  out.push(`${ind(1)}</bpmndi:BPMNDiagram>`);
  out.push('</bpmn:definitions>');
  return out.join('\n') + '\n';
}

export { dock, withSize };

export function sizeOf(type) {
  return SIZE[type] || [100, 90];
}

// Helper for models: returns a docking point on a node's boundary.
// side: 't' | 'b' | 'l' | 'r'; offset moves along the side.
export function makeAt(nodes) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return (id, side, offset = 0) => {
    const n = byId.get(id);
    if (!n) throw new Error(`Unknown node ${id}`);
    const [w, h] = sizeOf(n.type);
    switch (side) {
      case 't': return [n.x + offset, n.y - h / 2];
      case 'b': return [n.x + offset, n.y + h / 2];
      case 'l': return [n.x - w / 2, n.y + offset];
      case 'r': return [n.x + w / 2, n.y + offset];
      default: throw new Error(`Unknown side ${side}`);
    }
  };
}
