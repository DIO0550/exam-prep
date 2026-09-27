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
  /** セルの幅（em）。既定は 2.6。式や長い値を入れるときに広げる。 */
  cellWidth?: number;
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

/**
 * 図の部品に付ける色。ok（正しい・通る）と ng（誤り・止まる）だけが意味を持ち、
 * accent は「ここを見て」、muted は脇役（背景として置いているだけのもの）。
 */
export type FigureTone = "accent" | "ok" | "ng" | "muted";

/**
 * 構成図の部品の形。
 *
 * 形は見た目の約束ごとに合わせる（箱＝装置や処理、円柱＝データベース、雲＝インターネット、
 * 人＝利用者や攻撃者、円＝状態やグラフの節点、ひし形＝判断）。形で種類が分かれば、
 * ラベルを読む前に図の骨組みが頭に入る。
 */
export const DIAGRAM_SHAPES = [
  "box",
  "round",
  "circle",
  "diamond",
  "db",
  "actor",
  "cloud",
  "text",
] as const;

export type DiagramShape = (typeof DIAGRAM_SHAPES)[number];

export type DiagramNode = {
  /** 線の端から指す名前。画面には出ない。 */
  id: string;
  /** 部品の中に書く文字。改行は \n。fields を持つ部品では、箱の上に出す見出しになる。 */
  label: string;
  /**
   * 部品の中心を置く格子の位置（0 始まり）。0.5 刻みで、2 つの間にも置ける。
   * 座標を px で書かせると、書き足したときに全部を測り直すことになるので、格子で持つ。
   */
  col: number;
  row: number;
  shape?: DiagramShape;
  tone?: FigureTone;
  /** 部品に添える小さい文字（アドレス、値、補足）。 */
  note?: string;
  /** 注記を置く側。既定は下。下から線が入る部品は right にすると、線が文字を横切らない。 */
  notePlace?: "below" | "right";
  /**
   * 横に区切った欄。連結リストの「値｜次へのポインタ」やパケットのヘッダのように、
   * 1 つの箱の中身を区切って見せたいときに使う。
   */
  fields?: string[];
  /** 幅を格子のマス数で決める。省略すると中の文字に合わせる。 */
  w?: number;
  /** 複数行の文字の揃え。既定は中央。箇条書きのような説明は left にする。 */
  align?: "center" | "left";
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  /** 矢印の付け方。to＝to の側だけ（既定）、both＝両端、none＝線だけ。 */
  arrow?: "to" | "both" | "none";
  dashed?: boolean;
  tone?: FigureTone;
  /** 経由する点（格子の座標）。折れ線で引く。 */
  via?: [number, number][];
  /**
   * 線をふくらませる量（格子 1 マスの幅に対する割合）。同じ 2 つを行き来する線が重ならないよう、
   * 行きと帰りで符号を変えて使う。正なら進む向きの左へふくらむ。
   */
  bend?: number;
  /** from の何番目の欄から出すか（fields を持つ部品だけ）。ポインタの矢印に使う。 */
  fromField?: number;
  /** 線の途中に × を付ける（遮断される・届かない）。 */
  blocked?: boolean;
  /** ラベルを線のどこに置くか（0＝from 側の端、1＝to 側の端）。既定は真ん中。 */
  labelAt?: number;
};

export type DiagramGroup = {
  label: string;
  /** 囲むマスの範囲。左上のマス（col, row）から横 w マス・縦 h マス。 */
  col: number;
  row: number;
  w: number;
  h: number;
  tone?: FigureTone;
};

/**
 * 部品と矢印で組む図（構成図・ブロック図・状態遷移図・データ構造の図）。
 *
 * ネットワークの構成、装置どうしのデータの流れ、状態の移り変わり、ポインタのつながりのように、
 * 「何と何がどうつながっているか」が要点のものに使う。部品は格子の上に置き、線は部品の縁から縁へ
 * 自動で引く。囲み（groups）で DMZ や社内 LAN のような範囲を示せる。
 */
export type DiagramFigure = {
  type: "diagram";
  caption: string;
  nodes: DiagramNode[];
  edges?: DiagramEdge[];
  groups?: DiagramGroup[];
  /** 格子 1 マスの大きさ（px）。既定は横 150・縦 84。 */
  cell?: { w?: number; h?: number };
};

/** シーケンス図の 1 段。やり取り・注記・区切りのどれか。 */
export type SequenceStep =
  | {
      from: string;
      to: string;
      label: string;
      /** 応答や、あとから返ってくるものは点線にする。 */
      dashed?: boolean;
      tone?: FigureTone;
      /** 相手に届かない（遮断される）やり取り。矢印の手前に × を付ける。 */
      blocked?: boolean;
    }
  | {
      /** 注記を置く登場人物。2 つ渡すと、その間にまたがって置く。 */
      over: [string] | [string, string];
      note: string;
      tone?: FigureTone;
    }
  | {
      /** 段の区切り。「ここから暗号化」のように、流れの節目を横線で示す。 */
      divider: string;
    };

/**
 * 登場人物の間のやり取りを、時間を上から下へ流して見せる図（シーケンス図）。
 *
 * 通信の手順や攻撃の成立手順は、「誰が誰に何を送るか」の向きが要点なので、
 * 登場人物を横に並べて矢印で結ぶ。やり取りには自動で ①②… の番号が付く。
 */
export type SequenceFigure = {
  type: "sequence";
  caption: string;
  /** 登場人物。左から並べる順。改行は \n。 */
  actors: string[];
  steps: SequenceStep[];
};

export type ChartAxis = {
  label: string;
  min: number;
  max: number;
  /** 目盛りを置く値。省略すると数字を出さない（形だけを見せる図）。 */
  ticks?: number[];
  /** 目盛りに、値の代わりに出す文字（ticks と同じ並び）。 */
  tickLabels?: string[];
};

/** 系列の色の番号。並べる順に 1 から振る（検証済みの 4 色）。 */
export type SeriesColor = 1 | 2 | 3 | 4;

export type ChartSeries = {
  label: string;
  points: [number, number][];
  /** line＝折れ線（既定）、curve＝なめらかな曲線、step＝階段、bar＝棒。 */
  kind?: "line" | "curve" | "step" | "bar";
  color?: SeriesColor;
  dashed?: boolean;
  /** 線の横に出す名前の位置（points の添字）。既定は最後の点。 */
  labelAt?: number;
  /** 名前を点のどちら側に出すか。既定は右。途中の点に付けるときは上下にすると線と重ならない。 */
  labelPlace?: "right" | "left" | "above" | "below";
};

/**
 * 値の変化を座標に描く図（グラフ）。
 *
 * 損益分岐点、待ち時間の曲線、発注量と費用のように、「どこで交わるか」「どこで跳ね上がるか」が
 * 要点のものに使う。数値そのものより形を見せたいときは ticks を省いて目盛りを消す。
 */
export type ChartFigure = {
  type: "chart";
  caption: string;
  x: ChartAxis;
  y: ChartAxis;
  series: ChartSeries[];
  /** 描く範囲の大きさ（px）。既定は横 420・縦 230。正方形にしたい図などで変える。 */
  plot?: { w?: number; h?: number };
  /** 目印の点（交点や最適点）。 */
  marks?: {
    x: number;
    y: number;
    /** 名前。空にすると点だけを置く。 */
    label: string;
    /** 名前を点のどちら側に出すか。既定は右上。 */
    place?: "above" | "below" | "left" | "right";
  }[];
  /** 基準線。x を渡すと縦線、y を渡すと横線。 */
  guides?: { x?: number; y?: number; label?: string }[];
  /** 塗る範囲（多角形）。実行可能領域や、利益が出る範囲を示す。 */
  areas?: {
    points: [number, number][];
    label?: string;
    tone?: FigureTone;
    /** 名前を置く位置（軸の値）。既定は頂点の平均の位置。 */
    labelAt?: [number, number];
  }[];
};

/**
 * ベン図で塗る部分。含まれる集合の記号（A・B・C）を並べて書き、どの集合にも入らない部分は "0"。
 * 3 つの集合では "AB" は「A と B に入り、C には入らない部分」を指す。
 */
export type VennRegion = "0" | "A" | "B" | "C" | "AB" | "AC" | "BC" | "ABC";

export type VennPanel = {
  /** 見出し。選択肢の記号（ア〜エ）や式。 */
  label?: string;
  note?: string;
  shaded: VennRegion[];
  verdict?: "ok" | "ng";
};

/**
 * ベン図。集合演算や論理式のように、「どの部分を指しているか」が要点のものに使う。
 * panels を並べると、選択肢の式ごとに塗り分けて見比べられる。
 */
export type VennFigure = {
  type: "venn";
  caption: string;
  /** 集合の名前。2 つか 3 つ。順に A・B・C と呼ぶ。 */
  sets: [string, string] | [string, string, string];
  /** 全体集合の名前。付けると外枠を描き、"0" を塗れるようになる。 */
  universe?: string;
  panels: VennPanel[];
};

export type QuadrantCell = { title: string; note?: string; tone?: FigureTone };

/**
 * 2 つの軸で 4 つに分ける図。PPM や SL 理論のように、「どちらの軸が高いか低いか」の
 * 組合せで呼び名が決まるものに使う。表に並べると、軸との対応を頭の中で組み直すことになる。
 */
export type QuadrantFigure = {
  type: "quadrant";
  caption: string;
  /**
   * 横軸。low が左端、high が右端に出る。reverse を付けると左が high になる
   * （PPM の相対的市場占有率のように、左ほど高く描くのが慣例の図に合わせるため）。
   */
  x: { label: string; low: string; high: string; reverse?: boolean };
  /** 縦軸。low が下端、high が上端に出る。 */
  y: { label: string; low: string; high: string };
  /** 左上・右上・左下・右下の順。 */
  cells: [QuadrantCell, QuadrantCell, QuadrantCell, QuadrantCell];
};

/**
 * カルノー図。論理式の簡単化で、1 のマスをどうまとめたかを囲みで見せる。
 *
 * 真理値表を表に並べただけでは、「両端の列が隣どうし」「4 マスで 2 変数が消える」が見えない。
 * マスはグレイコード順（00, 01, 11, 10）に並べ、まとめは項の形（"-1-1" など）で書く。
 * 囲みの位置と、囲みから作る項の文字（B・D）は、どちらも term から機械的に作るので、
 * 絵と式が食い違うことがない。
 */
export type KarnaughFigure = {
  type: "karnaugh";
  caption: string;
  /** 行に置く変数（1〜2 個）。左の見出しに、上位の変数から並べる。 */
  rows: string[];
  /** 列に置く変数（1〜2 個）。 */
  cols: string[];
  /**
   * マスの値。画面に出る並び（行も列もグレイコード順）のまま、1 行を 1 つの文字列で書く。
   * "1" と "0" のほか、"-" はどちらでもよい組合せ（ドントケア）。例: ["1001", "0110", "0110", "0000"]。
   */
  values: string[];
  /**
   * まとめ。変数を rows → cols の順に並べ、1（肯定）・0（否定）・-（消える）で書く。
   * 例: 変数 A, B, C, D で "-1-1" は B・D、"00-0" は A̅・B̅・D̅。
   */
  groups?: string[];
};

/** 解説に添える図。こちらは本サイトで組んだもの。 */
export type Figure =
  | FlowFigure
  | CalcFigure
  | TableFigure
  | ArrayFigure
  | TimelineFigure
  | SketchFigure
  | TreeFigure
  | DiagramFigure
  | SequenceFigure
  | ChartFigure
  | VennFigure
  | QuadrantFigure
  | KarnaughFigure;

export type Question = {
  source: Source;
  /** 表示用の分野。IPA の解答例は T/M/S しか示さないので、細分類は本サイトで付けている。 */
  field: string;
  /** 正解の選択肢の添字。IPA の解答例から取る。 */
  answer: number;
  /**
   * 問題文。1 つの段落としてそのまま出すので、途中の改行は表示に出ない。
   * 条件を並べて示すものは、文中に「・」で書かずに stem の箇条書きへ持たせる（docs 3.5）。
   */
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
  /**
   * 合格ライン（%）。主催者が公表している試験だけ持つ。
   * 公表されていない試験は undefined にして、結果画面に合否を出さない。
   */
  passLine?: number;
};
