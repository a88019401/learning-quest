export type UnitId = 1 | 2 | 3 | 4 | 5 | 6;


export type Word = { term: string; def: string; example?: string };


export type GrammarPoint = {
point: string;
desc: string;
examples: string[];
};


export type Story = {
title: string;
paragraphs: string[];
sentencesForArrange: string[];
};


export type MCQ = {
id: string;
prompt: string;
choices: string[];
correctIndex: number;
explain?: string;
tag?: string;
};


export type UnitConfig = {
id: UnitId;
title: string;
words: Word[];
grammar: GrammarPoint[];
story: Story;
};

// types.ts
export type LevelStat = {
  bestScore: number;      // 該關最佳分數（0~10）
  bestTimeSec: number;    // 該關最佳時間（秒）
  stars: number;          // 該關星數（0~3）
};
