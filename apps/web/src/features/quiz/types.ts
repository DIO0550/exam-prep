/** 選択肢に振るラベル。IPA の午前問題が ア〜エ の 4 択なのに合わせている。 */
export const CHOICE_KEYS = ["ア", "イ", "ウ", "エ"] as const;

/** 選択肢の表示ラベル。4 つを超えたぶんは番号で振る。 */
export const choiceKey = (index: number): string => CHOICE_KEYS[index] ?? String(index + 1);

export type ExamCode = "AP" | "FE" | "SG";
export type Era = "令和" | "平成";
/**
 * 実施時期。春期・秋期のほかに「10月」がある。
 *
 * 令和2年度は春期の実施が取りやめになり、秋の回を IPA が「令和2年度10月試験」と
 * 呼んでいる。出典表記は原本に合わせる決まりなので、秋期に寄せずに別の値で持つ。
 */
export type Term = "haru" | "aki" | "oct";
export type Section = "am" | "pm";

/**
 * 出典。問題 ID と出典表記の両方をここから機械的に作る。
 * 手で出典文字列を書くと必ず抜けるので、構造化して持つ（docs 2.3）。
 */
export type IpaSource = {
  /** 出典の種類。IPA の過去問題は既定なので書かない。 */
  kind?: undefined;
  exam: ExamCode;
  era: Era;
  /** 元号での年。令和3年度なら 3。元年は 1 で持ち、表示のときだけ「元」にする。 */
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

/**
 * 本サイトで書き下ろした問題の出典。
 *
 * 過去問題と違って原本になる設問が無いので、年度や問番号では指せない。
 * 代わりに「どの問題集の何問目か」と「何を典拠に書いたか」を持つ。
 * 典拠を必須にしてあるのは、出どころの分からない問題を混ぜないため。
 */
export type OriginalSource = {
  kind: "original";
  /** 問題集の ID。問題 ID の前半になる。 */
  deck: string;
  /** 一覧やカードに出す短い名前。例: "GCP シナリオ"。 */
  label: string;
  /** 問題集の中での通し番号。 */
  no: number;
  /** 書くときに参照した公開資料。出典表記に出す。 */
  reference: string;
};

/** 問題の出典。過去問題（IPA）と、本サイトで書き下ろしたものの 2 種類がある。 */
export type Source = IpaSource | OriginalSource;

const EXAM_NAMES: Record<ExamCode, string> = {
  AP: "応用情報技術者試験",
  FE: "基本情報技術者試験",
  SG: "情報セキュリティマネジメント試験",
};

const TERM_NAMES: Record<Term, string> = { haru: "春期", aki: "秋期", oct: "10月" };
const SECTION_NAMES: Record<Section, string> = { am: "午前", pm: "午後" };

/**
 * 出典表記に出す年。元年は「1年度」ではなく「元年度」と書く。
 * IPA の問題冊子・解答例もこの書き方なので、そちらに合わせる（docs 2.3）。
 */
const eraYear = (year: number): string => (year === 1 ? "元" : String(year));

/**
 * 出典表記。IPA が FAQ で示している形式に合わせる。
 *
 * extra は、データではなく表示のしかたで原本と変わっている分（選択肢の並べ替えなど）。
 * 改変は理由を問わず併記する決まりなので、modified と同じ括弧に並べる（docs 2.3）。
 */
export const formatSource = (source: Source, extra?: string): string => {
  // 書き下ろしは「原本」が無いので、改変の有無ではなく典拠を併記する。
  // 出どころを過去問題と同じ強さで示さないと、公式の問題と読まれかねないため。
  if (source.kind === "original") {
    const notes = [`典拠 ${source.reference}`, extra].filter((note): note is string =>
      Boolean(note),
    );
    return `${source.label} 問${source.no}・本サイト作成（${notes.join("、")}）`;
  }

  const base = `${source.era}${eraYear(source.year)}年度 ${TERM_NAMES[source.term]} ${EXAM_NAMES[source.exam]} ${SECTION_NAMES[source.section]} 問${source.no}`;
  const notes = [source.modified, extra].filter((note): note is string => Boolean(note));
  return notes.length > 0 ? `${base}（${notes.join("、")}）` : base;
};

const ERA_SHORT: Record<Era, string> = { 令和: "R", 平成: "H" };

/**
 * 一覧やカードに出す、実施時期の短い表記。
 * 「10月」は 1 文字に詰めると「1」になって年と紛らわしいので、そのまま出す。
 */
const TERM_SHORT: Record<Term, string> = { haru: "春", aki: "秋", oct: "10月" };

/** 一覧やカードに出す短い表記。例: "R3春 問1"。 */
export const shortSource = (source: Source): string => {
  if (source.kind === "original") return `${source.label} 問${source.no}`;
  const term = TERM_SHORT[source.term];
  // 1 文字なら年に続けて詰める（R3春）。「10月」を詰めると R210月 と読めなくなるので、空白で切る。
  const when = term.length === 1 ? term : ` ${term}`;
  return `${ERA_SHORT[source.era]}${source.year}${when} 問${source.no}`;
};

/** 問題 ID。URL・ファイルパス・React のキーを兼ねる。 */
export const sourceId = (source: Source): string => {
  if (source.kind === "original") {
    return `${source.deck}-${String(source.no).padStart(2, "0")}`;
  }
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
  /**
   * 図の見出し。「図：」「表：」は書かない（中身に合わせて FigureBlock が付ける）。
   * 表の図に「図：」と書くと、絵を探して見つからない読み方になるため。
   */
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
export type TimelineBar = { start: number; length: number; label: string; tone?: BarTone };

export type TimelineTrack = {
  label: string;
  /** start は開始時刻（0 始まり）、length は占める目盛りの数。 */
  bars: TimelineBar[];
};

/**
 * 選択肢ごとに並べて見比べる段。
 *
 * 「どの組合せなら間に合うか」を問う設問は、数字の表より、同じ時間軸に並べて
 * 締切をまたぐかどうかを見るほうが早い。
 */
export type TimelineGroup = {
  /** 見出し。選択肢の記号（ア〜エ）など。 */
  label: string;
  /** 見出しに添える一言。条件と結論を書く。 */
  note?: string;
  /** 結論の色。○ なら ok、× なら ng。 */
  verdict?: "ok" | "ng";
  tracks: TimelineTrack[];
  /** 締切の縦線。この時刻を過ぎたら間に合わない。 */
  deadline?: { at: number; label?: string };
  /** 締切までに終わらなかった分。track はどの段に置くか（label で指す）。 */
  missed?: { track: string; start: number; length: number };
};

export type TimelineFigure = {
  type: "timeline";
  caption: string;
  /** 目盛りの数。0 から span までの区間を span 個に刻む。 */
  span: number;
  /** 目盛りの単位（「秒」「サイクル」）。軸の右端に出す。 */
  unit: string;
  /** 1 本だけ出すとき。 */
  tracks?: TimelineTrack[];
  /** 選択肢ごとに並べるとき。 */
  groups?: TimelineGroup[];
  /** 軸の下に立てる目印。到着時刻など、帯ではない出来事を指す。 */
  marks?: { at: number; label: string }[];
};

/** 段のまとまり。1 本だけの図も、見出しの無い 1 まとまりとして扱う。 */
export const timelineGroups = (figure: TimelineFigure): TimelineGroup[] =>
  figure.groups ?? [{ label: "", tracks: figure.tracks ?? [] }];

/**
 * 「どの図か」を問う設問で、図そのものの形を見せるための見本。
 *
 * 連関図・パレート図・クラス図のように、選択肢が図の名前や言葉の説明だけで並ぶ設問は、
 * 形を知らないと選べない。名前から見本の絵を引けるようにして、並べて見比べられるようにする。
 */
export const SKETCH_NAMES = [
  "連関図",
  "親和図",
  "系統図",
  "特性要因図",
  "パレート図",
  "マトリックス図",
  "アローダイアグラム",
  "クラス図",
  "オブジェクト図",
  "アクティビティ図",
  "状態マシン図",
  "シーケンス図",
  "ユースケース図",
  "DFD",
  "E-R図",
  "CRUD マトリクス",
  "バーンダウンチャート",
  "信頼度成長曲線",
  "B⁺木インデックス",
  "ハッシュインデックス",
] as const;

export type SketchName = (typeof SKETCH_NAMES)[number];

/** 図の見本を並べる図。1 つずつ「どんな形か」と「何を表すか」を添える。 */
export type SketchFigure = {
  type: "sketch";
  caption: string;
  items: { name: SketchName; note: string }[];
};

/**
 * 2 分木。節点は配列表現（1 始まりの添字。左の子が 2i、右の子が 2i+1）で持つ。
 *
 * 親子の線をデータに書かせると、書き間違いがそのまま木の形になってしまう。添字で持てば
 * 位置が一意に決まり、応用情報でよく出る「配列で 2 分木を表す」話ともそのまま噛み合う。
 */
export type TreeNode = {
  /** 配列表現での添字（根が 1）。 */
  at: number;
  label: string;
  /** 節点の色。注目させたいものに付ける。 */
  tone?: "accent" | "ok" | "ng";
  /** 節点に添える短い説明。 */
  note?: string;
};

export type TreeFigure = {
  type: "tree";
  caption: string;
  nodes: TreeNode[];
};

/** 解説に添える図。こちらは本サイトで組んだもの。 */
export type Figure =
  | FlowFigure
  | CalcFigure
  | TableFigure
  | ArrayFigure
  | TimelineFigure
  | SketchFigure
  | TreeFigure;

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
  /** 解説に添える図。2 つ以上あるときは配列で書いた順に出す。 */
  figure?: Figure | Figure[];
};

/** 解説に出す図を、1 つでも複数でも同じ形で受け取る。 */
export const figuresOf = (question: Question): Figure[] => {
  if (!question.figure) return [];
  return Array.isArray(question.figure) ? question.figure : [question.figure];
};

export type Exam = {
  code: string;
  name: string;
  sub: string;
  group: string;
};
