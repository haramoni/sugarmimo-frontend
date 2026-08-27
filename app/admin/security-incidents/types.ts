export type SecurityIncidentRecipient = {
  userId: string | null;
  emailSnapshot: string;
  notifiedAt: string | null;
  emailSentAt: string | null;
  emailError: string | null;
  acknowledgedAt: string | null;
  user: {
    id: string;
    username: string;
    email: string;
    role: string | null;
  } | null;
};

export type SecurityIncidentEvidence = {
  id: string;
  category: string;
  description: string;
  storageReference: string;
  sha256: string | null;
  collectedAt: string;
  retentionUntil: string;
  createdAt: string;
};

export type SecurityIncidentEvent = {
  id: string;
  action: string;
  notes: string | null;
  actorId: string;
  createdAt: string;
};

export type SecurityIncident = {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  occurredAt: string | null;
  detectedAt: string;
  controllerAwareAt: string;
  anpdDeadlineAt: string;
  natureAndCategories: string;
  affectedDataSubjectCount: number | null;
  sensitiveData: boolean;
  vulnerableDataSubjects: boolean;
  financialData: boolean;
  authenticationData: boolean;
  legallyProtectedData: boolean;
  largeScale: boolean;
  relevantRisk: boolean | null;
  riskAssessment: string | null;
  containmentMeasures: string | null;
  likelyConsequences: string | null;
  securityMeasures: string | null;
  mitigationMeasures: string | null;
  delayReason: string | null;
  contactChannel: string;
  anpdNotifiedAt: string | null;
  anpdProtocol: string | null;
  usersNotifiedAt: string | null;
  closedAt: string | null;
  retentionUntil: string;
  createdAt: string;
  updatedAt: string;
  recipients?: SecurityIncidentRecipient[];
  evidence?: SecurityIncidentEvidence[];
  events?: SecurityIncidentEvent[];
  _count: { recipients: number; evidence: number; events: number };
};

export type IncidentListResponse = {
  items: SecurityIncident[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
