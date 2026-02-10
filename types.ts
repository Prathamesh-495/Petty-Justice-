
export interface VerdictResponse {
  caseId: string;
  caseTitle: string;
  judgment: string;
  legalPrecedent: string;
  sentence: string;
  moralDamages: string;
  guiltMeter: number;
  dramaLevel: number;
  corruptionNote?: string;
}

export interface Grievance {
  text: string;
  image?: string;
  witness?: string;
  bribe?: string;
  isAppeal?: boolean;
}

export interface GalleryComment {
  name: string;
  comment: string;
  stance: 'Pro-Accuser' | 'Pro-Accused' | 'Chaotic';
}

export type AppStatus = 'idle' | 'deliberating' | 'sentencing' | 'verdict' | 'history';
