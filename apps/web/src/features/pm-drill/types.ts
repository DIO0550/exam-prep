import type { FillDrill, TextBlock } from "@/features/fill-drill/types";
import type { ChartFigure, DiagramFigure, SequenceFigure } from "@/features/quiz/types";

/**
 * 応用情報 午後の穴埋めドリル（情報セキュリティ・システムアーキテクチャ・IT サービスマネジメント・
 * システム監査）の本文のかたまり。段落・表・等幅の行と空欄の形は穴埋めドリル共通（fill-drill/types.ts）で、
 * ここでは本文の図（構成図・やり取りの順番・グラフ）を足す。
 *
 * 本文の図には空欄を置かない（空欄は本文・表・等幅の行に置く）。
 */
export type PmBlock =
  | {
      kind: "figure";
      /** 構成図（diagram）、通信や攻撃の手順（sequence）、利用率や件数の推移（chart）。 */
      figure: DiagramFigure | SequenceFigure | ChartFigure;
    }
  | TextBlock;

/** ドリル 1 問。Topic はドリルごとの分野。 */
export type PmDrill<Topic extends string = string> = FillDrill<Topic, PmBlock>;

/** 情報セキュリティ（午後 問1）の分野。 */
export type SecTopic =
  | "認証とパスワード"
  | "Web アプリケーションの脆弱性"
  | "暗号と PKI"
  | "メールと DNS の安全"
  | "マルウェアとインシデント対応"
  | "ネットワークの防御とログ"
  | "管理策とリスク"
  | "ゼロトラストとクラウド";

/** システムアーキテクチャ（午後 問4）の分野。 */
export type ArchTopic =
  | "稼働率と信頼性"
  | "性能と容量の見積り"
  | "クラウドと仮想化"
  | "Web システムと IoT の方式";

/** IT サービスマネジメント（午後 問10）の分野。 */
export type SmTopic =
  | "サービスレベル管理"
  | "インシデント管理と問題管理"
  | "変更管理とリリース"
  | "キャパシティと可用性"
  | "サービスデスクと財務";

/** システム監査（午後 問11）の分野。 */
export type AuditTopic =
  | "監査の進め方"
  | "監査手続と監査証拠"
  | "アクセス管理と職務の分離"
  | "入力・処理・インタフェースの統制"
  | "運用・委託・継続性";

/** 左の一覧に出す、ドリルの種類。 */
export type PmDrillBookId = "sec" | "arch" | "sm" | "audit";

/** 画面の名前。quiz の画面の切り替え（use-quiz-session.ts）で使う。 */
export type PmDrillScreen = `${PmDrillBookId}-drill`;
