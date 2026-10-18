// Current state (as-is): finding what council decided on a topic.
// Only publicly observable steps are modelled for the seeker and the portal;
// City-internal steps are assumptions, labelled as such in the BRD.
import { makeAt } from '../lib/writer.mjs';

const r0 = 205; // keyword search row
const r1 = 330; // main row
const r2 = 455; // not-found branch
const r3 = 565; // escalation row
const staffY = 745;
const atippY = 915;

const SEEK = 'Process_Seeker_AsIs';
const CITY = 'Process_City_AsIs';
const STAFF = 'Lane_Staff_AsIs';
const ATIPP = 'Lane_Atipp_AsIs';
const ESC_BOTTOM = 100; // bottom edge of the eSCRIBE black-box pool

const nodes = [
  // Information seeker
  { id: 'AsIs_Start', type: 'startEvent', name: 'Question about a council decision', process: SEEK, x: 190, y: r1 },
  { id: 'AsIs_OpenCalendar', type: 'userTask', name: 'Open the meeting calendar', process: SEEK, x: 300, y: r1 },
  { id: 'AsIs_JoinRetry', type: 'exclusiveGateway', process: SEEK, x: 410, y: r1 },
  { id: 'AsIs_DateKnown', type: 'exclusiveGateway', name: 'Date known?', process: SEEK, x: 500, y: r1 },
  { id: 'AsIs_Browse', type: 'userTask', name: 'Browse to the meeting date', process: SEEK, x: 625, y: r1 },
  { id: 'AsIs_Search', type: 'userTask', name: 'Search by keyword with filters', process: SEEK, x: 625, y: r0 },
  { id: 'AsIs_JoinFind', type: 'exclusiveGateway', process: SEEK, x: 750, y: r1 },
  { id: 'AsIs_OpenMinutes', type: 'userTask', name: 'Open the minutes, one by one', process: SEEK, x: 870, y: r1 },
  { id: 'AsIs_ReadFind', type: 'userTask', name: 'Read and search the text (Ctrl+F)', process: SEEK, x: 1010, y: r1 },
  { id: 'AsIs_Found', type: 'exclusiveGateway', name: 'Decision found?', process: SEEK, x: 1135, y: r1, labelPos: 't' },
  { id: 'AsIs_Note', type: 'userTask', name: 'Note the meeting, date and item', process: SEEK, x: 1280, y: r1 },
  { id: 'AsIs_EndFound', type: 'endEvent', name: 'Decision found', process: SEEK, x: 1400, y: r1 },
  { id: 'AsIs_NextStep', type: 'exclusiveGateway', name: 'Next step?', process: SEEK, x: 1135, y: r2, labelAt: [1080, 492] },
  { id: 'AsIs_AskCity', type: 'task', name: 'Ask the City Clerk\'s office or 311', process: SEEK, x: 1280, y: r2 },
  { id: 'AsIs_NeedMet', type: 'exclusiveGateway', name: 'Need met?', process: SEEK, x: 1410, y: r2, labelPos: 't' },
  { id: 'AsIs_EndAnswered', type: 'endEvent', name: 'Answer received', process: SEEK, x: 1520, y: r2 },
  { id: 'AsIs_EndGaveUp', type: 'endEvent', name: 'Need not met', process: SEEK, x: 1135, y: r3 },
  { id: 'AsIs_Atipp', type: 'task', name: 'Submit an access request (ATIPPA, 2015)', process: SEEK, x: 1410, y: r3 },
  { id: 'AsIs_EndAtipp', type: 'endEvent', name: 'Response received', process: SEEK, x: 1520, y: r3 },

  // City of St. John's (assumed internal steps)
  { id: 'City_EnquiryReceived', type: 'startEvent', eventDef: 'message', name: 'Enquiry received', process: CITY, lane: STAFF, x: 870, y: staffY },
  { id: 'City_SearchManually', type: 'userTask', name: 'Search and read the minutes', process: CITY, lane: STAFF, x: 1000, y: staffY },
  { id: 'City_Reply', type: 'sendTask', name: 'Reply with the meeting reference', process: CITY, lane: STAFF, x: 1140, y: staffY },
  { id: 'City_EnquiryClosed', type: 'endEvent', name: 'Enquiry closed', process: CITY, lane: STAFF, x: 1270, y: staffY },
  { id: 'City_RequestReceived', type: 'startEvent', eventDef: 'message', name: 'Access request received', process: CITY, lane: ATIPP, x: 1395, y: atippY },
  { id: 'City_ProcessRequest', type: 'userTask', name: 'Process request (20 business days)', process: CITY, lane: ATIPP, x: 1520, y: atippY },
  { id: 'City_RequestClosed', type: 'endEvent', name: 'Request closed', process: CITY, lane: ATIPP, x: 1650, y: atippY }
];

const at = makeAt(nodes);
const gapA = 645; // horizontal message-flow channel between pools
const gapB = 665;

export const currentState = {
  id: 'CurrentState',
  name: 'Finding what council decided: current state (as-is)',
  documentation:
    'Current-state process map for the St. John\'s Council Minutes Assistant business analysis. ' +
    'Seeker and portal steps are based on the public eSCRIBE portal and City web pages reviewed on 2026-10-17. ' +
    'City staff and ATIPP steps are assumptions to validate with stakeholders. ' +
    'Independent portfolio project, not affiliated with or endorsed by the City of St. John\'s.',
  participants: [
    {
      id: 'Participant_Escribe_AsIs',
      name: 'eSCRIBE public meetings portal (City of St. John\'s)',
      bounds: { x: 100, y: 30, w: 1620, h: 70 }
    },
    {
      id: 'Participant_Seeker_AsIs',
      name: 'Information seeker (resident, journalist, community volunteer)',
      process: SEEK,
      processName: 'Find a council decision (as-is)',
      bounds: { x: 100, y: 140, w: 1620, h: 490 }
    },
    {
      id: 'Participant_City_AsIs',
      name: 'City of St. John\'s',
      process: CITY,
      processName: 'Handle enquiries and access requests (as-is, assumed)',
      bounds: { x: 100, y: 680, w: 1620, h: 350 },
      lanes: [
        { id: STAFF, name: 'City Clerk\'s office and 311', y: 680, h: 170 },
        { id: ATIPP, name: 'ATIPP Coordinator', y: 850, h: 180 }
      ]
    }
  ],
  nodes,
  sequenceFlows: [
    { id: 'Flow_AsIs_01', from: 'AsIs_Start', to: 'AsIs_OpenCalendar' },
    { id: 'Flow_AsIs_02', from: 'AsIs_OpenCalendar', to: 'AsIs_JoinRetry' },
    { id: 'Flow_AsIs_03', from: 'AsIs_JoinRetry', to: 'AsIs_DateKnown' },
    { id: 'Flow_AsIs_04', from: 'AsIs_DateKnown', to: 'AsIs_Browse', name: 'Yes' },
    { id: 'Flow_AsIs_05', from: 'AsIs_DateKnown', to: 'AsIs_Search', name: 'No', route: { from: 't', to: 'l' } },
    { id: 'Flow_AsIs_06', from: 'AsIs_Browse', to: 'AsIs_JoinFind' },
    { id: 'Flow_AsIs_07', from: 'AsIs_Search', to: 'AsIs_JoinFind', route: { from: 'r', to: 't' } },
    { id: 'Flow_AsIs_08', from: 'AsIs_JoinFind', to: 'AsIs_OpenMinutes' },
    { id: 'Flow_AsIs_09', from: 'AsIs_OpenMinutes', to: 'AsIs_ReadFind' },
    { id: 'Flow_AsIs_10', from: 'AsIs_ReadFind', to: 'AsIs_Found' },
    { id: 'Flow_AsIs_11', from: 'AsIs_Found', to: 'AsIs_Note', name: 'Yes' },
    { id: 'Flow_AsIs_12', from: 'AsIs_Found', to: 'AsIs_NextStep', name: 'No', route: { from: 'b', to: 't' } },
    { id: 'Flow_AsIs_13', from: 'AsIs_Note', to: 'AsIs_EndFound' },
    { id: 'Flow_AsIs_14', from: 'AsIs_NextStep', to: 'AsIs_AskCity', name: 'Ask the City' },
    { id: 'Flow_AsIs_15', from: 'AsIs_NextStep', to: 'AsIs_EndGaveUp', name: 'Give up', route: { from: 'b', to: 't' } },
    { id: 'Flow_AsIs_16', from: 'AsIs_NextStep', to: 'AsIs_JoinRetry', name: 'Try other terms or meetings', route: { from: 'l', to: 'b' }, labelAt: [960, 440] },
    { id: 'Flow_AsIs_17', from: 'AsIs_AskCity', to: 'AsIs_NeedMet' },
    { id: 'Flow_AsIs_18', from: 'AsIs_NeedMet', to: 'AsIs_EndAnswered', name: 'Yes' },
    { id: 'Flow_AsIs_19', from: 'AsIs_NeedMet', to: 'AsIs_Atipp', name: 'No', route: { from: 'b', to: 't' } },
    { id: 'Flow_AsIs_20', from: 'AsIs_Atipp', to: 'AsIs_EndAtipp' },
    { id: 'Flow_City_01', from: 'City_EnquiryReceived', to: 'City_SearchManually' },
    { id: 'Flow_City_02', from: 'City_SearchManually', to: 'City_Reply' },
    { id: 'Flow_City_03', from: 'City_Reply', to: 'City_EnquiryClosed' },
    { id: 'Flow_City_04', from: 'City_RequestReceived', to: 'City_ProcessRequest' },
    { id: 'Flow_City_05', from: 'City_ProcessRequest', to: 'City_RequestClosed' }
  ],
  messageFlows: [
    { id: 'Message_AsIs_01', from: 'AsIs_Search', to: 'Participant_Escribe_AsIs', name: 'Keyword query',
      points: [at('AsIs_Search', 't', -15), [610, ESC_BOTTOM]], labelAt: [560, 120] },
    { id: 'Message_AsIs_02', from: 'Participant_Escribe_AsIs', to: 'AsIs_Search', name: 'Results list (no excerpts)',
      points: [[640, ESC_BOTTOM], at('AsIs_Search', 't', 15)], labelAt: [692, 120] },
    { id: 'Message_AsIs_03', from: 'Participant_Escribe_AsIs', to: 'AsIs_OpenMinutes', name: 'Minutes (PDF or HTML)',
      points: [[870, ESC_BOTTOM], at('AsIs_OpenMinutes', 't')], labelAt: [925, 120] },
    { id: 'Message_AsIs_04', from: 'AsIs_AskCity', to: 'City_EnquiryReceived', name: 'Enquiry',
      points: [at('AsIs_AskCity', 'b', -15), [1265, gapA], [870, gapA], at('City_EnquiryReceived', 't')], labelAt: [830, 700] },
    { id: 'Message_AsIs_05', from: 'City_Reply', to: 'AsIs_AskCity', name: 'Reply',
      points: [at('City_Reply', 't'), [1140, gapB], [1295, gapB], at('AsIs_AskCity', 'b', 15)], labelAt: [1322, 615] },
    { id: 'Message_AsIs_06', from: 'AsIs_Atipp', to: 'City_RequestReceived', name: 'Access request',
      points: [at('AsIs_Atipp', 'b', -15), at('City_RequestReceived', 't')], labelAt: [1348, 815] },
    { id: 'Message_AsIs_07', from: 'City_ProcessRequest', to: 'AsIs_Atipp', name: 'Response',
      points: [at('City_ProcessRequest', 't'), [1520, gapB], [1425, gapB], at('AsIs_Atipp', 'b', 15)], labelAt: [1557, 780] }
  ],
  annotations: [
    { id: 'Annotation_PP01', target: 'AsIs_Search', text: 'PP-01 Results show documents, not excerpts', x: 690, y: 150, w: 160, h: 40,
      points: [at('AsIs_Search', 'r', -20), [690, 175]] },
    { id: 'Annotation_PP02', target: 'AsIs_OpenMinutes', text: 'PP-02 Documents are opened one at a time', x: 900, y: 168, w: 160, h: 40,
      points: [at('AsIs_OpenMinutes', 't', 35), [905, 208]] },
    { id: 'Annotation_PP03', target: 'AsIs_ReadFind', text: 'PP-03 Ctrl+F needs the exact words used', x: 1080, y: 168, w: 160, h: 40,
      points: [at('AsIs_ReadFind', 't', 40), [1085, 208]] },
    { id: 'Annotation_PP04', target: 'City_SearchManually', text: 'PP-04 Staff repeat the same manual search', x: 930, y: 802, w: 170, h: 40,
      points: [at('City_SearchManually', 'b'), [1000, 802]] },
    { id: 'Annotation_PP05', target: 'City_ProcessRequest', text: 'PP-05 Formal request for already public records', x: 1440, y: 978, w: 175, h: 40,
      points: [at('City_ProcessRequest', 'b'), [1520, 978]] }
  ]
};
