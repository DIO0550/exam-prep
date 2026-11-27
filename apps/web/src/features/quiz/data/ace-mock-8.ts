import type { Question, Source } from "../types";

/**
 * Google Cloud Associate Cloud Engineer 対策 模擬試験 8（問1〜問50）。
 *
 * IPA の過去問題と違い、**問題文・選択肢・正解・解説のすべてを本サイトで書き下ろしている**。
 * どこかの認定試験の実際の設問ではなく、公式の模擬試験でもない。
 *
 * 典拠にした公開資料:
 * - Google Cloud「Associate Cloud Engineer 認定試験ガイド」（4 セクションの出題範囲。reference には節番号を書く）
 *
 * このセットが問う層は「サービスと機能の選び分け」。役割の近いサービスや機能（Dataproc と Dataflow、
 * Workflows と Cloud Composer、DaemonSet と StatefulSet、マシンイメージとスナップショット、テーブルの
 * スナップショットとクローン、組織のポリシーの各制約、サービスごとの事前定義ロールなど）のうち、
 * 要件に合うものを選べるかを問う。
 *
 * 作り方の方針:
 * - 設問は「立場と制約のある場面」から始め、覚えた言葉ではなく選び方を問う
 * - 選択肢は 4 つのうち 1〜2 つを**正解と紛らわしいもの**にする（似たロール、1 段ずれた範囲、
 *   似たコマンドやフラグ、要件に対して過剰な対処など）。残りは明確に誤りとする
 * - なぜその選択肢が違うのかは choice.note に 1 つずつ書く
 * - 模擬試験1〜7 で問うた論点を、場面だけ変えて同じ問い方で出すことはしない
 * - 上限値や料金のように確信の持てない数値は出題しない
 */

const GUIDE = "Google Cloud「Associate Cloud Engineer 認定試験ガイド」";

const at = (no: number, section: string): Source => ({
  kind: "original",
  deck: "ace-mock-8",
  label: "ACE 模擬8",
  no,
  reference: `${GUIDE} ${section}`,
});

const S1 = "セクション1 環境の設定";
const S2 = "セクション2 計画と実装";
const S3 = "セクション3 運用";
const S4 = "セクション4 アクセスとセキュリティ";

export const ACE_MOCK_8: [Question, ...Question[]] = [
  // ───────── セクション1 環境の設定（問1〜問10） ─────────
  {
    source: at(1, "1.1"),
    field: S1,
    answer: 1,
    text: "FA社の情報システム部長は、組織ノードで組織管理者（roles/resourcemanager.organizationAdmin）のロールを持っている。組織全体で VM の外部 IP アドレスを禁止しようと、組織のポリシーを設定したところ、権限が無いというエラーで拒否された。最も適切な説明と対処はどれか。",
    choices: [
      {
        text: "組織管理者は何でもできるはずなので、IAM の変更が反映されるのを待って再試行する。",
        note: "反映の遅れではない。組織管理者のロールには、組織のポリシーを設定する権限が含まれていない。",
      },
      {
        text: "組織のポリシーの設定には、組織のポリシー管理者（roles/orgpolicy.policyAdmin）のロールが要る。組織管理者は IAM を管理できるので、担当者にこのロールを付与してから設定する。",
        note: "組織のポリシーの管理は、組織管理者とは別のロールに分かれている。これが正解。",
      },
      {
        text: "対象のプロジェクトごとにオーナーのロールを付与し、プロジェクトの単位で設定する。",
        note: "プロジェクトのオーナーにも組織のポリシーを設定する権限は無い。組織全体に一度で効かせることにもならない。",
      },
      {
        text: "セキュリティ管理者（roles/iam.securityAdmin）のロールを付与する。",
        note: "IAM ポリシーなどを管理するロールで、組織のポリシーの設定はできない。",
      },
    ],
    explain:
      "組織のポリシーの作成・変更・削除には、組織のポリシー管理者（roles/orgpolicy.policyAdmin）のロールが要る。組織管理者のロールは組織の IAM を管理するためのもので、組織のポリシーを設定する権限は含まれていない。そのため、組織管理者が自分や担当者のグループに組織のポリシー管理者を付与してから作業する。統制のための強い権限なので、付与する相手は少数に絞る。",
    points: [
      "組織のポリシーの設定 → 組織のポリシー管理者（roles/orgpolicy.policyAdmin）。",
      "組織管理者のロールには、組織のポリシーを設定する権限は含まれない。",
    ],
  },
  {
    source: at(2, "1.1"),
    field: S1,
    answer: [0, 3],
    text: "FB社のネットワーク チームは、組織全体に次の 2 つの方針を組織のポリシーで適用したい。設定する制約として適切なものはどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "方針A: VPC ネットワーク ピアリングの相手を、承認済みの取引先のネットワークだけに限る",
          "方針B: 共有 VPC のサービス プロジェクトが接続できるホスト プロジェクトを、ネットワーク チームのホスト プロジェクトだけに限る",
        ],
      },
    },
    choices: [
      {
        text: "compute.restrictVpcPeering",
        note: "ピアリングできる相手の VPC ネットワークを、許可したものに限るリスト型の制約である。方針A に合う。これが正解。",
      },
      {
        text: "compute.skipDefaultNetworkCreation",
        note: "新しいプロジェクトで default ネットワークを作らせない制約で、ピアリングや共有 VPC の相手は制限しない。",
      },
      {
        text: "compute.vmCanIpForward",
        note: "IP 転送を有効にできる VM を制限する制約で、ピアリングや共有 VPC には関係しない。",
      },
      {
        text: "compute.restrictSharedVpcHostProjects",
        note: "サービス プロジェクトが接続できる共有 VPC のホスト プロジェクトを、許可したものに限る。方針B に合う。これが正解。",
      },
    ],
    explain:
      "ネットワークのつなぎ方も、組織のポリシーで統制できる。compute.restrictVpcPeering は、VPC ネットワーク ピアリングの相手として許す VPC ネットワーク（またはそれを含むプロジェクトや組織）を指定するリスト型の制約である。compute.restrictSharedVpcHostProjects は、サービス プロジェクトが接続してよい共有 VPC のホスト プロジェクトを指定する。どちらも、許可していない相手とつなぐ操作を作成の時点で拒否する。",
    points: [
      "ピアリングの相手を限る → compute.restrictVpcPeering。",
      "共有 VPC のホスト プロジェクトを限る → compute.restrictSharedVpcHostProjects。",
    ],
  },
  {
    source: at(3, "1.1"),
    field: S1,
    answer: 2,
    text: "FC社の規程では、BigQuery と Cloud Storage のデータは、Google が管理する鍵ではなく、自社が Cloud KMS で管理する鍵（CMEK）で暗号化しなければならない。組織全体で、CMEK を指定していないデータセットやバケットを作れないようにしたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "VPC Service Controls のサービス境界で、BigQuery と Cloud Storage を囲む。",
        note: "境界の外へのデータの持ち出しを防ぐ仕組みで、どの鍵で暗号化するかは強制しない。",
      },
      {
        text: "すべてのバケットで、均一なバケットレベルのアクセスを有効にする。",
        note: "ACL を使わせず IAM だけでアクセスを管理させる設定で、暗号化の鍵とは関係が無い。",
      },
      {
        text: "組織のポリシーの制約 gcp.restrictNonCmekServices で、bigquery.googleapis.com と storage.googleapis.com を CMEK が必要なサービスとして指定する。",
        note: "指定したサービスでは、CMEK を指定しないリソースの作成が拒否される。これが正解。",
      },
      {
        text: "開発者に、データセットやバケットを作るときは必ず CMEK を指定するよう周知する。",
        note: "人の運用に頼るので、指定し忘れたリソースが作られることを防げない。",
      },
    ],
    explain:
      "組織のポリシーの制約 gcp.restrictNonCmekServices に、CMEK を必須にしたいサービス（bigquery.googleapis.com、storage.googleapis.com など）を指定すると、そのサービスで CMEK を指定せずにリソースを作ることが拒否される。あわせて gcp.restrictCmekCryptoKeyProjects を使えば、使ってよい鍵を特定のプロジェクトの Cloud KMS の鍵に限れる。CMEK を使うときは、各サービスのサービス エージェントに、その鍵で暗号化・復号するロールを付与しておく。",
    points: [
      "CMEK の利用を強制する → gcp.restrictNonCmekServices。",
      "使ってよい鍵のプロジェクトを限る → gcp.restrictCmekCryptoKeyProjects。",
    ],
  },
  {
    source: at(4, "1.1"),
    field: S1,
    answer: 0,
    text: "FD社では、開発用のフォルダの配下のプロジェクトで、インターネットに公開する外部のロードバランサを作らせたくない。社内向けの内部のロードバランサは引き続き使わせる。最も適切な方法はどれか。",
    choices: [
      {
        text: "開発用のフォルダで、組織のポリシーの制約 compute.restrictLoadBalancerCreationForTypes を設定し、内部のロードバランサの種類だけを許可する。",
        note: "作成できるロードバランサの種類を制限でき、外部の種類を作らせないようにできる。これが正解。",
      },
      {
        text: "開発用のフォルダで、制約 compute.vmExternalIpAccess をすべて拒否にする。",
        note: "VM に外部 IP アドレスを付けることを禁じる制約で、外部のロードバランサの作成は止められない。",
      },
      {
        text: "開発用のプロジェクトに、Cloud Armor のセキュリティ ポリシーを設定する。",
        note: "ロードバランサに届く通信を絞る仕組みで、外部のロードバランサを作ること自体は止められない。",
      },
      {
        text: "開発用の VPC に、0.0.0.0/0 からの上りをすべて拒否するファイアウォール ルールを作る。",
        note: "外部のロードバランサの作成は止められない。ヘルスチェックなどまで止まり、内部のロードバランサにも影響しうる。",
      },
    ],
    explain:
      "組織のポリシーの制約 compute.restrictLoadBalancerCreationForTypes は、作成できるロードバランサの種類を制限するリスト型の制約である。内部の種類だけを許可しておけば、そのノードの配下では外部のロードバランサを作れなくなる。外部 IP アドレスの制約（compute.vmExternalIpAccess）は VM のネットワーク インターフェースに付くアドレスを対象にしており、ロードバランサの外部 IP アドレスには効かない。公開の入口を統制したいときは、どの種類のリソースを止めたいのかを見極めて制約を選ぶ。",
    points: [
      "作れるロードバランサの種類を限る → compute.restrictLoadBalancerCreationForTypes。",
      "VM の外部 IP の制約は、ロードバランサには効かない。",
    ],
  },
  {
    source: at(5, "1.1"),
    field: S1,
    answer: 3,
    text: "FE社は、今後作るすべてのプロジェクトで、Cloud Run・Artifact Registry・Secret Manager の API を最初から有効にしておきたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "組織ノードでこれらの API を有効にし、配下のプロジェクトに継承させる。",
        note: "API の有効化はプロジェクトごとの設定で、組織やフォルダから継承されるものではない。",
      },
      {
        text: "組織のポリシーで、これらの API を有効にすることを強制する。",
        note: "組織のポリシー（gcp.restrictServiceUsage など）は使えるサービスを制限するもので、API を有効にするものではない。",
      },
      {
        text: "フォルダの設定で、これらの API を既定で有効にする。",
        note: "フォルダに API を有効にする設定は無い。",
      },
      {
        text: "プロジェクトを作る手順を Terraform などで自動化し、その中で各プロジェクトの API を有効にする（google_project_service など）。",
        note: "API はプロジェクトごとに有効にするので、プロジェクトの作成と一緒に自動で行うのが確実である。これが正解。",
      },
    ],
    explain:
      "Google Cloud の API の有効化は、プロジェクトの単位で行う。組織やフォルダで有効にして継承させる仕組みは無いので、すべてのプロジェクトで同じ API を使いたいなら、プロジェクトの作成を自動化し、その中で API も有効にする。Terraform なら google_project_service リソースで、gcloud なら gcloud services enable でまとめて有効にできる。組織のポリシーの gcp.restrictServiceUsage は、逆に使ってよいサービスを制限するための制約である。",
    points: [
      "API の有効化はプロジェクトごと。組織やフォルダからは継承されない。",
      "全プロジェクトで同じ API を使うなら、プロジェクトの作成の自動化の中で有効にする。",
    ],
  },
  {
    source: at(6, "1.1"),
    field: S1,
    answer: 1,
    text: "FF社の運用チームは、Cloud Monitoring のアラートが発生したら、人の操作を待たずに、Cloud Run で動く復旧処理を自動で起動したい。アラートの内容（どのリソースで何が起きたか）も復旧処理に渡したい。最も適切な方法はどれか。",
    choices: [
      {
        text: "通知チャネルをメールにし、メールを受け取った担当者が手で復旧処理を起動する。",
        note: "人の操作を待つことになり、自動で起動するという要件に合わない。",
      },
      {
        text: "通知チャネルに Pub/Sub のトピックを使い、そのトピックのメッセージで Cloud Run の復旧処理を起動する。",
        note: "アラートの内容がメッセージとして届き、それをきっかけに処理を自動で起動できる。これが正解。",
      },
      {
        text: "通知チャネルを SMS にし、担当者の携帯電話に送る。",
        note: "人に知らせる手段で、処理を自動で起動することはできない。",
      },
      {
        text: "Error Reporting でエラーをまとめ、週に一度復旧処理を起動する。",
        note: "Error Reporting はアプリの例外をまとめる道具で、アラートをきっかけに処理を起動する仕組みではない。週に一度では遅すぎる。",
      },
    ],
    explain:
      "Cloud Monitoring のアラートの通知先（通知チャネル）には、メール、SMS、Slack、PagerDuty、Webhook、Pub/Sub などがある。人に知らせるならメールやチャットを、処理を自動で起動するなら Pub/Sub を使う。Pub/Sub の通知チャネルを使うと、アラートの内容が JSON のメッセージとしてトピックに届くので、push サブスクリプションや Eventarc で Cloud Run の処理を起動できる。トピックへの送信は Cloud Monitoring のサービス エージェントが行うので、トピックにパブリッシャーの権限を付与しておく。",
    points: [
      "アラートで処理を自動で起動する → Pub/Sub の通知チャネル。",
      "人に知らせる → メール、SMS、チャットなどの通知チャネル。",
    ],
  },
  {
    source: at(7, "1.1"),
    field: S1,
    answer: 2,
    text: "FG社の運用担当者は、毎晩 3 時間ほどかかるデータの整理のスクリプトを、Cloud Shell で起動して終わるまで動かしておこうとしている。ところが、ときどき途中で止まってしまう。最も適切な対処はどれか。",
    choices: [
      {
        text: "Cloud Shell のブラウザのタブを、処理が終わるまで開いたままにしておく。",
        note: "Cloud Shell のセッションには時間の制限があり、タブを開いていても長い処理を最後まで動かせる保証は無い。",
      },
      {
        text: "Cloud Shell の中で nohup を付けてスクリプトを動かす。",
        note: "端末を閉じても動き続けるようにはなるが、Cloud Shell の VM 自体が終わればスクリプトも止まる。",
      },
      {
        text: "Cloud Shell は対話的な作業のための環境なので、長い処理は Cloud Run ジョブや Compute Engine の VM など、処理を動かすための場所で実行する。",
        note: "処理の場所を変えれば、セッションの終了に左右されずに最後まで動かせる。スケジュールで起動することもできる。これが正解。",
      },
      {
        text: "Cloud Shell をブースト モードにして、処理を速く終わらせる。",
        note: "一時的に性能を上げるだけで、セッションが終わると止まる問題は残る。",
      },
    ],
    explain:
      "Cloud Shell は、ブラウザから gcloud などを使うための対話的なシェル環境で、操作の無い状態が続いたり、使える時間を超えたりするとセッションが終わり、その上で動いていた処理も止まる。決まった時刻に動かす処理や、長い時間かかる処理は、Cloud Run ジョブ、Compute Engine の VM、GKE の Job など、処理を動かすための場所で実行し、必要なら Cloud Scheduler で起動する。Cloud Shell は作業の入口として使い分ける。",
    points: [
      "Cloud Shell は対話的な作業用。長い処理や定期的な処理には向かない。",
      "長い処理は Cloud Run ジョブや VM などで動かす。",
    ],
  },
  {
    source: at(8, "1.1"),
    field: S1,
    answer: 0,
    text: "FH社では、1 つのプロジェクトに開発・ステージング・本番のリソースを置き、ラベル env で見分けている。最近、開発者に本番のリソースを触らせない権限の分け方や、環境ごとの割り当ての管理、費用の把握が難しくなってきた。最も適切な対処はどれか。",
    choices: [
      {
        text: "環境ごとにプロジェクトを分け、フォルダで束ねる。権限は環境ごとのプロジェクト（やフォルダ）で付与する。",
        note: "IAM・割り当て・API・費用はプロジェクトの単位で分かれるので、環境の分離が自然にできる。これが正解。",
      },
      {
        text: "今のプロジェクトのまま、ラベル env の値ごとにロールを付ける。",
        note: "IAM のロールは、ラベルを単位にして付与するものではない。割り当てもプロジェクトで共有されたままになる。",
      },
      {
        text: "今のプロジェクトの中に、環境ごとの VPC ネットワークを作る。",
        note: "ネットワークは分かれるが、IAM・割り当て・費用はプロジェクトで共有されたままになる。",
      },
      {
        text: "リソースの名前の先頭に環境名を付ける決まりを徹底する。",
        note: "見分けやすくはなるが、権限や割り当ての分離にはならない。",
      },
    ],
    explain:
      "Google Cloud では、プロジェクトがリソースの管理の基本の単位で、IAM の付与、API の有効化、割り当て、請求先のリンクなどはプロジェクトごとに分かれる。環境（開発・ステージング・本番）を 1 つのプロジェクトに混ぜると、権限や割り当てを分けにくく、誤操作の影響も広がる。環境ごとにプロジェクトを分け、フォルダで束ねて共通の権限や組織のポリシーをかけるのが基本の形である。ラベルは、費用の集計など、プロジェクトの中の細かい分類に使う。",
    points: [
      "環境はプロジェクトで分ける。IAM・割り当て・費用がプロジェクトの単位で分かれる。",
      "ラベルは集計のための分類で、権限の境界にはならない。",
    ],
  },
  {
    source: at(9, "1.2"),
    field: S1,
    answer: [1, 2],
    text: "FI社は、Compute Engine の確約利用割引の購入を検討している。来年は VM のマシンシリーズを N2 から新しいシリーズへ移し、一部の処理を別のリージョンへ移す予定もある。確約利用割引の説明として正しいものはどれか。2つ選べ。",
    choices: [
      {
        text: "確約利用割引は、契約の期間の途中でも、使わなくなれば手数料を払って解約できる。",
        note: "確約は契約の期間の途中で解約できず、使わなくても期間の終わりまで料金がかかる。",
      },
      {
        text: "リソースベースの確約利用割引は、特定のリージョンで、特定のマシンシリーズの vCPU とメモリの量を確約する。別のシリーズや別のリージョンへ移すと、その分には適用されない。",
        note: "量の確約はリージョンとマシンシリーズに結び付くので、構成が変わると使い切れなくなりうる。これが正解。",
      },
      {
        text: "費用ベース（フレキシブル）の確約利用割引は、1 時間あたりの一定の金額の利用を確約するもので、対象のマシンシリーズやリージョンが変わっても適用される。",
        note: "量ではなく金額を確約するので、構成が変わる見込みがあっても使いやすい。これが正解。",
      },
      {
        text: "Spot VM にも確約利用割引を重ねて適用できる。",
        note: "Spot VM はもともと大きく割り引かれた料金で、確約利用割引の対象にはならない。",
      },
    ],
    explain:
      "Compute Engine の確約利用割引は、1 年または 3 年の利用を確約する代わりに単価が下がる契約で、途中で解約することはできない。リソースベースのものは、リージョンとマシンシリーズを決めて vCPU やメモリの量を確約するので、別のシリーズや別のリージョンに移すと、移した分には適用されず、確約した量の料金だけが残る。費用ベース（フレキシブル）のものは、1 時間あたりの金額を確約し、対象のマシンシリーズやリージョンをまたいで適用されるので、構成が変わる見込みがあるときに向く。Spot VM は確約利用割引の対象外である。",
    points: [
      "リソースベースの確約は、リージョンとマシンシリーズに結び付く。",
      "構成が変わる見込みがあるなら、費用ベース（フレキシブル）の確約利用割引。確約は途中で解約できない。",
    ],
  },
  {
    source: at(10, "1.2"),
    field: S1,
    answer: 3,
    text: "FJ社は、プロジェクト fj-batch で、asia-northeast1 の N2 の vCPU とメモリについて、3 年のリソースベースの確約利用割引を購入した。その後、処理の一部を、同じ請求先アカウントにリンクされた別のプロジェクト fj-api（同じリージョンの N2 の VM）に移した。fj-batch の使用量が確約した量を下回り、確約の料金は払い続けているのに、fj-api の VM には割引が適用されていない。最も適切な対処はどれか。",
    choices: [
      {
        text: "fj-batch の確約を解約し、fj-api で買い直す。",
        note: "確約は契約の期間の途中で解約できない。",
      },
      {
        text: "fj-api の VM をすべて fj-batch に戻す。",
        note: "割引は受けられるが、プロジェクトの分け方を費用のために崩すことになる。プロジェクトをまたいで割引を使う仕組みがある。",
      },
      {
        text: "fj-api で継続利用割引を申し込む。",
        note: "継続利用割引は申し込むものではなく、対象の VM に自動で適用される。確約の使い残しを埋めるものでもない。",
      },
      {
        text: "請求先アカウントで確約利用割引の共有を有効にし、同じ請求先アカウントにリンクされたプロジェクトの間で、確約の割引を使えるようにする。",
        note: "共有を有効にすると、同じリージョンとマシンシリーズの使用量であれば、別のプロジェクトの VM にも確約の割引が適用される。これが正解。",
      },
    ],
    explain:
      "リソースベースの確約利用割引は、既定では購入したプロジェクトの使用量にだけ適用される。請求先アカウントで確約利用割引の共有を有効にすると、その請求先アカウントにリンクされた複数のプロジェクトの使用量に、確約の割引をまとめて適用できる（リージョンとマシンシリーズの条件は同じ）。プロジェクトの間で負荷が移っても、確約を使い切りやすくなる。確約は途中で解約できないので、購入の前に、どのプロジェクトでどれだけ使い続けるかを見積もり、共有の設定もあわせて決めておく。",
    points: [
      "確約をプロジェクトの間で使う → 請求先アカウントで確約利用割引の共有を有効にする。",
      "リソースベースの確約は、既定では購入したプロジェクトにだけ適用される。",
    ],
  },
  // ───────── セクション2 計画と実装（問11〜問25） ─────────
  {
    source: at(11, "2.1"),
    field: S2,
    answer: 2,
    text: "FK社は、.NET Framework 4.8 で作られ、Windows Server の IIS で動いている社内向けの Web アプリケーションを Google Cloud に移す。コードにはほとんど手を入れたくなく、チームにコンテナの経験は無い。最も適切な実行環境はどれか。",
    choices: [
      {
        text: "Cloud Run にデプロイする。",
        note: "Cloud Run は Linux のコンテナを動かすサービスで、Windows を前提にした .NET Framework のアプリケーションは動かせない。",
      },
      {
        text: "App Engine のスタンダード環境にデプロイする。",
        note: "決められた言語のランタイムで動かす環境で、.NET Framework と IIS のアプリケーションをそのまま載せることはできない。",
      },
      {
        text: "Google が提供する Windows Server の公開イメージから Compute Engine の VM を作り、IIS にアプリケーションを載せる。",
        note: "今と同じ OS と IIS の上で、コードを変えずに動かせる。公開イメージはライセンス込みなので、Windows のライセンスを別に用意しなくてよい。これが正解。",
      },
      {
        text: "Cloud Run functions に、アプリケーションを関数として分けてデプロイする。",
        note: "Windows のランタイムは無く、アプリケーションを関数に分ける作り直しも要る。",
      },
    ],
    explain:
      ".NET Framework（4.x まで）は Windows の上でしか動かない。Cloud Run や App Engine、Cloud Run functions は Linux で動く環境なので、そのままでは載せられない（Linux でも動く新しい .NET に書き換えれば候補になる）。手を入れずに移すなら、Compute Engine で Windows Server の VM を作り、今と同じ構成で動かす。Google が提供する Windows Server の公開イメージはライセンス込みで、使った分だけライセンスの料金がかかる。コンテナ化できるなら GKE の Windows Server ノードプールという選択肢もあるが、コンテナの経験が無いチームには負担が大きい。",
    points: [
      ".NET Framework と IIS をそのまま動かす → Compute Engine の Windows Server の VM。",
      "Cloud Run や App Engine は Linux の環境で、Windows 前提のアプリケーションは載らない。",
    ],
  },
  {
    source: at(12, "2.1"),
    field: S2,
    answer: 0,
    text: "FL社の研究部門は、数千件のシミュレーションをまとめて流したい。1 件ごとに 64 vCPU の計算最適化のマシンタイプが要り、費用を抑えるため Spot VM で動かしたい。待ち行列への登録、VM の用意と後片付け、失敗した件の再試行は、自分たちで仕組みを作らずに任せたい。最も適切なサービスはどれか。",
    choices: [
      {
        text: "Batch",
        note: "ジョブを登録すると、指定したマシンタイプや Spot VM で VM を用意して処理を動かし、終わったら片付ける。再試行も設定できる。これが正解。",
      },
      {
        text: "Cloud Run ジョブ",
        note: "タスクごとに使える CPU とメモリには上限があり、マシンタイプや Spot VM を選ぶことはできない。",
      },
      {
        text: "Compute Engine の VM を自分で立て、cron とスクリプトで順に流す。",
        note: "動かすことはできるが、VM の用意と後片付け、待ち行列や再試行の仕組みを自分で作り、管理することになる。",
      },
      {
        text: "Cloud Scheduler",
        note: "決まった時刻に処理を起動するサービスで、処理を動かす計算資源や待ち行列は持たない。",
      },
    ],
    explain:
      "Batch は、バッチ処理のジョブを登録すると、ジョブの定義に従って Compute Engine の VM を用意し、スクリプトやコンテナのタスクを動かし、終わったら VM を片付けるマネージド サービスである。マシンタイプ、GPU、Spot VM などの指定ができ、タスクの並列数や失敗したときの再試行の回数も決められる。Batch 自体に料金はかからず、使った VM などの料金を払う。Cloud Run ジョブは手軽だが、使える CPU とメモリに上限があり、マシンタイプを選べない。大きなマシンや特定のハードウェアが要るバッチには Batch が向く。",
    points: [
      "マシンタイプや Spot VM を指定する大量のバッチ → Batch。",
      "Cloud Run ジョブは CPU とメモリに上限があり、マシンタイプを選べない。",
    ],
  },
  {
    source: at(13, "2.1"),
    field: S2,
    answer: 3,
    text: "FM社は、16 台の VM で、互いに頻繁に通信する並列計算（MPI）を動かす。VM の間の通信の遅延をできるだけ小さくしたい。最も適切な構成はどれか。",
    choices: [
      {
        text: "16 台の VM を、同じリージョンの複数のゾーンに分けて置く。",
        note: "ゾーンをまたぐと、VM の間の通信の遅延はかえって大きくなる。",
      },
      {
        text: "分散（spread）の配置ポリシーを使い、VM を別々のハードウェアに散らす。",
        note: "障害の影響を分けるための置き方で、遅延を小さくするという目的とは逆になる。",
      },
      {
        text: "単一テナント ノードに 16 台の VM を載せる。",
        note: "他の顧客と物理ホストを分けるための仕組みで、ライセンスや規程のために使う。VM の間の遅延を小さくするためのものではない。",
      },
      {
        text: "コンパクトの配置ポリシー（gcloud compute resource-policies create group-placement で --collocation=collocated）を作り、16 台の VM に付けて同じゾーンの中で物理的に近くに置く。",
        note: "VM を物理的に近い場所に置くので、VM の間の通信の遅延が小さくなる。これが正解。",
      },
    ],
    explain:
      "Compute Engine の配置ポリシーには、VM を物理的に近くに置くコンパクトの配置ポリシーと、別々のハードウェアに散らす分散の配置ポリシーがある。互いに頻繁に通信する HPC や MPI の処理ではコンパクトの配置ポリシーを使い、gcloud compute resource-policies create group-placement で --collocation=collocated を指定して作り、VM の作成時に --resource-policies で付ける。対応するマシンシリーズや VM の数には条件があるので、使う前に確かめる。逆に、障害の影響を広げたくない冗長化の構成では、分散の配置ポリシーを使う。",
    points: [
      "VM の間の遅延を小さくする → コンパクトの配置ポリシー（--collocation=collocated）。",
      "障害の影響を分ける → 分散の配置ポリシー。",
    ],
  },
  {
    source: at(14, "2.1"),
    field: S2,
    answer: 1,
    text: "FN社では、マネージド インスタンス グループ（MIG）の VM が、Pub/Sub のサブスクリプション jobs-sub からメッセージを受け取って処理している。処理の多くは外部の API の応答待ちで、メッセージがたまっても CPU 使用率はほとんど上がらず、VM が増えない。たまったメッセージの量に応じて VM を増減させたい。最も適切な設定はどれか。",
    choices: [
      {
        text: "自動スケーリングの CPU 使用率の目標を 20% に下げる。",
        note: "処理は応答待ちで CPU を使わないので、目標を下げても、たまったメッセージの量とは結び付かない。",
      },
      {
        text: "Cloud Monitoring の指標 pubsub.googleapis.com/subscription/num_undelivered_messages（未配信のメッセージ数）を使う自動スケーリングにし、jobs-sub に絞って、VM 1 台あたりが受け持つメッセージ数を目標にする。",
        note: "たまったメッセージの数を VM 1 台あたりの目標で割った台数に合わせて増減する。これが正解。",
      },
      {
        text: "ロードバランサの処理能力（HTTP の負荷分散の使用率）を使う自動スケーリングにする。",
        note: "VM は Pub/Sub からメッセージを取りに行くだけで、ロードバランサから要求を受けていないので使えない。",
      },
      {
        text: "スケジュールに基づく自動スケーリングで、平日の昼だけ VM を増やす。",
        note: "メッセージがたまる時間帯が決まっていなければ、量の変化に合わせられない。",
      },
    ],
    explain:
      "MIG の自動スケーリングは、CPU 使用率やロードバランサの処理能力のほかに、Cloud Monitoring の指標を使って増減させることもできる。Pub/Sub のメッセージを処理する VM なら、サブスクリプションの未配信のメッセージ数（num_undelivered_messages）を指標にし、フィルタで対象のサブスクリプションに絞って、VM 1 台あたりが受け持つ量を目標にする（グループ全体の値を台数に割り当てる指定）。こうすると、たまった量に応じて台数が決まる。処理が CPU を使わない場合、CPU 使用率では負荷を表せない。",
    points: [
      "キューの長さに応じて VM を増減 → Cloud Monitoring の指標（未配信のメッセージ数）で自動スケーリング。",
      "CPU を使わない処理では、CPU 使用率は負荷を表さない。",
    ],
  },
  {
    source: at(15, "2.1"),
    field: S2,
    answer: [1, 3],
    text: "FO社は、GKE のクラスタで次の 2 つのワークロードを動かす。それぞれに使う Kubernetes のリソースとして適切なものはどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "ワークロードA: ログを集めるエージェント。すべてのノードで 1 つずつ動かし、ノードが増えたら自動で新しいノードにも置きたい",
          "ワークロードB: 3 つの Pod からなるデータベース。Pod ごとに決まった名前（db-0、db-1、db-2）と専用の永続ボリュームを持ち、Pod が作り直されても同じボリュームを使い続けたい",
        ],
      },
    },
    choices: [
      {
        text: "Deployment",
        note: "同じ役割の Pod を指定した数だけ動かすもので、Pod は入れ替え可能として扱われる。ノードごとに 1 つ置く保証も、Pod ごとの決まった名前やボリュームも無い。",
      },
      {
        text: "DaemonSet",
        note: "各ノードで Pod を 1 つずつ動かし、ノードが増えると自動で Pod を置く。ワークロードA に合う。これが正解。",
      },
      {
        text: "Job",
        note: "最後まで実行して終わる処理のためのもので、動き続けるエージェントやデータベースには使わない。",
      },
      {
        text: "StatefulSet",
        note: "Pod に順番の付いた決まった名前を与え、Pod ごとの永続ボリュームを作り直しのあとも引き継ぐ。ワークロードB に合う。これが正解。",
      },
    ],
    explain:
      "Kubernetes のワークロードのリソースは、Pod の性質で選ぶ。Deployment は入れ替え可能な Pod を指定した数だけ動かす、Web アプリケーションなど状態を持たない処理の基本形である。DaemonSet はノードごとに 1 つの Pod を動かすもので、ログや監視のエージェントに使う。StatefulSet は、Pod に db-0、db-1 のような決まった名前を与え、volumeClaimTemplates で Pod ごとの永続ボリュームを作って、作り直しのあとも同じものを付ける。データベースのように個々の Pod が区別される処理に使う。Job と CronJob は、終わる処理を動かす。",
    points: [
      "ノードごとに 1 つ → DaemonSet。",
      "Pod ごとの決まった名前と永続ボリューム → StatefulSet。",
    ],
  },
  {
    source: at(16, "2.2"),
    field: S2,
    answer: 2,
    text: "FP社は、オンプレミスの Hadoop クラスタで、数百本の Spark（PySpark）のジョブと Hive のクエリを動かしている。コードをできるだけ書き換えずに Google Cloud へ移し、ジョブのときだけクラスタを立てて費用を抑えたい。最も適切なサービスはどれか。",
    choices: [
      {
        text: "Dataflow",
        note: "Apache Beam で書いたパイプラインを動かすサービスで、Spark のジョブは Beam に書き換える必要がある。",
      },
      {
        text: "Cloud Run ジョブで Spark を動かす。",
        note: "Spark の分散処理のクラスタを自分で組むことになり、Hive も含めた移行には向かない。",
      },
      {
        text: "Dataproc",
        note: "Spark・Hadoop・Hive を動かすマネージドなクラスタで、ジョブをほぼそのまま動かせる。ジョブごとにクラスタを作って消す使い方もできる。これが正解。",
      },
      {
        text: "データを BigQuery に読み込み、Spark のジョブと Hive のクエリを BigQuery の SQL に書き換える。",
        note: "長い目で見れば選択肢になるが、数百本のジョブの書き換えが要り、できるだけ書き換えないという要件に合わない。",
      },
    ],
    explain:
      "Dataproc は、Apache Spark、Hadoop、Hive などのオープンソースのデータ処理をマネージドなクラスタで動かすサービスで、既存のジョブをほぼそのまま移せる。クラスタは数分で作れるので、ジョブのたびに作って終わったら消す（エフェメラルな）使い方にすると、使っていない間の費用がかからない。そのためには、データを HDFS ではなく Cloud Storage に置き（Cloud Storage コネクタで読み書きできる）、クラスタを消してもデータが残るようにする。新しく作るストリーミングやバッチのパイプラインなら Dataflow、SQL で分析するなら BigQuery、と使い分ける。",
    points: [
      "既存の Spark・Hadoop・Hive をそのまま移す → Dataproc。",
      "Apache Beam のパイプライン → Dataflow。",
    ],
  },
  {
    source: at(17, "2.2"),
    field: S2,
    answer: 0,
    text: "FQ社の業務システムは Cloud SQL for MySQL を使っている。分析チームは、業務データベースの変更を数分以内の遅れで BigQuery に複製し、分析のクエリが業務データベースに負荷をかけないようにしたい。コードは書かずに済ませたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "Datastream で、Cloud SQL for MySQL を転送元、BigQuery を転送先とするストリームを作り、変更データ キャプチャ（CDC）で複製する。",
        note: "データベースの変更を読み取り、ほぼリアルタイムに BigQuery へ反映する。これが正解。",
      },
      {
        text: "BigQuery の連携クエリ（EXTERNAL_QUERY）で、分析のたびに Cloud SQL を直接読む。",
        note: "クエリのたびに業務データベースへ問い合わせるので、業務データベースに負荷がかかる。",
      },
      {
        text: "Database Migration Service で、Cloud SQL から BigQuery への移行ジョブを作る。",
        note: "Database Migration Service はデータベースを Cloud SQL や AlloyDB へ移すサービスで、BigQuery への複製には使わない。",
      },
      {
        text: "毎晩 CSV でエクスポートし、bq load で BigQuery に読み込む。",
        note: "反映が 1 日遅れになり、数分以内という要件に合わない。",
      },
    ],
    explain:
      "Datastream は、MySQL、PostgreSQL、Oracle などのデータベースの変更をログから読み取り（変更データ キャプチャ、CDC）、BigQuery や Cloud Storage へほぼリアルタイムに届けるサーバーレスのサービスである。最初に既存のデータを取り込み（バックフィル）、その後は変更を追い続ける。分析は BigQuery の複製に対して行うので、業務データベースには変更の読み取りの分しか負荷がかからない。MySQL ではバイナリログを有効にしておく必要がある。",
    points: [
      "データベースの変更をほぼリアルタイムに BigQuery へ → Datastream（CDC）。",
      "Database Migration Service は Cloud SQL や AlloyDB への移行用。",
    ],
  },
  {
    source: at(18, "2.2"),
    field: S2,
    answer: [0, 3],
    text: "FR社では、2 つのチームが処理の流れの管理（オーケストレーション）の仕組みを探している。それぞれに合うサービスはどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "チームA: オンプレミスで Apache Airflow を使っており、数十本ある既存の DAG をそのまま移したい",
          "チームB: Cloud Run のサービスや Google Cloud の API を、条件分岐や再試行を入れて順に呼び出したい。手順は YAML で書き、サーバーレスで呼び出した分だけ払いたい",
        ],
      },
    },
    choices: [
      {
        text: "Cloud Composer",
        note: "マネージドな Apache Airflow の環境で、既存の DAG をそのまま動かせる。チームA に合う。これが正解。",
      },
      {
        text: "Cloud Scheduler",
        note: "決まった時刻に 1 つの処理を起動するもので、複数の手順の順序や分岐、再試行を管理する仕組みは持たない。",
      },
      {
        text: "Dataflow",
        note: "データを変換するパイプラインを動かすサービスで、サービスや API の呼び出しの順序を管理するものではない。",
      },
      {
        text: "Workflows",
        note: "YAML（または JSON）で書いた手順に従い、HTTP のサービスや Google Cloud の API を順に呼び出すサーバーレスのサービスで、実行した手順の分だけ課金される。チームB に合う。これが正解。",
      },
    ],
    explain:
      "処理の流れを管理するサービスは、既存の資産と処理の性質で選ぶ。Cloud Composer は Apache Airflow のマネージドな環境で、Python で書いた DAG をそのまま動かせる。データ パイプラインの多数のタスクの依存関係を管理するのに向くが、環境が動いている間は費用がかかる。Workflows はサーバーレスで、YAML や JSON で書いた手順に従って HTTP のサービスや Google Cloud の API を呼び出し、条件分岐、再試行、並列の実行などを扱える。実行した手順の数で課金されるので、軽いサービスの連携に向く。",
    points: [
      "既存の Airflow の DAG → Cloud Composer。",
      "サービスや API の呼び出しをサーバーレスで順に → Workflows。",
    ],
  },
  {
    source: at(19, "2.2"),
    field: S2,
    answer: 3,
    text: "FS社は、研究用の大きなデータセットを Cloud Storage のバケットで他の組織の研究者に公開する。利用者がダウンロードするときのネットワークの料金や操作の料金は、FS社ではなくダウンロードする側に払ってもらいたい。最も適切な設定はどれか。",
    choices: [
      {
        text: "バケットを一般公開し、だれでもダウンロードできるようにする。",
        note: "ダウンロードの料金はバケットを持つ FS社に請求される。",
      },
      {
        text: "オブジェクトごとに署名付き URL を発行して配る。",
        note: "アクセスの手段を渡すだけで、料金はバケットを持つ FS社に請求される。",
      },
      {
        text: "バケットで Autoclass を有効にする。",
        note: "アクセスの頻度に応じてストレージ クラスを自動で変える機能で、料金をだれが払うかは変わらない。",
      },
      {
        text: "バケットでリクエスト元による支払い（Requester Pays）を有効にする。利用者は自分の請求先のプロジェクトを指定してアクセスする。",
        note: "ダウンロードの料金や操作の料金が、アクセスした側のプロジェクトに請求される。これが正解。",
      },
    ],
    explain:
      "Cloud Storage のリクエスト元による支払い（Requester Pays）を有効にすると、オブジェクトの読み取りなどの操作の料金や、ネットワークの送信の料金が、アクセスする側が指定したプロジェクトに請求される（保存の料金はバケットの持ち主が払う）。利用者は gcloud storage cp の --billing-project などで請求先のプロジェクトを指定し、そのプロジェクトで料金を使う権限（serviceusage.services.use）を持っている必要がある。指定しないアクセスは拒否される。大きなデータを外部に配る場合に、費用の負担を利用者側へ移せる。",
    points: [
      "ダウンロードの料金を利用者に払わせる → リクエスト元による支払い（Requester Pays）。",
      "利用者は請求先のプロジェクトを指定してアクセスする。",
    ],
  },
  {
    source: at(20, "2.3"),
    field: S2,
    answer: 1,
    text: "FT社は、HTML や画像だけでできた静的なキャンペーン サイトを Cloud Storage のバケットに置いた。自社のドメイン www.ft-campaign.example で HTTPS で公開し、世界中の利用者に近い場所からキャッシュで速く返したい。最も適切な構成はどれか。",
    choices: [
      {
        text: "Cloud DNS で www.ft-campaign.example を c.storage.googleapis.com に向ける CNAME を作る。",
        note: "この方法は HTTP でしか使えず、HTTPS で公開するという要件に合わない。",
      },
      {
        text: "グローバル外部アプリケーション ロードバランサを作り、バケットをバックエンド バケットとして登録して Cloud CDN を有効にする。ドメインには Google マネージドの証明書を使う。",
        note: "自社のドメインの HTTPS で受け、Cloud CDN のキャッシュから世界中に配信できる。これが正解。",
      },
      {
        text: "バケットをデュアルリージョンに作り直す。",
        note: "データの置き場所の冗長性が上がるだけで、自社のドメインでの HTTPS やキャッシュの配信にはならない。",
      },
      {
        text: "Compute Engine の VM に Web サーバーを立て、バケットの中身をコピーして配信する。",
        note: "動かすことはできるが、VM の管理が要り、世界中に近い場所からキャッシュで返すことにもならない。",
      },
    ],
    explain:
      "Cloud Storage のバケットに置いた静的なファイルを自社のドメインで HTTPS で公開するには、グローバル外部アプリケーション ロードバランサのバックエンドにバケットを登録する（バックエンド バケット）。証明書はロードバランサに付け、Google マネージドの証明書なら発行や更新も任せられる。バックエンド バケットで Cloud CDN を有効にすると、Google のエッジのキャッシュから利用者に近い場所で返せる。ファイルを更新してすぐ反映したいときは、gcloud compute url-maps invalidate-cdn-cache でキャッシュを無効にする。",
    points: [
      "バケットの静的サイトを独自ドメインの HTTPS で → ロードバランサのバックエンド バケット。",
      "キャッシュで速く返す → バックエンド バケットで Cloud CDN を有効にする。",
    ],
  },
  {
    source: at(21, "2.3"),
    field: S2,
    answer: 2,
    text: "FU社は、AWS で動くシステムと Google Cloud の VPC の間で、大量のデータをやり取りするようになった。インターネットを経由しない、帯域の大きい専用の接続を用意したい。自社でコロケーション施設に機器を置くことはしたくない。最も適切な方法はどれか。",
    choices: [
      {
        text: "Dedicated Interconnect の回線を引く。",
        note: "Google のコロケーション施設で自社の機器とつなぐ方式で、自社の機器を置く必要がある。",
      },
      {
        text: "HA VPN で、AWS の VPN ゲートウェイとの間にトンネルを張る。",
        note: "暗号化された接続はできるが、インターネットを経由する。帯域もトンネルごとに限られる。",
      },
      {
        text: "Cross-Cloud Interconnect で、Google のネットワークと AWS のネットワークの間に専用の物理接続を用意する。",
        note: "Google が他のクラウドとの間の物理接続を用意し、インターネットを経由しない大きな帯域の接続ができる。これが正解。",
      },
      {
        text: "VPC ネットワーク ピアリングで、AWS の VPC とつなぐ。",
        note: "VPC ネットワーク ピアリングは Google Cloud の VPC どうしをつなぐ仕組みで、他のクラウドとはつなげない。",
      },
    ],
    explain:
      "Cross-Cloud Interconnect は、Google Cloud と他のクラウド（AWS、Azure、Oracle Cloud など）の間に、Google が専用の物理接続を用意するサービスである。自社で機器を置かずに、インターネットを経由しない大きな帯域の接続ができる。経路の交換には Cloud Router を使う。オンプレミスとつなぐなら Dedicated Interconnect や Partner Interconnect、早く安く始めるなら HA VPN、と接続の相手と要件で選び分ける。",
    points: [
      "他のクラウドとの専用の物理接続 → Cross-Cloud Interconnect。",
      "VPC ネットワーク ピアリングは Google Cloud の VPC どうしだけ。",
    ],
  },
  {
    source: at(22, "2.3"),
    field: S2,
    answer: 0,
    text: "FV社のプロジェクト fv-prod では、同じ VPC の VM app-1 から VM db-1（ゾーン asia-northeast1-b）に名前で接続したい。DNS のゾーンやレコードを新しく作る作業はしたくない。app-1 から使う名前として最も適切なものはどれか。",
    choices: [
      {
        text: "db-1.asia-northeast1-b.c.fv-prod.internal",
        note: "VM に自動で付く内部 DNS の名前（ゾーン DNS）で、同じ VPC の中から追加の設定なしに名前解決できる。これが正解。",
      },
      {
        text: "db-1.fv-prod.example.com",
        note: "自社のドメインの名前は、Cloud DNS などでゾーンとレコードを作らないと引けない。",
      },
      {
        text: "db-1.asia-northeast1-b.compute.googleapis.com",
        note: "Compute Engine の API の名前の形で、VM の内部 IP アドレスを引く名前ではない。",
      },
      {
        text: "db-1 の外部 IP アドレスを、app-1 の設定に直接書く。",
        note: "名前での接続にならず、VM を作り直すとアドレスが変わりうる。外部 IP を経由する通信にもなる。",
      },
    ],
    explain:
      "Compute Engine の VM には、内部 DNS の名前が自動で付く。ゾーン DNS の形式では VM名.ゾーン.c.プロジェクトID.internal となり、同じ VPC ネットワークの中の VM から、追加の設定なしに名前解決できる（VM のメタデータ サーバーが DNS を受け持つ）。VM を作り直して内部 IP アドレスが変わっても、名前は同じまま使える。決まった形式ではなく、db.corp.example.com のような自社の名前を付けたいときは、Cloud DNS の限定公開ゾーンを使う。",
    points: [
      "VM の内部 DNS の名前 → VM名.ゾーン.c.プロジェクトID.internal。",
      "同じ VPC の中なら、設定なしで名前解決できる。",
    ],
  },
  {
    source: at(23, "2.4"),
    field: S2,
    answer: 3,
    text: "FW社は Terraform の Google プロバイダで Cloud Run のサービスを管理している。プレビュー（ベータ）の段階にある機能の設定を使おうとしたところ、その引数はサポートされていないというエラーになった。最も適切な対処はどれか。",
    choices: [
      {
        text: "Terraform の本体（CLI）を最新の版に上げる。",
        note: "リソースの引数は、Terraform の本体ではなくプロバイダが定義している。本体を上げてもベータの機能は使えない。",
      },
      {
        text: "リソースのブロックに beta = true と書く。",
        note: "そのような引数は無い。ベータの機能は別のプロバイダで扱う。",
      },
      {
        text: "local-exec で gcloud beta のコマンドを実行し、その機能の設定を変える。",
        note: "Terraform の状態の外で設定を変えることになり、次の plan で差分が出たり、設定が戻されたりする。",
      },
      {
        text: "google-beta プロバイダを設定し、そのリソースで provider = google-beta を指定する。",
        note: "プレビューの機能は google-beta プロバイダで提供される。これが正解。",
      },
    ],
    explain:
      "Terraform で Google Cloud を扱うプロバイダには、一般提供（GA）の機能を扱う google と、ベータやプレビューの機能も扱う google-beta がある。プレビューの機能を使うには、required_providers と provider ブロックで google-beta を設定し、その機能を使うリソースに provider = google-beta を指定する。同じ構成の中で 2 つのプロバイダを併用でき、リソースごとに使い分けられる。プレビューの機能は仕様が変わることがあるので、本番での利用は慎重に判断する。",
    points: [
      "ベータやプレビューの機能 → google-beta プロバイダ（provider = google-beta）。",
      "リソースの引数はプロバイダが定義している。本体の版では変わらない。",
    ],
  },
  {
    source: at(24, "2.4"),
    field: S2,
    answer: 1,
    text: "FX社では、Terraform の変更を CI で確かめてから apply している。社内の規程（許可したリージョンだけを使う、バケットを一般公開しないなど）に違反する変更を、apply の前の CI の段階で見つけて止めたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "CI で terraform validate を実行する。",
        note: "構文や引数の型が正しいかを確かめるもので、社内の規程に合っているかは確かめない。",
      },
      {
        text: "terraform plan の結果を JSON に書き出し、gcloud beta terraform vet で、規程をまとめたポリシー ライブラリに照らして確かめる。",
        note: "plan の段階で規程に違反する変更を見つけ、CI を失敗させられる。これが正解。",
      },
      {
        text: "CI で terraform fmt -check を実行する。",
        note: "書式がそろっているかを確かめるだけで、内容が規程に合っているかは確かめない。",
      },
      {
        text: "apply のあとに、Security Command Center の結果を週に一度確かめる。",
        note: "作ってしまったあとに気付く方法で、apply の前に止めるという要件に合わない。",
      },
    ],
    explain:
      "Terraform の変更が社内の規程に合っているかを apply の前に確かめるには、Google Cloud のポリシーの検証（gcloud beta terraform vet）を使う。terraform plan -out で作った計画を terraform show -json で JSON に書き出し、規程を制約として書いたポリシー ライブラリを指定して gcloud beta terraform vet を実行すると、違反があればその内容を返し、終了コードで CI を止められる。組織のポリシーは作成の時点で拒否する最後の守りで、こちらは CI で早めに気付くための仕組みと考えて組み合わせる。",
    points: [
      "plan の段階で規程に照らす → gcloud beta terraform vet とポリシー ライブラリ。",
      "terraform validate は構文の確認で、規程の確認ではない。",
    ],
  },
  {
    source: at(25, "2.4"),
    field: S2,
    answer: 3,
    text: "FY社は、自社のアプリケーションをまとめた Helm のチャートを、社外に公開せずに Google Cloud の中で保管し、GKE へのデプロイのときにそこから取り出したい。最も適切な保管先はどれか。",
    choices: [
      {
        text: "Cloud Storage のバケットを一般公開し、Helm のリポジトリとして使う。",
        note: "社外に公開しないという要件に反する。",
      },
      {
        text: "Artifact Registry の Python 形式のリポジトリに置く。",
        note: "Python のパッケージのための形式で、Helm のチャートは置けない。",
      },
      {
        text: "Container Registry（gcr.io）に置く。",
        note: "Container Registry は提供が終わり、Artifact Registry に置き換わっている。",
      },
      {
        text: "Artifact Registry の Docker 形式のリポジトリに、helm push で OCI の形式（oci://asia-northeast1-docker.pkg.dev/プロジェクト/リポジトリ）として置く。",
        note: "Helm 3 のチャートは OCI の形式で Artifact Registry に保管でき、IAM でアクセスを制御できる。これが正解。",
      },
    ],
    explain:
      "Artifact Registry は、コンテナ イメージのほか、Helm のチャート、言語のパッケージ（Maven、npm、Python など）、OS のパッケージなどを保管するサービスである。Helm 3 のチャートは OCI の形式に対応しているので、Docker 形式のリポジトリに helm push で置き、helm install などで oci:// の URL を指定して取り出せる。アクセスは IAM で制御し、デプロイする側には Artifact Registry 読み取りのロールを付与する。",
    points: [
      "Helm のチャートの非公開の保管 → Artifact Registry の Docker 形式のリポジトリ（OCI）。",
      "Container Registry の後継は Artifact Registry。",
    ],
  },
  // ───────── セクション3 運用（問26〜問40） ─────────
  {
    source: at(26, "3.1"),
    field: S3,
    answer: [0, 2],
    text: "FZ社の開発者は、夜間に使わない開発用の VM の費用を抑えたい。止める方法として「停止（stop）」と「一時停止（suspend）」を比べている。正しい説明はどれか。2つ選べ。",
    choices: [
      {
        text: "停止した VM では、vCPU とメモリの料金はかからない。ただし、永続ディスクや予約した静的外部 IP アドレスの料金はかかり続ける。",
        note: "停止の間に払うのは、ディスクやアドレスなど、残しているものの料金である。これが正解。",
      },
      {
        text: "停止すると、メモリの内容が保存され、起動すると、アプリケーションは止めた時点の状態から続きを始める。",
        note: "これは一時停止の動きである。停止ではメモリの内容は失われ、起動すると OS の起動からやり直す。",
      },
      {
        text: "一時停止すると、メモリの内容とデバイスの状態が保存され、再開（resume）すると OS を起動し直さずに続きから使える。保存した状態の保管には料金がかかる。",
        note: "開いていたアプリケーションや作業の状態をそのまま残せる。保存したメモリの内容の分の料金がかかる。これが正解。",
      },
      {
        text: "一時停止の間も、vCPU とメモリの料金は動いているときと同じようにかかる。",
        note: "一時停止の間は vCPU とメモリの料金はかからない。かかるのは、保存した状態やディスクなどの料金である。",
      },
    ],
    explain:
      "Compute Engine の VM を使わない間に止める方法には、停止と一時停止がある。停止（gcloud compute instances stop）は OS をシャットダウンし、メモリの内容は失われる。起動すると OS の起動から始まる。一時停止（gcloud compute instances suspend）は、メモリの内容とデバイスの状態を保存して止め、再開（resume）すると止めた時点から続けられる。どちらも止めている間は vCPU とメモリの料金はかからず、ディスクや静的 IP アドレス、一時停止では保存した状態の保管の料金がかかる。一時停止は、ゲスト OS やマシンタイプなどの条件を満たす VM で使える。",
    points: [
      "停止: メモリの内容は失われ、起動は OS から。vCPU とメモリの料金はかからない。",
      "一時停止: メモリの内容を保存し、再開すると続きから使える。保存した状態の料金がかかる。",
    ],
  },
  {
    source: at(27, "3.1"),
    field: S3,
    answer: 0,
    text: "GA社の GKE Standard のクラスタには、e2-standard-4 のノードプールが 1 つだけある。機械学習チームは、ときどき GPU や大きなメモリが必要なジョブを動かすが、そのためのノードプールを常に用意しておくのは費用がもったいない。必要なときに合うノードが自動で用意され、使わなくなったら片付くようにしたい。最も適切な設定はどれか。",
    choices: [
      {
        text: "クラスタでノードの自動プロビジョニングを有効にし、クラスタ全体で使ってよい CPU、メモリ、GPU の上限を設定する。",
        note: "Pod の要求に合うマシンタイプのノードプールを自動で作り、使われなくなったら削除する。これが正解。",
      },
      {
        text: "今の e2-standard-4 のノードプールで、クラスタ オートスケーラを有効にする。",
        note: "既存のノードプールのノードの数を増減するだけで、GPU や大きなメモリのノードは用意されない。",
      },
      {
        text: "GPU 付きのノードと、メモリの大きいノードのノードプールを作り、それぞれ常に 2 台ずつ動かしておく。",
        note: "動かすことはできるが、使わない間もノードの費用がかかり続ける。",
      },
      {
        text: "機械学習のジョブに、水平 Pod 自動スケーリング（HPA）を設定する。",
        note: "Pod の数を増減する仕組みで、Pod の要求に合うノードを用意するものではない。",
      },
    ],
    explain:
      "GKE のクラスタ オートスケーラは、既存のノードプールのノードの数を増減する。ノードの自動プロビジョニングを有効にすると、さらに、スケジュールできない Pod の要求（CPU、メモリ、GPU、ノードの選択の条件など）に合うノードプールを自動で作り、使われなくなったノードプールを削除する。クラスタ全体で使ってよいリソースの上限（--max-cpu、--max-memory、GPU の種類と数）を決めて、費用が膨らみすぎないようにする。ノードの管理そのものを任せたいなら、Autopilot のクラスタを使う選択肢もある。",
    points: [
      "要求に合うノードプールを自動で作って消す → ノードの自動プロビジョニング。",
      "クラスタ オートスケーラは、既存のノードプールの台数を増減する。",
    ],
  },
  {
    source: at(28, "3.1"),
    field: S3,
    answer: 2,
    text: "GB社は、GKE のクラスタの名前空間 shop で動くアプリケーションを守りたい。Deployment、ConfigMap、Secret などの Kubernetes のリソースと、永続ボリュームのデータを毎日まとめてバックアップし、災害のときは別のリージョンのクラスタに戻せるようにしたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "永続ボリュームのディスクに、スナップショットのスケジュールを設定する。",
        note: "ボリュームのデータは守れるが、Deployment や Secret などの Kubernetes のリソースの定義は残らない。",
      },
      {
        text: "kubectl get all -n shop -o yaml の結果を、毎日 Git に保存する。",
        note: "定義の一部は残るが、all には ConfigMap や Secret などは含まれず、ボリュームのデータも含まれない。",
      },
      {
        text: "Backup for GKE でバックアップ プランを作り、名前空間 shop のリソースとボリュームのデータを毎日取得する。災害のときは、復元プランで別のクラスタへ戻す。",
        note: "Kubernetes のリソースとボリュームのデータをまとめて取得し、別のクラスタにも復元できる。これが正解。",
      },
      {
        text: "ノードプールで、ノードの自動修復を有効にする。",
        note: "不調なノードを作り直す機能で、データやリソースのバックアップにはならない。",
      },
    ],
    explain:
      "Backup for GKE は、GKE のクラスタのワークロードをバックアップし、復元するマネージド サービスである。バックアップ プランで、対象（クラスタ全体、名前空間、アプリケーション）、スケジュール、保持期間を決めると、Kubernetes のリソースの定義と、永続ボリュームのデータ（ディスクのスナップショット）をまとめて取得する。復元プランを使えば、同じクラスタにも別のクラスタ（別のリージョンを含む）にも戻せる。ディスクのスナップショットだけでは、アプリケーションを動かすための定義が残らない。",
    points: [
      "GKE のリソースとボリュームのデータをまとめてバックアップ → Backup for GKE。",
      "ディスクのスナップショットだけでは、Kubernetes のリソースの定義は残らない。",
    ],
  },
  {
    source: at(29, "3.1"),
    field: S3,
    answer: 3,
    text: "GC社は、GKE のクラスタで web と api の 2 つの Service を動かしている。1 つの外部 IP アドレスと HTTPS で受け、URL のパスが /api/ で始まる要求は api に、それ以外は web に振り分けたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "2 つの Service をそれぞれ type: LoadBalancer にする。",
        note: "Service ごとに別の外部 IP アドレスの L4 のロードバランサができ、パスでの振り分けや HTTPS の終端はできない。",
      },
      {
        text: "2 つの Service を type: NodePort にし、ノードの外部 IP アドレスを利用者に知らせる。",
        note: "ノードの増減でアドレスが変わり、HTTPS の終端やパスでの振り分けもできない。",
      },
      {
        text: "2 つの Service を type: ClusterIP にする。",
        note: "クラスタの中からしか届かず、外部から受けられない。",
      },
      {
        text: "Ingress を作り、/api/ で始まるパスを api の Service へ、それ以外を web の Service へ送るルールを書く。",
        note: "GKE が外部アプリケーション ロードバランサを作り、1 つの IP アドレスと HTTPS でパスごとに振り分ける。これが正解。",
      },
    ],
    explain:
      "GKE で HTTP（S）の要求を URL のパスやホスト名で複数の Service に振り分けるには、Ingress（または Gateway API の Gateway と HTTPRoute）を使う。GKE は Ingress の定義から外部アプリケーション ロードバランサを作り、1 つの IP アドレスで受けて、ルールに従ってバックエンドの Service へ送る。証明書を設定すれば HTTPS も終端できる。type: LoadBalancer の Service は、Service ごとに L4 のロードバランサを作るもので、パスでの振り分けはできない。",
    points: [
      "1 つの IP でパスごとに複数の Service へ → Ingress（または Gateway API）。",
      "type: LoadBalancer は Service ごとの L4 のロードバランサ。",
    ],
  },
  {
    source: at(30, "3.1"),
    field: S3,
    answer: 1,
    text: "GD社の開発者は、GKE のクラスタで動く Pod の管理画面（ポート 9090）を、調査のために一時的に自分の PC のブラウザで開きたい。管理画面は外部に公開したくない。最も適切な方法はどれか。",
    choices: [
      {
        text: "Service を type: LoadBalancer に変えて、外部 IP アドレスで接続する。",
        note: "管理画面がインターネットに公開されてしまう。",
      },
      {
        text: "kubectl port-forward で、手元のポートから Pod の 9090 へ転送し、手元のブラウザで localhost のそのポートを開く。",
        note: "kubectl の認証を通した一時的な転送で、外部に公開せずに接続できる。これが正解。",
      },
      {
        text: "kubectl logs で Pod のログを見る。",
        note: "ログを見るだけで、管理画面には接続できない。",
      },
      {
        text: "kubectl expose で、type: NodePort の Service を作る。",
        note: "ノードのポートで公開されることになり、ファイアウォールの設定によっては外部から届いてしまう。",
      },
    ],
    explain:
      "kubectl port-forward は、手元の PC のポートへの接続を、Kubernetes の API サーバーを通して Pod（や Service）のポートへ転送する。例えば kubectl port-forward pod/admin-7d9f 9090:9090 を実行すると、手元の localhost:9090 で Pod の管理画面を開ける。転送は kubectl を動かしている間だけで、kubectl の認証と権限を通るので、Service を作り替えて公開する必要が無い。調査や一時的な確認に向き、常に使う入口には向かない。",
    points: [
      "公開せずに一時的に Pod のポートへ接続 → kubectl port-forward。",
      "Service の種類を変えると、外部に公開されうる。",
    ],
  },
  {
    source: at(31, "3.2"),
    field: S3,
    answer: 0,
    text: "GE社の BigQuery のテーブル events は、event_date の列で日ごとにパーティション分割されている。クエリは必要な列だけを選び、ほぼ必ず WHERE event_date = '2026-11-01' AND customer_id = 'C123' のように日付と顧客で絞っているが、毎回その日のパーティション全体を読んでいる。読み込む量を減らすための最も適切な対処はどれか。",
    choices: [
      {
        text: "テーブルを customer_id でクラスタ化する。",
        note: "パーティションの中で customer_id の値ごとにデータがまとまり、絞り込んだ顧客のブロックだけを読むようになる。これが正解。",
      },
      {
        text: "テーブルを customer_id でもパーティション分割する。",
        note: "パーティション分割に使える列は 1 つだけで、日付と同時に customer_id で分割することはできない。値の種類の多い列も分割に向かない。",
      },
      {
        text: "クエリに LIMIT 100 を付ける。",
        note: "返す行の数が減るだけで、読み込む量は通常減らない。",
      },
      {
        text: "顧客ごとに別のテーブルに分ける。",
        note: "テーブルの数が増えて、管理もクエリも煩雑になる。同じ効果はクラスタ化で得られる。",
      },
    ],
    explain:
      "BigQuery のクラスタ化は、指定した列（最大 4 つ）の値でテーブルのデータを並べてまとめておく機能で、パーティション分割と組み合わせて使える。クラスタ化した列で絞り込むと、BigQuery は条件に合わないブロックを読み飛ばすので、読み込む量と料金が減る。パーティション分割は 1 つの列（日付や整数の範囲など）でテーブルを分けるもので、日付で分けたうえで、よく絞り込む値の種類の多い列でクラスタ化するのが定番の形である。ドライランの見積もりには、クラスタ化による削減は反映されないことがある。",
    points: [
      "パーティションの中でさらに絞る → よく絞り込む列でクラスタ化する。",
      "パーティション分割の列は 1 つだけ。",
    ],
  },
  {
    source: at(32, "3.2"),
    field: S3,
    answer: 2,
    text: "GF社では、数分ごとに更新されるダッシュボードが、大きな売上のテーブル sales に対して、店舗ごとの日別の売上の集計を繰り返し実行している。sales には常に新しい行が追記されている。集計の費用と時間を抑えつつ、常に最新のデータを反映したい。最も適切な方法はどれか。",
    choices: [
      {
        text: "集計のクエリを論理ビューにして、ダッシュボードからはそのビューを読む。",
        note: "論理ビューは読むたびに元のクエリを実行するので、読み込む量は変わらない。",
      },
      {
        text: "クエリの結果のキャッシュに任せる。",
        note: "参照するテーブルに追記があるとキャッシュは使われないので、常に追記されるこのテーブルでは効果が無い。",
      },
      {
        text: "集計のマテリアライズド ビューを作り、ダッシュボードからはそのビューを読む。",
        note: "集計の結果を保持し、追記された分を差分で反映するので、少ない読み込みで最新の結果を返せる。これが正解。",
      },
      {
        text: "スケジュールされたクエリで、1 時間ごとに集計のテーブルを作り直す。",
        note: "実行と実行の間に追記されたデータは反映されず、常に最新という要件に合わない。",
      },
    ],
    explain:
      "BigQuery のマテリアライズド ビューは、集計などのクエリの結果をあらかじめ計算して保持し、元のテーブルの変更に合わせてバックグラウンドで更新する。読むときは、保持している結果に、まだ反映していない差分を組み合わせて返すので、常に最新の結果を、元のテーブル全体を読むより少ない量で得られる。元のテーブルに対するクエリを、BigQuery が自動でマテリアライズド ビューを使うように書き換えることもある。論理ビューは保存したクエリにすぎず、読むたびに全体を計算する。",
    points: [
      "繰り返す集計を最新のまま安く → マテリアライズド ビュー。",
      "論理ビューは読むたびに元のクエリを実行する。",
    ],
  },
  {
    source: at(33, "3.2"),
    field: S3,
    answer: 3,
    text: "GG社は BigQuery をオンデマンドの料金（読み込んだ量に応じた課金）で使っているが、分析の量によって月々の費用が大きく変わり、予算を立てにくい。費用を一定の範囲に収めたいが、上限を超えたときにクエリを失敗させたくはない。最も適切な方法はどれか。",
    choices: [
      {
        text: "カスタムの割り当てで、プロジェクトが 1 日に処理できる量に上限を設ける。",
        note: "上限に達するとクエリが失敗するので、クエリを失敗させたくないという要件に合わない。",
      },
      {
        text: "予算とアラートを設定する。",
        note: "使った額を知らせるだけで、費用を一定の範囲に収める仕組みではない。",
      },
      {
        text: "すべてのクエリで、課金されるバイト数の上限（maximum_bytes_billed）を指定する。",
        note: "上限を超えるクエリは失敗する。月々の費用を一定にすることにもならない。",
      },
      {
        text: "BigQuery エディションの容量ベースの料金に切り替え、予約（reservation）でスロットの量（基準と自動スケーリングの上限）を決めて、プロジェクトを割り当てる。",
        note: "費用は使うスロットの量で決まり、上限を超える分のクエリは失敗せずに待たされる。これが正解。",
      },
    ],
    explain:
      "BigQuery の計算の料金には、読み込んだバイト数に応じたオンデマンドの料金と、使った計算の量（スロット）に応じた容量ベースの料金（BigQuery エディション）がある。容量ベースでは、予約を作って基準のスロットと自動スケーリングの上限を決め、プロジェクトやフォルダを割り当てる。費用はスロットの量で決まるので上限が見え、上限まで使っているときのクエリは失敗せずに順番を待つ。長く使う見込みがあれば、確約（コミットメント）で単価を下げられる。割り当てや maximum_bytes_billed は、超えたときにクエリを止める仕組みである。",
    points: [
      "費用を一定にしつつクエリは止めない → BigQuery エディションの予約（スロット）。",
      "割り当てや maximum_bytes_billed は、超えたクエリを失敗させる。",
    ],
  },
  {
    source: at(34, "3.2"),
    field: S3,
    answer: 1,
    text: "GH社のバケット contracts には、保持期間 1 年の保持ポリシーが設定されている。いくつかの契約書のファイルが社内の調査の対象になり、調査が終わるまでは消されないようにしたい。中には作成から 1 年を過ぎたものもある。調査が終わったら、ほかのファイルと同じようにすぐ削除できる状態に戻したい。最も適切な方法はどれか。",
    choices: [
      {
        text: "バケットの保持ポリシーの期間を 5 年に延ばす。",
        note: "バケットのすべてのオブジェクトに効き、調査に関係の無いファイルまで消せなくなる。",
      },
      {
        text: "対象のオブジェクトに一時的な保持（temporary hold）を設定し、調査が終わったら外す。",
        note: "保持を設定している間は削除も上書きもできず、外せば元の扱いに戻る。これが正解。",
      },
      {
        text: "対象のオブジェクトにイベントベースの保持を設定し、調査が終わったら外す。",
        note: "外した時点から保持ポリシーの期間を数え直すので、調査が終わってもさらに 1 年は削除できない。",
      },
      {
        text: "バケットの保持ポリシーをロックする。",
        note: "ロックは取り消せず、期間を縮められなくなる。対象のファイルに絞ることもできない。",
      },
    ],
    explain:
      "Cloud Storage のオブジェクトの保持（ホールド）には、一時的な保持とイベントベースの保持がある。どちらも、設定している間はオブジェクトの削除や上書きができない（ライフサイクルのルールでも消されない）。一時的な保持は外せば元の扱いに戻り、保持ポリシーの期間はオブジェクトの作成の時点から数えたままになる。イベントベースの保持は、外した時点から保持ポリシーの期間を数え始めるので、契約の終了などの出来事を起点に保管したいときに使う。gcloud storage objects update の --temporary-hold や --event-based-hold で設定する。",
    points: [
      "特定のオブジェクトを一時的に消させない → 一時的な保持（temporary hold）。",
      "イベントベースの保持は、外した時点から保持期間を数える。",
    ],
  },
  {
    source: at(35, "3.2"),
    field: S3,
    answer: [1, 3],
    text: "GI社の分析チームは、BigQuery の大きなテーブル sales について、次の 2 つのことをしたい。それぞれに合う方法はどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "要望A: 大規模な UPDATE を実行する前に、今の時点の内容を読み取り専用で 30 日間残しておきたい。保存の費用はできるだけ抑えたい",
          "要望B: 分析者が自由に行を書き換えて試せる複製を作りたい。元のテーブルとの差分の分だけ保存の費用を払いたい",
        ],
      },
    },
    choices: [
      {
        text: "CREATE TABLE AS SELECT で、sales の全行を新しいテーブルにコピーする。",
        note: "全行を持つ別のテーブルになり、全体の分の保存の費用がかかる。",
      },
      {
        text: "テーブルのスナップショットを作り、有効期限を 30 日にする。",
        note: "読み取り専用の時点の写しで、元のテーブルとの差分の分だけ保存の費用がかかる。要望A に合う。これが正解。",
      },
      {
        text: "bq extract で sales を Cloud Storage のファイルに書き出す。",
        note: "ファイルとして残るだけで、テーブルとして読むには読み込み直しが要る。書き換えて試す用途にも向かない。",
      },
      {
        text: "テーブルのクローンを作る。",
        note: "書き込みのできる複製で、元のテーブルとの差分の分だけ保存の費用がかかる。要望B に合う。これが正解。",
      },
    ],
    explain:
      "BigQuery のテーブルのスナップショットは、ある時点のテーブルの内容を読み取り専用で残すもので、有効期限を付けられる。保存の費用は、元のテーブルとの差分の分だけかかる。テーブルのクローンは、書き込みのできる複製で、クローンで変えた分と、元のテーブルで変わった分の差分だけが課金される。どちらも全行をコピーするより安い。直近の 7 日以内であれば、タイムトラベル（FOR SYSTEM_TIME AS OF）で過去の時点を読むこともできるが、それより長く残すならスナップショットを作る。",
    points: [
      "読み取り専用の時点の写し → テーブルのスナップショット。",
      "書き換えて試せる安い複製 → テーブルのクローン。",
    ],
  },
  {
    source: at(36, "3.3"),
    field: S3,
    answer: 2,
    text: "GJ社は、外部のレジストラで gj-shop.example のドメインを取得し、Cloud DNS に同じ名前の公開ゾーンを作って A レコードを登録した。しかし、インターネットから www.gj-shop.example の名前解決ができない。最も可能性が高い原因への対処はどれか。",
    choices: [
      {
        text: "A レコードの TTL を短くする。",
        note: "TTL はキャッシュしてよい期間で、ゾーンに問い合わせが来ていない問題は解決しない。",
      },
      {
        text: "ゾーンを限定公開ゾーンに作り直す。",
        note: "限定公開ゾーンは VPC の中からしか引けず、インターネットからは見えなくなる。",
      },
      {
        text: "レジストラで、ドメインのネームサーバーを、Cloud DNS のゾーンに割り当てられたネームサーバー（ゾーンの NS レコードに表示される ns-cloud-…）に変える。",
        note: "レジストラで委任先を Cloud DNS にしないと、インターネットからの問い合わせがこのゾーンに届かない。これが正解。",
      },
      {
        text: "ゾーンで DNSSEC を有効にする。",
        note: "応答の改ざんを防ぐ仕組みで、問い合わせがゾーンに届かない問題は解決しない。",
      },
    ],
    explain:
      "Cloud DNS に公開ゾーンを作っただけでは、インターネットの名前解決はそのゾーンに来ない。ドメインのネームサーバーはレジストラで登録されているので、そこを Cloud DNS のゾーンに割り当てられたネームサーバー（ゾーンの作成時に NS レコードとして示される ns-cloud-a1.googledomains.com のような名前）に変える必要がある。変更が広まるまでには時間がかかることがある。DNSSEC を使う場合は、ゾーンで有効にしてから、レジストラに DS レコードを登録する。",
    points: [
      "公開ゾーンを使うには、レジストラのネームサーバーを Cloud DNS のものに変える。",
      "ゾーンの NS レコードに、割り当てられたネームサーバーが示される。",
    ],
  },
  {
    source: at(37, "3.3"),
    field: S3,
    answer: 0,
    text: "GK社では、外部 IP アドレスを持たない VM が、Cloud NAT を通して外部の API を呼んでいる。ほとんどの VM の接続の数は少ないが、一部の VM だけが一時的に大量の接続を作り、そのときに接続が失敗する。Cloud NAT のログには、ポートが足りずに落とされた記録がある。VM に外部 IP アドレスを付けない方針は変えたくない。最も適切な対処はどれか。",
    choices: [
      {
        text: "Cloud NAT の動的ポート割り当てを有効にし、VM ごとの最小と最大のポート数を設定する。",
        note: "接続の多い VM には上限までポートを足し、少ない VM には少なく割り当てられる。これが正解。",
      },
      {
        text: "接続の多い VM にだけ外部 IP アドレスを付ける。",
        note: "VM に外部 IP アドレスを付けないという方針に反する。",
      },
      {
        text: "Cloud Router の BGP のセッションを増やす。",
        note: "経路の交換の設定で、Cloud NAT が VM に割り当てるポートの数とは関係が無い。",
      },
      {
        text: "下りの通信をすべて許可するファイアウォール ルールを作る。",
        note: "下りの通信は既定で許可されている。ポートが足りないことは解決しない。",
      },
    ],
    explain:
      "Cloud NAT は、NAT の IP アドレスの送信元ポートを VM ごとに割り当てて、外部への接続を変換する。既定の静的な割り当てでは、すべての VM に同じ数のポートが割り当てられるので、一部の VM だけが多くの接続を作るとその VM のポートが足りなくなり、接続が落とされる（Cloud NAT のログで確かめられる）。動的ポート割り当てを有効にすると、VM ごとの最小と最大の間で、使う量に応じてポートが増減する。全体のポートが足りないときは、NAT の IP アドレスを増やす。",
    points: [
      "VM ごとに接続の数がばらつく → Cloud NAT の動的ポート割り当て（最小と最大）。",
      "全体のポートが足りないときは、NAT の IP アドレスを増やす。",
    ],
  },
  {
    source: at(38, "3.4"),
    field: S3,
    answer: 3,
    text: "GL社のアプリケーションは、処理待ちの件数や決済にかかった時間を内部で計算している。これらの値を店舗の ID ごとに 1 分おきに Cloud Monitoring に送り、グラフとアラートに使いたい。値はログには出しておらず、ログに出すつもりも無い。最も適切な方法はどれか。",
    choices: [
      {
        text: "値をログに書き出し、ログベースの指標を作る。",
        note: "ログに出すつもりの無い値をわざわざログにする遠回りで、ログの取り込みの費用もかかる。",
      },
      {
        text: "アプリケーションの URL に対して稼働時間チェックを作る。",
        note: "外から応答を確かめるもので、アプリケーションの中で計算した値は取れない。",
      },
      {
        text: "Error Reporting を有効にする。",
        note: "アプリケーションの例外をまとめる道具で、数値の指標は扱わない。",
      },
      {
        text: "アプリケーションから OpenTelemetry（または Cloud Monitoring API）で、店舗の ID をラベルに持つユーザー定義の指標として送る。",
        note: "アプリケーションが計算した値を、ラベル付きの指標として直接送れる。これが正解。",
      },
    ],
    explain:
      "Google Cloud が自動で集める指標（システムの指標）に無い値は、ユーザー定義の指標（カスタム指標）として送れる。アプリケーションに OpenTelemetry の SDK を入れて Cloud Monitoring へ送るか、Cloud Monitoring API で時系列のデータを書き込む。ラベルを付ければ、店舗ごとなどの単位でグラフやアラートを分けられる。ログに出ている出来事を数えるならログベースの指標、外からの死活監視なら稼働時間チェック、と元のデータのある場所で使い分ける。ユーザー定義の指標は、取り込んだ量に応じて課金される。",
    points: [
      "アプリケーションが計算した値 → OpenTelemetry や Monitoring API でユーザー定義の指標として送る。",
      "ログに出ている出来事を数える → ログベースの指標。",
    ],
  },
  {
    source: at(39, "3.4"),
    field: S3,
    answer: 1,
    text: "GM社の EC サイトでは、トップページに稼働時間チェックを設定している。しかし先日、トップページは応答していたのに、ログインのあと商品をカートに入れる操作が失敗しており、しばらく気付かなかった。ログインからカートに入れるまでの一連の操作を定期的に外から試し、どこかで失敗したら知らせたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "稼働時間チェックで確かめる URL を、ログインのページとカートのページにも増やす。",
        note: "個々の URL の応答は確かめられるが、ログインして続けて操作するという手順はたどれない。",
      },
      {
        text: "Cloud Monitoring の合成モニター（synthetic monitor）を作り、一連の操作をたどるテストのスクリプトを定期的に実行させて、失敗したらアラートを出す。",
        note: "スクリプトで手順を順にたどり、どの段階で失敗したかまで記録できる。これが正解。",
      },
      {
        text: "Cloud Trace で、遅い区間を調べる。",
        note: "実際の要求の経路と時間を見る道具で、定期的に手順を試すものではない。",
      },
      {
        text: "Cloud Logging で、エラーのログが出たら知らせるアラートを作る。",
        note: "実際の利用者が失敗してから気付く方法で、利用者の少ない時間帯は気付きにくい。",
      },
    ],
    explain:
      "Cloud Monitoring の合成モニターは、テストのスクリプト（Node.js で書き、Cloud Run functions で動く）を決まった間隔で実行し、結果を記録する仕組みである。ログインしてから商品を選び、カートに入れる、といった一連の操作をたどって、どの段階で失敗したかや時間を確かめられる。失敗したらアラート ポリシーで知らせる。稼働時間チェックは 1 つの URL の応答を確かめる軽い死活監視で、複数の手順をたどる確認には合成モニターを使う。",
    points: [
      "一連の操作を定期的に外から試す → 合成モニター。",
      "稼働時間チェックは、1 つの URL の応答の確認。",
    ],
  },
  {
    source: at(40, "3.4"),
    field: S3,
    answer: 2,
    text: "GN社は金融機関で、監督官庁から「Google の担当者が自社のデータにアクセスしたときは、その記録と理由を確かめられるようにすること」を求められている。最も適切な方法はどれか。",
    choices: [
      {
        text: "データアクセス監査ログを有効にする。",
        note: "自社のユーザーやサービス アカウントがデータを読んだり書いたりした記録で、Google の担当者のアクセスは記録されない。",
      },
      {
        text: "Access Approval を有効にする。",
        note: "Google の担当者がアクセスする前に承認を求める仕組みで、要件は記録と理由を確かめることにある。Access Approval を使う場合も、Access Transparency が前提になる。",
      },
      {
        text: "組織で Access Transparency を有効にし、Google の担当者のアクセスの記録を Cloud Logging で確かめる。",
        note: "Google の担当者が顧客のコンテンツにアクセスしたときに、その内容と理由がログに残る。これが正解。",
      },
      {
        text: "管理アクティビティ監査ログを確かめる。",
        note: "自社のプリンシパルによる設定の変更の記録で、Google の担当者のアクセスは含まれない。",
      },
    ],
    explain:
      "Access Transparency のログは、Google の担当者（サポートやエンジニア）が顧客のコンテンツにアクセスしたときに、いつ、何に、どんな理由（顧客が開いたサポートのケースなど）でアクセスしたかを記録するもので、Cloud Logging で確かめられる。組織の単位で有効にする。Cloud Audit Logs が記録するのは、自社のプリンシパルの操作である。さらに、アクセスの前に自社の承認を求めたいときは Access Approval を使い、こちらは Access Transparency を有効にしていることが前提になる。",
    points: [
      "Google の担当者のアクセスの記録と理由 → Access Transparency。",
      "アクセスの前に承認を求める → Access Approval。",
    ],
  },
  // ───────── セクション4 アクセスとセキュリティ（問41〜問50） ─────────
  {
    source: at(41, "4.1"),
    field: S4,
    answer: 3,
    text: "GO社では、Cloud KMS の鍵の作成・ローテーション・無効化はセキュリティ チームが担当し、データの暗号化と復号はアプリケーションのサービス アカウント app-sa が行う。セキュリティ チームには鍵でデータを復号させず、app-sa には鍵の管理をさせたくない。最も適切なロールの付け方はどれか。",
    choices: [
      {
        text: "セキュリティ チームと app-sa の両方に、Cloud KMS 管理者（roles/cloudkms.admin）を付与する。",
        note: "app-sa に鍵の管理を許してしまう。しかも管理者のロールには暗号化と復号の権限が無いので、app-sa の処理も動かない。",
      },
      {
        text: "セキュリティ チームと app-sa の両方に、プロジェクトのオーナーを付与する。",
        note: "どちらにも、要件よりはるかに広い権限を与えることになる。",
      },
      {
        text: "セキュリティ チームに Cloud KMS 暗号鍵の暗号化 / 復号を、app-sa に Cloud KMS 管理者を付与する。",
        note: "役割が逆になっている。セキュリティ チームが復号でき、app-sa が鍵を管理できてしまう。",
      },
      {
        text: "セキュリティ チームに Cloud KMS 管理者（roles/cloudkms.admin）を、app-sa に Cloud KMS 暗号鍵の暗号化 / 復号（roles/cloudkms.cryptoKeyEncrypterDecrypter）を、鍵（またはキーリング）の単位で付与する。",
        note: "管理者のロールには暗号化と復号の権限が含まれず、暗号化 / 復号のロールには管理の権限が含まれない。これが正解。",
      },
    ],
    explain:
      "Cloud KMS の事前定義ロールは、鍵を管理する権限と、鍵を使う権限が分かれている。Cloud KMS 管理者は、鍵の作成、ローテーション、無効化や破棄などの管理ができるが、鍵でデータを暗号化・復号する権限は含まない。Cloud KMS 暗号鍵の暗号化 / 復号は、鍵を使う権限だけを持ち、鍵の設定は変えられない（暗号化だけ、復号だけのロールもある）。こうして、鍵を管理する人がデータを読めず、データを扱う処理が鍵を変えられない、という職務の分離ができる。",
    points: [
      "鍵の管理 → Cloud KMS 管理者（暗号化と復号の権限は含まない）。",
      "鍵を使う → Cloud KMS 暗号鍵の暗号化 / 復号。",
    ],
  },
  {
    source: at(42, "4.1"),
    field: S4,
    answer: 0,
    text: "GP社のアプリケーション開発者は、プロジェクトのすべての GKE クラスタで、Deployment や Service などの Kubernetes のオブジェクトを作成・変更・削除する必要がある。ただし、クラスタやノードプールの作成・削除・設定の変更はさせたくない。IAM で付与するロールとして最も適切なものはどれか。",
    choices: [
      {
        text: "Kubernetes Engine デベロッパー（roles/container.developer）",
        note: "クラスタの中の Kubernetes のオブジェクトを扱えるが、クラスタやノードプールの管理はできない。これが正解。",
      },
      {
        text: "Kubernetes Engine 管理者（roles/container.admin）",
        note: "クラスタやノードプールの作成・削除まで含む、すべての操作ができる。要件より広い。",
      },
      {
        text: "Kubernetes Engine クラスタ管理者（roles/container.clusterAdmin）",
        note: "クラスタやノードプールの管理のためのロールで、クラスタの中の Kubernetes のオブジェクトを扱う権限は含まない。要件と逆である。",
      },
      {
        text: "Kubernetes Engine 閲覧者（roles/container.viewer）",
        note: "読み取りだけで、オブジェクトの作成や変更はできない。",
      },
    ],
    explain:
      "GKE の IAM の事前定義ロールは、クラスタそのもの（Google Cloud のリソース）を管理する権限と、クラスタの中の Kubernetes のオブジェクトを扱う権限の組み合わせで分かれている。Kubernetes Engine デベロッパーは、クラスタの中のオブジェクトを作成・変更・削除できるが、クラスタやノードプールの管理はできない。クラスタ管理者はその逆で、クラスタとノードプールを管理できるが、中のオブジェクトは扱えない。管理者は両方ができる。名前空間ごとに細かく分けたいときは、IAM ではなく Kubernetes の RBAC を使う。",
    points: [
      "クラスタの中のオブジェクトだけを扱う → Kubernetes Engine デベロッパー。",
      "クラスタとノードプールの管理だけ → Kubernetes Engine クラスタ管理者。",
    ],
  },
  {
    source: at(43, "4.1"),
    field: S4,
    answer: [1, 2],
    text: "GQ社では、Artifact Registry のリポジトリ app-images について、次の 2 つの権限を付けたい。それぞれに合うロールはどれか（どちらもリポジトリの単位で付与する）。2つ選べ。",
    stem: {
      list: {
        items: [
          "要件A: CI のサービス アカウントに、新しいイメージを push させ、既存のイメージを pull させたい",
          "要件B: リリース担当者に、古いイメージやタグを削除させたい。ただし、リポジトリ自体の作成や削除はさせない",
        ],
      },
    },
    choices: [
      {
        text: "Artifact Registry 読み取り（roles/artifactregistry.reader）",
        note: "pull などの読み取りだけで、push や削除はできない。",
      },
      {
        text: "Artifact Registry 書き込み（roles/artifactregistry.writer）",
        note: "読み取りに加えて、アーティファクトの push ができる。要件A に合う。これが正解。",
      },
      {
        text: "Artifact Registry リポジトリ管理者（roles/artifactregistry.repoAdmin）",
        note: "リポジトリの中のアーティファクトやタグの削除まで管理できるが、リポジトリ自体の作成や削除はできない。要件B に合う。これが正解。",
      },
      {
        text: "Artifact Registry 管理者（roles/artifactregistry.admin）",
        note: "リポジトリの作成・削除や IAM ポリシーの変更まで含み、要件B には広すぎる。",
      },
    ],
    explain:
      "Artifact Registry の事前定義ロールは、扱える範囲が段階的に広がる。読み取りは pull などの読み取り、書き込みはそれに加えて push、リポジトリ管理者はさらにアーティファクトやタグの削除を含む管理、管理者はリポジトリの作成・削除や IAM ポリシーの変更まで含む。リポジトリの単位で付与すれば、対象のリポジトリだけに絞れる。古いイメージの削除を人の作業ではなく自動にしたいなら、クリーンアップ ポリシーを使う方法もある。",
    points: [
      "push と pull → Artifact Registry 書き込み。",
      "アーティファクトの削除まで（リポジトリの作成・削除は除く） → リポジトリ管理者。",
    ],
  },
  {
    source: at(44, "4.1"),
    field: S4,
    answer: 1,
    text: "GR社では、Cloud SQL for PostgreSQL に、社員が共有のユーザー名とパスワードでログインしている。今後は、社員の Google アカウントでデータベースにログインさせ、退職して Google アカウントが無効になれば、自動的にログインできなくなるようにしたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "パスワードを Secret Manager に保管し、社員にはシークレットの読み取りを許可する。",
        note: "保管の場所が変わるだけで、共有のパスワードでログインすることは変わらない。",
      },
      {
        text: "インスタンスで IAM データベース認証を有効にし、社員を IAM のユーザーとしてデータベースに追加する。社員には Cloud SQL インスタンス ユーザーのロールを付与し、データベースの中の権限は GRANT で与える。",
        note: "Google アカウントの認証でログインでき、アカウントが無効になればログインもできなくなる。これが正解。",
      },
      {
        text: "承認済みネットワークに、社員の PC の IP アドレスを登録する。",
        note: "接続できる送信元を絞るだけで、だれとしてログインするかは変わらない。",
      },
      {
        text: "Cloud SQL Auth Proxy を使わせるだけにする。",
        note: "Auth Proxy は接続の経路を IAM で認可して暗号化するが、それだけではデータベースへのログインは従来のユーザー名とパスワードのままである。",
      },
    ],
    explain:
      "Cloud SQL の IAM データベース認証を使うと、データベースのパスワードの代わりに、Google のアカウントやサービス アカウントの認証でログインできる。インスタンスでフラグ（PostgreSQL では cloudsql.iam_authentication）を有効にし、gcloud sql users create で --type=cloud_iam_user（グループなら cloud_iam_group）を付けて IAM のユーザーを追加する。ログインする人には Cloud SQL インスタンス ユーザー（roles/cloudsql.instanceUser）が要り、テーブルなどの権限はデータベースの中で GRANT で与える。アカウントが無効になれば、データベースにもログインできなくなる。",
    points: [
      "Google アカウントでデータベースにログイン → Cloud SQL の IAM データベース認証。",
      "ログインには roles/cloudsql.instanceUser、データベースの中の権限は GRANT。",
    ],
  },
  {
    source: at(45, "4.1"),
    field: S4,
    answer: 2,
    text: "GS社では、営業分析チームのリーダーに、BigQuery のデータセット sales_mart を任せたい。sales_mart のテーブルの作成・変更・削除に加え、sales_mart をだれが使えるかの設定（データセットのアクセス権）も変えられるようにしたい。ほかのデータセットには権限を与えない。最も適切な付与はどれか。",
    choices: [
      {
        text: "sales_mart で、BigQuery データ編集者（roles/bigquery.dataEditor）を付与する。",
        note: "テーブルの作成・変更・削除はできるが、データセットのアクセス権を変える権限は含まない。",
      },
      {
        text: "プロジェクトで、BigQuery 管理者（roles/bigquery.admin）を付与する。",
        note: "プロジェクトのすべてのデータセットとジョブを管理でき、ほかのデータセットには与えないという要件に反する。",
      },
      {
        text: "sales_mart で、BigQuery データ オーナー（roles/bigquery.dataOwner）を付与する。",
        note: "そのデータセットのテーブルの管理に加え、データセットのアクセス権も変えられる。これが正解。",
      },
      {
        text: "sales_mart で、BigQuery データ閲覧者（roles/bigquery.dataViewer）を付与する。",
        note: "読み取りだけで、テーブルの作成や変更はできない。",
      },
    ],
    explain:
      "BigQuery のデータのロールは、閲覧者（読み取り）、編集者（テーブルの作成・変更・削除）、オーナー（それに加えてデータセットのアクセス権の管理）と段階的に広がる。データセットの単位で付与すれば、そのデータセットだけに効く。データセットの管理を任せる相手には、データセットでデータ オーナーを付与する。BigQuery 管理者はプロジェクト全体のデータとジョブを扱える強いロールなので、特定のデータセットを任せるだけなら使わない。クエリを実行するには、別にジョブを作る権限（BigQuery ジョブユーザーなど）が要る。",
    points: [
      "データセットのアクセス権まで任せる → データセットで BigQuery データ オーナー。",
      "データ編集者は、データセットのアクセス権を変えられない。",
    ],
  },
  {
    source: at(46, "4.1"),
    field: S4,
    answer: [0, 3],
    text: "GT社では、Cloud Monitoring について次の 2 つの権限を付けたい。それぞれに合うロールはどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "要件A: SRE チームに、ダッシュボードやアラート ポリシー、稼働時間チェックを作成・変更させたい",
          "要件B: 企画部門の担当者には、ダッシュボードやグラフを見るだけにさせたい。ほかのサービスのリソースの中身は見せない",
        ],
      },
    },
    choices: [
      {
        text: "モニタリング編集者（roles/monitoring.editor）",
        note: "ダッシュボード、アラート ポリシー、稼働時間チェックなどの Cloud Monitoring の設定を作成・変更できる。要件A に合う。これが正解。",
      },
      {
        text: "ログ閲覧者（roles/logging.viewer）",
        note: "Cloud Logging のログを読むためのロールで、Cloud Monitoring のダッシュボードの閲覧や設定とは別である。",
      },
      {
        text: "閲覧者（roles/viewer）",
        note: "Cloud Monitoring は見られるが、プロジェクトのほとんどすべてのリソースを読み取れるので、要件B には広すぎる。",
      },
      {
        text: "モニタリング閲覧者（roles/monitoring.viewer）",
        note: "Cloud Monitoring のダッシュボードや指標を読み取るだけのロールで、ほかのサービスのリソースには及ばない。要件B に合う。これが正解。",
      },
    ],
    explain:
      "Cloud Monitoring には、サービスに限った事前定義ロールがある。モニタリング閲覧者は、指標、ダッシュボード、アラート ポリシーなどを読み取れる。モニタリング編集者は、それに加えてダッシュボード、アラート ポリシー、稼働時間チェック、通知チャネルなどを作成・変更できる。さらに細かく、アラート ポリシーだけ、ダッシュボードだけを扱うロールもある。基本ロールの閲覧者はプロジェクトのほぼすべてのリソースを読めるので、監視だけを見せたいときは、サービスに限ったロールを選ぶ。",
    points: [
      "監視の設定を作る → モニタリング編集者。見るだけ → モニタリング閲覧者。",
      "基本ロールの閲覧者は、ほぼすべてのリソースを読めてしまう。",
    ],
  },
  {
    source: at(47, "4.2"),
    field: S4,
    answer: 3,
    text: "GU社の Dataflow のジョブは、Cloud Storage のバケット gu-raw のファイルを読み、BigQuery のデータセット gu_dw に書き込む。今は Compute Engine のデフォルトのサービス アカウント（プロジェクトの編集者のロールが付いている）で動いている。最小権限の専用の ID で動かしたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "Dataflow のサービス エージェントに、gu-raw の読み取りと gu_dw の書き込みのロールを付与する。",
        note: "サービス エージェントはジョブの VM などを管理する Google 管理の ID で、データを読み書きするのはワーカーのサービス アカウントである。",
      },
      {
        text: "専用のサービス アカウントの鍵を作り、パイプラインのコードに埋め込む。",
        note: "鍵の漏えいの危険が増える。ワーカーのサービス アカウントを指定すれば、鍵は要らない。",
      },
      {
        text: "デフォルトのサービス アカウントのまま、ジョブを起動する担当者に BigQuery 管理者を付与する。",
        note: "ジョブのデータの読み書きは、起動した人ではなくワーカーのサービス アカウントの権限で行われる。編集者の広い権限も残ったままになる。",
      },
      {
        text: "専用のサービス アカウントを作り、Dataflow ワーカー（roles/dataflow.worker）と、gu-raw の読み取り・gu_dw の書き込みのロールだけを付与する。ジョブはそのサービス アカウントをワーカーのサービス アカウントに指定して起動する。",
        note: "ワーカーが専用の ID で動き、必要なデータだけを扱える。これが正解。",
      },
    ],
    explain:
      "Dataflow には 2 つの ID がかかわる。ジョブのワーカーの VM を作るなどの管理を行う Dataflow のサービス エージェント（Google 管理）と、ワーカーの VM の上でパイプラインを動かし、データを読み書きするワーカーのサービス アカウントである。ワーカーのサービス アカウントは、指定しなければ Compute Engine のデフォルトのサービス アカウントになる。専用のサービス アカウントを作り、Dataflow ワーカーのロールと、読み書きするデータへのロールだけを付与して、ジョブの起動時に指定する（gcloud dataflow jobs run の --service-account-email など）。起動する人には、そのサービス アカウントに対するサービス アカウント ユーザーのロールが要る。",
    points: [
      "Dataflow のデータの読み書きは、ワーカーのサービス アカウントの権限で行う。",
      "専用の SA に roles/dataflow.worker とデータのロールを付け、起動時に指定する。",
    ],
  },
  {
    source: at(48, "4.2"),
    field: S4,
    answer: 0,
    text: "GV社は、Cloud Storage のバケットにファイルが置かれたら、認証が必要な Cloud Run のサービス ingest（allUsers には公開していない）を Eventarc のトリガーで起動したい。トリガーには、専用のサービス アカウント trigger-sa を指定する。trigger-sa に付与するロールとして最も適切なものはどれか。",
    choices: [
      {
        text: "プロジェクトで Eventarc イベント受信者（roles/eventarc.eventReceiver）を、ingest で Cloud Run 起動元（roles/run.invoker）を付与する。",
        note: "trigger-sa がイベントを受け取り、その ID で ingest を呼び出せる。これが正解。",
      },
      {
        text: "プロジェクトで Eventarc 管理者（roles/eventarc.admin）だけを付与する。",
        note: "トリガーを作成・管理するためのロールで、Cloud Run のサービスを呼び出す権限は含まない。",
      },
      {
        text: "ingest で allUsers に Cloud Run 起動元を付与し、trigger-sa には何も付与しない。",
        note: "サービスをインターネットに公開することになり、認証が必要という要件に反する。",
      },
      {
        text: "トリガーを作成する担当者に、ingest の Cloud Run 起動元を付与する。",
        note: "イベントの配信は、作成した人ではなくトリガーのサービス アカウントの ID で行われる。",
      },
    ],
    explain:
      "Eventarc のトリガーでは、イベントを宛先に届けるときに、トリガーに指定したサービス アカウントの ID を使う。Cloud Storage などの Google Cloud のサービスから直接届くイベントを受けるには、そのサービス アカウントにプロジェクトで Eventarc イベント受信者のロールが要り、認証が必要な Cloud Run のサービスを呼び出すには、そのサービスで Cloud Run 起動元のロールが要る。Cloud Storage のイベントを使う場合は、別に、Cloud Storage のサービス エージェントに Pub/Sub パブリッシャーのロールが要る。トリガーを作る人には、trigger-sa に対するサービス アカウント ユーザーのロールが要る。",
    points: [
      "Eventarc のトリガーの SA → eventarc.eventReceiver と、宛先の run.invoker。",
      "イベントの配信は、トリガーに指定したサービス アカウントの ID で行われる。",
    ],
  },
  {
    source: at(49, "4.2"),
    field: S4,
    answer: 2,
    text: "GW社の Cloud Run のサービスは、サービス アカウント app-sa で動き、利用者にファイルを渡すための Cloud Storage の署名付き URL を作っている。セキュリティの方針でサービス アカウントの鍵は作れないため、クライアント ライブラリで IAM の署名の API（signBlob）を使って署名するようにしたが、iam.serviceAccounts.signBlob の権限が無いというエラーになった。最も適切な対処はどれか。",
    choices: [
      {
        text: "app-sa の鍵を作り、Secret Manager に保管して署名に使う。",
        note: "鍵を作れないという方針に反する。鍵を使わずに署名する方法がある。",
      },
      {
        text: "app-sa に、バケットでストレージ管理者（roles/storage.admin）を付与する。",
        note: "Cloud Storage のロールには、サービス アカウントとして署名する権限（signBlob）は含まれない。",
      },
      {
        text: "app-sa 自身に対して、app-sa にサービス アカウント トークン作成者（roles/iam.serviceAccountTokenCreator）を付与する。",
        note: "app-sa が自分の ID で署名の API を呼べるようになり、鍵なしで署名付き URL を作れる。これが正解。",
      },
      {
        text: "バケットを一般公開し、署名付き URL を使わないようにする。",
        note: "だれでもすべてのファイルを読めるようになり、利用者ごとに渡すという目的に合わない。",
      },
    ],
    explain:
      "署名付き URL は、サービス アカウントの秘密鍵で署名して作る。鍵ファイルを持たない環境（Cloud Run など）では、IAM Credentials API の signBlob を呼んで、Google にサービス アカウントとして署名してもらう。この API を呼ぶには iam.serviceAccounts.signBlob の権限が要り、これはサービス アカウント トークン作成者のロールに含まれる。自分自身として署名する場合でも、app-sa に対する付与（サービス アカウントのリソースへの付与）として、app-sa 自身にこのロールを付ける。URL で渡せる操作は、署名したサービス アカウントがバケットに対して持つ権限の範囲に限られる。",
    points: [
      "鍵なしで署名付き URL を作る → signBlob の権限（トークン作成者）を SA 自身に付ける。",
      "Cloud Storage のロールには、署名の権限は含まれない。",
    ],
  },
  {
    source: at(50, "4.2"),
    field: S4,
    answer: 1,
    text: "GX社のアプリケーションは AWS の EC2 で動き、Google Cloud のクライアント ライブラリ（アプリケーションのデフォルト認証情報）で Cloud Storage のファイルを読む。Workload Identity 連携のプールと AWS のプロバイダはすでに作り、その外部の ID にサービス アカウント gx-reader の権限借用を許可した。アプリケーションを動かす EC2 の側で行う設定として最も適切なものはどれか。",
    choices: [
      {
        text: "gx-reader の鍵を作って EC2 に置き、環境変数 GOOGLE_APPLICATION_CREDENTIALS でその鍵のファイルを指す。",
        note: "鍵を使わずに済ませるための Workload Identity 連携で、わざわざ長期間有効な鍵を作ることになる。",
      },
      {
        text: "gcloud iam workload-identity-pools create-cred-config で認証情報の構成ファイルを作って EC2 に置き、GOOGLE_APPLICATION_CREDENTIALS でそのファイルを指す。",
        note: "構成ファイルには秘密の情報が含まれず、ライブラリが AWS の認証情報を短期のトークンに交換し、gx-reader の権限を借用する。これが正解。",
      },
      {
        text: "EC2 で gcloud auth login を実行し、担当者の Google アカウントでログインしておく。",
        note: "人のアカウントをサーバーのアプリケーションに使わせることになり、担当者の異動や退職で止まる。",
      },
      {
        text: "AWS のアクセス キーを Secret Manager に保存し、Google Cloud から読ませる。",
        note: "Google Cloud へ認証する仕組みにはならない。AWS の長期の鍵を持ち出すことにもなる。",
      },
    ],
    explain:
      "Workload Identity 連携を使うアプリケーションは、認証情報の構成ファイルを使って Google Cloud に認証する。gcloud iam workload-identity-pools create-cred-config で、プロバイダ、借用するサービス アカウント、外部の認証情報の取り方（AWS なら --aws）を指定して作り、環境変数 GOOGLE_APPLICATION_CREDENTIALS で指す。クライアント ライブラリ（ADC）はこのファイルに従い、外部の認証情報を Security Token Service で短期の Google のトークンに交換し、必要ならサービス アカウントの権限を借用する。構成ファイルは設定の情報だけで、秘密の鍵は含まない。",
    points: [
      "Workload Identity 連携のクライアント側 → 認証情報の構成ファイル（create-cred-config）を GOOGLE_APPLICATION_CREDENTIALS で指す。",
      "構成ファイルに秘密の情報は含まれない。",
    ],
  },
];
