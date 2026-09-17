/** 選択肢に振るラベル。IPA の午前問題が ア〜エ の 4 択なのに合わせている。 */
export const CHOICE_KEYS = ["ア", "イ", "ウ", "エ"] as const;

/** 選択肢の表示ラベル。4 つを超えたぶんは番号で振る。 */
export const choiceKey = (index: number): string => CHOICE_KEYS[index] ?? String(index + 1);

export type ExamCode = "AP" | "FE" | "SG";
export type Era = "令和" | "平成";
export type Term = "haru" | "aki";
export type Section = "am" | "pm";

/**
 * 出典。問題 ID と出典表記の両方をここから機械的に作る。
 * 手で出典文字列を書くと必ず抜けるので、構造化して持つ（docs 2.3）。
 */
export type Source = {
  exam: ExamCode;
  era: Era;
  /** 元号での年。令和3年度なら 3。 */
  year: number;
  term: Term;
  section: Section;
  /** 問番号。 */
  no: number;
  /**
   * 原本から改変している場合の内容。無改変なら undefined。
   * 値を入れると出典表記の末尾に「（〜）」として出る（docs 2.3）。
   */
  modified?: string;
};

const EXAM_NAMES: Record<ExamCode, string> = {
  AP: "応用情報技術者試験",
  FE: "基本情報技術者試験",
  SG: "情報セキュリティマネジメント試験",
};

const TERM_NAMES: Record<Term, string> = { haru: "春期", aki: "秋期" };
const SECTION_NAMES: Record<Section, string> = { am: "午前", pm: "午後" };

/**
 * 出典表記。IPA が FAQ で示している形式に合わせる。
 *
 * extra は、データではなく表示のしかたで原本と変わっている分（選択肢の並べ替えなど）。
 * 改変は理由を問わず併記する決まりなので、modified と同じ括弧に並べる（docs 2.3）。
 */
export const formatSource = (source: Source, extra?: string): string => {
  const base = `${source.era}${source.year}年度 ${TERM_NAMES[source.term]} ${EXAM_NAMES[source.exam]} ${SECTION_NAMES[source.section]} 問${source.no}`;
  const notes = [source.modified, extra].filter((note): note is string => Boolean(note));
  return notes.length > 0 ? `${base}（${notes.join("、")}）` : base;
};

const ERA_SHORT: Record<Era, string> = { 令和: "R", 平成: "H" };

/** 一覧やカードに出す短い表記。例: "R3春 問1"。 */
export const shortSource = (source: Source): string =>
  `${ERA_SHORT[source.era]}${source.year}${TERM_NAMES[source.term].charAt(0)} 問${source.no}`;

/** 問題 ID。URL・ファイルパス・React のキーを兼ねる。 */
export const sourceId = (source: Source): string => {
  const era = source.era === "令和" ? "r" : "h";
  const year = String(source.year).padStart(2, "0");
  const no = String(source.no).padStart(2, "0");
  return `${source.exam.toLowerCase()}-${era}${year}-${source.term}-${source.section}-${no}`;
};

/**
 * 原本のページ画像から切り出した図（docs 3.5）。
 * src は public/ からの絶対パス。表示時に basePath を前置する。
 */
export type QuestionImage = {
  src: string;
  width: number;
  height: number;
  /** 読み上げ用。図が何を示しているかを書く。 */
  alt: string;
};

export type Choice = {
  text: string;
  /** 選択肢自体が図のとき（原本からの切り出し）。 */
  image?: QuestionImage;
  /** 解説に出す、この選択肢についての補足。本サイトで書いたもの。 */
  note?: string;
};

/** 問題文に添えられるもの。図は原本切り出し、表と箇条書きは HTML で組む（docs 3.5）。 */
export type Stem = {
  image?: QuestionImage;
  list?: { title?: string; items: string[] };
  /** headers は省略可。原本に見出し行が無い表を、見出しを捏造せずに持つため。 */
  table?: { caption?: string; headers?: string[]; rows: string[][] };
};

/** 登場人物と動きを順に並べる図。攻撃の成立手順や検証手順に使う。 */
export type FlowFigure = {
  type: "flow";
  caption: string;
  steps: { actor: string; text: string }[];
};

/** 式を 1 行ずつ積む図。単位換算のような計算問題に使う。 */
export type CalcFigure = {
  type: "calc";
  caption: string;
  lines: { expr: string; note: string }[];
};

/** 比較表。列数は headers の長さで決まる。 */
export type TableFigure = {
  type: "table";
  caption: string;
  headers: string[];
  rows: string[][];
};

/**
 * 配列や記憶枠の中身が、段階ごとにどう変わるかを見せる図。
 * 整列アルゴリズムやページ置換えのように、「どの値がどこへ動いたか」が要点のものに使う。
 */
export type ArrayFigure = {
  type: "array";
  caption: string;
  /** セルの上に出す見出し（添字や枠の番地）。省略すると見出し行は出ない。 */
  headers?: string[];
  rows: {
    /** 左に出す見出し。「1回目」「参照 4」など、その段が何なのかを書く。 */
    label: string;
    cells: string[];
    /** 塗って強調するセルの添字。確定した値や、入れ替わった枠を指す。 */
    marked?: number[];
    /** 比べた（入れ替えた）2 つの位置。セルの上で結んで示す。 */
    swap?: [number, number];
    /** 右に出す短い説明。 */
    note?: string;
  }[];
};

/**
 * 帯の色。意味は持たず、並んだときに隣と見分けるためだけのもの。
 * 同じものが複数の段に出るときは、同じ番号を振って対応を追えるようにする。
 */
export type BarTone = 1 | 2 | 3 | 4 | 5;

/**
 * 時間の流れに沿って、どの処理がいつ動いているかを見せる図。
 * 多重度やスケジューリング、パイプラインのように、時刻と重なりが要点のものに使う。
 */
export type TimelineFigure = {
  type: "timeline";
  caption: string;
  /** 目盛りの数。0 から span までの区間を span 個に刻む。 */
  span: number;
  /** 目盛りの単位（「秒」「サイクル」）。軸の右端に出す。 */
  unit: string;
  tracks: {
    label: string;
    /** start は開始時刻（0 始まり）、length は占める目盛りの数。 */
    bars: { start: number; length: number; label: string; tone?: BarTone }[];
  }[];
  /** 軸の下に立てる目印。到着時刻など、帯ではない出来事を指す。 */
  marks?: { at: number; label: string }[];
};

/** 解説に添える図。こちらは本サイトで組んだもの。 */
export type Figure = FlowFigure | CalcFigure | TableFigure | ArrayFigure | TimelineFigure;

export type Question = {
  source: Source;
  /** 表示用の分野。IPA の解答例は T/M/S しか示さないので、細分類は本サイトで付けている。 */
  field: string;
  /** 正解の選択肢の添字。IPA の解答例から取る。 */
  answer: number;
  text: string;
  stem?: Stem;
  choices: Choice[];
  /**
   * 選択肢を並べ替えずに出す。原本の図が「ア〜エ」で選択肢を指しているなど、
   * 並べ替えると問題そのものが成り立たなくなるものに付ける。
   */
  keepChoiceOrder?: boolean;
  /** 以下は本サイトで書いた解説。IPA の解答例ではない（docs 3.4）。 */
  explain?: string;
  points?: string[];
  figure?: Figure;
};

export type Exam = {
  code: string;
  name: string;
  sub: string;
  group: string;
};
