/**
 * 選択肢の表示順。
 *
 * 並べ替えは「表示順 → 原本での添字」の配列ひとつで表す。保存する解答（picked・excluded）も
 * 正解（answer）も原本の添字のまま扱うので、途中でシャッフルを切り替えても、記録した解答を
 * 読み違えることがない（変わるのは並びとラベルだけで、どの選択肢を選んだかは動かない）。
 *
 * 並びは問題 ID と種（seed）から毎回同じものを作る。保存するのが数値ひとつで済むうえ、
 * リロードしても同じ並びで出る。visit ごとに並びが変わると、見直したときの
 * 「あなたの解答：ア」が別の選択肢を指してしまうため、そこは動かさない。
 */

/** 原本のままの表示順。 */
export const naturalOrder = (length: number): number[] =>
  Array.from({ length }, (_, index) => index);

/** 文字列を 32 ビットの数にする（FNV-1a）。同じ文字列からは必ず同じ値が出る。 */
const hashOf = (text: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193);
  }
  return hash >>> 0;
};

/**
 * 種から 0 以上 1 未満の値を順に返す（mulberry32）。
 * 暗号用途ではないので、質より「同じ種なら同じ並びが出る」ことを取っている。
 */
const randomFrom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
};

/** シャッフルした表示順。同じ問題 ID・同じ種なら、いつ呼んでも同じ並びになる。 */
export const shuffledOrder = (length: number, questionId: string, seed: number): number[] => {
  const rest = naturalOrder(length);
  const random = randomFrom(hashOf(`${questionId}:${seed}`));
  const order: number[] = [];

  while (rest.length > 0) {
    const [picked] = rest.splice(Math.floor(random() * rest.length), 1);
    if (picked === undefined) break;
    order.push(picked);
  }

  return order;
};

/** 画面に出すときの並び。シャッフルしない設定なら原本のまま。 */
export const choiceOrder = (
  length: number,
  questionId: string,
  seed: number,
  shuffle: boolean,
): number[] => (shuffle ? shuffledOrder(length, questionId, seed) : naturalOrder(length));

/** 原本の添字が今どこに出ているか。ラベル（ア〜エ）を出すのに使う。 */
export const positionOf = (order: number[], original: number): number => {
  const position = order.indexOf(original);
  // 並びに無い添字はそのまま返す。ラベルが消えるより、原本の位置で出したほうがましなため。
  return position < 0 ? original : position;
};

/** 並べ替えて出しているときに、出典へ足す断り書き（docs 2.3）。 */
export const SHUFFLED_NOTE = "選択肢の順序を入れ替えて表示";

/** 原本と並びが違うか。出典の断り書きと、解説に出す原本の記号の出し分けに使う。 */
export const isShuffled = (order: number[]): boolean =>
  order.some((original, position) => original !== position);
