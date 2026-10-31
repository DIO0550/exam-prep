import { describe, expect, it } from "vitest";
import { selectionsOf } from "../answers";
import {
  chartProblems,
  diagramProblems,
  karnaughProblems,
  sequenceProblems,
  vennProblems,
} from "../figure-layout";
import type { Question } from "../types";
import { figuresOf, SKETCH_NAMES, shortSource, sourceId, timelineGroups } from "../types";
import { QUESTION_SETS } from "./questions";

/**
 * 問題データが、画面が想定している形に収まっているかの検査。
 *
 * データは手で書き足していくもので、崩れても型では落ちない（列数のずれ、目盛りをはみ出す帯、
 * 書いているうちに紛れ込んだ別の文字など）。描画側の前提をここに書いておき、
 * 収録を増やしたときに気付けるようにする。
 */

const ALL: Question[] = QUESTION_SETS.flatMap((set) => set.questions);

/** 問題を指す短い名前。落ちたときにどれか分かるようにする。 */
const nameOf = (question: Question) => shortSource(question.source);

/** 表の列数の上限。これを超えると、狭い画面で横スクロールしても読めなくなる。 */
const TABLE_COLUMN_LIMIT = 6;

/** ハングルとキリル文字。日本語の解説に混じるのは書き間違い。 */
const FOREIGN_SCRIPT = /[ᄀ-ᇿ가-힯Ѐ-ӿ]/;

/** E資格 シラバス2026 のうち、出題対象（グレー網掛けでない行）の語。用語問題の選択肢はこの中から選ぶ。 */
const E_SYLLABUS_TERMS = new Set([
  // 1. 数学的基礎（確率モデルにおけるパラメータ推定・情報理論）
  "ベイズ則",
  "ナイーブベイズ",
  "平均二乗誤差",
  "対数尤度",
  "ダイバージェンス",
  "最尤推定",
  "MAP推定",
  "ベイズ推定",
  "自己情報量",
  "相互情報量",
  "エントロピー",
  "条件付きエントロピー",
  "結合エントロピー",
  "クロスエントロピー",
  "KLダイバージェンス",
  "JSダイバージェンス",
  // 2. 機械学習（パターン認識・機械学習の分類・課題・検証集合・性能指標）
  "k近傍法",
  "近傍法",
  "kd-tree",
  "近似最近傍",
  "コサイン距離",
  "ユークリッド距離",
  "マンハッタン距離",
  "Lp距離",
  "マハラノビス距離",
  "機械学習",
  "教師あり学習",
  "教師なし学習",
  "半教師あり学習",
  "過剰適合",
  "過少適合",
  "汎化誤差",
  "訓練誤差",
  "バイアス",
  "バリアンス",
  "正則化",
  "次元の呪い",
  "ホールドアウト法",
  "k-分割交差検証法",
  "正解率(Accuracy)",
  "適合率(Precision)",
  "再現率(Recall)",
  "F値",
  "ROC曲線",
  "AUC",
  "Intersection-over-Union (IoU)",
  "mean Average Precision(mAP)",
  "micro平均",
  "macro平均",
  "RMSE/MSE",
  "MAE",
  "混同行列",
  "パープレキシティ",
  // 3. 深層学習の基礎
  "全結合層",
  "平均絶対誤差(MAE)",
  "バイナリクロスエントロピー",
  "クロスエントロピー誤差",
  "ソフトマックス関数",
  "one-hotベクトル",
  "シグモイド関数",
  "温度パラメータ",
  "勾配消失",
  "ReLU",
  "Leaky ReLU",
  "GELU",
  "tanh",
  "双曲線関数",
  "確率的勾配降下法（SGD）",
  "学習率",
  "最急降下法",
  "ミニバッチ",
  "Pathological Curvature",
  "Momentum",
  "Nesterov Accelerated Gradient",
  "誤差逆伝播法",
  "連鎖律",
  "自動微分",
  "計算グラフ",
  "AdaGrad",
  "RMSProp",
  "Adam",
  "Xavier法/Glorot法",
  "Kaiming法/He法",
  "L1正則化",
  "スパース表現",
  "L2正則化",
  "weight decay",
  "ドロップアウト",
  "ドロップコネクト",
  "早期終了",
  "バッチサイズ",
  "受容野（receptive field）",
  "特徴マップ",
  "フィルタ",
  "カーネル",
  "パディング",
  "ストライド",
  "im2col",
  "チャネル",
  "point-wise畳み込み（1x1畳み込み）",
  "depth-wise畳み込み",
  "グループ化畳み込み",
  "逆畳み込み",
  "Max pooling",
  "Lp pooling",
  "Global Average Pooling",
  "逆伝搬の計算（Back Propagation Through Time; BPTT）",
  "双方向RNN",
  "忘却ゲート",
  "入力ゲート",
  "出力ゲート",
  "LSTM（長期記憶と短期記憶）",
  "GRU",
  "リセットゲート",
  "メモリーセル",
  "エンコーダ・デコーダ",
  "seqence-to-sequence（seq2seq）",
  "アテンション（注意）機構",
  "Self-Attention",
  "Scaled Dot-Product Attention",
  "Source Target Attention",
  "Masked Attention",
  "Multi-Head Attention",
  "Positional Encoding",
  "ノイズ付与",
  "RandAugment",
  "MixUp",
  "EDA",
  "Batch Normalization",
  "Layer Normalization",
  "Instance Normalization",
  "Group Normalization",
  "バギング",
  "ブースティング",
  "ブートストラップ",
  "スタッキング",
  "グリッドサーチ",
  "ランダムサーチ",
  "ベイズ最適化",
  // 4. 深層学習の応用（音声処理・能動学習・メタ学習は対象外）
  "ResNet",
  "WideResNet",
  "残差接続（skip-connection）",
  "ボトルネック構造",
  "Residual Block",
  "Vision Transformer",
  "Shifted window",
  "CLS token",
  "Position embedding",
  "Bounding Box",
  "2ステージ検出",
  "Selective Search",
  "Fast R-CNN",
  "Region Proposal Network (RPN)",
  "Anchor box",
  "アンカー",
  "ROI Pooling",
  "ROI Align",
  "インスタンスセグメンテーション",
  "1ステージ検出",
  "デフォルトボックス",
  "Non-Maximum Suppression (NMS)",
  "ハードネガティブマイニング",
  "アンカーフリー（Anchor-Free）",
  "Feature Pyramid Network（FPN）",
  "センターネス（Center-ness）",
  "アンビギュアスサンプル",
  "FCN",
  "U-Net",
  "Mask R-CNN",
  "スキップコネクション",
  "アップサンプリング",
  "セマンティックセグメンテーション",
  "パノプティックセグメンテーション（Panoptic Segmentation）",
  "潜在的意味インデキシング（LSI）",
  "Word2vec",
  "n-gram",
  "skip gram",
  "CBOW",
  "ネガティブサンプリング",
  "Masked Language Modeling(MLM)",
  "Next Sentence Prediction(NSP)",
  "事前学習",
  "ファインチューニング",
  "positional embeddings",
  "segment embeddings",
  "基盤モデル",
  "Next token prediction",
  "Few Shot learning",
  "Zero Shot learning",
  "Prompt Based Learning",
  "RAG",
  "識別モデル",
  "自己回帰",
  "生成モデル",
  "拡散モデル",
  "フローベース生成モデル",
  "Denoising autoencoder",
  "VAE",
  "Reparameterization Trick",
  "変分下限",
  "生成器ネットワーク",
  "識別器ネットワーク",
  "モード崩壊 (mode collapse)",
  "モード崩壊",
  "Wasserstein GAN",
  "DCGAN",
  "Conditional GAN",
  "CycleGAN",
  "DQN",
  "A3C",
  "行動価値関数",
  "TD学習",
  "Q学習",
  "Experience replay",
  "方策勾配法（Policy Gradient）",
  "Actor-Critic法",
  "ドメイン適応 (domain adaptation)",
  "ドメインシフト",
  "Self-Training",
  "Co-Training",
  "Contrastive learning",
  "表現学習",
  "Siamese network",
  "contrastive loss",
  "Triplet loss",
  "Triplet network",
  "XAI (eXplainable AI)",
  "Grad-CAM",
  "Integrated Gradients",
  "局所的な解釈",
  "大域的な解釈",
  "LIME",
  "SHAP",
  "ShapleyValue",
  "協力ゲーム理論",
  // 5. 開発・運用環境（連合学習は対象外）
  "エッジコンピューティング",
  "プルーニング（枝刈り）",
  "蒸留(Distillation)",
  "量子化（Quantization）",
  "分散深層学習",
  "モデル並列化",
  "データ並列化",
  "単一命令複数データ (SIMD; Single Instruction Multiple Data)",
  "単一命令複数スレッド (SIMT; Single Instruction Multiple Thread)",
  "複数命令列複数データ (MIMD; Multiple Instruction Multiple Data)",
  "GPU (Graphics Processing Unit)",
  "TPU (Tensor Processing Unit)",
  "仮想化環境",
  "ホスト型",
  "ハイパーバイザー型",
  "コンテナ型",
  "Docker",
  "Dockerfile",
]);

describe("問題データ", () => {
  it("問題 ID が、問題集をまたいで重複しない", () => {
    // 解答状況は問題 ID をキーに 1 つの表へ入れている。重複すると別の問題の記録が混ざる。
    const ids = ALL.map((question) => sourceId(question.source));
    expect(new Set(ids).size).toBe(ALL.length);
  });

  it("IPA の回は、応用情報の午前が 1 回 80 問、支援士の午前Ⅱが 1 回 25 問ある", () => {
    // 書き下ろしの問題集は問題数が回ごとに違うので、原本のある回だけを見る。
    const counts: Record<string, number> = { AP: 80, SC: 25 };
    for (const set of QUESTION_SETS.filter((candidate) => candidate.exam in counts)) {
      expect(set.questions, set.id).toHaveLength(counts[set.exam] ?? 0);
      // 問番号が 1 から順に抜けなく並んでいること（書き起こしで飛ばしたり重ねたりしない）。
      expect(
        set.questions.map((question) =>
          question.source.kind === "original" ? 0 : question.source.no,
        ),
        set.id,
      ).toEqual(set.questions.map((_, index) => index + 1));
    }
  });

  it("JSTQB の模擬試験は 40 問で、章の配分が本試験と同じ", () => {
    // 本試験（Foundation Level・40 問）の章配分に合わせてある。書き足したときに
    // 1 章だけ増えて、本番と違う配分の模擬試験にならないよう数えて押さえておく。
    const expected = [8, 6, 4, 11, 9, 2];
    const mocks = QUESTION_SETS.filter(
      (set) => set.exam === "CTFL" && set.id.startsWith("ctfl-mock-"),
    );
    for (const set of mocks) {
      const counts = expected.map(
        (_, index) =>
          set.questions.filter((question) => question.field.startsWith(`第${index + 1}章`)).length,
      );
      expect(counts, set.id).toEqual(expected);
    }
  });

  it.each([4, 5, 6])(
    "JSTQB の模擬試験%dは、公開サンプル問題の形式（4 択から 1 つ、学習目的とシラバスの参照先つき）にそろっている",
    (no) => {
      // サンプル問題に寄せた回は、問題文の結びと、解説の要点に出す学習目的・参照先の形を固定している。
      // 書き足したときに形がばらけたり、ほかの問題集と同じ問題文が紛れ込んだりしないよう押さえておく。
      const mock = QUESTION_SETS.find((set) => set.id === `ctfl-mock-${no}`);
      expect(mock).toBeDefined();
      if (!mock) {
        return;
      }
      expect(mock.questions).toHaveLength(40);
      const texts = ALL.map((question) => question.text);
      for (const question of mock.questions) {
        expect(question.choices, nameOf(question)).toHaveLength(4);
        expect(Array.isArray(question.answer), nameOf(question)).toBe(false);
        expect(question.text, nameOf(question)).toMatch(/次の選択肢の中から１つ選びなさい。$/);
        expect(question.explain, nameOf(question)).toMatch(/を問う問題です。/);
        expect(question.points?.[0], nameOf(question)).toMatch(
          /^学習目的：FL-\d\.\d\.\d（K[123]：/,
        );
        expect(question.points?.[1], nameOf(question)).toMatch(/^シラバスの参照先：\d\.\d/);
        expect(texts.filter((text) => text === question.text)).toHaveLength(1);
      }
    },
  );

  it("JSTQB の用語問題は、シラバスのキーワード 94 語を 1 語 1 問で問う", () => {
    // 各章の冒頭のキーワード（章をまたいで重なる 5 語は 1 回だけ）を 1 問ずつにしてある。
    // 書き足したときに同じ語を 2 回問うたり、語を落としたりしないよう、正解の語で数える。
    const term = QUESTION_SETS.find((set) => set.id === "ctfl-term-1");
    expect(term).toBeDefined();
    if (!term) {
      return;
    }
    const keywords = term.questions.map((question) =>
      selectionsOf(question.answer).map((index) => question.choices[index]?.text),
    );
    expect(new Set(keywords.flat()).size).toBe(94);
    expect(term.questions).toHaveLength(94);
    // 紛らわしい選択肢もキーワードの中から選び、シラバスのキーワードに無い語は出さない。
    const allowed = new Set(keywords.flat());
    for (const question of term.questions) {
      for (const choice of question.choices) {
        expect(allowed.has(choice.text), choice.text).toBe(true);
      }
    }
  });

  it("E資格の用語問題は、シラバス2026 の出題対象の語だけを選択肢に使い、1 語を 2 回問わない", () => {
    // 以前「シラバスにない問題が出ている」と指摘を受けたので、選択肢の語を出題範囲の一覧で縛る。
    // 一覧はシラバス2026（第1.0版）のうち、グレー網掛け（オプション・出題対象外）でない行の
    // キーワード・細項目・小項目。網掛けの行（線形代数、一般的な確率分布、線形回帰〜クラスタリング、
    // 音声処理、能動学習、メタ学習、連合学習など）の語は入れていない。
    const term = QUESTION_SETS.find((set) => set.id === "e-term-1");
    expect(term).toBeDefined();
    if (!term) {
      return;
    }
    for (const question of term.questions) {
      for (const choice of question.choices) {
        expect(E_SYLLABUS_TERMS.has(choice.text), `${nameOf(question)} の「${choice.text}」`).toBe(
          true,
        );
      }
    }
    const answers = term.questions.flatMap((question) =>
      selectionsOf(question.answer).map((index) => question.choices[index]?.text),
    );
    expect(new Set(answers).size).toBe(answers.length);
  });

  it("E資格の模擬試験は 50 問で、大項目の配分が 6・9・17・13・5 になっている", () => {
    // 本演習独自の配分。書き足したときに 1 つの大項目だけが増えないよう数えて押さえておく。
    const fields = ["数学的基礎", "機械学習", "深層学習の基礎", "深層学習の応用", "開発・運用環境"];
    const expected = [6, 9, 17, 13, 5];
    const mocks = QUESTION_SETS.filter((set) => set.exam === "E" && set.id.startsWith("e-mock-"));
    expect(mocks.length).toBeGreaterThan(0);
    for (const set of mocks) {
      const counts = fields.map(
        (field) => set.questions.filter((question) => question.field === field).length,
      );
      expect(counts, set.id).toEqual(expected);
    }
  });

  it.each([5, 6, 7])("生成AI模試%dは全6章各10問、単一54問・複数6問の新しい設問を持つ", (no) => {
    const mock = QUESTION_SETS.find((set) => set.id === `gaip-mock-${no}`);
    expect(mock).toBeDefined();
    if (!mock) {
      return;
    }
    expect(mock.questions).toHaveLength(60);
    expect(mock.questions.filter((question) => Array.isArray(question.answer))).toHaveLength(6);
    for (let chapter = 1; chapter <= 6; chapter += 1) {
      const questions = mock.questions.filter((question) =>
        question.field.startsWith(`第${chapter}章`),
      );
      expect(questions).toHaveLength(10);
      expect(questions.filter((question) => Array.isArray(question.answer))).toHaveLength(1);
    }
    const texts = ALL.map((question) => question.text);
    for (const question of mock.questions) {
      expect(texts.filter((text) => text === question.text)).toHaveLength(1);
      expect(question.choices).toHaveLength(4);
      if (Array.isArray(question.answer)) {
        expect(question.text).toMatch(/2つ選べ|すべて選べ/);
        continue;
      }
      expect(question.text).not.toMatch(/2つ選べ|すべて選べ/);
    }
  });

  it.each([1, 2, 3, 4])(
    "ACE 模擬試験%dは50問で、セクション配分が試験ガイドに沿い、複数選択を8問持つ",
    (no) => {
      // 試験ガイドの配分（セクション1・4 が 20% 以下、2・3 が 30% 以下）に合わせ、
      // 50 問を 10・15・15・10 に配ってある。複数選択はどのセクションにも 2 問ずつ入れる。
      const mock = QUESTION_SETS.find((set) => set.id === `ace-mock-${no}`);
      expect(mock).toBeDefined();
      if (!mock) {
        return;
      }
      expect(mock.questions).toHaveLength(50);
      const expected = [10, 15, 15, 10];
      for (const [index, count] of expected.entries()) {
        const questions = mock.questions.filter((question) =>
          question.field.startsWith(`セクション${index + 1} `),
        );
        expect(questions, `${mock.id} のセクション${index + 1}`).toHaveLength(count);
        expect(
          questions.filter((question) => Array.isArray(question.answer)),
          `${mock.id} のセクション${index + 1} の複数選択`,
        ).toHaveLength(2);
      }
      const texts = ALL.map((question) => question.text);
      for (const question of mock.questions) {
        expect(texts.filter((text) => text === question.text)).toHaveLength(1);
        expect(question.choices, nameOf(question)).toHaveLength(4);
        if (Array.isArray(question.answer)) {
          expect(question.answer, nameOf(question)).toHaveLength(2);
          expect(question.text, nameOf(question)).toMatch(/2つ選べ。$/);
          continue;
        }
        expect(question.text, nameOf(question)).not.toMatch(/つ選べ/);
      }
    },
  );

  it("書き下ろした問題は、典拠を持つ", () => {
    // 出どころの分からない問題を混ぜないための検査。出典表記にもこの値が出る。
    for (const question of ALL) {
      if (question.source.kind !== "original") continue;
      expect(question.source.reference, `${nameOf(question)} の典拠`).not.toBe("");
    }
  });

  it("書き下ろした問題は、正解の選択肢にだけ「これが正解」と書いてある", () => {
    // 選択肢ごとの補足は手で書くので、選択肢を並べ替えた拍子に answer とずれる。
    // 「これが正解」と書いた選択肢が answer と一致することを、機械で押さえておく。
    for (const question of ALL) {
      if (question.source.kind !== "original") continue;
      const marked = question.choices
        .map((choice, index) => (choice.note?.includes("これが正解") ? index : -1))
        .filter((index) => index >= 0);
      expect(marked, `${nameOf(question)} の「これが正解」`).toEqual(selectionsOf(question.answer));
    }
  });

  it("書き下ろした問題は、すべての選択肢に補足と解説が付いている", () => {
    // 間違えた理由が解説本文まで読まないと分からない状態にしない。
    for (const question of ALL) {
      if (question.source.kind !== "original") continue;
      for (const choice of question.choices) {
        expect(choice.note, `${nameOf(question)} の「${choice.text}」`).toBeTruthy();
      }
      expect(question.explain, `${nameOf(question)} の解説`).toBeTruthy();
    }
  });

  it("正解の添字が、選択肢の範囲に収まっている", () => {
    for (const question of ALL) {
      const answers = selectionsOf(question.answer);
      expect(new Set(answers).size).toBe(answers.length);
      if (Array.isArray(question.answer)) {
        expect(answers.length).toBeGreaterThanOrEqual(2);
      }
      for (const answer of answers) {
        expect(Number.isInteger(answer)).toBe(true);
        expect(answer, `${nameOf(question)} の正解`).toBeGreaterThanOrEqual(0);
        expect(answer, `${nameOf(question)} の正解`).toBeLessThan(question.choices.length);
      }
    }
  });

  it("問題文や解説に改行が入っていない（並べて示すものは stem や figure へ）", () => {
    // 文字列は段落や項目にそのまま流しているので、改行は表示に出ない。
    // 「・」で並べたつもりのものが 1 行に溶けるため、並べるなら stem.list か figure を使う。
    for (const question of ALL) {
      const texts = [
        question.text,
        question.explain ?? "",
        ...(question.points ?? []),
        ...(question.stem?.list?.items ?? []),
        ...question.choices.flatMap((choice) => [choice.text, choice.note ?? ""]),
      ];
      for (const text of texts) {
        expect(text, `${nameOf(question)} の「${text.slice(0, 20)}」`).not.toContain("\n");
      }
    }
  });

  it("箇条書きの項目は行頭の点を持たない（点は描画側が付ける）", () => {
    // 原本の「・」をそのまま写すと、描画側の点と二重に出る。
    // 「・・・」は点ではなく中身（途中を省いた段）なので、そのまま通す。
    for (const question of ALL) {
      for (const item of question.stem?.list?.items ?? []) {
        expect(item, `${nameOf(question)} の箇条書き`).not.toMatch(/^・[^・]/);
      }
    }
  });

  it("図の見出しは呼び名を持たない（図・表は描画側が中身に合わせて付ける）", () => {
    for (const question of ALL) {
      for (const figure of figuresOf(question)) {
        expect(figure.caption, `${nameOf(question)} の図の見出し`).not.toMatch(/^(図|表)\s*[：:]/);
        expect(figure.caption, `${nameOf(question)} の図の見出し`).not.toBe("");
      }
    }
  });

  it("図の見本は、名前から引ける形だけを使う", () => {
    for (const question of ALL) {
      for (const figure of figuresOf(question)) {
        if (figure.type !== "sketch") continue;
        expect(figure.items.length, `${nameOf(question)} の図の見本`).toBeGreaterThanOrEqual(2);
        for (const item of figure.items) {
          expect(SKETCH_NAMES, `${nameOf(question)} の「${item.name}」`).toContain(item.name);
          expect(item.note, `${nameOf(question)} の「${item.name}」の説明`).not.toBe("");
        }
      }
    }
  });

  it("表の図は、見出しと各行の列数がそろっている", () => {
    for (const question of ALL) {
      const table = figuresOf(question).find((figure) => figure.type === "table");
      if (!table) continue;
      const { headers, rows } = table;
      expect(headers.length, `${nameOf(question)} の表の列数`).toBeGreaterThanOrEqual(2);
      expect(headers.length, `${nameOf(question)} の表の列数`).toBeLessThanOrEqual(
        TABLE_COLUMN_LIMIT,
      );
      for (const row of rows) {
        expect(row.length, `${nameOf(question)} の行「${row[0]}」`).toBe(headers.length);
      }
    }
  });

  it("タイムチャートの帯は、目盛りの中に収まっている", () => {
    for (const question of ALL) {
      const timeline = figuresOf(question).find((figure) => figure.type === "timeline");
      if (!timeline) continue;
      const { span, marks } = timeline;
      for (const group of timelineGroups(timeline)) {
        for (const track of group.tracks) {
          for (const bar of track.bars) {
            expect(bar.start, `${nameOf(question)} の「${bar.label}」`).toBeGreaterThanOrEqual(0);
            expect(
              bar.start + bar.length,
              `${nameOf(question)} の「${bar.label}」`,
            ).toBeLessThanOrEqual(span);
          }
        }

        // 締切と「終わらなかった分」も目盛りの中に収める
        if (group.deadline) {
          expect(group.deadline.at, `${nameOf(question)} の ${group.label} の締切`).toBeLessThan(
            span,
          );
        }
        if (group.missed) {
          const { track, start, length } = group.missed;
          expect(
            group.tracks.map((candidate) => candidate.label),
            `${nameOf(question)} の ${group.label} の未完の段`,
          ).toContain(track);
          expect(
            start + length,
            `${nameOf(question)} の ${group.label} の未完`,
          ).toBeLessThanOrEqual(span);
        }
      }
      for (const mark of marks ?? []) {
        expect(mark.at, `${nameOf(question)} の目印「${mark.label}」`).toBeLessThan(span);
      }
    }
  });

  it("配列図のセル数は、見出しと段でそろっている", () => {
    for (const question of ALL) {
      const array = figuresOf(question).find((figure) => figure.type === "array");
      if (!array) continue;
      const { headers, rows } = array;
      const width = headers?.length ?? rows[0]?.cells.length;
      for (const row of rows) {
        expect(row.cells.length, `${nameOf(question)} の段「${row.label}」`).toBe(width);
        for (const index of row.marked ?? []) {
          expect(index, `${nameOf(question)} の段「${row.label}」の強調`).toBeLessThan(width ?? 0);
        }
        for (const index of row.swap ?? []) {
          expect(index, `${nameOf(question)} の段「${row.label}」の交換`).toBeLessThan(width ?? 0);
        }
      }
    }
  });

  it("1 つの問題の図は、見出しが重ならない", () => {
    // 見出しを React のキーに使っているので、同じ見出しの図が 2 つあると片方が消える。
    for (const question of ALL) {
      const captions = figuresOf(question).map((figure) => figure.caption);
      expect(new Set(captions).size, `${nameOf(question)} の図の見出し`).toBe(captions.length);
    }
  });

  it("構成図・シーケンス図・グラフ・ベン図・カルノー図は、描いたときに崩れない", () => {
    // 部品の重なり、枠をまたぐ部品、軸からはみ出す点、無い登場人物への矢印など。
    // 型では落ちず、画面を開くまで気付けないものを、描くときと同じ座標で確かめる。
    for (const question of ALL) {
      for (const figure of figuresOf(question)) {
        const problems =
          figure.type === "diagram"
            ? diagramProblems(figure)
            : figure.type === "sequence"
              ? sequenceProblems(figure)
              : figure.type === "chart"
                ? chartProblems(figure)
                : figure.type === "venn"
                  ? vennProblems(figure)
                  : figure.type === "karnaugh"
                    ? karnaughProblems(figure)
                    : [];
        expect(problems, `${nameOf(question)} の「${figure.caption}」`).toEqual([]);
      }
    }
  });

  it("4 象限の図は、4 つのマスの呼び名がそろって別々になっている", () => {
    for (const question of ALL) {
      for (const figure of figuresOf(question)) {
        if (figure.type !== "quadrant") continue;
        const titles = figure.cells.map((cell) => cell.title);
        expect(new Set(titles).size, `${nameOf(question)} の「${figure.caption}」`).toBe(4);
      }
    }
  });

  it("解説に、日本語でも英数字でもない文字が紛れていない", () => {
    for (const question of ALL) {
      const text = [
        question.explain ?? "",
        ...(question.points ?? []),
        JSON.stringify(question.figure ?? {}),
        ...question.choices.map((choice) => choice.note ?? ""),
      ].join(" ");
      expect(FOREIGN_SCRIPT.test(text), `${nameOf(question)} の解説`).toBe(false);
    }
  });
});
