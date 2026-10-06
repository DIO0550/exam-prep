import type { Question, Source } from "../types";

/**
 * Google Cloud Associate Cloud Engineer 対策 模擬試験 1（問1〜問50）。
 *
 * IPA の過去問題と違い、**問題文・選択肢・正解・解説のすべてを本サイトで書き下ろしている**。
 * 実際の認定試験の設問を再現したものではなく、公式の模擬試験でもない。
 *
 * 典拠にした公開資料:
 * - Google Cloud「Associate Cloud Engineer 認定試験ガイド」（4 セクションと各節の出題範囲）
 *
 * このセットが問う層は「各プロダクトの役割と、gcloud・kubectl・Terraform の基本操作」。
 * 誰が何をしたいかを短い場面で示し、使うプロダクト・設定項目・コマンドとフラグを選ばせる。
 * 配分は本番の比重に合わせて、セクション1 が 10 問、2 が 15 問、3 が 15 問、4 が 10 問。
 *
 * 作り方の方針:
 * - 設問は「立場と制約のある場面」から始め、用語の暗記ではなく選び方を問う
 * - 選択肢 4 つのうち 1〜2 つは正解と紛らわしいもの（似たフラグ、似たロール、1 段ずれた粒度、
 *   要件に対して過剰な構成）にし、残りは明確に誤りとする
 * - なぜその選択肢が違うのかは choice.note に 1 つずつ書く
 * - 数値や新しい機能の細部のうち、確かめきれないものは出題しない
 */

const GUIDE = "Google Cloud「Associate Cloud Engineer 認定試験ガイド」";

const at = (no: number, section: string): Source => ({
  kind: "original",
  deck: "ace-mock-1",
  label: "ACE 模擬1",
  no,
  reference: `${GUIDE} ${section}`,
});

const S1 = "セクション1 環境の設定";
const S2 = "セクション2 計画と実装";
const S3 = "セクション3 運用";
const S4 = "セクション4 アクセスとセキュリティ";

export const ACE_MOCK_1: [Question, ...Question[]] = [
  // ───────── セクション1 環境の設定（問1〜問10） ─────────
  {
    source: at(1, "1.1"),
    field: S1,
    answer: 2,
    text: "製造業のA社は Google Cloud の組織を持ち、営業部・開発部・経理部がそれぞれ複数のプロジェクトを使っている。各部の管理者には自部門のプロジェクトだけをまとめて管理させたい。今後その部門で新しく作るプロジェクトにも、同じ権限が自動的に効くようにしたい。リソース階層の組み方として最も適切なものはどれか。",
    choices: [
      {
        text: "各プロジェクトに部門名のラベルを付け、部門管理者にはプロジェクトごとにロールを付与する。",
        note: "ラベルは費用の集計や検索の目印で、IAM の付与先にはならない。新しいプロジェクトのたびに付与し直す手間も残る。",
      },
      {
        text: "部門ごとに別の組織を作り、それぞれの組織に部門管理者を置く。",
        note: "組織はドメイン（Cloud Identity / Google Workspace）に 1 つ対応する最上位ノードで、部門単位で分けるものではない。全社で共通の統制もかけにくくなる。",
      },
      {
        text: "組織の下に部門ごとのフォルダを作ってプロジェクトを入れ、部門管理者のロールをフォルダに付与する。",
        note: "フォルダに付与したロールは配下のプロジェクトへ継承され、後から入れたプロジェクトにも効く。これが正解。",
      },
      {
        text: "全部門のリソースを 1 つのプロジェクトに集め、リソース名の接頭辞で部門を見分ける。",
        note: "名前の付け方では権限も課金も分けられない。部門をまたいで操作できてしまう。",
      },
    ],
    explain:
      "リソース階層は 組織 → フォルダ → プロジェクト → リソース の順に入れ子になり、上位で付与した IAM ロールや組織ポリシーは下位へ継承される。部門のように「まとめて同じ扱いにしたい単位」はフォルダで表すのが基本で、フォルダにロールを付けておけば、そのフォルダへ後から作ったプロジェクトにも同じ権限が自動で効く。フォルダは入れ子にもできるので、部門の下に本番・開発のような段を作ることもできる。",
    points: [
      "部門・環境など、権限や統制をまとめてかけたい単位はフォルダで表す。",
      "上位ノードの付与は下位に継承されるので、新しいプロジェクトにも付与し直す必要がない。",
    ],
  },
  {
    source: at(2, "1.1"),
    field: S1,
    answer: 0,
    text: "金融業のB社は、規制対応のため、すべてのリソースを日本国内のリージョン（東京・大阪）にだけ作らせたい。対象は既存の全プロジェクトと、今後作られるプロジェクトである。プラットフォーム チームが行う設定として最も適切なものはどれか。",
    choices: [
      {
        text: "組織ノードに組織ポリシーのリソース ロケーション制限（constraints/gcp.resourceLocations）を設定し、許可する値を日本国内のロケーションに絞る。",
        note: "組織ポリシーは「何を作ってよいか」の制約で、組織に設定すれば配下の既存・新規プロジェクトすべてに継承される。これが正解。",
      },
      {
        text: "各プロジェクトの割り当て（quota）で、東京・大阪以外のリージョンの上限を 0 に下げる。",
        note: "割り当ては消費量の上限であって、場所を統制するための仕組みではない。プロジェクトとリソースの種類ごとに設定が要り、新しいプロジェクトにも自動では効かない。",
      },
      {
        text: "VPC Service Controls のサービス境界で全プロジェクトを囲む。",
        note: "サービス境界は Google API へのアクセス経路を絞ってデータの持ち出しを防ぐもので、リソースを作る場所を制限するものではない。",
      },
      {
        text: "全員の gcloud CLI で gcloud config set compute/region asia-northeast1 を実行させる。",
        note: "既定値を変えるだけで、フラグで別のリージョンを指定すれば作れてしまう。強制力が無い。",
      },
    ],
    explain:
      "「誰が操作できるか」を決めるのが IAM、「どのような構成を許すか」を決めるのが組織ポリシーである。リソースを作る場所の制限は組織ポリシーのリソース ロケーション制限で行い、組織やフォルダに設定すれば配下へ継承される。例外が必要なプロジェクトだけ、下位で上書きすることもできる。",
    points: [
      "IAM は「誰が」、組織ポリシーは「何を・どのように」を縛る。",
      "組織ポリシーも IAM と同様にリソース階層を通じて下位へ継承される。",
    ],
  },
  {
    source: at(3, "1.1"),
    field: S1,
    answer: 3,
    text: "SRE のCさんは、開発用プロジェクトでは個人の Google アカウント、本番プロジェクトでは別の管理者アカウントを使い、1 日に何度も gcloud CLI で両方を行き来している。先日、開発のつもりで実行したコマンドが本番に当たる事故があった。アカウントとプロジェクトの組を取り違えにくくする方法として最も適切なものはどれか。",
    choices: [
      {
        text: "切り替えるたびに gcloud config set project と gcloud config set account を続けて実行する。",
        note: "動作はするが、2 つの値を毎回手で書き換えるので、片方だけ変え忘れる取り違えの原因がそのまま残る。",
      },
      {
        text: "切り替えるたびに gcloud auth revoke で認証情報を消し、gcloud auth login でログインし直す。",
        note: "認証情報を取り直すだけで、既定のプロジェクトは切り替わらない。手間も増える。",
      },
      {
        text: "本番用のサービス アカウント キーを作って手元に置き、gcloud auth activate-service-account で切り替える。",
        note: "長期間有効な鍵を手元に置くことになり、漏えいの危険が増える。切り替えの手間を減らす目的に対して代償が大きい。",
      },
      {
        text: "gcloud config configurations create で開発用と本番用の名前付き構成を作ってそれぞれにアカウントとプロジェクトを設定し、gcloud config configurations activate で構成ごと切り替える。",
        note: "アカウント・プロジェクト・既定リージョンなどを 1 つの構成にまとめて保持し、名前 1 つで丸ごと切り替えられる。これが正解。",
      },
    ],
    explain:
      "gcloud CLI の設定（account、project、compute/region など）は「構成（configuration）」という単位で保存される。gcloud config configurations create で構成を増やし、activate で切り替えると、そこに入っている値がまとめて入れ替わる。gcloud config configurations list で一覧と現在有効な構成を確認できる。1 回だけ別の構成で実行したいときは、コマンドに --configuration フラグを付けてもよい。",
    points: [
      "名前付き構成は account・project・リージョンなどの組をまとめて保持する。",
      "切り替えは gcloud config configurations activate、確認は gcloud config configurations list。",
    ],
  },
  {
    source: at(4, "1.1"),
    field: S1,
    answer: 1,
    text: "新しく作ったプロジェクトで、Cloud SQL のインスタンスを作るために gcloud sql instances create を実行したところ、「Cloud SQL Admin API がこのプロジェクトで使われたことがないか、無効になっている」という趣旨のエラーが出た。実行者はプロジェクトのオーナーである。次に行う操作として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud services list --available を実行する。",
        note: "有効にできる API の一覧を表示するだけで、有効化はされない。",
      },
      {
        text: "gcloud services enable sqladmin.googleapis.com を実行する。",
        note: "プロジェクトで Cloud SQL Admin API を有効にする。API はプロジェクトごとに有効化が必要。これが正解。",
      },
      {
        text: "自分にもう一度オーナー（roles/owner）を付与し直す。",
        note: "エラーの原因は権限ではなく API が無効なこと。ロールを付け直しても状況は変わらない。",
      },
      {
        text: "gcloud components update で gcloud CLI を最新版にする。",
        note: "手元のツールを更新しても、プロジェクト側で API が無効なままでは呼び出せない。",
      },
    ],
    explain:
      "Google Cloud の多くのサービスは、プロジェクトごとに API を有効にしてから使う。gcloud services enable にサービス名（例: sqladmin.googleapis.com、container.googleapis.com）を渡すと有効になり、gcloud services list --enabled で有効なものを確認できる。コンソールでは「API とサービス」のライブラリから同じ操作ができる。",
    points: [
      "API の有効化はプロジェクト単位。新しいプロジェクトでは最初に必要な API を有効にする。",
      "list --available は候補の一覧、list --enabled は有効なものの一覧。",
    ],
  },
  {
    source: at(5, "1.1"),
    field: S1,
    answer: 0,
    text: "映像制作のD社のレンダリング チームが、asia-northeast1 で N2 マシンタイプの VM を追加で 64 vCPU 分作ろうとしたところ、リージョンの N2_CPUS の割り当てを超えたというエラーで作成に失敗した。チームはこの容量を継続して使う予定である。取るべき対応として最も適切なものはどれか。",
    choices: [
      {
        text: "Cloud Quotas（コンソールの割り当てのページ）から、asia-northeast1 の N2_CPUS の上限引き上げをリクエストする。",
        note: "割り当ては申請によって引き上げを求められる。継続して使う容量なら上限そのものを上げるのが筋。これが正解。",
      },
      {
        text: "同じ asia-northeast1 の別のゾーンを指定して作り直す。",
        note: "N2_CPUS はリージョン単位の割り当てなので、同じリージョンのどのゾーンで作っても同じ上限に当たる。",
      },
      {
        text: "Cloud Billing の予算の金額を引き上げる。",
        note: "予算は費用の把握と通知のための仕組みで、作れるリソースの量には関係しない。",
      },
      {
        text: "プロジェクトを別の請求先アカウントにリンクし直す。",
        note: "請求先を付け替えても、割り当ての値が自動で増えるわけではない。",
      },
    ],
    explain:
      "割り当て（quota）は、プロジェクトがリージョンなどの単位で使えるリソース量の上限で、想定外の大量消費を防ぐ役割を持つ。上限に当たったら、コンソールの割り当てのページ（Cloud Quotas）で対象の指標と場所を選び、引き上げをリクエストする。審査があるため、計画的な増設なら事前に申請しておく。予算（budget）とは別物で、予算は使える量を制限しない。",
    points: [
      "vCPU などの割り当てはリージョン単位のものが多く、ゾーンを変えても同じ上限に当たる。",
      "割り当ては量の上限、予算は費用の通知。役割を混同しない。",
    ],
  },
  {
    source: at(6, "1.1"),
    field: S1,
    answer: 2,
    text: "ML チームは大阪リージョン（asia-northeast2）で NVIDIA L4 GPU を付けた VM を使う設計を考えている。設計を固める前に、その GPU がどのゾーンで提供されているかを gcloud CLI で確かめたい。使うコマンドとして最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud compute regions describe asia-northeast2",
        note: "リージョンの状態や割り当て（GPU の割り当てを含む）が分かるが、割り当てがあることと、そのゾーンで GPU が提供されていることは別の話である。",
      },
      {
        text: "gcloud compute zones list",
        note: "ゾーンの一覧と状態を表示するだけで、どのアクセラレータが使えるかは分からない。",
      },
      {
        text: "gcloud compute accelerator-types list",
        note: "GPU などのアクセラレータの種類を、提供されているゾーンごとに一覧表示する。フィルタでゾーンを絞り込める。これが正解。",
      },
      {
        text: "gcloud services list --enabled",
        note: "プロジェクトで有効な API の一覧で、提供場所とは無関係。",
      },
    ],
    explain:
      "GPU やマシンファミリーは、すべてのリージョン・ゾーンで提供されているわけではない。設計の前に、アクセラレータなら gcloud compute accelerator-types list、マシンタイプなら gcloud compute machine-types list でゾーンごとの提供状況を確かめる。実際に作れるかどうかは、これに加えて割り当てにも左右されるため、両方を見る。",
    points: [
      "提供の有無は accelerator-types list / machine-types list、使える量は割り当てで確かめる。",
      "ゾーンによって使えるハードウェアが違うことを前提に設計する。",
    ],
  },
  {
    source: at(7, "1.1"),
    field: S1,
    answer: [0, 2],
    text: "社員 3,000 人のE社は、オンプレミスの Active Directory を ID の正としている。Google Cloud を使い始めるにあたり、AD のユーザーとグループを Cloud Identity に自動で反映させたい。また、社員には AD のパスワードのまま Google Cloud にサインインさせ、別のパスワードを持たせたくない。行う構成として適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "Google Cloud Directory Sync（GCDS）を使い、AD のユーザーとグループを Cloud Identity へ定期的に同期する。",
        note: "GCDS は AD などの LDAP ディレクトリを読み、Cloud Identity のユーザーとグループを作成・更新する。これが正解。",
      },
      {
        text: "コンソールの IAM のページで、社員を 1 人ずつ新しいユーザーとして作成する。",
        note: "IAM のページはロールを付与する場所で、ユーザー アカウントそのものは作れない。3,000 人を手作業で保つのも現実的でない。",
      },
      {
        text: "AD 側の ID プロバイダ（AD FS など）と Cloud Identity の間で、SAML によるシングル サインオンを構成する。",
        note: "認証は AD 側の ID プロバイダに任せ、社員は AD の資格情報のままサインインできる。これが正解。",
      },
      {
        text: "社員ごとにサービス アカウントを作り、鍵ファイルを配布する。",
        note: "サービス アカウントはアプリケーションやワークロード用の ID で、人のサインインに使うものではない。鍵の配布は危険も大きい。",
      },
    ],
    explain:
      "既存の AD を正とする場合、ユーザーとグループの「もの」は GCDS で Cloud Identity へ同期し、「認証」は SAML のシングル サインオンで AD 側の ID プロバイダに委ねる、という 2 つを組み合わせるのが定番の構成である。同期したグループに IAM ロールを付ければ、AD 側のグループのメンバー変更がそのまま Google Cloud の権限にも反映される。",
    points: [
      "アカウントの同期は GCDS、パスワードの扱いは SAML SSO。役割を分けて考える。",
      "IAM のページではユーザーを作れない。ユーザーは Cloud Identity / Google Workspace 側で管理する。",
    ],
  },
  {
    source: at(8, "1.2"),
    field: S1,
    answer: [1, 3],
    text: "財務チームのFさんは、新しいプロジェクト analytics-dev を会社の請求先アカウントにリンクするため、gcloud billing projects link analytics-dev --billing-account=0X0X0X-0X0X0X-0X0X0X を実行したが、権限不足で失敗した。Fさんはこのプロジェクトにも請求先アカウントにも、まだ何のロールも持っていない。リンクに必要なロールの組み合わせとして適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "請求先アカウントに対する請求先アカウント閲覧者（roles/billing.viewer）",
        note: "請求の内容を見るだけのロールで、プロジェクトを紐づける権限は無い。",
      },
      {
        text: "請求先アカウントに対する請求先アカウント ユーザー（roles/billing.user）",
        note: "その請求先アカウントにプロジェクトを関連付ける権限を持つ。これが正解。",
      },
      {
        text: "プロジェクトに対する Compute 管理者（roles/compute.admin）",
        note: "Compute Engine のリソースを管理するロールで、課金の設定とは関係しない。",
      },
      {
        text: "プロジェクトに対するプロジェクト支払い管理者（roles/billing.projectManager）",
        note: "プロジェクト側で課金の有効化・無効化を行う権限を持つ。これが正解。",
      },
    ],
    explain:
      "プロジェクトを請求先アカウントにリンクするには、両側の権限が要る。請求先アカウント側では、そのアカウントを使ってよいという権限（請求先アカウント ユーザー、または請求先アカウント管理者）、プロジェクト側では課金設定を変えてよいという権限（プロジェクト支払い管理者、またはオーナー）である。どちらか一方だけでは失敗する。",
    points: [
      "リンクは「請求先アカウント側」と「プロジェクト側」の両方の権限がそろって初めて成功する。",
      "プロジェクトのオーナーなら、プロジェクト側の権限はすでに持っている。",
    ],
    figure: {
      type: "table",
      caption: "請求関連の主なロール",
      headers: ["ロール", "付与先", "できること"],
      rows: [
        [
          "請求先アカウント管理者",
          "請求先アカウント",
          "支払い方法の管理、権限の付与、リンクの管理",
        ],
        [
          "請求先アカウント ユーザー",
          "請求先アカウント",
          "プロジェクトをその請求先アカウントにリンクする",
        ],
        ["請求先アカウント閲覧者", "請求先アカウント", "費用や取引の閲覧のみ"],
        ["プロジェクト支払い管理者", "プロジェクト", "プロジェクトの課金の有効化・無効化"],
      ],
    },
  },
  {
    source: at(9, "1.2"),
    field: S1,
    answer: 3,
    text: "研修用のサンドボックス プロジェクトを多数運用しているG社は、受講者が高価なリソースを作りっぱなしにすることを心配している。プロジェクトの費用が予算額に達したら、人の操作を待たずに自動で課金を止めたい。構成として最も適切なものはどれか。",
    choices: [
      {
        text: "予算を作り、しきい値 100% のアラートを設定する。到達するとプロジェクトのリソースが自動的に停止する。",
        note: "予算アラートは通知を送るだけで、費用に上限をかけたりリソースを止めたりはしない。",
      },
      {
        text: "プロジェクトの割り当てをすべて 0 に下げておく。",
        note: "研修そのものができなくなる。割り当ては量の上限で、費用に連動して動くものでもない。",
      },
      {
        text: "予算アラートのメール通知先を、プロジェクトの全メンバーに広げる。",
        note: "気付く人は増えるが、止める操作は人手のまま。自動で止める要件を満たさない。",
      },
      {
        text: "予算にプログラムによる通知を設定して Pub/Sub トピックへ送り、それを受けた Cloud Run functions の関数がプロジェクトの課金を無効にする。",
        note: "予算の状況を Pub/Sub で受け取れば、関数などで自動の対処を組める。これが正解。",
      },
    ],
    explain:
      "Cloud Billing の予算とアラートは、費用の状況を知らせるための仕組みで、それ自体は支出を止めない。自動で何かをさせたいときは、予算に Pub/Sub トピックを結び付ける「プログラムによる通知」を使い、そのメッセージを受けた関数で課金の無効化やリソースの停止を行う。課金を無効にすると、そのプロジェクトの有料リソースは止まり、場合によっては削除されることがあるため、本番環境ではなくサンドボックス向けの手法と考える。",
    points: [
      "予算アラートは通知だけ。上限で止めるには Pub/Sub 経由の自動処理を自分で組む。",
      "課金の無効化は影響が大きいので、対象プロジェクトを限って使う。",
    ],
    figure: {
      type: "table",
      caption: "予算に結び付けられる通知の違い",
      headers: ["仕組み", "届く先", "自動で止まるか"],
      rows: [
        [
          "予算アラートのメール",
          "請求先アカウントの管理者・指定した受信者",
          "止まらない（人が判断する）",
        ],
        ["プログラムによる通知", "Pub/Sub トピック", "受け取った処理を書けば止められる"],
      ],
    },
  },
  {
    source: at(10, "1.2"),
    field: S1,
    answer: 1,
    text: "H社の財務部は、全プロジェクトの費用をプロジェクト別・ラベル（cost-center）別に毎日 SQL で集計し、Looker Studio のダッシュボードにしたいと考えている。設定として最も適切なものはどれか。",
    choices: [
      {
        text: "請求先アカウントの請求書 PDF を毎月ダウンロードし、表計算ソフトに転記する。",
        note: "月単位でしか得られず、ラベル別の明細を SQL で扱える形にもならない。",
      },
      {
        text: "Cloud Billing のデータを BigQuery へエクスポートする設定を有効にし、出力されたテーブルを SQL で集計する。",
        note: "使用料金の明細がプロジェクト・サービス・ラベルなどの列付きで BigQuery に入り続ける。これが正解。",
      },
      {
        text: "Cloud Logging のシンクで監査ログを BigQuery にエクスポートする。",
        note: "監査ログは誰が何をしたかの記録で、費用の金額は含まない。",
      },
      {
        text: "Cloud Monitoring で各プロジェクトの CPU 使用率のダッシュボードを作る。",
        note: "使用率は分かっても金額にはならない。財務部の要件とずれている。",
      },
    ],
    explain:
      "Cloud Billing のエクスポートを BigQuery に向けると、請求先アカウントに紐づく全プロジェクトの使用料金データが、指定したデータセットのテーブルに自動で書き込まれ続ける。プロジェクト、サービス、SKU、ラベルなどが列として入るので、GROUP BY で自由に集計でき、Looker Studio からもそのまま参照できる。エクスポートは有効にした時点以降のデータが対象になるため、早めに設定しておくのがよい。",
    points: [
      "費用を SQL で分析したいなら、Cloud Billing の BigQuery エクスポート。",
      "ラベルを付けておくと、エクスポートされた明細で部署やチーム別に集計できる。",
    ],
  },

  // ───────── セクション2 計画と実装（問11〜問25） ─────────
  {
    source: at(11, "2.1"),
    field: S2,
    answer: 1,
    text: "オンプレミスで動いている業務アプリを Compute Engine に移す。測定の結果、必要なのは 6 vCPU とメモリ 40 GB で、n2-standard-8（8 vCPU・32 GB）ではメモリが足りず、n2-highmem-8（8 vCPU・64 GB）ではメモリが大きく余る。1 台の VM で動かし、費用を必要な分に抑えたい。選び方として最も適切なものはどれか。",
    choices: [
      {
        text: "n2-highmem-8 を選ぶ。",
        note: "要件は満たすが、vCPU もメモリも必要以上に払うことになる。費用を抑える条件に合わない。",
      },
      {
        text: "カスタム マシンタイプで 6 vCPU・40 GB を指定する（例: --custom-vm-type=n2 --custom-cpu=6 --custom-memory=40GB）。",
        note: "vCPU 数とメモリ量を必要な値に合わせて作れる。これが正解。",
      },
      {
        text: "単一テナント ノードを予約して、その上で n2-standard-8 を動かす。",
        note: "単一テナント ノードは物理サーバーを専有するための仕組みで、費用はむしろ上がる。メモリ不足も解消しない。",
      },
      {
        text: "n2-standard-8 を Spot VM として作る。",
        note: "安くはなるがメモリ不足は変わらず、いつ停止されるか分からないため常時動かす業務アプリに向かない。",
      },
    ],
    explain:
      "事前定義のマシンタイプが要件にぴったり合わないときは、カスタム マシンタイプで vCPU とメモリを指定できる。gcloud compute instances create ではカスタム用のフラグ（--custom-cpu、--custom-memory、マシンファミリーを選ぶ --custom-vm-type）で指定する。vCPU 数の刻みや vCPU あたりのメモリ量にはファミリーごとの決まりがあるため、指定できる組み合わせはドキュメントで確かめる。",
    points: [
      "事前定義で過不足が出るなら、カスタム マシンタイプで合わせる。",
      "Spot VM は料金の割引、単一テナントは物理的な専有。どちらもサイズの問題は解かない。",
    ],
  },
  {
    source: at(12, "2.1"),
    field: S2,
    answer: 0,
    text: "画像変換の夜間バッチは、途中で止まっても最初からやり直せる作りになっている。費用をできるだけ下げるため、Compute Engine の割引価格で使える代わりに Google の都合で停止されうる VM で動かしたい。gcloud compute instances create に付けるフラグとして最も適切なものはどれか。",
    choices: [
      {
        text: "--provisioning-model=SPOT",
        note: "Spot VM として作成する。停止時の動作は --instance-termination-action（STOP または DELETE）で選べる。これが正解。",
      },
      {
        text: "--preemptible",
        note: "旧方式のプリエンプティブル VM になる。最長 24 時間で必ず停止される制約があり、新しく作るなら Spot VM を使う。",
      },
      {
        text: "--maintenance-policy=TERMINATE",
        note: "ホストのメンテナンス時に VM を止めるかどうかの設定で、割引価格にはならない。",
      },
      {
        text: "--shielded-secure-boot",
        note: "ブートの改ざんを防ぐ Shielded VM の設定で、料金とは関係ない。",
      },
    ],
    explain:
      "Spot VM は、Compute Engine の余剰容量を大幅な割引価格で使える VM で、容量が必要になると Google によって停止（プリエンプト）される。停止の前には 30 秒の通知が届くので、その間に後片付けをする。プリエンプティブル VM と違って最大実行時間の制限は無い。やり直しの効くバッチやフォールト トレラントな処理に向き、常時動かすサービスには向かない。",
    points: [
      "Spot VM は --provisioning-model=SPOT。停止前の通知は 30 秒。",
      "プリエンプティブル VM は 24 時間の上限がある旧方式。",
    ],
  },
  {
    source: at(13, "2.1"),
    field: S2,
    answer: 3,
    text: "I社は拡張機能の都合で Cloud SQL に移せない PostgreSQL を、Compute Engine の VM で自前運用している。ゾーン障害が起きたら、同じリージョンの別ゾーンに置いた待機 VM に切り替え、障害の直前までのデータで再開したい。データ ディスクの選び方として最も適切なものはどれか。",
    choices: [
      {
        text: "ゾーン Persistent Disk を使い、1 時間ごとにスナップショットを取る。",
        note: "スナップショットからの復元になるため、最後のスナップショット以降の最大 1 時間分のデータを失う。",
      },
      {
        text: "ローカル SSD に置く。",
        note: "VM に物理的に付いた一時的な領域で、VM の停止やホストの障害で中身が失われる。別ゾーンへの引き継ぎもできない。",
      },
      {
        text: "Hyperdisk Extreme に置き、プロビジョニングする IOPS を高めにする。",
        note: "性能は高いが、単一ゾーンのディスクなのでゾーン障害には耐えない。",
      },
      {
        text: "同じリージョンの 2 つのゾーンへ同期で複製されるリージョン Persistent Disk を使い、障害時は待機 VM に強制アタッチする。",
        note: "書き込みが 2 ゾーンに同期で複製されるため、もう一方のゾーンで最新のデータから再開できる。これが正解。",
      },
    ],
    explain:
      "リージョン Persistent Disk は、同じリージョン内の 2 つのゾーンにデータを同期で複製するブロック ストレージで、1 つのゾーンが使えなくなっても、もう一方のゾーンの VM に強制アタッチして処理を続けられる。ゾーン Persistent Disk や Hyperdisk Extreme は単一ゾーンのディスク、ローカル SSD は VM に付随する一時領域である。Hyperdisk には複数ゾーンへ複製する種類もあるが、選択肢の Hyperdisk Extreme は単一ゾーン向けである。",
    points: [
      "ゾーン障害への耐性が要るなら、2 ゾーンに同期複製するディスクを選ぶ。",
      "スナップショットは復旧の手段だが、取得間隔ぶんのデータは失いうる。",
    ],
    figure: {
      type: "table",
      caption: "Compute Engine で使う主なブロック ストレージ",
      headers: ["種類", "置かれる範囲", "向いている用途"],
      rows: [
        ["ゾーン Persistent Disk", "1 ゾーン", "一般的なブートディスク・データディスク"],
        [
          "リージョン Persistent Disk",
          "同じリージョンの 2 ゾーン",
          "ゾーン障害時に別ゾーンで引き継ぐ構成",
        ],
        [
          "Hyperdisk",
          "種類による（Extreme は 1 ゾーン）",
          "容量と別に IOPS やスループットを指定したい用途",
        ],
        ["ローカル SSD", "VM が載るホスト", "消えてもよい一時データ・キャッシュ"],
      ],
    },
  },
  {
    source: at(14, "2.1"),
    field: S2,
    answer: 2,
    text: "Web 層のために、インスタンス テンプレート web-tmpl から asia-northeast1 のリージョン マネージド インスタンス グループ（MIG）web-mig を 2 台で作成した。この MIG を、平均 CPU 使用率がおよそ 60% になるように 2〜10 台の範囲で自動的に増減させたい。実行するコマンドとして最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud compute instance-groups managed set-autoscaling web-mig --region=asia-northeast1 --min-num-replicas=2 --max-num-replicas=10 --target-cpu-utilization=60",
        note: "--target-cpu-utilization は 0.0〜1.0 の割合で指定する。60 では値の範囲から外れる。",
      },
      {
        text: "gcloud compute instance-groups managed resize web-mig --region=asia-northeast1 --size=10",
        note: "台数を 10 台に固定するだけで、負荷に応じて増減はしない。",
      },
      {
        text: "gcloud compute instance-groups managed set-autoscaling web-mig --region=asia-northeast1 --min-num-replicas=2 --max-num-replicas=10 --target-cpu-utilization=0.6",
        note: "MIG に自動スケーリングを設定し、CPU 使用率 60% を目標に 2〜10 台の間で調整させる。これが正解。",
      },
      {
        text: "gcloud compute instance-templates create web-tmpl-v2 --max-num-replicas=10 --target-cpu-utilization=0.6",
        note: "インスタンス テンプレートは VM の作り方の定義で、台数や自動スケーリングの設定は持たない。",
      },
    ],
    explain:
      "自動スケーリングは MIG に対して設定するもので、インスタンス テンプレートは「どういう VM を作るか」だけを持つ。set-autoscaling では最小・最大台数と目標（CPU 使用率、ロードバランサの処理容量、Cloud Monitoring の指標など）を指定する。CPU 使用率の目標は 0.6 のように割合で書く。ゾーン MIG なら --zone、リージョン MIG なら --region を付ける。",
    points: [
      "テンプレートは VM の設計図、台数と自動スケーリングは MIG の設定。",
      "--target-cpu-utilization は 0.0〜1.0 の割合で指定する。",
    ],
  },
  {
    source: at(15, "2.1"),
    field: S2,
    answer: 0,
    text: "J社のデータ チームは、1 日に数時間だけ動く小さなバッチ用 Pod を GKE で動かしたい。費用を比べるにあたり、Pod が動いていない時間のノードの空き容量にまで支払いが生じるかどうかを知りたい。GKE Autopilot と Standard の課金と管理の違いの説明として正しいものはどれか。",
    choices: [
      {
        text: "Autopilot では主に Pod がリクエストした CPU やメモリなどのリソースに対して課金され、ノードの構成と管理は Google が行う。",
        note: "Pod の要求量に応じて払うので、Pod の無い時間に空いたノードの分を払う形にならない。これが正解。",
      },
      {
        text: "Autopilot でも、ノードとして作られた VM 単位で課金されるため、空き容量の分も払うことになる。",
        note: "それは Standard の課金の形である。Standard では、Pod が載っていなくてもノードの VM の料金が発生する。",
      },
      {
        text: "Standard では、ノードの自動アップグレードや自動修復を設定できない。",
        note: "Standard でもノードプールごとに自動アップグレード・自動修復を有効にできる。違うのは、それを利用者が設定・管理する点。",
      },
      {
        text: "Autopilot ではゾーン クラスタしか作れない。",
        note: "Autopilot のクラスタはリージョン クラスタとして作られる。",
      },
    ],
    explain:
      "GKE には 2 つの運用モードがある。Autopilot はノードの構成・スケーリング・アップグレードを Google が管理し、課金は主に Pod のリソース リクエストに基づく。Standard はノードプールのマシンタイプや台数を利用者が決めて管理し、課金はノードの VM 単位になる。ノードを細かく制御したいなら Standard、運用の手間と遊休コストを減らしたいなら Autopilot が候補になる。",
    points: [
      "Autopilot は Pod のリクエスト量で、Standard はノード VM で課金される。",
      "Autopilot のクラスタはリージョン クラスタ。",
    ],
    figure: {
      type: "table",
      caption: "GKE の 2 つのモード",
      headers: ["観点", "Autopilot", "Standard"],
      rows: [
        ["ノードの管理", "Google が行う", "利用者がノードプールを設計・管理する"],
        ["主な課金単位", "Pod のリソース リクエスト", "ノードの VM"],
        [
          "向いている場面",
          "運用の手間と遊休コストを減らしたい",
          "ノードの種類や設定を細かく制御したい",
        ],
      ],
    },
  },
  {
    source: at(16, "2.1"),
    field: S2,
    answer: [0, 3],
    text: "新しく入ったエンジニアのノート PC には、gcloud CLI と kubectl がすでに入っている。asia-northeast1 にあるリージョン GKE クラスタ prod を kubectl で操作したいが、いまは kubectl get nodes を実行しても接続先が設定されていないというエラーになる。追加で必要な操作として適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "gcloud components install gke-gcloud-auth-plugin を実行して、kubectl 用の認証プラグインを入れる。",
        note: "kubectl が GKE に認証するには、このプラグインが必要になる。これが正解。",
      },
      {
        text: "gcloud auth configure-docker asia-northeast1-docker.pkg.dev を実行する。",
        note: "Docker から Artifact Registry へ push / pull するための認証設定で、kubectl の接続先とは関係ない。",
      },
      {
        text: "kubectl config use-context prod を実行する。",
        note: "切り替える先のコンテキストがまだ kubeconfig に無いので失敗する。GKE が作るコンテキスト名も gke_プロジェクト_場所_クラスタ の形になる。",
      },
      {
        text: "gcloud container clusters get-credentials prod --region=asia-northeast1 を実行し、kubeconfig に接続情報を書き込む。",
        note: "クラスタのエンドポイントと認証の設定を kubeconfig に追加し、そのコンテキストを現在のものにする。リージョン クラスタなので --region を付ける。これが正解。",
      },
    ],
    explain:
      "手元から GKE を kubectl で操作するには、kubectl 本体に加えて gke-gcloud-auth-plugin が必要で、gcloud components install（または OS のパッケージ マネージャ）で入れられる。そのうえで gcloud container clusters get-credentials を実行すると、クラスタの接続先と認証方法が kubeconfig に書き込まれ、kubectl がそのクラスタを向く。ゾーン クラスタなら --zone、リージョン クラスタなら --region で場所を指定する。",
    points: [
      "kubectl 本体 ＋ gke-gcloud-auth-plugin ＋ get-credentials の 3 つがそろって接続できる。",
      "場所の指定はクラスタの種類に合わせる（ゾーンなら --zone、リージョンなら --region）。",
    ],
  },
  {
    source: at(17, "2.1"),
    field: S2,
    answer: 1,
    text: "公開 REST API のコンテナ イメージを asia-northeast1-docker.pkg.dev/shop-prod/apps/api:1.4 として Artifact Registry に push した。このイメージをそのまま使って東京リージョンの Cloud Run にデプロイし、認証なしで誰でも呼び出せるようにしたい。実行するコマンドとして最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud run deploy api --image=asia-northeast1-docker.pkg.dev/shop-prod/apps/api:1.4 --region=asia-northeast1 --no-allow-unauthenticated",
        note: "未認証の呼び出しを拒否する設定になる。公開 API の要件と逆。",
      },
      {
        text: "gcloud run deploy api --image=asia-northeast1-docker.pkg.dev/shop-prod/apps/api:1.4 --region=asia-northeast1 --allow-unauthenticated",
        note: "push 済みのイメージから Cloud Run サービスを作り、未認証の呼び出しを許可する。これが正解。",
      },
      {
        text: "gcloud run deploy api --source=. --region=asia-northeast1 --allow-unauthenticated",
        note: "手元のソースからイメージを新たにビルドしてデプロイする方法。push 済みのイメージをそのまま使う要件に合わない。",
      },
      {
        text: "gcloud container clusters create api --image=asia-northeast1-docker.pkg.dev/shop-prod/apps/api:1.4",
        note: "GKE クラスタを作るコマンドで、イメージを渡してアプリを動かすものではない。",
      },
    ],
    explain:
      "Cloud Run へのデプロイは gcloud run deploy で行い、既存のイメージなら --image、ソースからビルドさせるなら --source を使う。誰でも呼び出せる公開サービスにするには --allow-unauthenticated を付ける（内部では allUsers に Cloud Run 起動元のロールが付く）。認証を求めるなら --no-allow-unauthenticated とし、呼び出し側に起動元ロールを付与する。",
    points: [
      "既存イメージは --image、ソースからは --source。",
      "公開するなら --allow-unauthenticated、認証を求めるなら --no-allow-unauthenticated。",
    ],
  },
  {
    source: at(18, "2.1"),
    field: S2,
    answer: 3,
    text: "K社では、取引先が Cloud Storage のバケット gs://sales-inbox に CSV をアップロードすると、Cloud Run サービス csv-loader がそのファイルを取り込む仕組みを作りたい。アップロードからなるべく間を置かずに処理を始めたい。構成として最も適切なものはどれか。",
    choices: [
      {
        text: "Eventarc トリガーを作り、イベント タイプに google.cloud.storage.object.v1.deleted、宛先に csv-loader を指定する。",
        note: "これはオブジェクトが削除されたときのイベントで、アップロードでは発火しない。",
      },
      {
        text: "Cloud Scheduler で 1 分ごとに csv-loader を呼び出し、バケットに新しいファイルが無いか調べさせる。",
        note: "ポーリングでは最大 1 分程度の遅れが出るうえ、ファイルが無いときも呼び出しが発生する。イベントで起動できるなら不要な構成。",
      },
      {
        text: "バケットにライフサイクル ルールを設定し、新しいオブジェクトが来たら csv-loader を呼び出させる。",
        note: "ライフサイクル ルールはストレージ クラスの変更や削除を行う仕組みで、サービスを呼び出す機能は無い。",
      },
      {
        text: "Eventarc トリガーを作り、イベント タイプに google.cloud.storage.object.v1.finalized、対象バケットに sales-inbox、宛先に csv-loader を指定する。",
        note: "オブジェクトの作成（書き込みの完了）をきっかけに csv-loader が呼び出される。これが正解。",
      },
    ],
    explain:
      "Eventarc は、Cloud Storage や Pub/Sub などで起きたイベントを Cloud Run などの宛先へ届けるサービスである。Cloud Storage のオブジェクトが新しく作られたとき（上書きを含む）のイベント タイプは google.cloud.storage.object.v1.finalized で、トリガーにはこのタイプとバケット名、宛先のサービスを指定する。Cloud Storage のイベントは Pub/Sub を経由して届くため、Cloud Storage のサービス エージェントに Pub/Sub パブリッシャーのロールが必要になる点も覚えておく。",
    points: [
      "アップロード完了は finalized、削除は deleted。",
      "イベントで起動できるなら、ポーリングより Eventarc のトリガーを使う。",
    ],
  },
  {
    source: at(19, "2.2"),
    field: S2,
    answer: 2,
    text: "L病院は、スキャンした診療記録を 10 年間保管する義務がある。記録を読み出すのは監査や法的な照会があったときだけで、1 年に 1 回あるかどうかである。読み出すときに数時間待たされるのは困るが、保管にかかる費用はできるだけ抑えたい。Cloud Storage のストレージ クラスとして最も適切なものはどれか。",
    choices: [
      {
        text: "Standard",
        note: "頻繁に読み書きするデータ向けで、保管料金が最も高い。年 1 回以下の読み出しには割高。",
      },
      {
        text: "Coldline",
        note: "四半期に 1 回程度の読み出しを想定したクラス。年 1 回以下で 10 年保管するなら、保管料金がさらに安いクラスがある。",
      },
      {
        text: "Archive",
        note: "年 1 回未満の読み出しを想定し、保管料金が最も安い。読み出しの待ち時間は他のクラスと同じくミリ秒単位。これが正解。",
      },
      {
        text: "Nearline",
        note: "月に 1 回程度の読み出しを想定したクラスで、この要件には割高。",
      },
    ],
    explain:
      "Cloud Storage のストレージ クラスは、読み出しの頻度に応じて保管料金と読み出し料金の釣り合いが違う。読み出しが少ないクラスほど保管料金は安く、読み出し料金と最小保存期間が大きくなる。どのクラスでも読み出しはミリ秒単位で始まり、テープのように数時間待つことはない。10 年保管で年 1 回以下の読み出しなら、最小保存期間 365 日も問題にならず、Archive が最も安くなる。",
    points: [
      "最小保存期間は Nearline 30 日、Coldline 90 日、Archive 365 日。",
      "クラスによって読み出しの速さは変わらない。違うのは料金の構成。",
    ],
    figure: {
      type: "table",
      caption: "ストレージ クラスと想定する読み出し頻度",
      headers: ["クラス", "想定する読み出し頻度", "最小保存期間"],
      rows: [
        ["Standard", "頻繁", "なし"],
        ["Nearline", "月 1 回程度", "30 日"],
        ["Coldline", "四半期に 1 回程度", "90 日"],
        ["Archive", "年 1 回未満", "365 日"],
      ],
    },
  },
  {
    source: at(20, "2.2"),
    field: S2,
    answer: 3,
    text: "M社は Amazon S3 にある約 150 TB のデータを Cloud Storage に移す。移行期間の 2 か月間は、S3 側に毎日追加されるオブジェクトも Cloud Storage に反映し続ける必要がある。転送用のサーバーは自分で用意・管理したくない。使う手段として最も適切なものはどれか。",
    choices: [
      {
        text: "Cloud Shell から gcloud storage cp -r で S3 のデータをまとめてコピーする。",
        note: "少量のファイルを手早く移すには便利だが、150 TB の転送や毎日の差分の反映を Cloud Shell のセッションで続けるのは現実的でない。",
      },
      {
        text: "Transfer Appliance を申し込み、データを入れた機器を Google に送る。",
        note: "ネットワークで送りにくい大量のオンプレミス データを物理的に運ぶための手段。S3 からの転送や毎日の差分の反映には向かない。",
      },
      {
        text: "BigQuery Data Transfer Service で S3 からの定期転送を設定する。",
        note: "BigQuery のテーブルにデータを読み込むためのサービスで、Cloud Storage のバケットへオブジェクトを移すものではない。",
      },
      {
        text: "Storage Transfer Service で、S3 を転送元、Cloud Storage のバケットを転送先とするジョブを作り、毎日実行するスケジュールを付ける。",
        note: "マネージドなサービスとして大量のデータを転送し、スケジュール実行で差分も反映できる。これが正解。",
      },
    ],
    explain:
      "Storage Transfer Service は、他のクラウド（Amazon S3、Azure Blob Storage など）やオンプレミス、別の Cloud Storage バケットから Cloud Storage へデータを移すマネージド サービスで、定期実行や差分の転送にも対応する。数 GB 程度を手元から上げるなら gcloud storage cp、ネットワーク帯域が足りない大量のオンプレミス データなら Transfer Appliance、というように規模と転送元で使い分ける。",
    points: [
      "クラウド間の大量転送や定期同期は Storage Transfer Service。",
      "手元からの少量のアップロードは gcloud storage cp、帯域が足りない大量データは Transfer Appliance。",
    ],
    figure: {
      type: "table",
      caption: "Cloud Storage へデータを入れる手段の使い分け",
      headers: ["手段", "向いている場面"],
      rows: [
        ["gcloud storage cp", "手元や VM からの少量〜中量のアップロード"],
        ["Storage Transfer Service", "他クラウドや別バケットからの大量転送、定期的な同期"],
        ["Transfer Appliance", "回線で送るには時間がかかりすぎる大量のオンプレミス データ"],
      ],
    },
  },
  {
    source: at(21, "2.3"),
    field: S2,
    answer: 0,
    text: "N社のオンプレミス ネットワークは 10.128.0.0/16 を使っている。Google Cloud には東京リージョンにだけサブネット 10.20.0.0/24 を持つ VPC を作り、後で Cloud VPN でオンプレミスとつなぐ予定である。VPC の作り方として最も適切なものはどれか。",
    choices: [
      {
        text: "サブネット作成モードを custom にして VPC を作り（--subnet-mode=custom）、asia-northeast1 に 10.20.0.0/24 のサブネットを追加する。",
        note: "カスタムモードではサブネットを作る場所と範囲を自分で決められ、オンプレミスとの重複を避けられる。これが正解。",
      },
      {
        text: "サブネット作成モードを auto にして VPC を作る。",
        note: "自動モードでは各リージョンに 10.128.0.0/9 の中からサブネットが作られるため、オンプレミスの 10.128.0.0/16 と重なる。",
      },
      {
        text: "プロジェクト作成時に用意される default ネットワークをそのまま使う。",
        note: "default ネットワークも自動モードと同じ範囲を使うため重複する。広めのファイアウォール ルールも最初から入っている。",
      },
      {
        text: "カスタムモードの VPC を作り、サブネットを --zone=asia-northeast1-a で作成する。",
        note: "サブネットはリージョンのリソースで、ゾーンを指定して作るものではない。",
      },
    ],
    explain:
      "VPC ネットワーク自体はグローバルなリソースで、その中のサブネットがリージョンごとに作られる。自動モードは全リージョンに決まった範囲のサブネットを自動で作るので手軽だが、範囲が固定されているため、オンプレミスや他の VPC と接続する計画があるときは重複しやすい。接続を見込むなら、カスタムモードで必要なリージョンにだけ、重ならない範囲のサブネットを作る。",
    points: [
      "VPC はグローバル、サブネットはリージョン単位。",
      "他のネットワークとつなぐ予定があるなら、範囲を自分で決められるカスタムモードを選ぶ。",
    ],
  },
  {
    source: at(22, "2.3"),
    field: S2,
    answer: [1, 2],
    text: "Web 層の VM はサービス アカウント web-sa、データベース層の VM はサービス アカウント db-sa で動いている。Web 層は自動スケーリングで台数と IP アドレスが変わる。データベース層への tcp:5432 の接続を、Web 層の VM からだけ許可する上り（INGRESS）のファイアウォール ルールを作るとき、指定する属性として適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "送信元 IP 範囲に 0.0.0.0/0 を指定する。",
        note: "すべての送信元から許可することになり、Web 層だけに絞る要件と逆。",
      },
      {
        text: "送信元サービス アカウントに web-sa を指定する。",
        note: "web-sa で動く VM からの通信だけを対象にでき、IP アドレスが変わっても追随する。これが正解。",
      },
      {
        text: "ターゲット サービス アカウントに db-sa を指定する。",
        note: "ルールを適用する先を、db-sa で動くデータベース層の VM に絞れる。これが正解。",
      },
      {
        text: "方向を下り（EGRESS）にし、ターゲットに web-sa を指定する。",
        note: "下りのルールは Web 層から出る通信の扱いで、データベース層が受け入れるかどうかは決めない。下りは暗黙のルールで既定で許可されてもいる。",
      },
    ],
    explain:
      "VPC ファイアウォール ルールは、方向（上り・下り）、アクション（許可・拒否）、送信元または宛先、ターゲット、プロトコルとポート、優先度で構成する。台数や IP が変わる層どうしの通信は、IP 範囲ではなくサービス アカウントやタグで指定すると、構成が変わっても書き換えずに済む。gcloud では --source-service-accounts と --target-service-accounts で指定する。",
    points: [
      "上りのルールは「誰から（送信元）」「どの VM へ（ターゲット）」で絞る。",
      "台数や IP が変わる層は、サービス アカウントで指定すると追随する。",
    ],
  },
  {
    source: at(23, "2.3"),
    field: S2,
    answer: 1,
    text: "ある VPC には、すべての送信元からの上りの通信を拒否するルール deny-all-ingress（優先度 500）がある。監視サーバーのために、10.30.0.0/24 からの tcp:9100 を許可するルール allow-monitoring を既定の優先度で追加したが、通信は通らないままである。直し方として最も適切なものはどれか。",
    choices: [
      {
        text: "allow-monitoring の優先度を 1500 に変更する。",
        note: "優先度は数値が小さいほど強い。1500 にすると、拒否ルールに対してさらに弱くなる。",
      },
      {
        text: "allow-monitoring の優先度を、500 より小さい値（例: 400）に変更する。",
        note: "許可ルールの方が先に評価されるようになり、監視の通信だけが通る。これが正解。",
      },
      {
        text: "allow-monitoring と同じ内容の許可ルールを、優先度 500 でもう 1 つ作る。",
        note: "同じ優先度で許可と拒否がぶつかると、拒否が優先される。通信は通らない。",
      },
      {
        text: "deny-all-ingress を削除する。",
        note: "監視の通信は通るようになるが、拒否ルールで守っていた他の通信まで開いてしまう。要件に対して過剰な変更。",
      },
    ],
    explain:
      "VPC ファイアウォール ルールの優先度は 0〜65535 の整数で、数値が小さいほど優先される。作成時に指定しなければ 1000 になる。今回は既定の 1000 の許可ルールが、優先度 500 の拒否ルールに負けている。同じ優先度で許可と拒否が重なった場合は拒否が勝つので、許可ルールを確実に効かせるには拒否ルールより小さい数値を付ける。",
    points: [
      "優先度は数値が小さいほど強い。既定値は 1000。",
      "同じ優先度なら拒否が許可より優先される。",
    ],
  },
  {
    source: at(24, "2.3"),
    field: S2,
    answer: 2,
    text: "O社は世界中の顧客に EC サイトを提供している。バックエンドは東京・アイオワ・ベルギーの 3 リージョンのマネージド インスタンス グループで、HTTPS を Google マネージド証明書で終端し、1 つのエニーキャスト IP アドレスで受けて、利用者に近い正常なバックエンドへ振り分けたい。静的コンテンツには Cloud CDN も使いたい。選ぶロードバランサとして最も適切なものはどれか。",
    choices: [
      {
        text: "リージョン外部パススルー ネットワーク ロードバランサ",
        note: "1 つのリージョン内で TCP / UDP をそのまま渡す L4 のロードバランサ。複数リージョンへの振り分けや HTTPS の終端、Cloud CDN には対応しない。",
      },
      {
        text: "内部アプリケーション ロードバランサ",
        note: "VPC の内側のクライアント向けで、インターネットの利用者からは使えない。",
      },
      {
        text: "グローバル外部アプリケーション ロードバランサ",
        note: "1 つのエニーキャスト IP で世界中から受け、近くの正常なバックエンドへ振り分ける L7 のロードバランサ。HTTPS の終端と Cloud CDN にも対応する。これが正解。",
      },
      {
        text: "各リージョンの VM の外部 IP アドレスを Cloud DNS の A レコードに並べ、ラウンドロビンで振り分ける。",
        note: "近さや正常性を見た振り分けにならず、TLS の終端や CDN の機能も無い。",
      },
    ],
    explain:
      "ロードバランサは、外部か内部か、L7（HTTP / HTTPS）か L4（TCP / UDP）か、グローバルかリージョンか、で選ぶ。世界中の利用者からの HTTPS を 1 つの IP で受け、複数リージョンのバックエンドに振り分けるならグローバル外部アプリケーション ロードバランサである。URL のパスごとの振り分けや Cloud CDN、Cloud Armor もこの種類で使える。",
    points: [
      "外部か内部か、L7 か L4 か、グローバルかリージョンか、の 3 つで絞る。",
      "世界中からの HTTPS ＋ 複数リージョン ＋ CDN なら、グローバル外部アプリケーション LB。",
    ],
    figure: {
      type: "table",
      caption: "主なロードバランサの使い分け",
      headers: ["種類", "層", "範囲", "主な用途"],
      rows: [
        ["グローバル外部アプリケーション LB", "L7", "グローバル", "世界中からの HTTP / HTTPS"],
        ["内部アプリケーション LB", "L7", "リージョン", "VPC 内の HTTP / HTTPS サービス"],
        [
          "外部パススルー ネットワーク LB",
          "L4",
          "リージョン",
          "送信元 IP を保ったままの TCP / UDP",
        ],
        ["内部パススルー ネットワーク LB", "L4", "リージョン", "VPC 内の TCP / UDP サービス"],
      ],
    },
  },
  {
    source: at(25, "2.4"),
    field: S2,
    answer: 0,
    text: "P社では、Terraform の構成をリポジトリで管理し、状態は Cloud Storage のバックエンドに置いている。CI ではリポジトリを新しくチェックアウトした環境で動かし、レビューで承認された変更内容と寸分違わぬものだけを適用したい。CI で実行する順序として最も適切なものはどれか。",
    choices: [
      {
        text: "terraform init → terraform plan -out=tfplan → （レビューと承認）→ terraform apply tfplan",
        note: "初期化してから差分を計画ファイルに保存し、承認後にその計画ファイルどおりに適用する。これが正解。",
      },
      {
        text: "terraform plan → terraform init → terraform apply",
        note: "新しくチェックアウトした環境ではプロバイダもバックエンドも未初期化なので、init より前の plan は失敗する。",
      },
      {
        text: "terraform apply -auto-approve だけを実行する。",
        note: "初期化も事前のレビューも飛ばしている。承認した内容と同じものが適用される保証も無い。",
      },
      {
        text: "terraform init → terraform apply → terraform plan",
        note: "適用した後に計画を見ても、事前のレビューにはならない。",
      },
    ],
    explain:
      "Terraform の基本の流れは、init（プロバイダやモジュールの取得、バックエンドの初期化）→ plan（現在の状態と構成を比べた変更内容の提示）→ apply（変更の実行）である。plan に -out を付けて計画ファイルを保存し、apply にそのファイルを渡すと、レビューした計画どおりに適用される。不要になったリソースをまとめて消すときは destroy を使う。",
    points: [
      "新しい作業ディレクトリでは、まず terraform init。",
      "plan -out で保存した計画を apply に渡すと、レビューした内容どおりに適用される。",
    ],
    figure: {
      type: "table",
      caption: "Terraform の主なコマンド",
      headers: ["コマンド", "役割"],
      rows: [
        ["terraform init", "プロバイダとモジュールを取得し、バックエンドを初期化する"],
        ["terraform fmt / validate", "書式をそろえる / 構成の文法と整合性を確かめる"],
        ["terraform plan", "実環境との差分から、行う変更を示す"],
        ["terraform apply", "計画した変更を実環境に反映する"],
        ["terraform destroy", "構成で管理しているリソースを削除する"],
      ],
    },
  },

  // ───────── セクション3 運用（問26〜問40） ─────────
  {
    source: at(26, "3.1"),
    field: S3,
    answer: [2, 3],
    text: "Q社では、組織ポリシーにより VM に外部 IP アドレスを付けられない。運用担当者には IAP で保護されたトンネル ユーザーのロールと、OS Login のロールがすでに付与されている。運用担当者が手元の端末から VM app-1（asia-northeast1-b）に SSH 接続するために必要な設定・操作として適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "app-1 にエフェメラル外部 IP アドレスを付ける。",
        note: "組織ポリシーの制約に反する。IAP を使えば外部 IP なしで接続できる。",
      },
      {
        text: "サブネットに Cloud NAT を構成する。",
        note: "Cloud NAT は VM から外へ出る通信のためのもので、外から VM への SSH 接続には使えない。",
      },
      {
        text: "IAP の転送元の範囲 35.235.240.0/20 から tcp:22 への上りの通信を許可するファイアウォール ルールを作る。",
        note: "IAP の TCP 転送は、この範囲から VM へ接続してくる。これが正解。",
      },
      {
        text: "gcloud compute ssh app-1 --zone=asia-northeast1-b --tunnel-through-iap を実行する。",
        note: "IAP 経由のトンネルで SSH 接続する。これが正解。",
      },
    ],
    explain:
      "IAP の TCP 転送を使うと、外部 IP アドレスを持たない VM にも、IAP を経由して SSH や RDP で接続できる。必要なのは、IAP の転送元 35.235.240.0/20 から対象ポートへの上りを許可するファイアウォール ルール、利用者への IAP で保護されたトンネル ユーザーのロール、そして接続時の --tunnel-through-iap である。外部 IP を付けずに済むので、攻撃を受ける面を減らせる。",
    points: [
      "IAP の TCP 転送の送信元は 35.235.240.0/20。ここからの tcp:22 を許可する。",
      "Cloud NAT は外向きの通信用で、外から VM に入る経路にはならない。",
    ],
  },
  {
    source: at(27, "3.1"),
    field: S3,
    answer: 3,
    text: "受注システムのデータ ディスク orders-data（asia-northeast1-b）について、1 日 1 回スナップショットを自動で取り、14 日を過ぎたものは自動で消したい。スクリプトや cron の保守はしたくない。手順として最も適切なものはどれか。",
    choices: [
      {
        text: "VM に cron を設定し、毎日 gcloud compute snapshots create を実行させ、古いものを消す処理も書く。",
        note: "動作はするが、スクリプトと cron を自分で保守することになる。要件に反する。",
      },
      {
        text: "マシンイメージを毎日手動で作成する。",
        note: "マシンイメージは VM の構成と全ディスクをまとめて保存するもので、手動では自動化にならない。",
      },
      {
        text: "gcloud compute disks snapshot orders-data --zone=asia-northeast1-b を実行する。",
        note: "その時点のスナップショットを 1 回作るだけで、定期実行も保持期間の管理もされない。",
      },
      {
        text: "gcloud compute resource-policies create snapshot-schedule でスケジュール（--daily-schedule、--max-retention-days=14 など）を作り、gcloud compute disks add-resource-policies で orders-data に付ける。",
        note: "スナップショット スケジュールをディスクに付けると、取得と古いものの削除を Compute Engine が自動で行う。これが正解。",
      },
    ],
    explain:
      "スナップショット スケジュールは、リソース ポリシーとして作成し、ディスクに付けて使う。作成時に取得の頻度（毎時・毎日・毎週）と開始時刻、保持日数（--max-retention-days）を指定すると、取得と期限切れの削除が自動で行われる。1 つのスケジュールを複数のディスクに付けることもできる。",
    points: [
      "定期スナップショットは「スケジュールを作る」→「ディスクに付ける」の 2 段階。",
      "保持期間を指定しておけば、古いスナップショットの削除も自動になる。",
    ],
  },
  {
    source: at(28, "3.1"),
    field: S3,
    answer: 1,
    text: "R社のセキュリティ チームは、OS を強化した VM イメージを毎月作り直して、プロジェクト sec-images で公開している。各アプリ チームの VM 作成スクリプトは、毎月書き換えなくても、その時点で最新のイメージから VM を起動するようにしたい。運用として最も適切なものはどれか。",
    choices: [
      {
        text: "毎月スナップショットを共有し、アプリ チームは最新のスナップショットからディスクを作る。",
        note: "どれが最新かをアプリ チームが毎回探して指定することになり、スクリプトの書き換えが残る。",
      },
      {
        text: "イメージを --family=hardened-base を付けて作成し、アプリ チームは --image-family=hardened-base --image-project=sec-images で VM を作る。",
        note: "イメージ ファミリーを指定すると、そのファミリーで非推奨になっていない最新のイメージが使われる。これが正解。",
      },
      {
        text: "マシンイメージを毎月作り、アプリ チームはそこから VM を作る。",
        note: "マシンイメージは特定の VM の構成ごと保存するもので、バックアップや複製には向くが、「最新を自動で選ぶ」仕組みは持たない。",
      },
      {
        text: "毎月のイメージ名（例: hardened-base-v12）をアプリ チームに通知し、--image で名前を指定してもらう。",
        note: "動作はするが、毎月スクリプトを書き換える必要があり要件に反する。",
      },
    ],
    explain:
      "カスタム イメージは、ディスクやスナップショットなどから gcloud compute images create で作成し、--family でイメージ ファミリーにまとめられる。VM 作成時にファミリーを指定すると、その時点で非推奨でない最新のイメージが選ばれる。問題のあるイメージは gcloud compute images deprecate で非推奨にすれば、ファミリーの指定先が 1 つ前に戻る。",
    points: [
      "イメージ ファミリーは「常に最新のイメージ」を指す名前として使える。",
      "別プロジェクトのイメージを使うときは --image-project を付ける。",
    ],
  },
  {
    source: at(29, "3.1"),
    field: S3,
    answer: 2,
    text: "Deployment を適用したところ、kubectl get pods で Pod web-6c9f7d8b5-x2kqp が 10 分以上 Pending のままである。スケジューラがこの Pod をノードに配置できない理由（リソース不足など）を確かめたい。最初に実行するコマンドとして最も適切なものはどれか。",
    choices: [
      {
        text: "kubectl logs web-6c9f7d8b5-x2kqp",
        note: "Pending の Pod はまだコンテナが起動していないので、見るべきアプリのログが無い。",
      },
      {
        text: "kubectl get deployment web",
        note: "希望数と利用可能な数が分かるだけで、配置できない理由は表示されない。",
      },
      {
        text: "kubectl describe pod web-6c9f7d8b5-x2kqp",
        note: "Pod の詳細と Events が表示され、Insufficient cpu のようなスケジューリング失敗の理由を確認できる。これが正解。",
      },
      {
        text: "kubectl delete pod web-6c9f7d8b5-x2kqp",
        note: "Deployment が同じ条件の Pod を作り直すだけで、原因は分からず解決もしない。",
      },
    ],
    explain:
      "kubectl get は一覧と状態の概要、kubectl describe は個々のリソースの詳細と、そのリソースに関するイベントの履歴を見るためのコマンドである。Pending の原因はスケジューラが記録するイベントに出るため、まず describe で Events を確認する。リソース不足ならリクエストを見直すか、ノードを増やす（ノードプールの自動スケーリングなど）といった対処につなげる。",
    points: [
      "一覧は get、詳細と Events は describe。",
      "起動前の Pod はアプリのログが無いので、まずイベントを見る。",
    ],
  },
  {
    source: at(30, "3.1"),
    field: S3,
    answer: 0,
    text: "asia-northeast1 のリージョン Standard クラスタ prod には、e2-standard-4 のノードプールが 1 つある。新しくメモリを大量に使うキャッシュのワークロードを載せるため、高メモリのノードを追加したい。既存のノードと、その上で動いている Pod はそのまま動かし続ける必要がある。行う操作として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud container node-pools create highmem --cluster=prod --region=asia-northeast1 --machine-type=n2-highmem-8 --num-nodes=1 で、新しいノードプールを追加する。",
        note: "既存のノードプールに触れずに、別のマシンタイプのノード群を追加できる。リージョン クラスタでは --num-nodes はゾーンごとの台数になる。これが正解。",
      },
      {
        text: "gcloud container clusters resize prod --region=asia-northeast1 --num-nodes=6 でノード数を増やす。",
        note: "既存ノードプールの台数が変わるだけで、マシンタイプは e2-standard-4 のまま。高メモリのノードにはならない。",
      },
      {
        text: "--machine-type=n2-highmem-8 を指定してクラスタを作り直し、ワークロードを移す。",
        note: "ノードプールの追加で済むのに、クラスタの再作成と移行という大きな作業になる。要件に対して過剰。",
      },
      {
        text: "kubectl scale deployment cache --replicas=3 を実行する。",
        note: "Pod の数を変えるだけで、ノードの種類は変わらない。",
      },
    ],
    explain:
      "ノードプールは、同じ構成（マシンタイプ、ディスク、ラベルなど）を持つノードのまとまりで、1 つのクラスタに複数持てる。用途の違うノードが必要になったら、クラスタを作り直さずにノードプールを追加し、nodeSelector や taint / toleration で特定の Pod をそのノードに載せる。ノードプールごとに自動スケーリングも設定できる。",
    points: [
      "種類の違うノードが要るなら、ノードプールを追加する。",
      "リージョン クラスタの --num-nodes はゾーンごとの台数。",
    ],
  },
  {
    source: at(31, "3.1"),
    field: S3,
    answer: 3,
    text: "GKE 上の Deployment web は、CPU のリクエストを設定済みである。負荷に応じて Pod の数を 2〜10 の範囲で増減させ、CPU 使用率がリクエストに対しておよそ 60% になるように保ちたい。実行するコマンドとして最も適切なものはどれか。",
    choices: [
      {
        text: "kubectl scale deploy/web --replicas=10",
        note: "Pod 数を 10 に固定するだけで、負荷に応じて増減はしない。",
      },
      {
        text: "gcloud container clusters update で、ノードプールの自動スケーリングを有効にする。",
        note: "これはノードの数を増減させるクラスタ オートスケーラの設定で、Pod の数は変わらない。",
      },
      {
        text: "垂直 Pod 自動スケーリング（VPA）を作成する。",
        note: "VPA は Pod の CPU・メモリのリクエスト値を調整するもので、Pod の数は増減させない。",
      },
      {
        text: "kubectl autoscale deploy/web --cpu-percent=60 --min=2 --max=10",
        note: "水平 Pod 自動スケーリング（HPA）を作り、CPU 使用率 60% を目標に Pod 数を 2〜10 で調整させる。これが正解。",
      },
    ],
    explain:
      "GKE の自動スケーリングには 3 つの層がある。HPA は Pod の数、VPA は Pod 1 つあたりのリクエスト値、クラスタ オートスケーラはノードの数を調整する。CPU 使用率で HPA を動かす場合、使用率は Pod のリクエストに対する割合で計算されるため、リクエストを設定しておく必要がある。HPA で Pod が増えてノードに載り切らなくなったときに、クラスタ オートスケーラがノードを足す、という組み合わせがよく使われる。",
    points: [
      "Pod の数は HPA、Pod の大きさは VPA、ノードの数はクラスタ オートスケーラ。",
      "CPU 使用率で HPA を使うには、Pod にリクエストを設定しておく。",
    ],
    figure: {
      type: "table",
      caption: "GKE の自動スケーリングの層",
      headers: ["仕組み", "増減させるもの", "設定の例"],
      rows: [
        ["水平 Pod 自動スケーリング（HPA）", "Pod の数", "kubectl autoscale"],
        [
          "垂直 Pod 自動スケーリング（VPA）",
          "Pod のリクエスト値",
          "VerticalPodAutoscaler リソース",
        ],
        ["クラスタ オートスケーラ", "ノードの数", "ノードプールの --enable-autoscaling"],
      ],
    },
  },
  {
    source: at(32, "3.1"),
    field: S3,
    answer: [0, 2],
    text: "Cloud Run サービス checkout（asia-northeast1）では、リビジョン checkout-00007-abc が全トラフィックを受けている。新しいイメージ v2 を、まずはトラフィックを流さずにデプロイし、新リビジョン checkout-00008-def が作られたら、その 10% だけを流してカナリア リリースしたい。実行するコマンドとして適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "gcloud run deploy checkout --image=asia-northeast1-docker.pkg.dev/shop-prod/apps/checkout:v2 --region=asia-northeast1 --no-traffic",
        note: "新しいリビジョンを作るが、トラフィックは既存のリビジョンに流したままにする。これが正解。",
      },
      {
        text: "gcloud run deploy checkout --image=asia-northeast1-docker.pkg.dev/shop-prod/apps/checkout:v2 --region=asia-northeast1",
        note: "サービスが最新リビジョンへ流す設定のままなら、デプロイした直後に全トラフィックが新リビジョンへ移る。カナリアにならない。",
      },
      {
        text: "gcloud run services update-traffic checkout --region=asia-northeast1 --to-revisions=checkout-00007-abc=90,checkout-00008-def=10",
        note: "リビジョンごとの割合を指定してトラフィックを分割する。これが正解。",
      },
      {
        text: "gcloud run services update-traffic checkout --region=asia-northeast1 --to-latest",
        note: "最新リビジョンに全トラフィックを流す指定で、10% だけの段階的な切り替えにならない。",
      },
    ],
    explain:
      "Cloud Run はデプロイのたびに変更不可のリビジョンを作り、サービスはどのリビジョンにどれだけのトラフィックを流すかを持つ。--no-traffic を付けてデプロイすれば新リビジョンを待機させておけ、update-traffic の --to-revisions で割合を指定して段階的に移せる。問題があれば元のリビジョンに 100% を戻すだけで切り戻せる。--tag を付けると、特定のリビジョンだけに届く URL も作れる。",
    points: [
      "トラフィックを流さずにデプロイするのは --no-traffic。",
      "割合の指定は update-traffic の --to-revisions、全量を最新へ移すのは --to-latest。",
    ],
  },
  {
    source: at(33, "3.2"),
    field: S3,
    answer: 1,
    text: "アプリのログを保存しているバケット gs://app-logs について、作成から 30 日を過ぎたオブジェクトは Nearline に移し、365 日を過ぎたものは削除したい。人手の作業は増やしたくない。設定として最も適切なものはどれか。",
    choices: [
      {
        text: "バケットに 365 日の保持ポリシーを設定する。",
        note: "保持ポリシーは期間内の削除や上書きを禁止するもので、期間が過ぎても自動では消さない。クラスの変更もしない。",
      },
      {
        text: "経過日数 30 日で SetStorageClass（NEARLINE）、365 日で Delete を行うライフサイクル ルールを JSON に書き、gcloud storage buckets update gs://app-logs --lifecycle-file=rules.json で設定する。",
        note: "条件（経過日数など）とアクション（クラスの変更・削除）の組でオブジェクトを自動で管理できる。これが正解。",
      },
      {
        text: "バケットでオブジェクトのバージョニングを有効にする。",
        note: "上書きや削除の前の版を残す機能で、クラスの移動や期限での削除とは目的が違う。",
      },
      {
        text: "バケットで Autoclass を有効にする。",
        note: "アクセスの状況に応じてクラスを自動で移す機能で、「30 日で Nearline」のような日数指定にはならず、削除も行わない。",
      },
    ],
    explain:
      "オブジェクトのライフサイクル管理では、条件（作成からの経過日数、ストレージ クラス、新しい版の数など）とアクション（SetStorageClass、Delete など）を組にしたルールをバケットに設定する。設定は JSON ファイルに書いて gcloud storage buckets update の --lifecycle-file で適用できる。保持ポリシーやバージョニングは「消さない」ための機能で、ライフサイクルとは向きが逆である。",
    points: [
      "日数に応じたクラスの移動と削除はライフサイクル ルール。",
      "保持ポリシー・バージョニングはデータを守るための機能で、自動削除はしない。",
    ],
  },
  {
    source: at(34, "3.2"),
    field: S3,
    answer: 2,
    text: "Cloud SQL for MySQL の orders-db では、毎日 2:00 に自動バックアップを取っている。14:05 にオペレータが誤った DELETE 文を実行し、大量の行が消えた。14:04 時点のデータを取り戻したい。あらかじめ有効にしておく必要があった機能と、その使い方として最も適切なものはどれか。",
    choices: [
      {
        text: "自動バックアップだけで足り、2:00 のバックアップから元のインスタンスを復元すればよい。",
        note: "2:00 の時点に戻るため、それ以降 14:04 までの約 12 時間分の変更を失う。",
      },
      {
        text: "リードレプリカを作っておき、レプリカを昇格させて使う。",
        note: "レプリカには誤った DELETE も複製されるため、消える前のデータは残っていない。",
      },
      {
        text: "ポイントインタイム リカバリを有効にしておき、gcloud sql instances clone で 14:04 時点を指定（--point-in-time）して新しいインスタンスに復元する。",
        note: "バックアップとログを使って、指定した時刻の状態を別のインスタンスとして作り出せる。これが正解。",
      },
      {
        text: "毎晩 SQL ダンプを Cloud Storage にエクスポートしておき、それを読み込む。",
        note: "エクスポートした時点のデータにしか戻れず、日中の変更は失われる。",
      },
    ],
    explain:
      "Cloud SQL の自動バックアップは、取得した時点の状態に戻すためのものである。任意の時刻に戻したいときは、ポイントインタイム リカバリ（PITR）を有効にしておき、変更のログと組み合わせて指定時刻の状態を復元する。PITR による復元は、元のインスタンスを上書きせず、クローンとして新しいインスタンスを作る形で行う。事故が起きてからでは有効にしても間に合わないので、本番環境では最初から有効にしておく。",
    points: [
      "バックアップは取得時点に、PITR は任意の時刻に戻せる。",
      "レプリカは誤操作も複製するので、誤操作からの復旧手段にはならない。",
    ],
    figure: {
      type: "table",
      caption: "Cloud SQL でデータを戻す手段の比較",
      headers: ["手段", "戻れる時点", "誤操作からの復旧"],
      rows: [
        ["自動バックアップ", "バックアップを取った時点", "取得後の変更は失う"],
        ["ポイントインタイム リカバリ", "保持期間内の任意の時刻", "直前の時点まで戻せる"],
        ["リードレプリカ", "常に最新（誤操作も含む）", "使えない"],
      ],
    },
  },
  {
    source: at(35, "3.2"),
    field: S3,
    answer: 0,
    text: "BigQuery をオンデマンド料金で使っている分析担当者が、数 TB ある売上テーブルに対する重い集計クエリを書いた。実行する前に、このクエリが読み取るデータ量を知って費用の見当をつけたい。方法として最も適切なものはどれか。",
    choices: [
      {
        text: "bq query --use_legacy_sql=false --dry_run でクエリを送り、処理されるバイト数の見積もりを確認する。",
        note: "ドライランはクエリを実行せずに読み取り量を見積もり、料金もかからない。これが正解。",
      },
      {
        text: "クエリの末尾に LIMIT 10 を付けて実行する。",
        note: "通常のテーブルでは、LIMIT を付けても読み取る列のデータ全体がスキャンされ、課金対象の量は減らない。",
      },
      {
        text: "bq show --schema で、テーブルのスキーマを確認する。",
        note: "列の名前と型が分かるだけで、このクエリが読む量は分からない。",
      },
      {
        text: "一度実行してから、INFORMATION_SCHEMA のジョブ情報で処理バイト数を確かめる。",
        note: "量は分かるが、実行した時点で料金は発生している。事前の見積もりにならない。",
      },
    ],
    explain:
      "BigQuery のオンデマンド料金は、クエリが読み取ったデータ量で決まる。ドライラン（bq の --dry_run、コンソールではクエリ エディタに出る処理量の表示）を使えば、実行せずに読み取り量を確認でき、ドライランそのものには料金がかからない。読む列を必要なものに絞る、パーティションで期間を絞る、といった工夫で読み取り量は減らせるが、LIMIT だけでは通常減らない。",
    points: [
      "実行前の読み取り量の確認はドライラン（--dry_run）。料金はかからない。",
      "SELECT * を避け、パーティションやクラスタリングで読む範囲を絞ると費用が下がる。",
    ],
  },
  {
    source: at(36, "3.3"),
    field: S3,
    answer: 3,
    text: "asia-northeast1 のサブネット app-subnet（10.40.0.0/24）の IP アドレスが残りわずかになった。マネージド インスタンス グループの台数は今後も増える見込みで、動いている VM は止められない。10.40.0.0/22 の範囲は VPC 内でもオンプレミスでも使われていない。取るべき対応として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud compute networks subnets expand-ip-range app-subnet --region=asia-northeast1 --prefix-length=26 を実行する。",
        note: "/26 は /24 より狭い範囲で、サブネットの範囲を縮めることはできない。",
      },
      {
        text: "app-subnet を削除し、10.40.0.0/22 で作り直す。",
        note: "サブネットを削除するには、そこで動いている VM をすべて先に消す必要がある。止められない要件に反する。",
      },
      {
        text: "app-subnet にセカンダリ IP 範囲を追加する。",
        note: "セカンダリ範囲はエイリアス IP（GKE の Pod など）に使う範囲で、VM のプライマリ内部 IP の不足は解消しない。",
      },
      {
        text: "gcloud compute networks subnets expand-ip-range app-subnet --region=asia-northeast1 --prefix-length=22 を実行する。",
        note: "動いている VM を止めずに、サブネットのプライマリ範囲を /22 に広げられる。これが正解。",
      },
    ],
    explain:
      "サブネットのプライマリ IPv4 範囲は、expand-ip-range で後から広げられる。既存の VM には影響しないが、広げる範囲が VPC 内の他のサブネットや、ピアリング先・オンプレミスなどの接続先と重ならないことが条件になる。広げた範囲を元に戻す（狭める）ことはできないので、拡張幅は計画して決める。",
    points: [
      "サブネットの範囲は広げられるが、狭めることはできない。",
      "広げる先の範囲が他のネットワークと重ならないかを先に確かめる。",
    ],
  },
  {
    source: at(37, "3.3"),
    field: S3,
    answer: 1,
    text: "S社は 1 台の VM で Web サーバーを動かしており、エフェメラル外部 IP アドレス 203.0.113.25 を Cloud DNS の A レコード（www）に登録している。先日メンテナンスで VM を停止・起動したところ外部 IP が変わり、サイトに届かなくなった。DNS の設定を直した後、二度と同じことが起きないよう、いまの外部 IP アドレスをこの VM に固定したい。操作として最も適切なものはどれか。",
    choices: [
      {
        text: "Cloud DNS の A レコードの TTL を短くする。",
        note: "変わった後の反映が早くなるだけで、IP アドレスが変わること自体は防げない。",
      },
      {
        text: "gcloud compute addresses create web-ip --addresses=203.0.113.25 --region=asia-northeast1 を実行して、使用中のエフェメラル IP アドレスを静的外部 IP アドレスに昇格させる。",
        note: "いま VM に付いている IP をそのまま予約済みの静的アドレスにでき、停止・起動しても変わらなくなる。これが正解。",
      },
      {
        text: "グローバルの静的外部 IP アドレスを予約し、VM のネットワーク インターフェースに付ける。",
        note: "グローバルの外部 IP はグローバル ロードバランサ用で、VM に直接付けることはできない。VM にはリージョンのアドレスを使う。",
      },
      {
        text: "VM のネットワーク サービス ティアを Standard に変える。",
        note: "ティアは通信経路と料金の違いで、IP アドレスが固定されるかどうかには関係しない。",
      },
    ],
    explain:
      "エフェメラル外部 IP アドレスは、VM を停止すると解放され、起動時に別のアドレスが割り当てられることがある。変わっては困るなら静的外部 IP アドレスを予約して使う。いま使っているエフェメラル アドレスは、VM が動いている間に --addresses でその値を指定して予約すれば、同じ値のまま静的アドレスに昇格できる。VM に付けられるのはリージョンのアドレスで、グローバルのアドレスはグローバル ロードバランサのフロントエンド用である。",
    points: [
      "エフェメラル IP は停止で解放されうる。固定したいなら静的 IP を予約する。",
      "使用中のエフェメラル IP は、同じ値のまま静的 IP に昇格できる。",
    ],
  },
  {
    source: at(38, "3.3"),
    field: S3,
    answer: 2,
    text: "T社のセキュリティ方針では、VM に外部 IP アドレスを持たせない。プライベート サブネットの VM から、インターネット上の OS パッケージ リポジトリへ更新を取りに行く必要がある。インターネット側から VM へ接続を開始させてはならない。構成として最も適切なものはどれか。",
    choices: [
      {
        text: "サブネットで限定公開の Google アクセスを有効にする。",
        note: "外部 IP の無い VM から Google の API やサービスに届くようにするもので、一般のインターネット上のリポジトリには届かない。",
      },
      {
        text: "IAP の TCP 転送を有効にする。",
        note: "管理者が外から VM に SSH などで入るための経路で、VM から外へ出る通信には使わない。",
      },
      {
        text: "そのリージョンに Cloud Router を作り、Cloud NAT ゲートウェイを構成する。",
        note: "外部 IP の無い VM が外向きに接続でき、外から VM への新しい接続は受け付けない。これが正解。",
      },
      {
        text: "全 VM にエフェメラル外部 IP アドレスを付け、上りの通信をすべて拒否するファイアウォール ルールを作る。",
        note: "外部 IP を持たせない方針そのものに反する。",
      },
    ],
    explain:
      "Cloud NAT は、外部 IP アドレスを持たない VM（や GKE ノード）がインターネットへ外向きに接続できるようにするマネージドな NAT で、Cloud Router を使ってリージョン単位で構成する。外から開始される接続は通さない。Google API だけに届けばよいなら限定公開の Google アクセス、管理者の入口が欲しいなら IAP、と目的で使い分ける。",
    points: [
      "外部 IP なしで外へ出るのは Cloud NAT。外から入る経路にはならない。",
      "Google API だけなら限定公開の Google アクセスで足りる。",
    ],
    figure: {
      type: "table",
      caption: "外部 IP の無い VM に関わる 3 つの仕組み",
      headers: ["仕組み", "通信の向き", "届く先"],
      rows: [
        ["Cloud NAT", "VM から外へ", "インターネット全般"],
        ["限定公開の Google アクセス", "VM から外へ", "Google の API とサービス"],
        ["IAP の TCP 転送", "外（管理者）から VM へ", "VM の SSH / RDP などのポート"],
      ],
    },
  },
  {
    source: at(39, "3.4"),
    field: S3,
    answer: 0,
    text: "障害調査のため、ログ エクスプローラで、インスタンス ID が 4615287790123456789 の Compute Engine VM が出したログのうち、重大度が ERROR 以上のもの（CRITICAL なども含む）だけを表示したい。入力するクエリとして最も適切なものはどれか。",
    choices: [
      {
        text: 'resource.type="gce_instance" AND resource.labels.instance_id="4615287790123456789" AND severity>=ERROR',
        note: "リソースの種類、インスタンス ID、重大度の下限を正しく指定している。これが正解。",
      },
      {
        text: 'resource.type="gce_instance" AND resource.labels.instance_id="4615287790123456789" AND severity=ERROR',
        note: "ERROR ちょうどのものしか出ず、CRITICAL・ALERT・EMERGENCY が漏れる。",
      },
      {
        text: 'resource.type="vm_instance" AND resource.labels.instance_id="4615287790123456789" AND severity>=ERROR',
        note: "Compute Engine の VM のリソースの種類は gce_instance で、この値では何も一致しない。",
      },
      {
        text: "SELECT * FROM logs WHERE instance_id = '4615287790123456789' AND severity >= 'ERROR'",
        note: "SQL で問い合わせるのはログ分析（Log Analytics）の書き方で、ログ エクスプローラのクエリ言語ではない。",
      },
    ],
    explain:
      "ログ エクスプローラでは、Logging のクエリ言語で resource.type、resource.labels、severity、logName、jsonPayload のフィールドなどを AND / OR でつないで絞り込む。重大度は DEBUG < INFO < NOTICE < WARNING < ERROR < CRITICAL < ALERT < EMERGENCY の順に並んでいて、比較演算子で範囲を指定できる。SQL で集計したいときは、ログバケットをアップグレードしてログ分析を使う。",
    points: [
      "Compute Engine の VM のリソースの種類は gce_instance。",
      "「以上」を取りたいときは severity>=ERROR のように比較演算子を使う。",
    ],
  },
  {
    source: at(40, "3.4"),
    field: S3,
    answer: 3,
    text: "U社は Compute Engine の VM について、メモリ使用率とディスクの使用率でアラートを出し、あわせて nginx のアクセスログを Cloud Logging に集めたい。いまは VM に何もインストールしておらず、Cloud Monitoring には CPU 使用率などは表示されている。行う対応として最も適切なものはどれか。",
    choices: [
      {
        text: "何もしなくてよい。メモリ使用率とディスク使用率も、エージェントなしで既定で収集されている。",
        note: "エージェントなしで集まるのはハイパーバイザ側から見える指標で、OS の中のメモリやディスクの使用率は含まれない。",
      },
      {
        text: "従来の Monitoring エージェントと Logging エージェントを、それぞれ VM にインストールする。",
        note: "従来の 2 つのエージェントは Ops エージェントに置き換えられた旧方式で、新しく入れる選択肢ではない。",
      },
      {
        text: "サブネットで VPC フローログを有効にする。",
        note: "フローログは VM が送受信したネットワーク フローの記録で、メモリ使用率や nginx のログは取れない。",
      },
      {
        text: "VM に Ops エージェントをインストールし、nginx のログと指標を集めるよう設定する。",
        note: "Ops エージェントは OS 内の指標とログをまとめて収集し、nginx などの主要なアプリにも対応する。これが正解。",
      },
    ],
    explain:
      "Compute Engine の VM では、CPU 使用率やディスクの I/O、ネットワークのバイト数などは、エージェントなしでも Cloud Monitoring に入る。一方、OS の中でしか分からないメモリ使用率やファイルシステムの使用率、アプリのログを集めるには、VM に Ops エージェントを入れる。Ops エージェントは指標とログの収集を 1 つにまとめたもので、nginx・Apache・MySQL などの設定済みの収集にも対応している。",
    points: [
      "メモリ使用率やアプリのログは、Ops エージェントを入れて初めて集まる。",
      "VPC フローログはネットワークの記録で、VM の中の状態は分からない。",
    ],
  },

  // ───────── セクション4 アクセスとセキュリティ（問41〜問50） ─────────
  {
    source: at(41, "4.1"),
    field: S4,
    answer: 1,
    text: "外部の監査担当者に、本番プロジェクトの Compute Engine の VM の構成（マシンタイプ、ディスク、ネットワーク設定など）を確認してもらう。監査担当者には VM を変更させず、BigQuery など他のサービスの内容も見せたくない。付与するロールとして最も適切なものはどれか。",
    choices: [
      {
        text: "基本ロールの閲覧者（roles/viewer）",
        note: "プロジェクト内のほぼすべてのサービスを読み取れるため、Compute Engine 以外も見えてしまう。要件より広い。",
      },
      {
        text: "事前定義ロールの Compute 閲覧者（roles/compute.viewer）",
        note: "Compute Engine のリソースの読み取りに限られ、変更も他サービスの閲覧もできない。これが正解。",
      },
      {
        text: "事前定義ロールの Compute インスタンス管理者（roles/compute.instanceAdmin.v1）",
        note: "VM の作成・変更・削除までできる。変更させない要件に反する。",
      },
      {
        text: "基本ロールのオーナー（roles/owner）",
        note: "プロジェクトのすべてを操作でき、IAM の変更までできる。最も過剰。",
      },
    ],
    explain:
      "IAM のロールには、基本ロール（オーナー・編集者・閲覧者）、事前定義ロール、カスタムロールがある。基本ロールはプロジェクト全体の幅広いサービスに効くため、最小権限の原則に照らすと本番ではなるべく避け、サービスごとに用意された事前定義ロールを使う。事前定義ロールで過不足があるときに、必要な権限だけを集めたカスタムロールを作る。",
    points: [
      "基本ロールは範囲が広すぎるので、本番では事前定義ロールを優先する。",
      "事前定義ロールで合わないときにカスタムロールを作る。",
    ],
    figure: {
      type: "table",
      caption: "IAM のロールの種類",
      headers: ["種類", "例", "特徴"],
      rows: [
        ["基本ロール", "roles/owner、roles/editor、roles/viewer", "プロジェクト全体に広く効く"],
        ["事前定義ロール", "roles/compute.viewer", "サービスごとに Google が定義・更新する"],
        ["カスタムロール", "組織やプロジェクトで定義", "必要な権限だけを選んで作る"],
      ],
    },
  },
  {
    source: at(42, "4.1"),
    field: S4,
    answer: 2,
    text: "V社のセキュリティ チームは、「ログの閲覧と VM の一覧表示だけができる」ロールを、必要な権限を選んで自分たちで定義したい。このロールは、複数のフォルダにまたがる 40 のプロジェクトで使う予定で、定義は 1 か所で管理したい。作り方として最も適切なものはどれか。",
    choices: [
      {
        text: "フォルダごとに gcloud iam roles create を --folder を付けて実行し、フォルダ単位でカスタムロールを作る。",
        note: "カスタムロールを定義できるのは組織かプロジェクトで、フォルダには作れない。",
      },
      {
        text: "40 のプロジェクトそれぞれで gcloud iam roles create を --project を付けて実行する。",
        note: "使えるようにはなるが、40 個の定義を別々に保守することになり、1 か所で管理する要件に反する。",
      },
      {
        text: "gcloud iam roles create opsReader --organization=123456789012 --file=ops-reader.yaml で、組織レベルのカスタムロールとして作る。",
        note: "組織で定義したカスタムロールは、その組織内のどのプロジェクトでも付与に使える。これが正解。",
      },
      {
        text: "事前定義ロールの roles/logging.viewer を編集し、VM の一覧表示の権限を加える。",
        note: "事前定義ロールは Google が管理していて、利用者は中身を編集できない。",
      },
    ],
    explain:
      "カスタムロールは、組織レベルかプロジェクト レベルで定義する。組織レベルで作ったロールは組織内のすべてのプロジェクトやフォルダで付与に使え、プロジェクト レベルで作ったロールはそのプロジェクトの中でしか使えない。権限の一覧は YAML などのファイルに書いて --file で渡せる。なお、権限によってはカスタムロールに入れられないものもある。",
    points: [
      "カスタムロールを定義できるのは組織かプロジェクト。フォルダには作れない。",
      "複数プロジェクトで共通に使うなら、組織レベルで 1 つ定義する。",
    ],
  },
  {
    source: at(43, "4.1"),
    field: S4,
    answer: [1, 3],
    text: "W社では、フォルダ prod に対して運用グループ ops@example.com へ Compute 管理者（roles/compute.admin）を付与している。prod の配下にあるプロジェクト prod-payments の IAM ポリシーには、ops@example.com へのロールの付与は書かれていない。この状況についての説明として正しいものはどれか。2つ選べ。",
    choices: [
      {
        text: "prod-payments の許可ポリシーにも同じロールを書かない限り、ops@example.com は prod-payments の VM を管理できない。",
        note: "フォルダで付与したロールは配下に継承されるので、プロジェクト側に書かなくても効いている。",
      },
      {
        text: "フォルダ prod で付与したロールは、prod-payments を含む配下のすべてのプロジェクトとリソースに継承される。",
        note: "IAM の許可ポリシーはリソース階層に沿って上から下へ継承される。これが正解。",
      },
      {
        text: "prod-payments で ops@example.com に Compute 閲覧者だけを付与すれば、フォルダの Compute 管理者は上書きされ、閲覧しかできなくなる。",
        note: "許可ポリシーは足し算で、下位でより狭いロールを付けても上位から継承した権限は消えない。",
      },
      {
        text: "あるリソースで有効な権限は、そのリソース自身の付与と上位から継承した付与の和集合であり、プロジェクトの許可ポリシーで継承分を取り消すことはできない。",
        note: "継承された付与は下位の許可ポリシーでは打ち消せない。止めたいなら上位の付与を見直すか、IAM の拒否ポリシーを使う。これが正解。",
      },
    ],
    explain:
      "IAM の許可ポリシーは、組織・フォルダ・プロジェクト・リソースの各階層に付けられ、あるリソースで有効なポリシーは、そのリソースと上位すべての付与を合わせたもの（和集合）になる。下位で付与を書かなくても上位の付与は効き、下位でより弱いロールを付けても上位の強いロールは打ち消されない。特定の権限を確実に使わせたくない場合は、上位での付与範囲を見直すか、拒否ポリシーで明示的に拒否する。",
    points: [
      "有効なポリシー ＝ 自分の付与 ＋ 上位から継承した付与。",
      "許可は足し算なので、下位の許可ポリシーで上位の付与は消せない。",
    ],
  },
  {
    source: at(44, "4.1"),
    field: S4,
    answer: 0,
    text: "プロジェクト mkt-analytics で、Google グループ data-analysts@example.com に BigQuery データ閲覧者のロールを付与したい。プロジェクトに既にある他のロールの付与には影響を与えたくない。実行するコマンドとして最も適切なものはどれか。",
    choices: [
      {
        text: 'gcloud projects add-iam-policy-binding mkt-analytics --member="group:data-analysts@example.com" --role="roles/bigquery.dataViewer"',
        note: "既存のポリシーに 1 つの付与を追加するだけで、他の付与はそのまま残る。グループには group: を付ける。これが正解。",
      },
      {
        text: 'gcloud projects add-iam-policy-binding mkt-analytics --member="user:data-analysts@example.com" --role="roles/bigquery.dataViewer"',
        note: "user: は個人の Google アカウントを表す。グループを指定するなら group: を使う。",
      },
      {
        text: "この付与 1 件だけを書いた policy.json を用意し、gcloud projects set-iam-policy mkt-analytics policy.json を実行する。",
        note: "set-iam-policy はポリシー全体を置き換えるため、ファイルに書かれていない既存の付与が消えてしまう。",
      },
      {
        text: "gcloud iam roles create で bigquery.dataViewer という名前のカスタムロールを作る。",
        note: "ロールを定義するコマンドで、誰かに付与する操作ではない。事前定義ロールがあるのでカスタムロールも不要。",
      },
    ],
    explain:
      "IAM の付与は、プリンシパル（user:、group:、serviceAccount:、domain: などの接頭辞付き）とロールの組で表す。add-iam-policy-binding は既存のポリシーに付与を 1 つ足し、remove-iam-policy-binding は 1 つ外す。set-iam-policy はポリシー全体を渡したファイルの内容で置き換えるので、使う前に get-iam-policy で現在のポリシーを取得し、それを編集して戻すのが安全である。",
    points: [
      "1 件だけ足すなら add-iam-policy-binding。set-iam-policy は全体の置き換え。",
      "メンバーの接頭辞（user: / group: / serviceAccount:）を正しく付ける。",
    ],
  },
  {
    source: at(45, "4.2"),
    field: S4,
    answer: 3,
    text: "夜間バッチの VM は、Cloud Storage のバケット gs://raw-orders からオブジェクトを読むだけである。いまは Compute Engine のデフォルトのサービス アカウントで動いていて、このプロジェクトではそのアカウントに編集者ロールが付いている。最小権限の考え方に沿った構成として最も適切なものはどれか。",
    choices: [
      {
        text: "デフォルトのサービス アカウントのまま、VM のアクセス スコープを Cloud Storage の読み取り専用に絞る。",
        note: "スコープは旧来の補助的な仕組みで、アカウント自体には編集者ロールが残る。同じアカウントを使う他の VM にも影響し、根本的な絞り込みにならない。",
      },
      {
        text: "専用のサービス アカウントを作ってキーを発行し、キー ファイルを VM のディスクに置いて使わせる。",
        note: "VM にはサービス アカウントを直接割り当てられるので、長期間有効なキーを置く必要は無い。漏えいの危険を増やすだけ。",
      },
      {
        text: "デフォルトのサービス アカウントに、プロジェクトの Storage 管理者（roles/storage.admin）を追加で付与する。",
        note: "権限をさらに広げることになり、最小権限と逆。",
      },
      {
        text: "gcloud iam service-accounts create で専用のサービス アカウントを作り、gs://raw-orders に対する Storage オブジェクト閲覧者だけを付与して、VM の作成時に --service-account でそのアカウントを割り当てる。",
        note: "VM が使う ID を専用にし、必要なバケットの読み取りだけに絞れる。これが正解。",
      },
    ],
    explain:
      "VM などのリソースには、ワークロードごとに専用のユーザー管理サービス アカウントを作って割り当て、必要なロールだけを、できれば対象のリソース（この場合はバケット）に絞って付与するのが基本である。VM に割り当てたサービス アカウントの認証情報はメタデータ サーバーから自動で取得されるので、キー ファイルは不要になる。アクセス スコープは旧来の仕組みで、現在は cloud-platform を指定して IAM ロールで制御するのが推奨される。",
    points: [
      "ワークロードごとに専用のサービス アカウントを作り、必要なロールだけを付ける。",
      "VM に割り当てればキーは不要。権限の制御はスコープではなく IAM で行う。",
    ],
  },
  {
    source: at(46, "4.2"),
    field: S4,
    answer: [0, 1],
    text: "プラットフォーム エンジニアのXさんは、本番環境の Terraform をサービス アカウント tf-deployer@infra-prod.iam.gserviceaccount.com の権限で実行したい。セキュリティ方針により、サービス アカウントのキーはダウンロードできない。Xさんは自分のユーザー アカウントで gcloud CLI にログインしている。必要な設定・操作として適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "Xさんに、tf-deployer に対するサービス アカウント トークン作成者（roles/iam.serviceAccountTokenCreator）を付与する。",
        note: "サービス アカウントとしての短期のアクセス トークンを発行できるようになる。権限借用に必要なロール。これが正解。",
      },
      {
        text: "gcloud や Terraform を、--impersonate-service-account=tf-deployer@infra-prod.iam.gserviceaccount.com（または同じ意味の設定）を指定して実行する。",
        note: "自分の認証情報で tf-deployer の短期トークンを取得し、その権限で処理を行う。これが正解。",
      },
      {
        text: "Xさんに、tf-deployer に対するサービス アカウント ユーザー（roles/iam.serviceAccountUser）だけを付与する。",
        note: "VM などにサービス アカウントを割り当てる（actAs）ためのロールで、アクセス トークンを発行する権限は含まない。",
      },
      {
        text: "gcloud iam service-accounts keys create でキーを作り、gcloud auth activate-service-account --key-file で切り替える。",
        note: "キーのダウンロードを禁じる方針に反する。長期間有効なキーの管理も必要になる。",
      },
    ],
    explain:
      "サービス アカウントの権限借用（impersonation）では、利用者は自分の認証情報のまま、サービス アカウントの短期のアクセス トークンを発行してもらい、その権限で操作する。そのためには、対象のサービス アカウントに対するトークン作成者のロールが要る。gcloud では --impersonate-service-account フラグか gcloud config set auth/impersonate_service_account、Terraform の Google プロバイダでは impersonate_service_account の設定で使える。キーを配る必要がなく、誰が借用したかも監査ログに残る。",
    points: [
      "権限借用にはトークン作成者、リソースへの割り当て（actAs）にはサービス アカウント ユーザー。",
      "借用で得るトークンは短期間で失効するので、キーより安全に扱える。",
    ],
  },
  {
    source: at(47, "4.2"),
    field: S4,
    answer: 1,
    text: "開発者のYさんは、プロジェクトで Compute インスタンス管理者（roles/compute.instanceAdmin.v1）を持っている。VM を --service-account=app-runner@shop-prod.iam.gserviceaccount.com 付きで作成しようとしたところ、iam.serviceAccounts.actAs の権限が無いというエラーで失敗した。最小権限で解決する付与として最も適切なものはどれか。",
    choices: [
      {
        text: "Yさんに、app-runner に対するサービス アカウント トークン作成者（roles/iam.serviceAccountTokenCreator）を付与する。",
        note: "トークンを発行して権限借用するためのロールで、VM への割り当てに必要な actAs の権限は含まない。",
      },
      {
        text: "Yさんに、app-runner に対するサービス アカウント ユーザー（roles/iam.serviceAccountUser）を付与する。",
        note: "そのサービス アカウントを VM などに割り当てる actAs の権限を、このアカウントに限って与えられる。これが正解。",
      },
      {
        text: "Yさんに、プロジェクトのサービス アカウント管理者（roles/iam.serviceAccountAdmin）を付与する。",
        note: "サービス アカウントの作成・削除・設定変更のためのロールで、要件より広く、しかも actAs の権限は含まない。",
      },
      {
        text: "Yさんに、プロジェクトのオーナー（roles/owner）を付与する。",
        note: "解決はするが、プロジェクトのすべてを操作できるようになり、最小権限に反する。",
      },
    ],
    explain:
      "リソースにサービス アカウントを割り当てると、そのリソース上の処理はサービス アカウントの権限で動く。そのため、割り当てる人には「そのサービス アカウントとして振る舞ってよい」という actAs の権限が求められ、これはサービス アカウント ユーザーのロールに含まれる。プロジェクト全体ではなく、対象のサービス アカウントに対して付与すれば、使えるアカウントを限定できる。",
    points: [
      "VM などへの割り当てに必要なのは actAs ＝ サービス アカウント ユーザー。",
      "付与先をプロジェクトではなく特定のサービス アカウントにすると、範囲を絞れる。",
    ],
  },
  {
    source: at(48, "4.2"),
    field: S4,
    answer: 2,
    text: "Z社では、GitHub Actions のワークフローから Cloud Run へデプロイしている。いまはデプロイ用サービス アカウントの JSON キーを GitHub のシークレットに保存しているが、セキュリティ チームから長期間有効なキーを廃止するよう求められた。代わりの構成として最も適切なものはどれか。",
    choices: [
      {
        text: "JSON キーを毎月作り直し、古いキーを無効にする運用にする。",
        note: "漏えい時の影響期間は短くなるが、長期間有効なキーを外部に置く構造は変わらない。",
      },
      {
        text: "API キーを発行し、ワークフローから使わせる。",
        note: "API キーは一部の API の呼び出し元を識別するもので、サービス アカウントの権限で Cloud Run にデプロイする認証には使えない。",
      },
      {
        text: "Workload Identity 連携でワークロード ID プールと GitHub の OIDC プロバイダを作り、対象リポジトリのワークフローにデプロイ用サービス アカウントの権限借用を許可する。",
        note: "GitHub が発行する ID トークンを短期の Google Cloud の認証情報に交換するので、キーを保存しなくてよくなる。これが正解。",
      },
      {
        text: "Workforce Identity 連携で GitHub を ID プロバイダとして登録する。",
        note: "Workforce Identity 連携は、外部の ID プロバイダにいる「人」（従業員など）を対象にした仕組みで、CI のようなワークロード向けではない。",
      },
    ],
    explain:
      "Google Cloud の外で動くワークロード（他のクラウド、オンプレミス、GitHub Actions などの CI）が Google Cloud の API を呼ぶときは、Workload Identity 連携を使うと、外部の ID プロバイダが発行したトークンを短期の認証情報に交換でき、サービス アカウント キーが不要になる。プールとプロバイダを作り、属性の条件で受け入れる相手（特定のリポジトリなど）を絞ったうえで、サービス アカウントの権限借用を許可する。人を対象にした Workforce Identity 連携と混同しない。",
    points: [
      "外部のワークロードはキーではなく Workload Identity 連携で認証する。",
      "Workload は機械、Workforce は人を対象にした連携。",
    ],
  },
  {
    source: at(49, "4.2"),
    field: S4,
    answer: 0,
    text: "GKE クラスタとノードプールで Workload Identity Federation for GKE を有効にした。名前空間 shop の Kubernetes サービス アカウント cart-ksa で動く Pod に、Google サービス アカウント cart-gsa@shop-prod.iam.gserviceaccount.com として Pub/Sub へメッセージを送らせたい。cart-gsa には Pub/Sub パブリッシャーを付与済みである。cart-ksa が cart-gsa の権限を使えるようにする IAM の付与として最も適切なものはどれか。",
    choices: [
      {
        text: 'gcloud iam service-accounts add-iam-policy-binding cart-gsa@shop-prod.iam.gserviceaccount.com --role=roles/iam.workloadIdentityUser --member="serviceAccount:shop-prod.svc.id.goog[shop/cart-ksa]" を実行し、cart-ksa に iam.gke.io/gcp-service-account のアノテーションを付ける。',
        note: "Kubernetes サービス アカウントに、Google サービス アカウントとして動く許可を与える組み合わせ。これが正解。",
      },
      {
        text: "ノードのサービス アカウントに Pub/Sub パブリッシャーを付与する。",
        note: "そのノードに載るすべての Pod が同じ権限を持つことになり、Pod ごとに権限を分けられない。",
      },
      {
        text: "cart-gsa のキーを作成し、Kubernetes の Secret に入れて Pod にマウントする。",
        note: "長期間有効なキーを配ることになり、Workload Identity Federation for GKE を使う意味がなくなる。",
      },
      {
        text: 'gcloud iam service-accounts add-iam-policy-binding cart-gsa@shop-prod.iam.gserviceaccount.com --role=roles/iam.workloadIdentityUser --member="user:cart-ksa@shop-prod.iam.gserviceaccount.com" を実行する。',
        note: "Kubernetes サービス アカウントは user: のプリンシパルではない。PROJECT_ID.svc.id.goog[名前空間/名前] の形で指定する。",
      },
    ],
    explain:
      "Workload Identity Federation for GKE では、Kubernetes サービス アカウント（KSA）が IAM のプリンシパルとして扱われ、キーなしで Google Cloud の API を呼べる。Google サービス アカウント（GSA）の権限を使わせる方法では、GSA に対して KSA へ Workload Identity ユーザーのロールを付け、KSA に GSA を示すアノテーションを付ける。KSA を表すプリンシパルに直接 IAM ロールを付与する方法もある。どちらの場合も、権限は Pod が使う KSA の単位で分けられる。",
    points: [
      "KSA は PROJECT_ID.svc.id.goog[名前空間/KSA名] の形で IAM に現れる。",
      "ノードのサービス アカウントに権限を寄せると、Pod ごとの最小権限にならない。",
    ],
  },
  {
    source: at(50, "4.2"),
    field: S4,
    answer: 3,
    text: "AA社のセキュリティ チームは、組織内のすべてのプロジェクト（今後作られるものを含む）で、ユーザー管理のサービス アカウント キーの作成を禁止したい。どうしてもキーが必要な古いシステムのプロジェクト 1 つだけは例外にする。構成として最も適切なものはどれか。",
    choices: [
      {
        text: "組織全体を VPC Service Controls のサービス境界で囲む。",
        note: "サービス境界は API 経由のデータの持ち出しを防ぐもので、キーの作成そのものは禁止しない。",
      },
      {
        text: "サービス アカウント キーの作成を監査ログで検知し、Cloud Monitoring でアラートを出す。",
        note: "作られた後に気付く検知の仕組みで、作成を防ぐことはできない。",
      },
      {
        text: "全プロジェクトで、サービス アカウント キー管理者のロールを持つ人から 1 人ずつロールを外す。",
        note: "オーナーなど他のロールでもキーを作れる場合があり、新しいプロジェクトにも自動では効かない。漏れの出やすい方法。",
      },
      {
        text: "組織ノードで組織ポリシーの制約 iam.disableServiceAccountKeyCreation を適用し、例外のプロジェクトだけでポリシーを上書きして適用を外す。",
        note: "組織ポリシーは配下のすべてのプロジェクトに継承され、必要な場所だけ下位で上書きできる。これが正解。",
      },
    ],
    explain:
      "サービス アカウント キーは長期間有効で漏えいの危険が大きいため、組織ポリシーでキーの作成を禁止し、権限借用や Workload Identity 連携など、キーを使わない方法へ寄せるのが推奨される。組織ポリシーは組織に設定すると既存・新規のすべてのプロジェクトに継承され、例外が必要なプロジェクトだけ下位で上書きできる。IAM のロールの付け外しで同じことをしようとすると、漏れや新規プロジェクトへの適用忘れが起きやすい。",
    points: [
      "キーの作成禁止は組織ポリシーで一括してかけ、例外は下位で上書きする。",
      "監査ログでの検知は、予防の代わりにはならない。",
    ],
  },
];
