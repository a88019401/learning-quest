import type { UnitConfig, UnitId } from "../types";


const mkUnit = (id: UnitId, title: string): UnitConfig => ({
id,
title,
words: [
{ term: "hello", def: "你好", example: "Hello, my name is Tom." },
{ term: "goodbye", def: "再見", example: "Goodbye! See you tomorrow." },
{ term: "teacher", def: "老師", example: "The teacher is kind." },
{ term: "student", def: "學生", example: "I am a student." },
{ term: "school", def: "學校", example: "Our school is big." },
],
grammar: [
{
point: "be 動詞 (am/is/are)",
desc: "主詞 + be + 補語。",
examples: ["I am a student.", "She is a teacher.", "They are friends."],
},
{
point: "一般現在式",
desc: "描述習慣或事實。第三人稱單數動詞+s。",
examples: ["He goes to school.", "We play basketball."],
},
],
story: {
title: `${title} — A New Friend`,
paragraphs: [
"Tom is new at school. He says hello to everyone.",
"He meets a teacher and a student in the hallway.",
"They show him the library and the playground.",
],
sentencesForArrange: [
"Tom is new at school.",
"He meets a teacher and a student.",
"They show him the library.",
"They play together at the playground.",
],
},
});


export const UNITS: UnitConfig[] = [
mkUnit(1, "Unit 1: Greetings"),
mkUnit(2, "Unit 2: Classroom"),
mkUnit(3, "Unit 3: Family"),
mkUnit(4, "Unit 4: Food"),
mkUnit(5, "Unit 5: Hobbies"),
mkUnit(6, "Unit 6: Travel"),
];