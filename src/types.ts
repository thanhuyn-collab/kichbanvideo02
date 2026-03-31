export interface ViralAnalysis {
  hook: {
    text: string;
    type: string;
    emotion: string;
  };
  insight: {
    audience: string;
    problem: string;
    reason: string;
  };
  structure: {
    flow: string;
    mainParts: string[];
  };
  viralReasons: string[];
}

export interface RoomInfo {
  furniture: string[];
  utilities: string[];
  plusPoints: string[];
  address: string;
  summary: string;
}

export interface VideoScript {
  hook: string;
  body: string[];
  twist: string;
  cta: string;
}

export interface SalesOutput {
  hooks: string[];
  caption: string;
  titles: string[];
  hashtags: string[];
}

export interface FinalResult {
  transcript?: {
    timestamp: string;
    text: string;
  }[];
  analysis: ViralAnalysis;
  filteredRoom: RoomInfo;
  script: VideoScript;
  sales: SalesOutput;
}
