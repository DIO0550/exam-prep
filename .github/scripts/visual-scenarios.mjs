/**
 * 撮影する画面の一覧。
 *
 * 見た目の差分（VRT）は、ここに並べた「画面 × 幅」の枚数だけ撮る。画面を足したいときは
 * SCENARIOS に 1 つ足すだけでよく、ワークフロー側は触らない。
 *
 * 撮影を安定させるために 2 つ仕込んである。
 * - 時刻を固定する（capture 側で Date を差し替える）。結果画面の所要時間や連続学習日数が
 *   撮るたびに変わると、毎回差分として出てしまうため
 * - 学習記録は localStorage に直接置く。80 問分を画面から解かせると時間がかかりすぎる
 */

/**
 * 撮影する幅。height は「この高さの画面で開いたとき」を表す。
 * 撮るのはページ全体だが、maxHeight までで切る（見直し一覧は 80 行あり、全部撮ると
 * 1 枚 12,000px を超えてレビューでも保存でも扱いにくいため）。
 */
export const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 1600, maxHeight: 2000 },
  { name: "mobile", width: 430, height: 1200, maxHeight: 2600 },
];

/** 撮影時に固定する時刻。UTC でも JST でも同じ日付になる時刻を選んである。 */
export const FROZEN_TIME = Date.UTC(2026, 0, 1, 12, 0, 0);

/**
 * 学習記録の保存先と形。apps/web/src/features/quiz/progress/ の storage.ts と record.ts に
 * 合わせてある。形を変えたらここも直す（ズレると記録が読み捨てられ、記録なしの画面が撮れる）。
 */
const RECORD_KEY = "exam-prep:progress:v1";
const RECORD_VERSION = 4;
const SET_ID = "ap-r07-aki-am";

const questionId = (no) => `${SET_ID}-${String(no).padStart(2, "0")}`;

/**
 * 解答済みの学習記録。answered 問目までを解いた状態にする。
 * 正誤は 3 問に 1 問を不正解にして、正答率と苦手登録の数が毎回同じになるようにしてある。
 */
const answeredRecord = (answered) => ({
  version: RECORD_VERSION,
  setId: SET_ID,
  attempts: Object.fromEntries(
    Array.from({ length: answered }, (_, index) => [
      questionId(index + 1),
      {
        picked: 0,
        revealed: true,
        flagged: index % 7 === 0,
        weak: index % 3 === 0,
        excluded: [],
      },
    ]),
  ),
  recent: Array.from({ length: answered }, (_, index) => index % 3 !== 0),
  // FROZEN_TIME の当日と前日。連続学習を「2日」で固定する。
  days: ["2025-12-31", "2026-01-01"],
  shuffle: false,
  shuffleSeed: 0,
  textScale: "standard",
  noteWidth: 380,
});

/** メモの保存先と形。apps/web/src/features/quiz/notes/ に合わせてある。 */
const NOTES_KEY = "exam-prep:notes:v1";

/**
 * 画面ごとの手順。
 *
 * steps に書けるもの:
 * - { click: "ボタンの文字" }        文字がちょうど一致するボタンを押す
 * - { choice: 0 }                    n 番目の選択肢を押す（0 始まり）
 * - { dot: 6 }                       下の問番号ボタンを押す
 * - { draw: [[x, y], ...] }          手書き欄に線を引く（0〜1 の割合で指定）
 * - { wait: 400 }                    ミリ秒待つ
 */
export const SCENARIOS = [
  {
    name: "home-empty",
    label: "学習ホーム（記録なし）",
    steps: [],
  },
  {
    name: "home-progress",
    label: "学習ホーム（記録あり）",
    storage: { [RECORD_KEY]: answeredRecord(37) },
    steps: [],
  },
  {
    name: "quiz",
    label: "演習（未解答）",
    steps: [{ click: "演習を開始" }],
  },
  {
    name: "quiz-answered",
    label: "演習（解答後・同画面に解説）",
    steps: [{ click: "演習を開始" }, { choice: 0 }],
  },
  {
    name: "quiz-shuffled",
    label: "演習（選択肢シャッフル）",
    steps: [{ click: "シャッフル" }, { click: "演習を開始" }, { choice: 0 }],
  },
  {
    name: "quiz-note",
    label: "演習（メモを開く）",
    storage: {
      [NOTES_KEY]: {
        version: 1,
        notes: {
          [questionId(1)]: {
            text: "ビットとバイトの取り違えに注意。\n40,000 × 16 ÷ 8 ＝ 80,000 バイト",
            strokes: [],
          },
        },
      },
    },
    steps: [
      { click: "演習を開始" },
      { click: "メモ" },
      {
        draw: [
          [0.12, 0.78],
          [0.34, 0.64],
          [0.52, 0.36],
          [0.78, 0.22],
        ],
      },
      {
        draw: [
          [0.12, 0.86],
          [0.88, 0.86],
        ],
      },
    ],
  },
  {
    name: "explain",
    label: "解説（別画面）",
    steps: [{ click: "別画面" }, { click: "演習を開始" }, { choice: 0 }],
  },
  {
    name: "explain-xlarge",
    label: "解説（別画面・文字サイズ特大）",
    steps: [{ click: "別画面" }, { click: "特大" }, { click: "演習を開始" }, { choice: 0 }],
  },
  {
    name: "explain-timeline",
    label: "解説（タイムチャート）",
    // 図の種類ごとに見た目が違うので、表以外の図も 1 つずつ撮る。
    storage: { [RECORD_KEY]: { ...answeredRecord(0), setId: "ap-r04-haru-am" } },
    steps: [{ click: "別画面" }, { click: "演習を開始" }, { dot: 19 }, { choice: 0 }],
  },
  {
    name: "explain-array",
    label: "解説（配列図）",
    storage: { [RECORD_KEY]: { ...answeredRecord(0), setId: "ap-r03-aki-am" } },
    steps: [{ click: "別画面" }, { click: "演習を開始" }, { dot: 5 }, { choice: 0 }],
  },
  {
    name: "explain-compare",
    label: "解説（選択肢を並べたタイムチャート）",
    storage: { [RECORD_KEY]: { ...answeredRecord(0), setId: "ap-r05-aki-am" } },
    steps: [{ click: "別画面" }, { click: "演習を開始" }, { dot: 17 }, { choice: 0 }],
  },
  {
    name: "explain-starve",
    label: "解説（方式を並べたタイムチャート）",
    storage: { [RECORD_KEY]: { ...answeredRecord(0), setId: "ap-r06-aki-am" } },
    steps: [{ click: "別画面" }, { click: "演習を開始" }, { dot: 16 }, { choice: 0 }],
  },
  {
    name: "explain-sketch",
    label: "解説（図の見本）",
    // 「どの図か」を問う設問。各図の形を並べた見本を撮る。
    storage: { [RECORD_KEY]: { ...answeredRecord(0), setId: "ap-r03-aki-am" } },
    steps: [{ click: "別画面" }, { click: "演習を開始" }, { dot: 47 }, { choice: 0 }],
  },
  {
    name: "explain-tree",
    label: "解説（2 分木）",
    storage: { [RECORD_KEY]: { ...answeredRecord(0), setId: "ap-r06-aki-am" } },
    steps: [{ click: "別画面" }, { click: "演習を開始" }, { dot: 5 }, { choice: 0 }],
  },
  {
    name: "result",
    label: "結果",
    // 79 問まで解いた状態から始め、残り 1 問を解いて結果へ進む。
    storage: { [RECORD_KEY]: answeredRecord(79) },
    steps: [{ click: "演習を再開" }, { choice: 0 }, { click: "結果を見る" }],
  },
  {
    name: "review",
    label: "問題一覧・見直し",
    storage: { [RECORD_KEY]: answeredRecord(37) },
    steps: [{ click: "問題一覧・見直し" }],
  },
  {
    name: "vocab-setup",
    label: "単語帳（設定）",
    steps: [{ click: "単語帳" }],
  },
  {
    name: "vocab-card",
    label: "単語帳（めくる）",
    // 分野を 1 つに絞ってから始め、1 枚目の答えを出したところを撮る。
    steps: [
      { click: "単語帳" },
      { click: "すべて解除" },
      { click: "🗄️ データベース21" },
      { click: "収録順" },
      { click: "開始する" },
      { click: "答えを見るSpace" },
    ],
  },
];
