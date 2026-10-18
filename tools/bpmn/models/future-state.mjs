// Future state (to-be): finding what council decided with the
// St. John's Council Minutes Assistant, plus the scheduled ingestion pipeline.
import { makeAt } from '../lib/writer.mjs';

const cityY = 110;
const u0 = 320; // not-found branch row
const u1 = 440; // main row
const u2 = 550; // bypass row (edge only)
const a1 = 760; // answer service main row
const a2 = 865; // answer service not-found row
const i1 = 1005; // ingestion main row
const i2 = 1115; // ingestion exception row
const LANE_SPLIT = 925; // boundary between the answer and ingestion lanes
const ASSIST_BOTTOM = 1175;
const ESC_TOP = 1215;

const CITY = 'Process_City_ToBe';
const USER = 'Process_User_ToBe';
const ASSIST = 'Process_Assistant_ToBe';
const STAFF = 'Lane_Staff_ToBe';
const ANSWER = 'Lane_Answer_ToBe';
const INGEST = 'Lane_Ingest_ToBe';

const nodes = [
  // City staff
  { id: 'ToBe_City_EnquiryReceived', type: 'startEvent', eventDef: 'message', name: 'Enquiry received', process: CITY, lane: STAFF, x: 755, y: cityY, labelPos: 't' },
  { id: 'ToBe_City_AskAssistant', type: 'userTask', name: 'Ask the assistant and verify', process: CITY, lane: STAFF, x: 875, y: cityY },
  { id: 'ToBe_City_Reply', type: 'sendTask', name: 'Reply with the official link', process: CITY, lane: STAFF, x: 1010, y: cityY },
  { id: 'ToBe_City_Closed', type: 'endEvent', name: 'Enquiry closed', process: CITY, lane: STAFF, x: 1130, y: cityY },

  // Resident, journalist or community volunteer
  { id: 'ToBe_Start', type: 'startEvent', name: 'Question about a council decision', process: USER, x: 190, y: u1 },
  { id: 'ToBe_JoinAsk', type: 'exclusiveGateway', process: USER, x: 290, y: u1 },
  { id: 'ToBe_Ask', type: 'userTask', name: 'Ask a question (optional dates)', process: USER, x: 400, y: u1 },
  { id: 'ToBe_Response', type: 'intermediateCatchEvent', eventDef: 'message', name: 'Response received', process: USER, x: 520, y: u1, labelPos: 't' },
  { id: 'ToBe_AnswerFound', type: 'exclusiveGateway', name: 'Answer found?', process: USER, x: 620, y: u1 },
  { id: 'ToBe_Review', type: 'userTask', name: 'Review answer and excerpts', process: USER, x: 740, y: u1 },
  { id: 'ToBe_Verify', type: 'exclusiveGateway', name: 'Verify or quote?', process: USER, x: 860, y: u1, labelPos: 't' },
  { id: 'ToBe_OpenOfficial', type: 'userTask', name: 'Open the official page', process: USER, x: 980, y: u1 },
  { id: 'ToBe_JoinDone', type: 'exclusiveGateway', process: USER, x: 1100, y: u1 },
  { id: 'ToBe_EndFound', type: 'endEvent', name: 'Decision found', process: USER, x: 1190, y: u1 },
  { id: 'ToBe_NextStep', type: 'exclusiveGateway', name: 'Next step?', process: USER, x: 620, y: u0, labelPos: 't' },
  { id: 'ToBe_AskCity', type: 'task', name: 'Contact the Clerk\'s office or 311', process: USER, x: 770, y: u0 },
  { id: 'ToBe_EndAnswered', type: 'endEvent', name: 'Answer received', process: USER, x: 890, y: u0 },

  // Assistant: answer service
  { id: 'ToBe_QuestionReceived', type: 'startEvent', eventDef: 'message', name: 'Question received', process: ASSIST, lane: ANSWER, x: 400, y: a1 },
  { id: 'ToBe_Retrieve', type: 'serviceTask', name: 'Retrieve passages (hybrid search)', process: ASSIST, lane: ANSWER, x: 510, y: a1 },
  { id: 'ToBe_PassagesFound', type: 'exclusiveGateway', name: 'Passages found?', process: ASSIST, lane: ANSWER, x: 630, y: a1, labelPos: 't' },
  { id: 'ToBe_Draft', type: 'serviceTask', name: 'Draft answer from passages only', process: ASSIST, lane: ANSWER, x: 750, y: a1 },
  { id: 'ToBe_CheckCitations', type: 'serviceTask', name: 'Check every claim is cited', process: ASSIST, lane: ANSWER, x: 880, y: a1 },
  { id: 'ToBe_AllSupported', type: 'exclusiveGateway', name: 'Claims cited?', process: ASSIST, lane: ANSWER, x: 1000, y: a1, labelPos: 't' },
  { id: 'ToBe_Format', type: 'serviceTask', name: 'Add citations, excerpts and links', process: ASSIST, lane: ANSWER, x: 1120, y: a1 },
  { id: 'ToBe_JoinNotFound', type: 'exclusiveGateway', process: ASSIST, lane: ANSWER, x: 1000, y: a2 },
  { id: 'ToBe_NotFound', type: 'serviceTask', name: 'Prepare a "not found" reply', process: ASSIST, lane: ANSWER, x: 1120, y: a2 },
  { id: 'ToBe_JoinRespond', type: 'exclusiveGateway', process: ASSIST, lane: ANSWER, x: 1240, y: a1 },
  { id: 'ToBe_ResponseSent', type: 'endEvent', eventDef: 'message', name: 'Response sent', process: ASSIST, lane: ANSWER, x: 1340, y: a1 },
  { id: 'ToBe_Index', type: 'dataStoreReference', name: 'Minutes index', process: ASSIST, x: 570, y: LANE_SPLIT, labelAt: [570, 886] },

  // Assistant: ingestion pipeline
  { id: 'ToBe_Schedule', type: 'startEvent', eventDef: 'timer', timeCycle: 'R/P1D', name: 'Daily schedule', process: ASSIST, lane: INGEST, x: 190, y: i1 },
  { id: 'ToBe_CheckPortal', type: 'serviceTask', name: 'Check portal for new minutes', process: ASSIST, lane: INGEST, x: 300, y: i1 },
  { id: 'ToBe_NewMinutes', type: 'exclusiveGateway', name: 'New minutes?', process: ASSIST, lane: INGEST, x: 410, y: i1, labelPos: 't' },
  { id: 'ToBe_EndNoChange', type: 'endEvent', name: 'No change', process: ASSIST, lane: INGEST, x: 410, y: i2 },
  { id: 'ToBe_Download', type: 'serviceTask', name: 'Download, extract text and pages', process: ASSIST, lane: INGEST, x: 530, y: i1 },
  { id: 'ToBe_BuildIndex', type: 'serviceTask', name: 'Split into passages and index', process: ASSIST, lane: INGEST, x: 660, y: i1 },
  { id: 'ToBe_QualityChecks', type: 'serviceTask', name: 'Run automated quality checks', process: ASSIST, lane: INGEST, x: 790, y: i1 },
  { id: 'ToBe_QualityGate', type: 'exclusiveGateway', name: 'Gate passed?', process: ASSIST, lane: INGEST, x: 910, y: i1, labelPos: 't' },
  { id: 'ToBe_Publish', type: 'serviceTask', name: 'Publish index and coverage dates', process: ASSIST, lane: INGEST, x: 1030, y: i1 },
  { id: 'ToBe_EndUpdated', type: 'endEvent', name: 'Index updated', process: ASSIST, lane: INGEST, x: 1150, y: i1 },
  { id: 'ToBe_KeepPrevious', type: 'serviceTask', name: 'Keep previous index; alert maintainer', process: ASSIST, lane: INGEST, x: 1030, y: i2 },
  { id: 'ToBe_EndAlerted', type: 'endEvent', name: 'Maintainer alerted', process: ASSIST, lane: INGEST, x: 1150, y: i2 }
];

const at = makeAt(nodes);

export const futureState = {
  id: 'FutureState',
  name: 'Finding what council decided: future state (to-be)',
  documentation:
    'Future-state process map for the St. John\'s Council Minutes Assistant. ' +
    'Annotations reference requirement IDs in 01-business-requirements-document.md. ' +
    'Independent portfolio project, not affiliated with or endorsed by the City of St. John\'s.',
  participants: [
    {
      id: 'Participant_City_ToBe',
      name: 'City of St. John\'s',
      process: CITY,
      processName: 'Answer a routine enquiry (to-be)',
      bounds: { x: 100, y: 30, w: 1340, h: 190 },
      lanes: [{ id: STAFF, name: 'City Clerk\'s office and 311', y: 30, h: 190 }]
    },
    {
      id: 'Participant_User_ToBe',
      name: 'Resident, journalist or community volunteer',
      process: USER,
      processName: 'Find a council decision (to-be)',
      bounds: { x: 100, y: 260, w: 1340, h: 320 }
    },
    {
      id: 'Participant_Assistant_ToBe',
      name: 'St. John\'s Council Minutes Assistant',
      process: ASSIST,
      processName: 'Answer questions and keep the index current (to-be)',
      bounds: { x: 100, y: 650, w: 1340, h: ASSIST_BOTTOM - 650 },
      lanes: [
        { id: ANSWER, name: 'Answer service', y: 650, h: LANE_SPLIT - 650 },
        { id: INGEST, name: 'Ingestion pipeline', y: LANE_SPLIT, h: ASSIST_BOTTOM - LANE_SPLIT }
      ]
    },
    {
      id: 'Participant_Escribe_ToBe',
      name: 'eSCRIBE public meetings portal (official minutes, unchanged)',
      bounds: { x: 100, y: ESC_TOP, w: 1340, h: 70 }
    }
  ],
  nodes,
  sequenceFlows: [
    // City staff
    { id: 'Flow_ToBe_City_01', from: 'ToBe_City_EnquiryReceived', to: 'ToBe_City_AskAssistant' },
    { id: 'Flow_ToBe_City_02', from: 'ToBe_City_AskAssistant', to: 'ToBe_City_Reply' },
    { id: 'Flow_ToBe_City_03', from: 'ToBe_City_Reply', to: 'ToBe_City_Closed' },
    // User
    { id: 'Flow_ToBe_User_01', from: 'ToBe_Start', to: 'ToBe_JoinAsk' },
    { id: 'Flow_ToBe_User_02', from: 'ToBe_JoinAsk', to: 'ToBe_Ask' },
    { id: 'Flow_ToBe_User_03', from: 'ToBe_Ask', to: 'ToBe_Response' },
    { id: 'Flow_ToBe_User_04', from: 'ToBe_Response', to: 'ToBe_AnswerFound' },
    { id: 'Flow_ToBe_User_05', from: 'ToBe_AnswerFound', to: 'ToBe_Review', name: 'Yes' },
    { id: 'Flow_ToBe_User_06', from: 'ToBe_AnswerFound', to: 'ToBe_NextStep', name: 'No', route: { from: 't', to: 'b' } },
    { id: 'Flow_ToBe_User_07', from: 'ToBe_Review', to: 'ToBe_Verify' },
    { id: 'Flow_ToBe_User_08', from: 'ToBe_Verify', to: 'ToBe_OpenOfficial', name: 'Yes' },
    { id: 'Flow_ToBe_User_09', from: 'ToBe_Verify', to: 'ToBe_JoinDone', name: 'No', route: { from: 'b', to: 'b', via: [[860, u2], [1100, u2]] } },
    { id: 'Flow_ToBe_User_10', from: 'ToBe_OpenOfficial', to: 'ToBe_JoinDone' },
    { id: 'Flow_ToBe_User_11', from: 'ToBe_JoinDone', to: 'ToBe_EndFound' },
    { id: 'Flow_ToBe_User_12', from: 'ToBe_NextStep', to: 'ToBe_AskCity', name: 'Ask the City' },
    { id: 'Flow_ToBe_User_13', from: 'ToBe_NextStep', to: 'ToBe_JoinAsk', name: 'Rephrase', route: { from: 'l', to: 't' } },
    { id: 'Flow_ToBe_User_14', from: 'ToBe_AskCity', to: 'ToBe_EndAnswered' },
    // Answer service
    { id: 'Flow_ToBe_Ans_01', from: 'ToBe_QuestionReceived', to: 'ToBe_Retrieve' },
    { id: 'Flow_ToBe_Ans_02', from: 'ToBe_Retrieve', to: 'ToBe_PassagesFound' },
    { id: 'Flow_ToBe_Ans_03', from: 'ToBe_PassagesFound', to: 'ToBe_Draft', name: 'Yes' },
    { id: 'Flow_ToBe_Ans_04', from: 'ToBe_PassagesFound', to: 'ToBe_JoinNotFound', name: 'No', route: { from: 'b', to: 'l' } },
    { id: 'Flow_ToBe_Ans_05', from: 'ToBe_Draft', to: 'ToBe_CheckCitations' },
    { id: 'Flow_ToBe_Ans_06', from: 'ToBe_CheckCitations', to: 'ToBe_AllSupported' },
    { id: 'Flow_ToBe_Ans_07', from: 'ToBe_AllSupported', to: 'ToBe_Format', name: 'Yes' },
    { id: 'Flow_ToBe_Ans_08', from: 'ToBe_AllSupported', to: 'ToBe_JoinNotFound', name: 'No', route: { from: 'b', to: 't' } },
    { id: 'Flow_ToBe_Ans_09', from: 'ToBe_JoinNotFound', to: 'ToBe_NotFound' },
    { id: 'Flow_ToBe_Ans_10', from: 'ToBe_Format', to: 'ToBe_JoinRespond' },
    { id: 'Flow_ToBe_Ans_11', from: 'ToBe_NotFound', to: 'ToBe_JoinRespond', route: { from: 'r', to: 'b' } },
    { id: 'Flow_ToBe_Ans_12', from: 'ToBe_JoinRespond', to: 'ToBe_ResponseSent' },
    // Ingestion pipeline
    { id: 'Flow_ToBe_Ing_01', from: 'ToBe_Schedule', to: 'ToBe_CheckPortal' },
    { id: 'Flow_ToBe_Ing_02', from: 'ToBe_CheckPortal', to: 'ToBe_NewMinutes' },
    { id: 'Flow_ToBe_Ing_03', from: 'ToBe_NewMinutes', to: 'ToBe_Download', name: 'Yes' },
    { id: 'Flow_ToBe_Ing_04', from: 'ToBe_NewMinutes', to: 'ToBe_EndNoChange', name: 'No', route: { from: 'b', to: 't' } },
    { id: 'Flow_ToBe_Ing_05', from: 'ToBe_Download', to: 'ToBe_BuildIndex' },
    { id: 'Flow_ToBe_Ing_06', from: 'ToBe_BuildIndex', to: 'ToBe_QualityChecks' },
    { id: 'Flow_ToBe_Ing_07', from: 'ToBe_QualityChecks', to: 'ToBe_QualityGate' },
    { id: 'Flow_ToBe_Ing_08', from: 'ToBe_QualityGate', to: 'ToBe_Publish', name: 'Yes' },
    { id: 'Flow_ToBe_Ing_09', from: 'ToBe_QualityGate', to: 'ToBe_KeepPrevious', name: 'No', route: { from: 'b', to: 'l' } },
    { id: 'Flow_ToBe_Ing_10', from: 'ToBe_Publish', to: 'ToBe_EndUpdated' },
    { id: 'Flow_ToBe_Ing_11', from: 'ToBe_KeepPrevious', to: 'ToBe_EndAlerted' }
  ],
  messageFlows: [
    { id: 'Message_ToBe_01', from: 'ToBe_AskCity', to: 'ToBe_City_EnquiryReceived', name: 'Enquiry',
      points: [at('ToBe_AskCity', 't', -15), at('ToBe_City_EnquiryReceived', 'b')], labelAt: [718, 245] },
    { id: 'Message_ToBe_02', from: 'ToBe_City_Reply', to: 'ToBe_AskCity', name: 'Reply',
      points: [at('ToBe_City_Reply', 'b'), [1010, 240], [785, 240], at('ToBe_AskCity', 't', 15)], labelAt: [900, 251] },
    { id: 'Message_ToBe_03', from: 'ToBe_Ask', to: 'ToBe_QuestionReceived', name: 'Question and date range',
      points: [at('ToBe_Ask', 'b'), at('ToBe_QuestionReceived', 't')], labelAt: [345, 622] },
    { id: 'Message_ToBe_04', from: 'ToBe_ResponseSent', to: 'ToBe_Response', name: 'Response: answer or not found',
      points: [at('ToBe_ResponseSent', 't'), [1340, 600], [520, 600], at('ToBe_Response', 'b')], labelAt: [930, 622] },
    { id: 'Message_ToBe_05', from: 'ToBe_CheckPortal', to: 'Participant_Escribe_ToBe', name: 'Request meeting list',
      points: [at('ToBe_CheckPortal', 'b'), [300, ESC_TOP]], labelAt: [245, 1195] },
    { id: 'Message_ToBe_06', from: 'Participant_Escribe_ToBe', to: 'ToBe_Download', name: 'Minutes (PDF, HTML)',
      points: [[530, ESC_TOP], at('ToBe_Download', 'b')], labelAt: [588, 1195] }
  ],
  dataAssociations: [
    { id: 'DataInput_ToBe_Index', kind: 'input', from: 'ToBe_Index', to: 'ToBe_Retrieve',
      points: [[545, LANE_SPLIT], [510, LANE_SPLIT], at('ToBe_Retrieve', 'b')] },
    { id: 'DataOutput_ToBe_Index', kind: 'output', from: 'ToBe_BuildIndex', to: 'ToBe_Index',
      points: [at('ToBe_BuildIndex', 't', -20), [640, LANE_SPLIT], [595, LANE_SPLIT]] }
  ],
  annotations: [
    { id: 'Annotation_ToBe_Citation', target: 'ToBe_OpenOfficial', text: 'Link opens the official document at the cited page (FR-02)', x: 935, y: 300, w: 190, h: 54,
      points: [at('ToBe_OpenOfficial', 't'), [980, 354]] },
    { id: 'Annotation_ToBe_NoClaim', target: 'ToBe_CheckCitations', text: 'No claim without a citation (FR-02, FR-03)', x: 805, y: 662, w: 150, h: 42,
      points: [at('ToBe_CheckCitations', 't'), [880, 704]] },
    { id: 'Annotation_ToBe_Gate', target: 'ToBe_QualityChecks', text: 'Thresholds from NFR-01 and NFR-02', x: 715, y: 1077, w: 150, h: 40,
      points: [at('ToBe_QualityChecks', 'b'), [790, 1077]] },
    { id: 'Annotation_ToBe_Staff', target: 'ToBe_City_AskAssistant', text: 'Staff use the same assistant (BR-03)', x: 815, y: 168, w: 150, h: 40,
      points: [at('ToBe_City_AskAssistant', 'b'), [875, 168]] }
  ]
};
