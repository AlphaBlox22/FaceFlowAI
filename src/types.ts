
export enum View {
  DASHBOARD = 'dashboard',
  CAMERA = 'camera',
  ANALYSIS = 'analysis',
  CHAT = 'chat',
}

export interface AnalysisResult {
  scores: {
    overall: number;
    structure: number;
    skin: number;
    grooming: number;
    harmony: number;
  };
  potential: {
    score: number;
    explanation: string;
  };
  breakdown: {
    symmetry: string;
    skin: string;
    jawline: string;
    eyes: string;
    nose: string;
    lips: string;
    hair: string;
  };
  landmarks: {
    label: string;
    x: number; // 0-100
    y: number; // 0-100
    type: 'point' | 'box';
    value?: string;
    width?: number;
    height?: number;
  }[];
  recommendations: {
    skincare: string[];
    grooming: string[];
    lifestyle: string[];
    advanced: string[];
  };
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
