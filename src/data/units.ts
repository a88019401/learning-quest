import type { UnitConfig, UnitId } from "../types";

// ✅ Unit 1: Family 專用單字（37筆）
const UNIT1_WORDS = [
  { term: "family", def: "n. 家人；家庭（複數：families〈少見〉）" },
  { term: "husband", def: "n. 丈夫" },
  { term: "wife", def: "n. 妻子（複數：wives）" },
  { term: "uncle", def: "n. 叔／伯父；姑／姨丈；舅舅" },
  { term: "aunt", def: "n. 嬸嬸／伯母；姑／姨媽；舅媽" },
  { term: "cousin", def: "n. 堂（表）兄弟姐妹" },
  { term: "son", def: "n. 兒子" },
  { term: "daughter", def: "n. 女兒" },
  { term: "parent", def: "n. 雙親之一；父／母（常用複數：parents）" },
  { term: "child / children", def: "n. 孩子／孩子們（不規則複數：children）" },
  { term: "young", def: "adj. 年輕的" },
  { term: "man / men", def: "n. 男人／男人們（不規則複數：men）" },
  { term: "handsome", def: "adj. 英俊的" },
  { term: "our", def: "poss. adj./det. 我們的（形容詞性物主代名詞）" },
  { term: "PE (P.E.)", def: "n. 體育（= Physical Education）" },
  { term: "really", def: "adv. 真的；真地（程度副詞）" },
  { term: "classroom", def: "n. 教室" },
  { term: "same", def: "adj. 一樣的；相同的（常與 the 連用：the same）" },
  { term: "class", def: "n. 班級；課程（可數名詞）" },
  { term: "again", def: "adv. 再一次；又" },
  { term: "Nice to meet you.", def: "set phrase 很高興認識你。（句型／寒暄語）" },
  { term: "too", def: "adv. 也；太（句尾「也」；程度「太」）" },
  { term: "news", def: "n. [U] 消息；新聞（不可數名詞）" },
  { term: "problem", def: "n. 問題（可數名詞）" },
  { term: "strict", def: "adj. 嚴格的" },
  { term: "junior high school", def: "n. phr. 國民中學（名詞片語）" },
  { term: "warm", def: "adj. 溫暖的" },
  { term: "farmer", def: "n. 農夫" },
  { term: "cook", def: "n./v. 廚師；煮（可作名詞或動詞）" },
  { term: "nurse", def: "n. 護理師；護士" },
  { term: "beautiful", def: "adj. 漂亮的；美麗的" },
  { term: "woman / women", def: "n. 女人／女人們（不規則複數：women）" },
  { term: "doctor", def: "n. 醫生" },
  { term: "senior high school", def: "n. phr. 高級中學（名詞片語）" },
  { term: "pet", def: "n. 寵物" },
  { term: "cute", def: "adj. 可愛的" },
  { term: "nice", def: "adj. 好的；好心的" },
];

// ✅ Unit 1：文法重點（整理為 UnitConfig['grammar'] 結構）
const UNIT1_GRAMMAR: UnitConfig["grammar"] = [
  {
    point: "不定冠詞 a / an",
    desc:
      "單數可數名詞前用 a 或 an；以「字首發音」判斷：子音音→ a；母音音→ an。注意：有些字雖以母音字母開頭但發子音（如 uniform /juː-/），要用 a；字母念法開頭是母音音（如 M /em/），要用 an。",
    examples: [
      "a teacher; an angry teacher",
      "a uniform; an umbrella; an MRT; a market",
      "This is an apple. / He is a doctor."
    ]
  },
  {
    point: "定冠詞 the",
    desc:
      "指「已提過」或「說話者與聽者皆知道的」特定人事物，單複數名詞前皆可放。",
    examples: [
      "My birthday party is this weekend. The party is at my house.",
      "A: Where’s the bookstore? B: It is next to the park.",
      "A: Who are the boys? B: They are my cousins."
    ]
  },
  {
    point: "姓名與尊稱",
    desc:
      "英文稱謂置於姓氏前：Mr./Mrs./Miss/Ms. + 姓氏；Mr. and Mrs. + 姓氏 表「某氏夫婦」。英文姓名順序為 名字 first name + 姓氏 last name。",
    examples: [
      "This is Mr. Lin. / Ms. Chen is my teacher.",
      "Mr. and Mrs. Johnson are nurses.",
      "Jackie Lin; Benjamin Huang"
    ]
  },
  {
    point: "be 動詞：用法與縮寫",
    desc:
      "現在式有 am / is / are，用來表達主詞的『狀態』，後可接名詞、形容詞或介系詞片語。常見縮寫：I’m / you’re / he’s …；否定：isn’t / aren’t（肯定簡答不可縮寫：Yes, I am.）",
    examples: [
      "Mr. Li is a farmer.（接名詞）",
      "You are tall.（接形容詞）",
      "He is at school.（接介系詞片語）"
    ]
  },
  {
    point: "be 動詞：句型變化",
    desc:
      "肯定：S + be ...；否定：S + be + not ...；Yes/No 問句：Be + S ...? 簡答：Yes, S + be. / No, S + be + not.",
    examples: [
      "My father is a doctor. / My father is not a doctor.",
      "Is your father a doctor? Yes, he is. / No, he isn’t."
    ]
  },
  {
    point: "形容詞：位置與用法",
    desc:
      "形容詞可放在 be 動詞後修飾主詞（表述狀態），也可放在名詞前修飾名詞。少數形容詞（如 afraid）僅能放在 be 後面。",
    examples: [
      "She is tall.（主詞補語）",
      "She is a tall girl.（名詞前）",
      "She is afraid of snakes."
    ]
  },
  {
    point: "對等連接詞 and",
    desc:
      "連接相同詞性（名詞、形容詞、子句等）。連接子句時，重複部分可省略。",
    examples: [
      "Mike and Tina are my classmates.",
      "The park is big and beautiful.",
      "Ivy’s daughter is a doctor, and her son is (a doctor), too."
    ]
  },
  {
    point: "too / either 的用法",
    desc:
      "too 用於肯定句句尾（前加逗號）表『也』；too 也可修飾形容詞表『太…』；either 用於否定句句尾表『也不』。",
    examples: [
      "She is my English teacher, too.",
      "The box is too small.",
      "Mr. Li isn’t my teacher, and Mr. Wang isn’t, either."
    ]
  },
  {
    point: "疑問代名詞 who",
    desc:
      "詢問『姓名或關係』：Who + be + 主詞? 一般視為單數用 is；針對複數群體時用 are。回答要給姓名或與說話者的關係。",
    examples: [
      "Who is that man? He is my uncle.",
      "Who are the girls? They are my classmates."
    ]
  }
];
const UNIT1_STORY: UnitConfig["story"] = {
  title: "Lesson 1: The Lins（林氏家庭）",
  paragraphs: [
    { en: "Hi, I’m Nick.", zh: "嗨，我是 Nick。" },
    { en: "I’m a junior high school student.", zh: "我是一位國中生。" },
    { en: "I’m from a warm family.", zh: "我來自一個溫暖的家庭。" },
    { en: "My grandfather is a farmer.", zh: "我的祖父是一名農夫。" },
    { en: "My grandmother is a cook.", zh: "我的祖母是一名廚師。" },
    { en: "They are nice.", zh: "他們人很好。" },
    { en: "Paul is my father.", zh: "Paul 是我的爸爸。" },
    { en: "He is a tall man.", zh: "他是一位高大的男人。" },
    { en: "He is a nurse.", zh: "他是一位護理師。" },
    { en: "Lily is my mother.", zh: "Lily 是我的媽媽。" },
    { en: "She is a beautiful woman.", zh: "她是一位美麗的女人。" },
    { en: "She is a doctor.", zh: "她是一名醫生。" },
    { en: "Bella is my sister.", zh: "Bella 是我的姐姐。" },
    { en: "She is my English teacher, too.", zh: "她也是我的英文老師。" },
    { en: "Eddie is my brother.", zh: "Eddie 是我的哥哥。" },
    { en: "He’s a senior high school student.", zh: "他是一位高中生。" },
    { en: "Abby is our pet pig.", zh: "Abby 是我們的寵物豬。" },
    { en: "She’s cute.", zh: "她很可愛。" },
  ],
  sentencesForArrange: [
    "I’m a junior high school student.",
    "I’m from a warm family.",
    "My grandfather is a farmer.",
    "My grandmother is a cook.",
    "Paul is my father.",
    "He is a nurse.",
    "Lily is my mother.",
    "She is a doctor.",
    "Bella is my sister.",
    "She is my English teacher, too.",
    "Eddie is my brother.",
    "He’s a senior high school student.",
    "Abby is our pet pig.",
    "She’s cute."
  ]
};


// ✅ mkUnit：改成可選的覆蓋參數
const mkUnit = (
  id: UnitId,
  title: string,
  opts?: {
    words?: UnitConfig["words"];
    grammar?: UnitConfig["grammar"];
    story?: UnitConfig["story"];
  }
): UnitConfig => ({
  id,
  title,
  words: opts?.words ?? [
    { term: "hello", def: "你好", example: "Hello, my name is Tom." },
    { term: "goodbye", def: "再見", example: "Goodbye! See you tomorrow." },
    { term: "teacher", def: "老師", example: "The teacher is kind." },
    { term: "student", def: "學生", example: "I am a student." },
    { term: "school", def: "學校", example: "Our school is big." },
  ],
  grammar: opts?.grammar ?? [
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
  story: opts?.story ?? {
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
  mkUnit(1, "Unit 1: Family", { words: UNIT1_WORDS, grammar: UNIT1_GRAMMAR,story: UNIT1_STORY }), // ← 套用你的家庭單字
  mkUnit(2, "Unit 2: Classroom"),
  mkUnit(3, "Unit 3: Family"),
  mkUnit(4, "Unit 4: Food"),
  mkUnit(5, "Unit 5: Hobbies"),
  mkUnit(6, "Unit 6: Travel")
];

