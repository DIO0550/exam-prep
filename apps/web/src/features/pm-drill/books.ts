import { ARCH_DRILLS, ARCH_TOPICS } from "./arch/drills";
import { AUDIT_DRILLS, AUDIT_TOPICS } from "./audit/drills";
import { SEC_DRILLS, SEC_TOPICS } from "./sec/drills";
import { SM_DRILLS, SM_TOPICS } from "./sm/drills";
import type { PmDrill, PmDrillBookId, PmDrillScreen } from "./types";

/** 穴埋めドリル 1 種類分の設定。左の一覧の行と、一覧画面の見出し・説明。 */
export type PmDrillBook = {
  id: PmDrillBookId;
  screen: PmDrillScreen;
  /** 左の一覧の行の名前と、その下の小さい説明。 */
  sidebarName: string;
  sidebarSub: string;
  /** 一覧画面の見出しの上に小さく出す、どの問の対策か。 */
  eyebrow: string;
  title: string;
  /** 一覧の上に出す、このドリルで何を練習するかの説明。 */
  intro: string;
  /** 一覧に並べる分野の順。 */
  topics: string[];
  /** 分野の順に並べた全問。画面の「No.」と「次の問題へ」はこの順に従う。 */
  drills: PmDrill[];
};

/**
 * 応用情報 午後の穴埋めドリルのうち、情報セキュリティ（問1）・システムアーキテクチャ（問4）・
 * IT サービスマネジメント（問10）・システム監査（問11）の 4 種類。ネットワーク（問5）は nw-drill/、
 * データベース（問6）は db-drill/ にある。どれも本サイトで書き下ろしたもの（IPA の過去問題ではない）で、
 * 過去問で繰り返し問われている知識・計算・読み取りの型から作っている。
 */
export const PM_DRILL_BOOKS: Record<PmDrillBookId, PmDrillBook> = {
  sec: {
    id: "sec",
    screen: "sec-drill",
    sidebarName: "応用情報 セキュリティ 穴埋め",
    sidebarSub: "午後 問1 対策 ・ 自動採点",
    eyebrow: "午後 問1 対策",
    title: "情報セキュリティの穴埋めドリル",
    intro:
      "応用情報 午後の情報セキュリティの問で出る、認証ログ・ハッシュ値の表・Cookie の属性・電子署名の鍵の使い分け・SPF や DMARC のレコード・FW のルール・インシデント対応の手順などの空欄を埋める練習です。パスワード攻撃とソルト、Web アプリの脆弱性、PKI と S/MIME、送信ドメイン認証と DNS の攻撃、ランサムウェアと EDR、ログと SIEM、リスク対応と内部不正、ゼロトラストとサプライチェーンまで扱います。略語・ポート番号・数値は自分で書き、用語や仕組みは選んで答えます。",
    topics: SEC_TOPICS,
    drills: SEC_DRILLS,
  },
  arch: {
    id: "arch",
    screen: "arch-drill",
    sidebarName: "応用情報 アーキテクチャ 穴埋め",
    sidebarSub: "午後 問4 対策 ・ 自動採点",
    eyebrow: "午後 問4 対策",
    title: "システムアーキテクチャの穴埋めドリル",
    intro:
      "応用情報 午後のシステムアーキテクチャの問で出る、稼働率・データ量と帯域・保存容量・処理時間・クラウドの料金などの計算と、IaaS・PaaS・FaaS の違い、コンテナ、キャッシュ、SPA と Web API、エッジコンピューティング、IoT の通信方式の空欄を埋める練習です。計算の答えは数値で書き、方式や用語は選んで答えます。",
    topics: ARCH_TOPICS,
    drills: ARCH_DRILLS,
  },
  sm: {
    id: "sm",
    screen: "sm-drill",
    sidebarName: "応用情報 サービスマネジメント 穴埋め",
    sidebarSub: "午後 問10 対策 ・ 自動採点",
    eyebrow: "午後 問10 対策",
    title: "IT サービスマネジメントの穴埋めドリル",
    intro:
      "応用情報 午後の IT サービスマネジメントの問で出る、SLA の可用性と許容停止時間、MTBF と MTRS、インシデントの優先度、問題管理と既知の誤り、変更の種類と CAB、イベントの種類としきい値、サービスデスクの一次解決率と工数、費用の区分の空欄を埋める練習です。計算の答えは数値で書き、用語やプロセスは選んで答えます。",
    topics: SM_TOPICS,
    drills: SM_DRILLS,
  },
  audit: {
    id: "audit",
    screen: "audit-drill",
    sidebarName: "応用情報 システム監査 穴埋め",
    sidebarSub: "午後 問11 対策 ・ 自動採点",
    eyebrow: "午後 問11 対策",
    title: "システム監査の穴埋めドリル",
    intro:
      "応用情報 午後のシステム監査の問で出る、監査の手順（計画・予備調査・本調査・報告・フォローアップ）、監査技法（突合・再実行・観察など）、母集団とサンプリング、アクセス権の棚卸と職務の分離、入力・インタフェースのコントロール、委託先とコンティンジェンシー計画の点検の空欄を埋める練習です。予備調査の結果と監査手続を突き合わせて、何と何を照らし合わせるかを選んで答えます。",
    topics: AUDIT_TOPICS,
    drills: AUDIT_DRILLS,
  },
};

/** 左の一覧に並べる順（本試験の問番号の順）。 */
export const PM_DRILL_ORDER: PmDrillBookId[] = ["sec", "arch", "sm", "audit"];
