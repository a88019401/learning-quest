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