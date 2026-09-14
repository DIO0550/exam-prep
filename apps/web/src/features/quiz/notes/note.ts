/**
 * 問題ごとのメモの形と、その上の純粋な操作。
 *
 * 自由入力（text）と手書き（strokes）の 2 つを持つ。手書きを画像で持たないのは、
 * PNG にすると 1 問で数十 KB になり、localStorage にはすぐ入らなくなるため。
 * 点の並びなら 1 問あたり数 KB で収まり、拡大しても線が荒れない。
 */

/**
 * 手書き領域の論理サイズ。
 *
 * 点はこの中の座標で持つ。表示の幅は画面によって変わるが、描くときに拡大縮小すれば
 * 同じ絵が出る（実寸で持つと、別の幅で開いたときに絵がずれる）。
 */
export const SKETCH_WIDTH = 1000;
export const SKETCH_HEIGHT = 750;

/** ひと筆。x,y を交互に並べた論理座標。点ごとにオブジェクトを作るより JSON が小さい。 */
export type Stroke = number[];

export type Note = {
  text: string;
  strokes: Stroke[];
};

/** 保存形式の版。形を変えたら上げる。読めない版は捨てて作り直す。 */
export const NOTE_VERSION = 1;

/** 自由入力の上限。これを超える長文はメモではないので、書き込み時に切る。 */
export const TEXT_LIMIT = 4000;

/** 1 問あたりの筆数の上限。保存先を埋め尽くさないための歯止め。 */
export const STROKE_LIMIT = 2000;

export type NoteRecord = {
  version: number;
  /** 問題 ID ごとのメモ。書いた問題だけを持つ。 */
  notes: Record<string, Note>;
};

/** まだ何も書いていない問題のメモ。共有するので、更新は必ず新しい値を作る。 */
export const EMPTY_NOTE: Note = Object.freeze({
  text: "",
  strokes: Object.freeze([]) as unknown as Stroke[],
});

export const emptyNotes = (): NoteRecord => ({ version: NOTE_VERSION, notes: {} });

/** メモが空のときに返す値。参照を固定する（useSyncExternalStore が同一性で見るため）。 */
export const EMPTY_NOTES: NoteRecord = Object.freeze(emptyNotes());

export const noteOf = (record: NoteRecord, questionId: string): Note =>
  record.notes[questionId] ?? EMPTY_NOTE;

/** 文章も手書きも無いか。空になったメモは保存先から落とす。 */
export const isEmptyNote = (note: Note): boolean =>
  note.text.trim() === "" && note.strokes.length === 0;

/** メモを差し替える。空になったら、その問題の項目ごと消す。 */
export const withNote = (record: NoteRecord, questionId: string, note: Note): NoteRecord => {
  const notes = { ...record.notes };
  if (isEmptyNote(note)) {
    delete notes[questionId];
  } else {
    notes[questionId] = note;
  }
  return { ...record, notes };
};

export const withText = (record: NoteRecord, questionId: string, text: string): NoteRecord =>
  withNote(record, questionId, { ...noteOf(record, questionId), text: text.slice(0, TEXT_LIMIT) });

/** ひと筆を足す。上限に達していたら足さない（描けたように見せて落とさないため）。 */
export const withStroke = (record: NoteRecord, questionId: string, stroke: Stroke): NoteRecord => {
  const note = noteOf(record, questionId);
  if (stroke.length < 2 || note.strokes.length >= STROKE_LIMIT) return record;
  return withNote(record, questionId, { ...note, strokes: [...note.strokes, stroke] });
};

/** 最後のひと筆を取り消す。 */
export const withoutLastStroke = (record: NoteRecord, questionId: string): NoteRecord => {
  const note = noteOf(record, questionId);
  if (note.strokes.length === 0) return record;
  return withNote(record, questionId, { ...note, strokes: note.strokes.slice(0, -1) });
};

/** 手書きだけを全部消す。文章は残す。 */
export const withoutStrokes = (record: NoteRecord, questionId: string): NoteRecord => {
  const note = noteOf(record, questionId);
  if (note.strokes.length === 0) return record;
  return withNote(record, questionId, { ...note, strokes: [] });
};

const isStroke = (value: unknown): value is Stroke =>
  Array.isArray(value) &&
  value.length % 2 === 0 &&
  value.length >= 2 &&
  value.every((point) => typeof point === "number" && Number.isFinite(point));

const parseNote = (value: unknown): Note | null => {
  if (typeof value !== "object" || value === null) return null;
  const note = value as Record<string, unknown>;
  if (typeof note.text !== "string") return null;
  if (!Array.isArray(note.strokes) || !note.strokes.every(isStroke)) return null;
  const parsed: Note = {
    text: note.text.slice(0, TEXT_LIMIT),
    strokes: note.strokes.slice(0, STROKE_LIMIT),
  };
  return isEmptyNote(parsed) ? null : parsed;
};

/**
 * 保存されていた値をメモに戻す。
 *
 * 崩れている問題だけを落とし、残りは読む。学習記録（parseRecord）が 1 か所でも崩れていたら
 * 全部捨てるのは、半端な記録から集計を出すと数字の出どころが分からなくなるため。
 * メモは問題ごとに独立していて集計もしないので、他の問題のメモまで巻き添えにしない。
 */
export const parseNotes = (raw: unknown): NoteRecord => {
  if (typeof raw !== "object" || raw === null) return emptyNotes();
  const value = raw as Record<string, unknown>;
  if (value.version !== NOTE_VERSION) return emptyNotes();
  if (typeof value.notes !== "object" || value.notes === null) return emptyNotes();

  const notes: Record<string, Note> = {};
  for (const [id, note] of Object.entries(value.notes)) {
    const parsed = parseNote(note);
    if (parsed) notes[id] = parsed;
  }

  return { version: NOTE_VERSION, notes };
};
