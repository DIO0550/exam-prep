/** 選択肢に振るラベル。IPA の午前問題が ア〜エ の 4 択なのに合わせている。 */
export const CHOICE_KEYS = ["ア", "イ", "ウ", "エ"] as const;

/** 選択肢の表示ラベル。4 つを超えたぶんは番号で振る。 */
export const choiceKey = (index: number): string => CHOICE_KEYS[index] ?? String(index + 1);

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

export type Figure = FlowFigure | CalcFigure | TableFigure;

/** 選択肢 1 つ。解説（note）は解答後にだけ出す。 */
export type Choice = {
  text: string;
  note: string;
};

export type Question = {
  /** 出典（年度・期・区分・問番号）から作る一意キー。 */
  id: string;
  field: string;
  /** 一覧に出す短い出典。例: "R7春 問41"。 */
  year: string;
  /** 受験者全体の正答率。 */
  rate: string;
  /** 正解の選択肢の添字。 */
  answer: number;
  text: string;
  choices: Choice[];
  explain: string;
  points: string[];
  /** 解説末尾に出す出典表記。年度・期・試験区分・時間区分・問番号まで書く。 */
  source: string;
  figure: Figure;
};

export type Exam = {
  code: string;
  name: string;
  sub: string;
  group: string;
};

/** 分野ごとの到達度（学習ホームの棒グラフ）。 */
export type Mastery = {
  name: string;
  /** 0〜100。 */
  percent: number;
};
