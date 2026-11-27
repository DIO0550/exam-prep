import type { Question, Source } from "../types";

/**
 * Google Cloud Associate Cloud Engineer 対策 模擬試験 9（問1〜問50）。
 *
 * IPA の過去問題と違い、**問題文・選択肢・正解・解説のすべてを本サイトで書き下ろしている**。
 * どこかの認定試験の実際の設問ではなく、公式の模擬試験でもない。
 *
 * 典拠にした公開資料:
 * - Google Cloud「Associate Cloud Engineer 認定試験ガイド」（4 セクションの出題範囲。reference には節番号を書く）
 *
 * このセットが問う層は「エラーと症状の読み解き」。gcloud・kubectl・Terraform のエラー メッセージや、
 * 「届かない」「消えない」「止まる」といった症状を手がかりに、原因の場所（権限、組織のポリシー、割り当て、
 * ロケーション、ネットワークの経路、仕様上の待ち時間など）を見分けて、正しく直せるかを問う。
 *
 * 作り方の方針:
 * - 設問は「立場と制約のある場面」から始め、覚えた言葉ではなく選び方を問う
 * - 選択肢は 4 つのうち 1〜2 つを**正解と紛らわしいもの**にする（似たロール、1 段ずれた範囲、
 *   似たコマンドやフラグ、要件に対して過剰な対処など）。残りは明確に誤りとする
 * - なぜその選択肢が違うのかは choice.note に 1 つずつ書く
 * - 模擬試験1〜8 で問うた論点を、場面だけ変えて同じ問い方で出すことはしない
 * - 上限値や料金のように確信の持てない数値は出題しない
 */

const GUIDE = "Google Cloud「Associate Cloud Engineer 認定試験ガイド」";

const at = (no: number, section: string): Source => ({
  kind: "original",
  deck: "ace-mock-9",
  label: "ACE 模擬9",
  no,
  reference: `${GUIDE} ${section}`,
});

const S1 = "セクション1 環境の設定";
const S2 = "セクション2 計画と実装";
const S3 = "セクション3 運用";
const S4 = "セクション4 アクセスとセキュリティ";

export const ACE_MOCK_9: [Question, ...Question[]] = [
  // ───────── セクション1 環境の設定（問1〜問10） ─────────
  {
    source: at(1, "1.1"),
    field: S1,
    answer: 2,
    text: "HA社の運用担当者は、Ubuntu のサーバーに apt で Google Cloud CLI を入れて使っている。GKE に接続するため gcloud components install gke-gcloud-auth-plugin を実行したところ、次のエラーになった。最も適切な対処はどれか。",
    stem: {
      list: {
        items: [
          "ERROR: (gcloud.components.install) You cannot perform this action because the Google Cloud CLI component manager is disabled for this installation.",
        ],
      },
    },
    choices: [
      {
        text: "sudo を付けて、gcloud components install を実行し直す。",
        note: "権限の問題ではない。このインストールでは、components のコマンド自体が使えなくなっている。",
      },
      {
        text: "gcloud components update で CLI を最新にしてから、入れ直す。",
        note: "update も同じコンポーネント マネージャの機能なので、同じエラーになる。",
      },
      {
        text: "apt で、パッケージ google-cloud-cli-gke-gcloud-auth-plugin を入れる。",
        note: "パッケージ マネージャで入れた CLI では、追加のコンポーネントもパッケージとして入れる。これが正解。",
      },
      {
        text: "サーバーの CLI を削除し、今後は Cloud Shell だけで作業する。",
        note: "エラーは避けられるが、このサーバーから GKE に接続するという目的を果たせない。",
      },
    ],
    explain:
      "Google Cloud CLI を apt や dnf（yum）などのパッケージ マネージャで入れた場合、gcloud components の install や update は使えない（コンポーネント マネージャが無効になる）。追加のコンポーネントは google-cloud-cli-gke-gcloud-auth-plugin や google-cloud-cli-kubectl のようなパッケージとして入れ、更新もパッケージ マネージャで行う。エラー メッセージにも、代わりに実行するコマンドが示される。gcloud components を使いたいなら、アーカイブやインストーラで入れた CLI を使う。",
    points: [
      "apt や dnf で入れた CLI では gcloud components は使えない → google-cloud-cli-… のパッケージで入れる。",
      "更新もパッケージ マネージャで行う。",
    ],
  },
  {
    source: at(2, "1.1"),
    field: S1,
    answer: [0, 2],
    text: "HB社の新人が、新しい PC に Google Cloud CLI を入れて gcloud compute instances list を実行したところ、次の 2 つのエラーが順に出た。それぞれへの対処として適切なものはどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "エラーA: ERROR: (gcloud.compute.instances.list) You do not currently have an active account selected.",
          "エラーB（A を直したあと）: ERROR: (gcloud.compute.instances.list) The required property [project] is not currently set.",
        ],
      },
    },
    choices: [
      {
        text: "エラーB に対して、gcloud config set project で既定のプロジェクトを設定する（またはコマンドに --project を付ける）。",
        note: "どのプロジェクトに対して実行するかが決まっていないというエラーである。これが正解。",
      },
      {
        text: "エラーA に対して、gcloud services enable compute.googleapis.com で API を有効にする。",
        note: "API の有効化の問題ではない。だれとして実行するか（アカウント）が決まっていない。",
      },
      {
        text: "エラーA に対して、gcloud auth login でアカウントにログインする（または gcloud init で初期設定をする）。",
        note: "使うアカウントが選ばれていないというエラーで、ログインすれば解消する。これが正解。",
      },
      {
        text: "エラーB に対して、gcloud components update で CLI を最新にする。",
        note: "CLI の版の問題ではない。プロジェクトの設定が無いことが原因である。",
      },
    ],
    explain:
      "gcloud のコマンドは、だれとして（アカウント）、どのプロジェクトに対して実行するかが決まっていないと動かない。active account が無いというエラーはアカウントの未設定で、gcloud auth login でログインする。required property [project] というエラーはプロジェクトの未設定で、gcloud config set project で既定を決めるか、--project で指定する。gcloud init を使えば、ログインと既定のプロジェクトの設定をまとめて対話的に行える。今の設定は gcloud config list と gcloud auth list で確かめられる。",
    points: [
      "active account が無い → gcloud auth login（または gcloud init）。",
      "required property [project] → gcloud config set project（または --project）。",
    ],
  },
  {
    source: at(3, "1.1"),
    field: S1,
    answer: 1,
    text: "HC社では、管理者が Google Cloud のセッションの管理で、再認証を求める間隔を設定した。それ以来、担当者の PC で夜通し動かしていた gcloud のスクリプトが、翌朝には次のエラーで止まっているようになった。最も適切な対処はどれか。",
    stem: {
      list: {
        items: [
          "ERROR: (gcloud.storage.cp) There was a problem refreshing your current auth tokens: Reauthentication failed. cannot prompt during non-interactive execution.",
        ],
      },
    },
    choices: [
      {
        text: "再認証の間隔の設定をやめるよう、管理者に頼む。",
        note: "組織が意図して決めた統制を外すことになる。無人の処理の動かし方を変えるべきである。",
      },
      {
        text: "無人で動かす処理は、担当者のアカウントではなく、サービス アカウントを割り当てた VM や Cloud Run ジョブなどで動かす。",
        note: "再認証の設定は人のアカウントにかかるもので、サービス アカウントの処理は止まらない。これが正解。",
      },
      {
        text: "gcloud auth login を cron で毎晩実行する。",
        note: "ログインにはブラウザでの人の操作が要り、無人では通らない。",
      },
      {
        text: "gcloud config set auth/disable_credentials true を設定する。",
        note: "認証情報を使わない設定で、API を呼べなくなるだけである。",
      },
    ],
    explain:
      "Google Workspace や Cloud Identity の管理コンソールにある Google Cloud のセッションの管理では、ユーザーがコンソールや gcloud を使うときに、決まった間隔で再認証（パスワードやセキュリティ キー）を求めるように設定できる。間隔を過ぎると、人のアカウントのトークンは再認証が済むまで更新できず、無人のスクリプトは止まる。この設定はサービス アカウントにはかからないので、決まった時刻に動かす処理や長い処理は、サービス アカウントを割り当てた環境で動かすのが筋である。",
    points: [
      "再認証の設定は人のアカウントにかかる。無人の処理はサービス アカウントで動かす。",
      "Reauthentication failed は、人のアカウントの再認証が必要になったことを示す。",
    ],
  },
  {
    source: at(4, "1.1"),
    field: S1,
    answer: 3,
    text: "HD社の担当者が、オンプレミスから取り込んだ古い OS のカスタム イメージから VM を作ろうとしたところ、次のエラーになった。最も適切な説明と対処はどれか。",
    stem: {
      list: {
        items: ["Constraint constraints/compute.requireShieldedVm violated for project hd-prod."],
      },
    },
    choices: [
      {
        text: "担当者に、プロジェクトのオーナーのロールを付与する。",
        note: "組織のポリシーによる拒否で、IAM のロールを強くしても通らない。",
      },
      {
        text: "別のゾーンを指定して作り直す。",
        note: "ゾーンの空きや割り当ての問題ではない。どのゾーンでも同じ制約がかかる。",
      },
      {
        text: "--no-shielded-secure-boot を付けて作る。",
        note: "制約はセキュアブートなどを有効にすることを求めており、外せば違反のままである。",
      },
      {
        text: "組織のポリシーで Shielded VM が必須になっている。UEFI に対応したイメージを用意し、セキュアブートなどを有効にした Shielded VM として作る。",
        note: "Google が提供する公開イメージは対応している。古いカスタム イメージは、UEFI に対応させて取り込み直す。これが正解。",
      },
    ],
    explain:
      "エラーに constraints/... が出ていれば、組織のポリシーによる拒否である。compute.requireShieldedVm は、新しく作る VM を、セキュアブートなどを有効にした Shielded VM に限るブール型の制約である。Shielded VM には UEFI に対応したブート ディスクのイメージが要る。Google の公開イメージは対応しているが、古い OS から取り込んだカスタム イメージは対応していないことがあるので、UEFI に対応させて取り込み直す（イメージの作成時に --guest-os-features=UEFI_COMPATIBLE を付けるなど）。どうしても対応できない場合は、そのプロジェクトだけ例外のポリシーを置くかを、統制の担当と相談する。",
    points: [
      "compute.requireShieldedVm 違反 → UEFI に対応したイメージで、Shielded VM として作る。",
      "組織のポリシーの拒否は、IAM のロールでは通らない。",
    ],
  },
  {
    source: at(5, "1.1"),
    field: S1,
    answer: 0,
    text: "HE社は、us-central1 の NVIDIA L4 の GPU の割り当てを増やしてもらった。ところが、GPU を 1 つ付けた VM を作ろうとすると次のエラーになる。最も適切な対処はどれか。",
    stem: {
      list: {
        items: ["Quota 'GPUS_ALL_REGIONS' exceeded. Limit: 0.0 globally."],
      },
    },
    choices: [
      {
        text: "リージョンごとの GPU の割り当てとは別に、全リージョンの合計の GPU の割り当て（GPUS_ALL_REGIONS）があるので、その増加もリクエストする。",
        note: "GPU は、リージョンとグローバルの両方の割り当ての範囲に収まる必要がある。これが正解。",
      },
      {
        text: "別のリージョンで VM を作る。",
        note: "globally とあるとおり全リージョンの合計の上限なので、どのリージョンでも同じエラーになる。",
      },
      {
        text: "GPU の種類を変えて作る。",
        note: "全種類の GPU の合計の割り当てなので、種類を変えても同じである。",
      },
      {
        text: "リージョンの割り当ての増加が反映されるまで待つ。",
        note: "上限に達しているのはリージョンの割り当てではなく、別のグローバルの割り当てである。",
      },
    ],
    explain:
      "割り当て超過のエラーは、どの割り当てがどの範囲で上限に達したかを読む。GPU には、リージョンごと・GPU の種類ごとの割り当て（例: us-central1 の NVIDIA L4）に加えて、全リージョン・全種類の合計を抑える GPUS_ALL_REGIONS というグローバルの割り当てがある。VM を作るにはその両方に収まる必要があり、新しいプロジェクトではグローバルの側が小さいことがある。Google Cloud コンソールの割り当てのページ（Cloud Quotas）で、両方の増加をリクエストする。",
    points: [
      "GPU はリージョンの割り当てと、全リージョン合計（GPUS_ALL_REGIONS）の割り当ての両方が要る。",
      "エラーの globally は、グローバルの割り当てを示す。",
    ],
  },
  {
    source: at(6, "1.1"),
    field: S1,
    answer: 2,
    text: "HF社の担当者は、ブラウザの無い Linux のサーバーに SSH で入り、そこで gcloud auth login を実行した。ブラウザを開こうとして先に進めない。担当者自身のアカウントでログインしたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "サーバーにブラウザを入れて、画面を手元に転送する。",
        note: "手間がかかるうえ、そのための標準の手段が CLI に用意されている。",
      },
      {
        text: "手元の PC の gcloud の設定ディレクトリ（~/.config/gcloud）を、サーバーにコピーする。",
        note: "認証情報のファイルを持ち回ることになり、漏えいの危険が増える。",
      },
      {
        text: "gcloud auth login --no-browser（または --no-launch-browser）で実行し、表示される手順に従って、ブラウザのある端末で認可を済ませる。",
        note: "ブラウザの無い環境のためのオプションで、認可だけを別の端末で行える。これが正解。",
      },
      {
        text: "サービス アカウントの鍵を作り、gcloud auth activate-service-account でその鍵を使う。",
        note: "人の作業のために鍵を作ることになる。担当者自身のアカウントでログインするという要件にも合わない。",
      },
    ],
    explain:
      "ブラウザの無い環境で gcloud auth login を使うときは、--no-browser か --no-launch-browser を付ける。--no-browser では、ブラウザと gcloud のある別の端末で実行するコマンドが表示され、その結果を貼り付けてログインを終える。--no-launch-browser では、認可のための URL が表示され、任意のブラウザで開いて認可したあと、表示されたコードを貼り付ける。サーバーで無人の処理を動かすなら、人のアカウントではなく、サーバーに割り当てたサービス アカウントを使う。",
    points: [
      "ブラウザの無い環境のログイン → gcloud auth login --no-browser（または --no-launch-browser）。",
      "設定ディレクトリのコピーや、人の作業のための鍵の作成はしない。",
    ],
  },
  {
    source: at(7, "1.1"),
    field: S1,
    answer: 1,
    text: "HG社は、使わなくなったネットワーク用のプロジェクト hg-net を削除しようとしたが、次のエラーで失敗した。hg-net は共有 VPC のホスト プロジェクトとして使われていた。最も適切な対処はどれか。",
    stem: {
      list: {
        items: [
          "ERROR: (gcloud.projects.delete) FAILED_PRECONDITION: A lien to prevent deletion was placed on the project. Remove the lien to allow deletion.",
        ],
      },
    },
    choices: [
      {
        text: "オプションを付けて、リーエンを無視して削除する。",
        note: "リーエンを無視してプロジェクトを削除するオプションは無い。リーエンを外す必要がある。",
      },
      {
        text: "サービス プロジェクトの接続を外し、hg-net の共有 VPC のホストを無効にする。ホストを有効にしたときに付いたリーエンが外れてから削除する。",
        note: "共有 VPC のホスト プロジェクトには、誤って消さないためのリーエンが自動で付く。これが正解。",
      },
      {
        text: "自分にオーナーのロールを付け直してから、削除する。",
        note: "リーエンは、オーナーであっても削除を止める仕組みである。",
      },
      {
        text: "30 日待ってから、もう一度削除する。",
        note: "削除待ちの期間の話ではない。削除の操作そのものが止められている。",
      },
    ],
    explain:
      "リーエンは、プロジェクトの削除を止める印である。利用者が自分で付けるほかに、Google Cloud のサービスが自動で付けることがあり、共有 VPC のホスト プロジェクトを有効にすると、サービス プロジェクトのネットワークを壊さないためのリーエンが付く。このプロジェクトを削除するには、サービス プロジェクトの接続を外し（gcloud compute shared-vpc associated-projects remove）、ホストを無効にして（gcloud compute shared-vpc disable）、リーエンが外れてから削除する。",
    points: [
      "共有 VPC のホスト プロジェクトには、削除を止めるリーエンが自動で付く。",
      "削除するには、サービス プロジェクトを外してホストを無効にする。",
    ],
  },
  {
    source: at(8, "1.1"),
    field: S1,
    answer: 3,
    text: "HH社では、組織にタグのキー env（値は prod と dev）を作り、組織のポリシーの条件に使っている。自分のプロジェクトのオーナーである担当者が、そのプロジェクトに env=prod のタグを付けようとしたところ、権限が無いというエラーになった。最も適切な対処はどれか。",
    choices: [
      {
        text: "担当者に、組織でタグ管理者（roles/resourcemanager.tagAdmin）を付与する。",
        note: "タグのキーや値の作成・変更・削除まで含み、付けるだけという用途には広すぎる。",
      },
      {
        text: "タグの代わりに、ラベル env=prod をプロジェクトに付ける。",
        note: "ラベルは付けられるが、組織のポリシーの条件には使えない。",
      },
      {
        text: "担当者に、組織の管理者のロールを付与する。",
        note: "組織の IAM を管理できる強いロールで、タグを付けるだけには広すぎる。",
      },
      {
        text: "担当者に、タグの値 env/prod に対するタグ ユーザー（roles/resourcemanager.tagUser）を付与する。",
        note: "タグの値をリソースに付けるには、その値に対する権限が要る。プロジェクトのオーナーだけでは付けられない。これが正解。",
      },
    ],
    explain:
      "Resource Manager のタグは、だれがどの値を付けられるかを IAM で制御できる。タグ管理者はタグのキーと値を作って管理するロール、タグ ユーザーはタグの値をリソースに付けたり外したりするロールである。値を付けるには、その値に対するタグ ユーザーと、付ける先のリソースでタグを付ける権限の両方が要る。プロジェクトのオーナーでも、組織で作られたタグの値を勝手に付けられないので、タグを統制の条件に使える。",
    points: [
      "タグの値をリソースに付ける → その値に対するタグ ユーザー。",
      "タグのキーと値を作る → タグ管理者。",
    ],
  },
  {
    source: at(9, "1.2"),
    field: S1,
    answer: 0,
    text: "HI社の請求レポートを SKU ごとに見ると、先月から、リージョン間のデータ転送の費用が大きく増えていた。調べると、us-central1 の Compute Engine の VM が、asia-northeast1 にある Cloud Storage のバケットから毎日大量のファイルを読んでいた。費用を下げるための最も適切な対処はどれか。",
    choices: [
      {
        text: "VM とバケットを同じリージョンにそろえる（us-central1 にバケットを作ってデータを移すか、VM を asia-northeast1 に移す）。",
        note: "同じリージョンの中の VM とバケットの間では、データ転送の料金がかからない。これが正解。",
      },
      {
        text: "バケットのストレージ クラスを Archive に変える。",
        note: "保存の単価は下がるが、毎日読むと取り出しの料金がかさむ。リージョン間の転送の料金も減らない。",
      },
      {
        text: "VM のネットワーク サービス ティアをスタンダードにする。",
        note: "インターネットへの送信の経路と料金にかかわる設定で、Google Cloud の中のリージョン間の転送には効かない。",
      },
      {
        text: "予算のアラートのしきい値を上げる。",
        note: "通知の設定を変えるだけで、費用は下がらない。",
      },
    ],
    explain:
      "Cloud Storage から読み出すとき、読む側とバケットが同じリージョンにあれば、Google Cloud の中のデータ転送には料金がかからない。リージョンをまたいで読むと、リージョン間のデータ転送の料金が読んだ量に応じてかかる。大量のデータを繰り返し読む処理は、データの置き場所と計算の場所をそろえる。請求レポートを SKU でグループ化すると、どの種類の料金が増えたかを見つけやすい。",
    points: [
      "リージョンをまたぐ読み出しには、データ転送の料金がかかる。計算とデータの場所をそろえる。",
      "費用の増加は、請求レポートを SKU でグループ化して見つける。",
    ],
  },
  {
    source: at(10, "1.2"),
    field: S1,
    answer: [1, 3],
    text: "HJ社の経理担当者が、請求について次の 2 つの疑問を持っている。正しい説明はどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "疑問A: データ基盤チームのプロジェクト hj-data にあるデータセットを、分析チームが自分たちのプロジェクト hj-ana からクエリしている。クエリの料金は、どちらのプロジェクトに付くのか",
          "疑問B: 東京リージョン（asia-northeast1）で動かしている e2-micro の VM 1 台に料金がかかっている。e2-micro は無料ではなかったのか",
        ],
      },
    },
    choices: [
      {
        text: "クエリの料金は、データセットを持つ hj-data に付く。",
        note: "データを持つ側に付くのは保存の料金で、クエリの料金はジョブを実行したプロジェクトに付く。",
      },
      {
        text: "クエリの料金は、クエリのジョブを実行したプロジェクト hj-ana に付く。",
        note: "BigQuery の計算の料金は、ジョブを実行したプロジェクトに請求される。疑問A の答えである。これが正解。",
      },
      {
        text: "e2-micro の無料枠は、どのリージョンでも 1 台分が適用される。",
        note: "無料枠の対象は、米国の一部のリージョンに限られる。",
      },
      {
        text: "Compute Engine の無料枠の e2-micro は、米国の一部のリージョン（us-west1、us-central1、us-east1）に限られる。東京リージョンでは通常の料金がかかる。",
        note: "無料枠はリージョンや台数などの条件付きで、条件を外れると通常の料金になる。疑問B の答えである。これが正解。",
      },
    ],
    explain:
      "BigQuery の料金は、保存と計算で請求先が分かれる。テーブルの保存の料金はデータセットを持つプロジェクトに、クエリの計算の料金はジョブを実行したプロジェクト（ジョブを作る権限を使ったプロジェクト）に付く。別のチームのデータを使わせても、クエリの費用は使う側のプロジェクトで把握できる。Compute Engine の無料枠（Free Tier）は、米国の一部のリージョンでの e2-micro の VM 1 台分などに限られ、それ以外のリージョンや台数には通常の料金がかかる。",
    points: [
      "BigQuery のクエリの料金は、ジョブを実行したプロジェクトに付く。保存の料金はデータを持つ側。",
      "Compute Engine の無料枠の e2-micro は、米国の一部のリージョンに限られる。",
    ],
  },
  // ───────── セクション2 計画と実装（問11〜問25） ─────────
  {
    source: at(11, "2.1"),
    field: S2,
    answer: 1,
    text: "HK社の Cloud Run のサービスには、月次のレポートを作って返すエンドポイントがある。データが増えてから、この処理だけが約 5 分で打ち切られ、利用者に 504 が返るようになった。ログには次の記録があり、処理は 7 分ほどかかる見込みである。設定を最小限に変えて動くようにしたい。最も適切な対処はどれか。",
    stem: {
      list: {
        items: [
          "The request has been terminated because it has reached the maximum request timeout.",
        ],
      },
    },
    choices: [
      {
        text: "最大インスタンス数を増やす。",
        note: "同時に動くインスタンスが増えるだけで、1 件の要求にかけられる時間は変わらない。",
      },
      {
        text: "gcloud run services update の --timeout で、リクエストのタイムアウトを処理にかかる時間より長くする。",
        note: "既定のタイムアウト（5 分）で打ち切られている。タイムアウトは最長 60 分まで延ばせる。これが正解。",
      },
      {
        text: "CPU を常に割り当てる設定にする。",
        note: "レスポンスを返したあとも CPU を使うための設定で、要求の時間の上限は変わらない。",
      },
      {
        text: "最小インスタンス数を 1 にする。",
        note: "コールド スタートを減らすための設定で、要求の時間の上限とは関係しない。",
      },
    ],
    explain:
      "Cloud Run のサービスは、1 件のリクエストに応答するまでの時間に上限（リクエストのタイムアウト）があり、既定は 5 分である。超えると処理は打ち切られ、利用者には 504 が返る。上限は gcloud run deploy や services update の --timeout で最長 60 分まで延ばせる。60 分を超える処理や、リクエストに応答する必要の無い処理は、Cloud Run ジョブで動かす。ロードバランサの背後に置いている場合は、ロードバランサの側のタイムアウトもあわせて確かめる。",
    points: [
      "Cloud Run の要求が約 5 分で切れる → リクエストのタイムアウト（--timeout、最長 60 分）。",
      "60 分を超える処理は Cloud Run ジョブにする。",
    ],
  },
  {
    source: at(12, "2.1"),
    field: S2,
    answer: 3,
    text: "HL社の GKE のリージョン クラスタで、ノードプールを作り直したところ、asia-northeast1-a のノードが無い構成になった。その後、StatefulSet の Pod が Pending のままになり、kubectl describe pod の Events には次のように出ている。最も適切な説明と対処はどれか。",
    stem: {
      list: {
        items: ["0/4 nodes are available: 4 node(s) had volume node affinity conflict."],
      },
    },
    choices: [
      {
        text: "Pod の CPU とメモリのリクエストを減らす。",
        note: "資源の不足ではなく、ボリュームとノードの場所が合わないことが原因である。",
      },
      {
        text: "PersistentVolumeClaim を削除して作り直す。",
        note: "新しい空のボリュームが作られ、これまでのデータを失う。",
      },
      {
        text: "ノードプールで、クラスタ オートスケーラを有効にする。",
        note: "ノードプールが asia-northeast1-a を含まない限り、そのゾーンにノードは増えない。",
      },
      {
        text: "Pod のボリュームはゾーンの永続ディスクで、asia-northeast1-a にある。そのゾーンにノードを置くようにノードプールのゾーンを戻す。今後はリージョン永続ディスクの StorageClass も検討する。",
        note: "ゾーンの永続ディスクは、同じゾーンのノードにしか付けられない。これが正解。",
      },
    ],
    explain:
      "GKE の PersistentVolume が使うゾーンの永続ディスクは、作られたゾーンのノードにしか接続できない。そのため PersistentVolume にはゾーンのノード アフィニティが付いており、そのゾーンにノードが無いと、Pod は volume node affinity conflict で Pending になる。そのゾーンにノードを置き直すのが直接の対処で、ゾーンの障害にも耐えたいなら、2 つのゾーンに複製するリージョン永続ディスクの StorageClass を使う。PersistentVolumeClaim を作り直すとデータを失うので、安易に消さない。",
    points: [
      "volume node affinity conflict → ボリュームのあるゾーンにノードが無い。",
      "ゾーンをまたいで使いたいボリュームは、リージョン永続ディスクにする。",
    ],
  },
  {
    source: at(13, "2.1"),
    field: S2,
    answer: 0,
    text: "HM社のマネージド インスタンス グループは、CPU 使用率 60% を目標に自動スケーリングしている。夕方に負荷が下がって CPU 使用率が 20% 程度になったのに、VM の台数はすぐには減らず、10 分ほどたってから減り始めた。担当者は設定の誤りを疑っている。最も適切な説明はどれか。",
    choices: [
      {
        text: "スケールインは、台数の増減を繰り返さないよう、直近の一定の期間（安定化の期間）に必要だった台数をもとに判断するので、すぐには減らない。設計どおりの動きである。",
        note: "負荷が一時的に下がっただけで台数を減らし、すぐ増やし直すことを避けるための仕組みである。これが正解。",
      },
      {
        text: "初期化の期間が長すぎるので、短くすれば減るのが速くなる。",
        note: "初期化の期間は、起動したばかりの VM の指標を判断に使わない期間で、スケールインの待ち時間とは関係しない。",
      },
      {
        text: "自動スケーリングが、スケールアウトだけを行うモードになっている。",
        note: "そのモードなら台数は減らない。10 分後に減り始めているので当てはまらない。",
      },
      {
        text: "CPU 使用率の目標が高すぎる。",
        note: "目標を変えても、減らす前に一定の期間を見るという仕組みは変わらない。",
      },
    ],
    explain:
      "MIG の自動スケーリングは、台数を増やすときはすぐに、減らすときは慎重に動く。スケールインでは、直近の一定の期間（安定化の期間、およそ 10 分）に必要だった最大の台数をもとに判断するので、負荷が下がってもしばらくは台数が保たれる。これは、負荷の揺れで台数の増減を繰り返すことを防ぐための設計である。さらにゆっくり減らしたいときは、スケールインの制御で、一定の時間に減らせる台数の上限を決められる。",
    points: [
      "スケールインは安定化の期間を見てから行うので、すぐには減らない。",
      "初期化の期間は、起動直後の VM の指標を使わない期間。",
    ],
  },
  {
    source: at(14, "2.1"),
    field: S2,
    answer: 2,
    text: "HN社は GKE Autopilot のクラスタで、CPU のリクエストを 100m、メモリのリクエストを 2Gi にした Pod を動かしている。請求を見ると、想定より CPU の料金が高い。kubectl get pod -o yaml で Pod を見ると、CPU のリクエストがマニフェストの値より大きくなっていた。最も適切な説明はどれか。",
    choices: [
      {
        text: "Autopilot はリクエストを使わず、ノードの大きさに応じて課金している。",
        note: "Autopilot の料金は、Pod のリクエストに基づく。リクエストの値そのものが変わっている。",
      },
      {
        text: "垂直 Pod 自動スケーリング（VPA）が自動で有効になり、使用量に合わせて引き上げた。",
        note: "VPA を設定していないのに勝手に有効になることは無い。",
      },
      {
        text: "Autopilot は、リクエストを、許される最小値や CPU とメモリの比率の範囲に合うように自動で調整する。調整の内容は Pod の注釈 autopilot.gke.io/resource-adjustment で確かめ、比率に合うようにリクエストを見直す。",
        note: "メモリに比べて CPU が小さすぎるため、比率に合うよう CPU が引き上げられた。これが正解。",
      },
      {
        text: "マニフェストの適用に失敗しており、以前の値のまま動いている。",
        note: "値が変わったのは、Autopilot による調整である。",
      },
    ],
    explain:
      "GKE Autopilot では、Pod のリソースのリクエストに対して課金されるが、リクエストには許される範囲（最小値や、CPU とメモリの比率など）がある。範囲から外れたリクエストは、Autopilot が自動で範囲に合うように調整し、その内容を Pod の注釈 autopilot.gke.io/resource-adjustment に残す。メモリを多く、CPU を極端に少なくしたような Pod では、CPU が引き上げられて料金が増える。実際の使用量を確かめ、範囲に合うリクエストを明示しておく。",
    points: [
      "Autopilot はリクエストを許される範囲に自動で調整する。注釈 autopilot.gke.io/resource-adjustment で確かめる。",
      "調整後のリクエストが課金の対象になる。",
    ],
  },
  {
    source: at(15, "2.1"),
    field: S2,
    answer: [0, 3],
    text: "HO社の Cloud Run のサービスで、次の 2 つの問題が起きた。それぞれの原因と対処として適切なものはどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "問題A: Apple シリコンの Mac で docker build したイメージをデプロイすると、イメージが amd64/linux に対応していなければならないという旨のエラーで失敗する",
          "問題B: アップロードされた大きな画像をいったん /tmp に書き出して加工する処理で、「Memory limit of 512 MiB exceeded」というログが出てインスタンスが止まる。加工の処理そのものは少ないメモリで済む",
        ],
      },
    },
    choices: [
      {
        text: "問題A: イメージが arm64 向けだけに作られている。docker buildx build --platform linux/amd64 で作り直すか、Cloud Build でビルドする。",
        note: "Cloud Run は amd64（x86-64）の Linux のイメージを動かす。これが正解。",
      },
      {
        text: "問題A: コンテナが PORT 環境変数のポートで待ち受けていない。",
        note: "ポートの問題なら、デプロイのあとの起動の失敗として現れる。このエラーはイメージのアーキテクチャの問題である。",
      },
      {
        text: "問題B: 同時実行数を増やす。",
        note: "1 つのインスタンスに入る要求が増え、メモリはかえって足りなくなる。",
      },
      {
        text: "問題B: Cloud Run のコンテナのファイル システムへの書き込みはメモリを使う。メモリの上限を上げるか、一時的なファイルを Cloud Storage などに置く。",
        note: "/tmp に書いたファイルの分もメモリを消費する。これが正解。",
      },
    ],
    explain:
      "Cloud Run は、amd64（x86-64）の Linux 向けのコンテナ イメージを動かす。Apple シリコンの Mac で何も指定せずにビルドすると arm64 向けのイメージになるので、--platform linux/amd64 を付けてビルドするか、Cloud Build でビルドする。また、Cloud Run のコンテナのファイル システムはメモリの上にあり、/tmp などに書いたファイルもインスタンスのメモリを消費する。大きな一時ファイルを扱うなら、メモリの上限（--memory）を上げるか、Cloud Storage など外の置き場所を使う。",
    points: [
      "Cloud Run のイメージは linux/amd64 でビルドする。",
      "Cloud Run のファイル システムへの書き込みはメモリを使う。",
    ],
  },
  {
    source: at(16, "2.2"),
    field: S2,
    answer: 1,
    text: "HP社の担当者は、バケット logs-archive に「作成から 30 日を過ぎたオブジェクトを削除する」ライフサイクル ルールを設定した。1 時間後に確かめると、作成から 90 日以上たったオブジェクトがまだ残っている。保持ポリシーやオブジェクトの保持は設定していない。最も適切な説明はどれか。",
    choices: [
      {
        text: "ルールは設定したあとに作られたオブジェクトにだけ効くので、既存のオブジェクトは手で消す必要がある。",
        note: "既存のオブジェクトも、条件に合えばルールの対象になる。",
      },
      {
        text: "ライフサイクルの設定の反映と実行は非同期で、反映までに最大で 24 時間ほどかかることがある。しばらく待ってから確かめる。",
        note: "設定の直後にすぐ削除されるとは限らない。これが正解。",
      },
      {
        text: "削除のルールを使うには、オブジェクトのバージョニングを有効にする必要がある。",
        note: "バージョニングが無効のバケットでも、削除のルールは使える。",
      },
      {
        text: "条件の age は最後に読まれてからの日数なので、よく読まれるオブジェクトは消えない。",
        note: "age はオブジェクトが作成されてからの日数で、読まれたかどうかは関係しない。",
      },
    ],
    explain:
      "Cloud Storage のライフサイクル ルールは、条件に合うオブジェクトに対して、非同期で削除やクラスの変更を行う。ルールを追加・変更してから反映されるまでに最大で 24 時間ほどかかることがあり、設定の直後には動かないことがある。既存のオブジェクトも条件に合えば対象になる。保持ポリシーの期間内のものや、保持（ホールド）が付いたものは削除されない。結果を確かめるときは、時間をおいてから見る。",
    points: [
      "ライフサイクル ルールは非同期で、反映までに最大 24 時間ほどかかることがある。",
      "age は作成からの日数。既存のオブジェクトも対象になる。",
    ],
  },
  {
    source: at(17, "2.2"),
    field: S2,
    answer: 3,
    text: "HQ社のアプリケーションは、各店舗の在庫の合計を、Cloud Storage の 1 つのオブジェクト stock/summary.json に、在庫が変わるたびに上書きしている。アクセスが増えてから、この書き込みが 429 Too Many Requests でときどき失敗するようになった。最も適切な対処はどれか。",
    choices: [
      {
        text: "バケットのストレージ クラスを Nearline に変える。",
        note: "クラスを変えても、同じオブジェクトへの書き込みの頻度の制限は変わらない。読み出しの料金も増える。",
      },
      {
        text: "バケットをマルチリージョンに作り直す。",
        note: "置き場所を変えても、同じオブジェクトへの書き込みの頻度の制限は変わらない。",
      },
      {
        text: "オブジェクトのバージョニングを有効にする。",
        note: "古い版が残るようになるだけで、同じ名前への書き込みの頻度の制限は変わらない。",
      },
      {
        text: "同じオブジェクトへの書き込みには、1 秒に 1 回程度という頻度の目安がある。頻繁に変わる値は Firestore などのデータベースに置くか、更新をまとめて書き込む。",
        note: "同じ名前のオブジェクトを高い頻度で上書きする作り自体を変える。これが正解。",
      },
    ],
    explain:
      "Cloud Storage では、同じ名前のオブジェクトへの書き込み（作成・上書き・メタデータの更新）は、1 秒に 1 回程度までという目安があり、超えると 429 が返る。一時的なエラーには指数バックオフで再試行するが、頻繁に変わる値を 1 つのオブジェクトに書き続ける作りでは解決しない。カウンタや状態のように頻繁に更新するデータは Firestore などのデータベースに置き、Cloud Storage には、まとめた結果を間隔をあけて書く。名前の違う多数のオブジェクトへの書き込みには、この制限はかからない。",
    points: [
      "同じオブジェクトへの書き込みは、1 秒に 1 回程度まで。超えると 429。",
      "頻繁に変わる値はデータベースに置く。",
    ],
  },
  {
    source: at(18, "2.2"),
    field: S2,
    answer: 2,
    text: "HR社は、Cloud SQL for MySQL のインスタンス hr-db の読み取りの負荷を分けるため、リードレプリカを作ろうとしたが、作成できないというエラーになった。hr-db は費用を抑えるため、自動バックアップを無効にして作られている。最も適切な対処はどれか。",
    choices: [
      {
        text: "リードレプリカを、別のリージョンに作る。",
        note: "リージョンの問題ではない。どこに作っても、プライマリの前提の設定が足りない。",
      },
      {
        text: "hr-db を高可用性（リージョン）構成にする。",
        note: "ゾーンの障害に備えるための構成で、リードレプリカを作る前提の設定とは別である。",
      },
      {
        text: "hr-db で自動バックアップとバイナリログを有効にしてから、リードレプリカを作る。",
        note: "MySQL のリードレプリカは、プライマリのバイナリログで変更を複製する。これが正解。",
      },
      {
        text: "hr-db のマシンタイプを大きくする。",
        note: "性能の問題ではない。プライマリの設定が足りないことが原因である。",
      },
    ],
    explain:
      "Cloud SQL for MySQL のリードレプリカは、プライマリのバイナリログを使って変更を複製する。そのため、プライマリで自動バックアップとバイナリログ（ポイントインタイム リカバリ）を有効にしておくことが、レプリカを作る前提になる。費用を抑えるために自動バックアップを止めていると、レプリカを作れないだけでなく、障害や誤操作からの戻し先も失う。本番のインスタンスでは有効にしておくのが基本である。",
    points: [
      "MySQL のリードレプリカには、プライマリの自動バックアップとバイナリログが要る。",
      "自動バックアップを止めると、戻し先も失う。",
    ],
  },
  {
    source: at(19, "2.2"),
    field: S2,
    answer: 0,
    text: "HS社の担当者が、CSV ファイルを bq load でテーブル sales（列 date は DATE 型、amount は INTEGER 型）に読み込もうとしたところ、次のエラーで失敗した。bq show -j でジョブの詳細を見ると、1 行目の amount の値 'amount' を INTEGER として読めないと記録されていた。最も適切な対処はどれか。",
    stem: {
      list: {
        items: [
          "Error while reading data, error message: CSV table encountered too many errors, giving up. Rows: 1; errors: 1.",
        ],
      },
    },
    choices: [
      {
        text: "1 行目は列名の見出しなので、--skip_leading_rows=1 を付けて読み込み直す。",
        note: "見出しの行をデータとして読んだことが原因で、読み飛ばす行数を指定すれば読み込める。これが正解。",
      },
      {
        text: "--max_bad_records を大きくして、読めない行を無視させる。",
        note: "見出しの行は飛ばせるが、本当に壊れた行まで黙って捨てられやすくなる。原因に合った対処ではない。",
      },
      {
        text: "amount の列を STRING 型に変えて読み込む。",
        note: "見出しの行もデータとして入ってしまい、金額として集計できなくなる。",
      },
      {
        text: "ファイルを JSON に変換してから読み込む。",
        note: "形式を変える必要は無い。見出しの行の扱いを指定すれば済む。",
      },
    ],
    explain:
      "bq load のエラーは、bq show -j ジョブID でジョブの詳細（どの行のどの列で何が起きたか）を見て原因を確かめる。CSV の 1 行目に列名の見出しがあると、それもデータとして読まれ、型が合わずに失敗する。--skip_leading_rows=1 で見出しの行を読み飛ばす。--max_bad_records は、壊れた行がいくつかあっても読み込みを続けたいときに使う設定で、見出しのような決まった原因には使わない。",
    points: [
      "CSV の見出しの行 → --skip_leading_rows=1。",
      "読み込みの失敗の詳細は bq show -j で確かめる。",
    ],
  },
  {
    source: at(20, "2.3"),
    field: S2,
    answer: 2,
    text: "HT社は、asia-northeast1 の内部パススルー ネットワーク ロードバランサの背後で、社内向けの API を動かしている。同じ VPC の us-central1 の VM からロードバランサの IP アドレスに接続するとタイムアウトするが、asia-northeast1 の VM からは接続できる。最も適切な対処はどれか。",
    choices: [
      {
        text: "us-central1 にサブネットを追加する。",
        note: "接続元の VM はすでに us-central1 のサブネットにある。足りないのはロードバランサの側の設定である。",
      },
      {
        text: "VPC ネットワーク ピアリングを作る。",
        note: "同じ VPC の中の通信なので、ピアリングは要らない。",
      },
      {
        text: "ロードバランサの転送ルールで、グローバル アクセスを有効にする（gcloud compute forwarding-rules update --allow-global-access）。",
        note: "内部ロードバランサは、既定では同じリージョンのクライアントからしか使えない。これが正解。",
      },
      {
        text: "ロードバランサを外部のものに作り直す。",
        note: "社内向けの API をインターネットに出すことになる。",
      },
    ],
    explain:
      "内部ロードバランサ（内部パススルー ネットワーク ロードバランサや内部アプリケーション ロードバランサ）は、既定では、ロードバランサと同じリージョンにあるクライアントからの接続だけを受ける。別のリージョンの VM（同じ VPC、またはピアリングや VPN でつながったネットワーク）から使わせるには、転送ルールでグローバル アクセスを有効にする。内部のまま、リージョンをまたいで使えるようになる。",
    points: [
      "内部ロードバランサに別のリージョンから届かない → 転送ルールでグローバル アクセスを有効にする。",
      "既定では、同じリージョンのクライアントだけが使える。",
    ],
  },
  {
    source: at(21, "2.3"),
    field: S2,
    answer: 1,
    text: "HU社は、グローバル外部アプリケーション ロードバランサの背後の MIG で、帳票を作る API を動かしている。処理に 1 分ほどかかる要求だけが約 30 秒で失敗し、利用者に 502 が返る。ロードバランサのログには statusDetails が backend_timeout と記録されている。VM のアプリケーションは処理を最後まで続けている。最も適切な対処はどれか。",
    choices: [
      {
        text: "ヘルスチェックの間隔を長くする。",
        note: "ヘルスチェックはバックエンドが正常かを見るもので、1 件の要求を待つ時間とは関係しない。",
      },
      {
        text: "バックエンド サービスのタイムアウトを、処理にかかる時間より長くする（gcloud compute backend-services update --timeout）。",
        note: "ロードバランサがバックエンドの応答を待つ時間の上限（既定 30 秒）を超えている。これが正解。",
      },
      {
        text: "MIG の台数を増やす。",
        note: "1 件の処理にかかる時間は変わらず、同じように打ち切られる。",
      },
      {
        text: "バックエンド サービスで Cloud CDN を有効にする。",
        note: "要求ごとに作る帳票はキャッシュできず、待ち時間の上限も変わらない。",
      },
    ],
    explain:
      "外部アプリケーション ロードバランサは、バックエンドの応答を待つ時間に上限（バックエンド サービスのタイムアウト、既定 30 秒）を持つ。超えると、バックエンドが処理を続けていても、利用者には 502 が返り、ログの statusDetails に backend_timeout と残る。時間のかかる処理があるなら、バックエンド サービスのタイムアウトを延ばす。より長い処理は、要求を受け付けたらすぐ応答し、結果をあとから取りに来させる作りにする。",
    points: [
      "backend_timeout → バックエンド サービスのタイムアウト（既定 30 秒）を延ばす。",
      "ロードバランサの側の待ち時間は、アプリケーションの設定とは別に決まる。",
    ],
  },
  {
    source: at(22, "2.3"),
    field: S2,
    answer: 3,
    text: "HV社では、外部 IP アドレスを持たない VM のサブネットで限定公開の Google アクセスを有効にし、VM から Cloud Storage を使っていた。ところが、セキュリティ担当が VPC から「0.0.0.0/0 宛て、次のホップはデフォルト インターネット ゲートウェイ」のルートを削除してから、storage.googleapis.com への接続がタイムアウトするようになった。外部のインターネットには出させたくない。最も適切な対処はどれか。",
    choices: [
      {
        text: "限定公開の Google アクセスをいったん無効にして、有効にし直す。",
        note: "設定は有効のままで、経路が無くなったことが原因である。",
      },
      {
        text: "VM に外部 IP アドレスを付ける。",
        note: "外部 IP アドレスを持たせない方針に反する。経路が無いままでは、それでも届かない。",
      },
      {
        text: "Cloud NAT を構成する。",
        note: "インターネットへ出る経路を作ることになり、要件に反する。デフォルトのルートが無いので、NAT を作っても外へは出られない。",
      },
      {
        text: "Google の API の宛先の範囲（private.googleapis.com など）に向けて、次のホップをデフォルト インターネット ゲートウェイにしたルートを作り、DNS もその範囲を向くようにする。",
        note: "限定公開の Google アクセスには、Google の API の宛先への、デフォルト インターネット ゲートウェイのルートが要る。これが正解。",
      },
    ],
    explain:
      "限定公開の Google アクセスは、外部 IP アドレスの無い VM から Google の API に届くようにする設定だが、Google の API の宛先の IP アドレスへのルート（次のホップがデフォルト インターネット ゲートウェイ）があることが前提になる。通信はインターネットには出ず、Google のネットワークの中を通る。0.0.0.0/0 のルートを消したなら、private.googleapis.com（199.36.153.8/30）や restricted.googleapis.com（199.36.153.4/30）の範囲へのルートを作り、Cloud DNS でそれらの名前の範囲へ向ける。",
    points: [
      "限定公開の Google アクセスには、Google の API の宛先へのデフォルト インターネット ゲートウェイのルートが要る。",
      "0.0.0.0/0 を消したなら、private.googleapis.com などの範囲へのルートと DNS を用意する。",
    ],
  },
  {
    source: at(23, "2.4"),
    field: S2,
    answer: 0,
    text: "HW社は、Terraform の状態を Cloud Storage のバックエンドに置いてチームで共有している。担当者が terraform apply を実行すると、次のエラーになった。表示されたロックの情報を見ると、昨夜 CI のジョブが途中で強制終了されたときのものだった。最も適切な対処はどれか。",
    stem: {
      list: {
        items: ["Error: Error acquiring the state lock"],
      },
    },
    choices: [
      {
        text: "ほかにだれも実行していないことを確かめてから、表示されたロックの ID を指定して terraform force-unlock を実行する。",
        note: "強制終了で残ったロックを外せば、次の実行ができる。これが正解。",
      },
      {
        text: "バケットの状態ファイルを削除して、apply し直す。",
        note: "状態を失い、Terraform が既存のリソースを把握できなくなる。",
      },
      {
        text: "今後は、いつも -lock=false を付けて実行する。",
        note: "ロックを使わないと、同時に実行したときに状態が壊れうる。",
      },
      {
        text: "バケットのバージョニングを有効にする。",
        note: "状態を戻せるようにする備えで、残っているロックは外れない。",
      },
    ],
    explain:
      "Cloud Storage のバックエンドは、実行の間ロックのファイルを置き、ほかの人が同時に状態を書き換えないようにする。実行が強制終了されると、ロックが残ったままになり、次の実行が Error acquiring the state lock で止まる。表示されたロックの情報（だれが、いつ、何の操作で取ったか）を見て、ほかに実行中の人がいないことを確かめてから、terraform force-unlock ロックID で外す。実行中の人がいるのに外すと、状態が壊れるおそれがある。",
    points: [
      "残ったロック → 実行中の人がいないことを確かめてから terraform force-unlock。",
      "状態ファイルの削除や -lock=false は使わない。",
    ],
  },
  {
    source: at(24, "2.4"),
    field: S2,
    answer: [1, 2],
    text: "HX社の担当者が terraform plan を実行したところ、2 つの VM について次のような出力になった。正しい読み方はどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "google_compute_instance.app には -/+ が付き、boot_disk の image の行に「# forces replacement」と書かれている",
          "google_compute_instance.batch には ~ が付き、machine_type の行だけが変わっている",
        ],
      },
    },
    choices: [
      {
        text: "app は、設定を変えるだけで、作り直されない。",
        note: "-/+ は、いったん削除してから作り直すことを示す。",
      },
      {
        text: "app は、いったん削除されてから作り直される。ブート ディスクのイメージの変更が、作り直しの原因である。",
        note: "「# forces replacement」が付いた引数は、変えると作り直しになる。これが正解。",
      },
      {
        text: "batch は、既存の VM のまま設定が変更される（作り直しではない）。",
        note: "~ は、その場での変更を示す。これが正解。",
      },
      {
        text: "batch は、削除されるだけで、作り直されない。",
        note: "削除だけなら - が付く。~ は変更である。",
      },
    ],
    explain:
      "terraform plan の記号は、+ が作成、- が削除、~ がその場での変更、-/+ が削除してからの作り直しを表す。作り直しの原因になる引数の行には「# forces replacement」と書かれる。VM の作り直しでは、ブート ディスクの中身や一時的な IP アドレスなどが失われるので、apply の前に必ず確かめる。なお、マシンタイプの変更のように VM の停止が要る変更は、google_compute_instance で allow_stopping_for_update を true にしておく必要がある。",
    points: [
      "-/+ は作り直し、~ はその場での変更。原因の引数には「# forces replacement」。",
      "作り直しはデータを失いうるので、apply の前に plan で確かめる。",
    ],
  },
  {
    source: at(25, "2.4"),
    field: S2,
    answer: 2,
    text: "HY社では、Terraform の構成と一緒に .terraform.lock.hcl をリポジトリで管理している。同僚が required_providers の google プロバイダの版の制約を新しい版に変えてマージしたあと、担当者が手元で terraform plan を実行すると、依存関係のロック ファイルが構成と合わないというエラーになった。最も適切な対処はどれか。",
    choices: [
      {
        text: ".terraform.lock.hcl を削除し、リポジトリの管理からも外す。",
        note: "プロバイダの版を固定できなくなり、人や CI ごとに違う版が使われうる。",
      },
      {
        text: "terraform plan に -lock=false を付ける。",
        note: "状態のロックを使わない指定で、プロバイダの版を記録するロック ファイルとは関係が無い。",
      },
      {
        text: "terraform init -upgrade を実行して、新しい制約に合う版を選び直し、更新された .terraform.lock.hcl をコミットする。",
        note: "制約の変更に合わせて、ロック ファイルの版を選び直す。これが正解。",
      },
      {
        text: "Terraform の本体（CLI）を最新の版にする。",
        note: "プロバイダの版の選び直しは、本体の更新ではなく init で行う。",
      },
    ],
    explain:
      ".terraform.lock.hcl は、terraform init で選んだプロバイダの版を記録し、だれがいつ実行しても同じ版を使うためのファイルで、リポジトリで管理する。版の制約を変えたのにロック ファイルが古い版のままだと、構成と合わないというエラーになる。terraform init -upgrade を実行すると、制約に合う版を選び直してロック ファイルを更新するので、それをコミットしてチームで共有する。-lock は状態のロックの指定で、別のものである。",
    points: [
      "版の制約を変えたら → terraform init -upgrade で選び直し、ロック ファイルをコミットする。",
      "プロバイダの版のロック ファイルと、状態のロックは別のもの。",
    ],
  },
  // ───────── セクション3 運用（問26〜問40） ─────────
  {
    source: at(26, "3.1"),
    field: S3,
    answer: 3,
    text: "HZ社のマネージド インスタンス グループ web-mig の目標の台数は 6 台だが、実際には 4 台のまま増えない。手作業で台数を指定し直しても変わらない。VM が作れない理由を調べる最初の手順として最も適切なものはどれか。",
    choices: [
      {
        text: "既存の VM に SSH で入り、アプリケーションのログを見る。",
        note: "作られなかった VM の理由は、既存の VM の中には記録されない。",
      },
      {
        text: "ロードバランサのヘルスチェックの結果を見る。",
        note: "作られた VM が正常かどうかを見るもので、作られない理由は分からない。",
      },
      {
        text: "Cloud Billing のレポートで、費用の推移を見る。",
        note: "VM の作成の失敗の理由は、費用のレポートには出ない。",
      },
      {
        text: "gcloud compute instance-groups managed list-errors web-mig（またはコンソールの MIG のエラーの表示）で、VM の作成に失敗した理由を確かめる。",
        note: "割り当ての超過、イメージやサービス アカウントが見つからない、ゾーンの空き不足など、MIG が VM を作れなかった理由が記録されている。これが正解。",
      },
    ],
    explain:
      "MIG は、目標の台数に合わせて VM を作ろうとし、失敗すると理由を記録して再試行を続ける。gcloud compute instance-groups managed list-errors（またはコンソールの MIG の詳細のエラー）で、いつ、どの VM の作成が、どんな理由（割り当ての超過、インスタンス テンプレートが指すイメージやサービス アカウントが無い、ゾーンの空き不足、組織のポリシーの違反など）で失敗したかを確かめられる。理由が分かれば、割り当ての増加やテンプレートの作り直しなど、直す場所が決まる。",
    points: [
      "MIG の台数が増えない → list-errors で、VM の作成に失敗した理由を見る。",
      "失敗の理由は、既存の VM の中ではなく MIG に記録される。",
    ],
  },
  {
    source: at(27, "3.1"),
    field: S3,
    answer: 0,
    text: "IA社の担当者は、パッケージを入れて設定ファイルを置くスタートアップ スクリプトを付けて、Linux の VM を作った。VM は起動したが、設定ファイルが置かれていない。スクリプトがどこで失敗したかを調べる方法として最も適切なものはどれか。",
    choices: [
      {
        text: "VM の中で sudo journalctl -u google-startup-scripts.service を実行するか、gcloud compute instances get-serial-port-output でシリアル ポートの出力を見て、スクリプトの実行の記録を確かめる。",
        note: "スタートアップ スクリプトの出力とエラーは、これらに記録される。これが正解。",
      },
      {
        text: "管理アクティビティ監査ログを見る。",
        note: "VM の作成などの API の操作の記録で、VM の中で動いたスクリプトの出力は残らない。",
      },
      {
        text: "VM を削除して、同じ設定で作り直す。",
        note: "同じスクリプトが同じところで失敗するだけで、原因は分からない。",
      },
      {
        text: "VPC フローログを見る。",
        note: "通信の記録で、スクリプトのどの行で失敗したかは分からない。",
      },
    ],
    explain:
      "Linux の VM のスタートアップ スクリプトは、ゲスト環境のサービス（google-startup-scripts.service）が起動時に実行し、その出力とエラーをシステムのジャーナルとシリアル ポートに書く。VM に入れるなら sudo journalctl -u google-startup-scripts.service で、入れないなら gcloud compute instances get-serial-port-output で確かめる。Ops エージェントを入れていれば、Cloud Logging でも見られる。スクリプトを直したら、sudo google_metadata_script_runner startup で入ったまま再実行して確かめられる。",
    points: [
      "スタートアップ スクリプトの記録 → journalctl -u google-startup-scripts.service、またはシリアル ポートの出力。",
      "監査ログやフローログには、VM の中の処理の出力は残らない。",
    ],
  },
  {
    source: at(28, "3.1"),
    field: S3,
    answer: 1,
    text: "IB社の GKE のクラスタで、Service api（type: ClusterIP）に同じクラスタの別の Pod から接続すると、接続が拒否される。api の Deployment の Pod は Running で、READY になっている。kubectl get endpoints api を実行すると、ENDPOINTS の欄が <none> だった。最も可能性が高い原因と確かめ方はどれか。",
    choices: [
      {
        text: "Service が ClusterIP なので、クラスタの中からは接続できない。",
        note: "ClusterIP は、まさにクラスタの中から接続するための種類である。",
      },
      {
        text: "Service の selector が Pod のラベルと一致しておらず、Service に Pod が結び付いていない。kubectl get pods --show-labels で Pod のラベルを見て、selector と突き合わせる。",
        note: "Endpoints が空なのは、selector に合う準備完了の Pod が無いことを示す。Pod は READY なので、ラベルの不一致が疑わしい。これが正解。",
      },
      {
        text: "ノードのファイアウォール ルールが、Pod の間の通信を止めている。",
        note: "通信の前に、Service に結び付く Pod が 1 つも無いことが問題である。",
      },
      {
        text: "Pod の CPU が足りず、応答できていない。",
        note: "Pod は READY で、Endpoints が空であることの説明にならない。",
      },
    ],
    explain:
      "Kubernetes の Service は、selector に合うラベルを持ち、準備完了（READY）になっている Pod を Endpoints（EndpointSlice）として集め、そこへ通信を振り分ける。Endpoints が空なら、selector に合う Pod が無いか、合う Pod がどれも準備完了になっていない。今回は Pod が READY なので、Deployment の Pod のテンプレートのラベルと、Service の selector の綴りや値の食い違いを疑う。kubectl describe service でも selector を確かめられる。",
    points: [
      "Endpoints が空 → selector に合う準備完了の Pod が無い。ラベルと selector を突き合わせる。",
      "kubectl get endpoints と kubectl get pods --show-labels で確かめる。",
    ],
  },
  {
    source: at(29, "3.1"),
    field: S3,
    answer: 3,
    text: "IC社が GKE の Deployment web に新しい版を適用したところ、kubectl rollout status が終わらず、新しい Pod は Running のまま READY が 0/1 になっている。古い Pod は動き続けている。kubectl describe pod の Events には次のように出ている。最も適切な説明と対処はどれか。",
    stem: {
      list: {
        items: ["Readiness probe failed: HTTP probe failed with statuscode: 404"],
      },
    },
    choices: [
      {
        text: "新しいイメージを取得できていない。",
        note: "取得に失敗していれば ImagePullBackOff などになり、Running にはならない。",
      },
      {
        text: "ノードの CPU が足りない。",
        note: "足りなければ Pod は Pending になる。新しい Pod はすでに Running である。",
      },
      {
        text: "kubectl rollout restart で Pod を作り直す。",
        note: "同じ設定で作り直しても、同じ確認に失敗する。",
      },
      {
        text: "新しい版では、readinessProbe に指定したパスが 404 を返すので、Pod が準備完了にならず、入れ替えが進まない。アプリケーションの確認用のパスか、probe の設定を直す。",
        note: "準備完了にならない Pod には通信が送られず、ローリング アップデートも先に進まない。これが正解。",
      },
    ],
    explain:
      "readinessProbe は、Pod が通信を受けられる状態かを確かめる仕組みで、失敗している間は Pod が準備完了にならず、Service の振り分け先にも入らない。ローリング アップデートは新しい Pod が準備完了になるのを待って古い Pod を減らすので、新しい版の確認に失敗し続けると入れ替えが止まり、古い Pod が動き続ける。確認用のパスがアプリケーションの変更で変わっていないか、probe のパスやポートを見直す。急ぐなら、いったん前の版に戻す。",
    points: [
      "Running なのに READY にならない → readinessProbe の失敗を疑う。",
      "準備完了にならない Pod には通信が届かず、ローリング アップデートも進まない。",
    ],
  },
  {
    source: at(30, "3.1"),
    field: S3,
    answer: 0,
    text: 'ID社は、GKE の CronJob で毎朝 6 時（日本時間）に集計を動かそうと、schedule に "0 6 * * *" と書いた。ところが、実際には日本時間の 15 時に動いている。最も適切な対処はどれか。',
    choices: [
      {
        text: 'CronJob の時刻は、既定では UTC として解釈される。spec.timeZone に Asia/Tokyo を指定する（または UTC に直して "0 21 * * *" と書く）。',
        note: "UTC の 6 時は日本時間の 15 時である。タイムゾーンを指定すれば、日本時間で書ける。これが正解。",
      },
      {
        text: "ノードの OS のタイムゾーンを Asia/Tokyo に変える。",
        note: "CronJob の時刻の解釈は、ノードの OS の設定では変わらない。",
      },
      {
        text: "Pod の環境変数 TZ に Asia/Tokyo を設定する。",
        note: "コンテナの中の時刻の表示が変わるだけで、CronJob が起動する時刻は変わらない。",
      },
      {
        text: "CronJob をやめて Deployment で常に動かし、アプリケーションの中で時刻を待つ。",
        note: "動かすことはできるが、決まった時刻に起動するという CronJob の役割を自分で作り直すことになる。",
      },
    ],
    explain:
      'Kubernetes の CronJob の schedule は、タイムゾーンを指定しなければ、コントロール プレーンの時刻（GKE では UTC）で解釈される。"0 6 * * *" は UTC の 6 時、つまり日本時間の 15 時になる。spec.timeZone に Asia/Tokyo のような名前を指定すれば、そのタイムゾーンで解釈される。Pod の環境変数やノードの設定は、起動の時刻の決め方には影響しない。Cloud Scheduler を使う場合も、ジョブのタイムゾーンを明示しておく。',
    points: [
      "CronJob の時刻は既定で UTC。spec.timeZone でタイムゾーンを指定する。",
      "Pod の TZ やノードの設定では、起動の時刻は変わらない。",
    ],
  },
  {
    source: at(31, "3.2"),
    field: S3,
    answer: [0, 2],
    text: "IE社の Pub/Sub について、次の 2 つの問い合わせが来た。それぞれの原因として正しいものはどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "問い合わせA: 昨日の 10 時に新しいサブスクリプション audit-sub を作った。トピックには 9 時に発行したメッセージもあるはずなのに、audit-sub には 10 時より後のメッセージしか届かない",
          "問い合わせB: 検証用に作ったまま 2 か月使っていなかったサブスクリプション test-sub が、いつの間にか無くなっていた。トピックは残っている",
        ],
      },
    },
    choices: [
      {
        text: "A: サブスクリプションは、作成したあとに発行されたメッセージから受け取る。作成より前に発行されたメッセージは届かない。",
        note: "9 時のメッセージは、audit-sub ができる前に発行されている。問い合わせA の原因である。これが正解。",
      },
      {
        text: "A: メッセージの保持期間を過ぎたので、9 時のメッセージが消えた。",
        note: "既定の保持期間（7 日）よりずっと短い。そもそも作成より前のメッセージはそのサブスクリプションに届かない。",
      },
      {
        text: "B: 一定の期間使われなかったサブスクリプションは、有効期限（既定は 31 日）を過ぎると自動で削除される。消したくなければ、有効期限を無期限にしておく。",
        note: "使われていないサブスクリプションは自動で片付けられる。問い合わせB の原因である。これが正解。",
      },
      {
        text: "B: トピックでメッセージの保持を有効にしていなかったので、サブスクリプションも削除された。",
        note: "トピックのメッセージの保持は、メッセージを残す期間の設定で、サブスクリプションの削除とは関係が無い。",
      },
    ],
    explain:
      "Pub/Sub のサブスクリプションは、作成した時点よりあとにトピックへ発行されたメッセージを受け取る。前のメッセージも読みたいなら、トピックでメッセージの保持を有効にしておき、サブスクリプションを過去の時刻へシークする。また、サブスクリプションには有効期限があり、既定では 31 日間使われない（受信などの操作が無い）と自動で削除される。めったに使わないが残しておきたいサブスクリプションは、gcloud pubsub subscriptions update --expiration-period=never で無期限にする。",
    points: [
      "サブスクリプションは、作成後に発行されたメッセージから受け取る。",
      "使われないサブスクリプションは有効期限（既定 31 日）で削除される。--expiration-period=never で防ぐ。",
    ],
  },
  {
    source: at(32, "3.2"),
    field: S3,
    answer: 1,
    text: "IF社のアプリケーションは、従来のストリーミング挿入（tabledata.insertAll）で BigQuery のテーブル events に行を追加している。誤って入った行を消そうと、直前に挿入した行を対象に DELETE を実行したところ、次のエラーになった。最も適切な説明はどれか。",
    stem: {
      list: {
        items: [
          "UPDATE or DELETE statement over table if-prod.app.events would affect rows in the streaming buffer, which is not supported",
        ],
      },
    },
    choices: [
      {
        text: "DELETE を実行する権限が無い。",
        note: "権限の不足なら、Access Denied のエラーになる。",
      },
      {
        text: "ストリーミング挿入した直後の行は、ストリーミング バッファにある間は DML で変更・削除できない。時間をおいてバッファから出てから実行するか、対象を古い行に絞って実行する。",
        note: "エラーは、対象の行がまだストリーミング バッファにあることを示している。これが正解。",
      },
      {
        text: "テーブルがパーティション分割されていない。",
        note: "パーティション分割の有無とは関係が無い。",
      },
      {
        text: "クエリのロケーションが、テーブルのロケーションと違う。",
        note: "ロケーションの違いなら、Not found などの別のエラーになる。",
      },
    ],
    explain:
      "従来のストリーミング挿入で追加した行は、しばらくの間ストリーミング バッファに置かれ、クエリでは読めるが、UPDATE や DELETE などの DML では変更できない。対象にバッファの行が含まれると、このエラーになる。時間をおいてバッファから出てから実行するか、WHERE の条件で取り込み時刻の古い行に絞る。後から直す運用が多いなら、取り込み方（バッチの読み込みや Storage Write API など）を見直す。",
    points: [
      "ストリーミング バッファの行は DML で変更できない。時間をおくか、古い行に絞る。",
      "権限やロケーションのエラーとは、メッセージで見分ける。",
    ],
  },
  {
    source: at(33, "3.2"),
    field: S3,
    answer: 2,
    text: "IG社の夜間のバッチは、bq query --location=US で SQL を実行している。新しく作ったデータセット ig_jp を参照する SQL を追加したところ、次のエラーになった。ig_jp は確かに存在し、担当者は中身を読める。最も適切な対処はどれか。",
    stem: {
      list: {
        items: ["Not found: Dataset ig-prod:ig_jp was not found in location US"],
      },
    },
    choices: [
      {
        text: "担当者に、ig_jp の BigQuery データ閲覧者を付与し直す。",
        note: "権限が無ければ Access Denied になる。存在するのに見つからないのは、ロケーションの食い違いである。",
      },
      {
        text: "データセット ig_jp のロケーションを US に変更する。",
        note: "データセットのロケーションは、作成後に変えられない。",
      },
      {
        text: "ig_jp は US 以外のロケーション（asia-northeast1 など）にある。その SQL は、データセットと同じロケーションを --location に指定して実行する。US のデータと結合したいなら、どちらかを同じロケーションに複製する。",
        note: "クエリのジョブは 1 つのロケーションで動き、別のロケーションのデータセットは見えない。これが正解。",
      },
      {
        text: "1 時間待ってから実行し直す。",
        note: "作成直後の反映の遅れではなく、ロケーションの指定の問題である。",
      },
    ],
    explain:
      "BigQuery のクエリのジョブは、1 つのロケーションで実行され、同じロケーションのデータセットしか読み書きできない。--location で US を指定していると、asia-northeast1 にあるデータセットは「その場所には見つからない」というエラーになる。データセットのロケーションは bq show で確かめ、ジョブのロケーションをそれに合わせる（参照するデータセットから自動で決めさせることもできる）。ロケーションの違うデータを 1 つのクエリで結合したいときは、どちらかを同じロケーションに複製する。",
    points: [
      "not found in location → ジョブのロケーションとデータセットのロケーションの食い違い。",
      "1 つのクエリで扱えるのは、同じロケーションのデータだけ。",
    ],
  },
  {
    source: at(34, "3.2"),
    field: S3,
    answer: 3,
    text: "IH社の Web アプリケーション（https://app.ih.example）は、ブラウザの JavaScript から、署名付き URL を使って Cloud Storage のバケットにファイルを直接アップロードする。ところが、ブラウザのコンソールに次のエラーが出て失敗する。同じ署名付き URL は curl では問題なく使える。最も適切な対処はどれか。",
    stem: {
      list: {
        items: [
          "Access to XMLHttpRequest at 'https://storage.googleapis.com/...' from origin 'https://app.ih.example' has been blocked by CORS policy",
        ],
      },
    },
    choices: [
      {
        text: "バケットを一般公開する。",
        note: "公開しても、ブラウザのクロスオリジンの確認は通らない。公開の危険が増えるだけである。",
      },
      {
        text: "署名付き URL の有効期限を延ばす。",
        note: "期限切れなら curl でも失敗する。ブラウザの確認の問題である。",
      },
      {
        text: "均一なバケットレベルのアクセスを無効にする。",
        note: "アクセスの制御の方式の設定で、CORS とは関係しない。",
      },
      {
        text: "バケットに CORS の設定を入れ、オリジン https://app.ih.example と、使うメソッド（PUT など）やヘッダーを許可する（gcloud storage buckets update --cors-file）。",
        note: "ブラウザが別のオリジンへの要求を許すかは、バケットの CORS の設定で決まる。これが正解。",
      },
    ],
    explain:
      "ブラウザは、ページと違うオリジン（ここでは storage.googleapis.com）への JavaScript からの要求を、相手が CORS で許可していなければ止める。curl などブラウザ以外では、この確認は行われない。Cloud Storage では、バケットに CORS の設定（許可するオリジン、メソッド、レスポンス ヘッダー、キャッシュの時間）を JSON で書き、gcloud storage buckets update --cors-file で設定する。CORS はアクセスの権限とは別の仕組みで、署名付き URL や IAM の設定とは独立している。",
    points: [
      "ブラウザから別オリジンのバケットへ → バケットの CORS の設定（--cors-file）。",
      "curl で動いてブラウザで止まるなら、CORS を疑う。",
    ],
  },
  {
    source: at(35, "3.2"),
    field: S3,
    answer: 0,
    text: "II社のアプリケーションで、Firestore の orders コレクションに対して「store_id が一致するものを、created_at の新しい順に」取り出すクエリを追加したところ、次のエラーで失敗した。最も適切な対処はどれか。",
    stem: {
      list: {
        items: [
          "FAILED_PRECONDITION: The query requires an index. You can create it here: https://console.firebase.google.com/...",
        ],
      },
    },
    choices: [
      {
        text: "複数のフィールドを組み合わせたクエリには複合インデックスが要る。エラーのリンクから、または gcloud firestore indexes composite create（インデックスの定義ファイル）で、store_id と created_at の複合インデックスを作る。",
        note: "インデックスを作れば、そのクエリを実行できるようになる。これが正解。",
      },
      {
        text: "Firestore の書き込みの割り当ての増加をリクエストする。",
        note: "割り当ての問題ではない。クエリに必要なインデックスが無い。",
      },
      {
        text: "データベースのロケーションを変える。",
        note: "ロケーションとは関係が無い。ロケーションは作成後に変えられない。",
      },
      {
        text: "アプリケーションのサービス アカウントに、Cloud Datastore オーナーのロールを付与する。",
        note: "権限の問題ではない。権限が足りなければ PERMISSION_DENIED になる。",
      },
    ],
    explain:
      "Firestore は、すべてのクエリをインデックスで処理する。1 つのフィールドのインデックスは自動で作られるが、等価の条件と別のフィールドの並べ替えを組み合わせるようなクエリには、複合インデックスが要る。無いとこのエラーになり、メッセージには作成用のリンクが付く。インデックスはコンソール、gcloud firestore indexes composite create、またはインデックスの定義ファイルで作れる。本番で使うインデックスは、定義ファイルで構成として管理しておくとよい。",
    points: [
      "The query requires an index → 複合インデックスを作る。",
      "インデックスの定義はファイルで管理しておく。",
    ],
  },
  {
    source: at(36, "3.3"),
    field: S3,
    answer: 1,
    text: "IJ社では、VPC hub が HA VPN と Cloud Router（BGP）でオンプレミスとつながっている。VPC app は hub と VPC ネットワーク ピアリングでつながっており、app の VM から hub の VM には届くが、オンプレミスには届かない。最も適切な対処はどれか。",
    choices: [
      {
        text: "app にも HA VPN を作り、オンプレミスと直接つなぐ。",
        note: "動くが、接続をもう 1 つ持つことになり、要件に対して過剰である。",
      },
      {
        text: "ピアリングで、hub 側はカスタム ルートのエクスポートを、app 側はカスタム ルートのインポートを有効にする。さらに hub の Cloud Router で、app のサブネットの範囲もオンプレミスに広告する。",
        note: "VPN で学んだ動的ルートをピアリングで渡し、戻りの経路もオンプレミスに伝える。これが正解。",
      },
      {
        text: "app に、オンプレミスの範囲への静的ルートを作り、次のホップを hub の VM にする。",
        note: "hub の VM は VPN の終端ではなく、通信をオンプレミスへ運ぶ経路にならない。",
      },
      {
        text: "ピアリングは推移しないので、app からオンプレミスに届かせる方法は無い。",
        note: "推移しないのは、別のピアリングで学んだルートである。VPN で学んだ動的ルートは、カスタム ルートとして交換できる。",
      },
    ],
    explain:
      "VPC ネットワーク ピアリングでは、サブネットのルートは自動で交換されるが、静的ルートや Cloud Router が学んだ動的ルート（カスタム ルート）は、エクスポートとインポートを有効にしたときだけ交換される。hub がオンプレミスから学んだルートを app に渡すには、hub 側でエクスポート、app 側でインポートを有効にする。戻りの通信のため、hub の Cloud Router のカスタムの広告で、app のサブネットの範囲もオンプレミスに伝える。別のピアリングで学んだルートは、これでも渡らない（推移しない）。",
    points: [
      "ピアリング先から VPN の先へ → カスタム ルートのエクスポートとインポート ＋ Cloud Router での範囲の広告。",
      "ピアリングで学んだルートは、さらに別のピアリングには渡らない。",
    ],
  },
  {
    source: at(37, "3.3"),
    field: S3,
    answer: 2,
    text: "IK社の取引先の API は、IK社の Cloud NAT の IP アドレスからの接続だけを許可している。ほとんどの VM からは接続できるが、vm-legacy からだけは拒否される。vm-legacy には、昔の作業のために外部 IP アドレスが付いたままになっている。最も適切な説明と対処はどれか。",
    choices: [
      {
        text: "vm-legacy のサブネットが Cloud NAT の対象に入っていないので、対象に加える。",
        note: "対象に加えても、外部 IP アドレスを持つ VM の通信には NAT が使われない。",
      },
      {
        text: "Cloud NAT のポートが足りないので、VM ごとの最小のポート数を増やす。",
        note: "ポートが足りないなら接続が落とされる。許可されていない送信元として拒否されている状況とは合わない。",
      },
      {
        text: "外部 IP アドレスを持つ VM の通信は Cloud NAT を通らず、自分の外部 IP アドレスから出ていく。vm-legacy の外部 IP アドレスを外す。",
        note: "外部 IP アドレスを外せば、Cloud NAT の IP アドレスから出ていくようになる。これが正解。",
      },
      {
        text: "取引先に、Google Cloud の IP アドレスの範囲をすべて許可してもらう。",
        note: "範囲が広すぎ、取引先が送信元を絞っている意味が無くなる。",
      },
    ],
    explain:
      "Cloud NAT は、外部 IP アドレスを持たない VM（のネットワーク インターフェース）の外向きの通信を変換する。外部 IP アドレスを持つ VM は、Cloud NAT の対象のサブネットにあっても、自分の外部 IP アドレスから直接出ていく。送信元の IP アドレスで許可している相手には、その VM だけ違うアドレスから届くので拒否される。外向きの通信を NAT の IP アドレスにそろえたいなら、VM から外部 IP アドレスを外す。",
    points: [
      "外部 IP アドレスを持つ VM は Cloud NAT を使わない。",
      "送信元を NAT の IP にそろえたいなら、VM の外部 IP アドレスを外す。",
    ],
  },
  {
    source: at(38, "3.4"),
    field: S3,
    answer: 3,
    text: "IL社の担当者は、監査ログを Cloud Storage のバケットに送るシンクを作り、シンクの書き込み ID にバケットへの書き込みのロールも付与した。10 分後にバケットを見ても、まだファイルが 1 つも無い。シンクのフィルタと権限に誤りは見当たらない。最も適切な説明はどれか。",
    choices: [
      {
        text: "シンクは作成前のログもまとめて送るので、その処理に時間がかかっている。",
        note: "シンクが送るのは、作成したあとに届いたログだけである。過去のログはさかのぼって送られない。",
      },
      {
        text: "ストレージ クラスが Archive のバケットには、シンクから書き込めない。",
        note: "どのストレージ クラスのバケットにも書き込める。",
      },
      {
        text: "監査ログは、シンクで別の宛先に送ることができない。",
        note: "監査ログも、シンクのフィルタに合えば Cloud Storage などに送れる。",
      },
      {
        text: "Cloud Storage への送信では、ログがまとめて 1 時間ごとにファイルとして書き込まれる。しばらく待ってから確かめる。",
        note: "BigQuery や Pub/Sub と違い、Cloud Storage にはまとめて書き込まれる。これが正解。",
      },
    ],
    explain:
      "ログのシンクの宛先によって、届くまでの時間が違う。Pub/Sub や BigQuery にはほぼ即時に送られるが、Cloud Storage には、ログをまとめて 1 時間ごとのファイルとして書き込む。作ってすぐにファイルが無くても、設定の誤りとは限らない。また、シンクは作成したあとに届いたログだけを送り、それより前のログは送らない。すぐに確かめたいなら、ログ エクスプローラで同じフィルタのログが出ているかを先に見る。",
    points: [
      "Cloud Storage へのシンクは、1 時間ごとにまとめて書き込む。",
      "シンクは作成後のログだけを送る。",
    ],
  },
  {
    source: at(39, "3.4"),
    field: S3,
    answer: 1,
    text: "IM社は、外部 IP アドレスで公開している VM の Web サーバーに、Cloud Monitoring の稼働時間チェックを設定した。社内からブラウザで開くと問題なく表示されるのに、稼働時間チェックはすべての地点で失敗している。VPC のファイアウォール ルールは、社内の拠点と取引先の IP 範囲からの TCP 443 だけを許可している。最も適切な対処はどれか。",
    choices: [
      {
        text: "稼働時間チェックの間隔を短くする。",
        note: "間隔を変えても、チェックの通信がファイアウォールで止められることは変わらない。",
      },
      {
        text: "稼働時間チェックの送信元の IP アドレス（gcloud monitoring uptime list-ips で確かめられる）からの TCP 443 を許可するファイアウォール ルールを作る。",
        note: "稼働時間チェックは Google の決まった送信元から来るので、それを許可する。これが正解。",
      },
      {
        text: "ロードバランサのヘルスチェックの範囲（35.191.0.0/16 と 130.211.0.0/22）を許可する。",
        note: "ロードバランサのヘルスチェックの送信元で、稼働時間チェックの送信元とは別である。",
      },
      {
        text: "VM に Ops エージェントを入れる。",
        note: "VM の中から指標やログを送る仕組みで、外から来る稼働時間チェックの通信は通らない。",
      },
    ],
    explain:
      "Cloud Monitoring の稼働時間チェックは、世界の複数の地点にある Google のチェック用のサーバーから、対象に要求を送る。送信元の IP アドレスは決まっており、gcloud monitoring uptime list-ips などで一覧を得られる。ファイアウォールで送信元を絞っている対象を監視するなら、これらのアドレスからの通信を許可する。ロードバランサのヘルスチェックの範囲とは別なので、取り違えない。",
    points: [
      "稼働時間チェックが全地点で失敗 → チェックの送信元の IP をファイアウォールで許可する（list-ips）。",
      "ロードバランサのヘルスチェックの範囲とは別。",
    ],
  },
  {
    source: at(40, "3.4"),
    field: S3,
    answer: [1, 3],
    text: "IN社の運用チームには、「VM の CPU 使用率が 80% を超えた」というアラートが、1 日に何十回も発報と解消を繰り返して届く。調べると、数十秒だけ跳ね上がってすぐ戻る動きがほとんどだった。高い状態が続いたときだけ通知したい。アラート ポリシーの見直しとして適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "通知チャネルを、メールから SMS に変える。",
        note: "届け先を変えるだけで、通知の回数は減らない。",
      },
      {
        text: "条件に持続時間（再テストの期間）を設け、しきい値を一定の時間（例: 5 分）超え続けたときだけ発報させる。",
        note: "短い跳ね上がりでは発報しなくなる。これが正解。",
      },
      {
        text: "しきい値を 30% に下げる。",
        note: "しきい値を下げると、発報はかえって増える。",
      },
      {
        text: "指標を集計する期間（アライメントの期間）を長くし、平均などで短い跳ね上がりを均す。",
        note: "数十秒の跳ね上がりが平均の中で小さくなり、続く高負荷だけがしきい値を超える。これが正解。",
      },
    ],
    explain:
      "メトリクスのしきい値の条件は、指標をアライメントの期間ごとに集計した値を、しきい値と比べて判断する。アライメントの期間が短いと、一瞬の跳ね上がりもそのまま超過として扱われる。アライメントの期間を長くして平均などで集計すると、短い揺れが均される。さらに、条件の持続時間（再テストの期間）を設けると、しきい値を超えた状態がその時間続いたときだけ発報する。通知が多すぎるアラートは、やがて誰も見なくなるので、本当に対応が要る状態にだけ鳴るよう調整する。",
    points: [
      "短い揺れで鳴るアラート → 持続時間（再テストの期間）を設ける。",
      "アライメントの期間を長くして、短い跳ね上がりを均す。",
    ],
  },
  // ───────── セクション4 アクセスとセキュリティ（問41〜問50） ─────────
  {
    source: at(41, "4.1"),
    field: S4,
    answer: 2,
    text: "IO社では、本番のプロジェクトを VPC Service Controls のサービス境界で囲み、BigQuery と Cloud Storage を保護している。データ分析の委託先の担当者が、委託先のネットワークから本番のバケットを読もうとすると、IAM のロールは付いているのに次のエラーになる。委託先の特定の担当者に、委託先の IP 範囲からだけ読ませたい。最も適切な対処はどれか。",
    stem: {
      list: {
        items: [
          "Request is prohibited by organization's policy. vpcServiceControlsUniqueIdentifier: 2b4fXq9",
        ],
      },
    },
    choices: [
      {
        text: "担当者に、バケットでストレージ管理者を付与する。",
        note: "IAM のロールを強くしても、サービス境界による拒否は通れない。",
      },
      {
        text: "サービス境界を削除する。",
        note: "本番のデータの保護をまるごと外すことになる。",
      },
      {
        text: "委託先の IP 範囲を条件にしたアクセス レベルを作り、委託先の担当者を対象にした上り（ingress）のルールで、境界の外からのその読み取りを許可する。まずはドライランで影響を確かめる。",
        note: "境界を保ったまま、特定の相手と送信元と操作だけを通せる。これが正解。",
      },
      {
        text: "委託先の担当者のアカウントを、自社の Cloud Identity に移す。",
        note: "アカウントの所属を変えても、境界の外のネットワークから来る要求であることは変わらない。",
      },
    ],
    explain:
      "VPC Service Controls は、サービス境界の外から境界の中の Google Cloud のサービスへのアクセスを、IAM とは別に止める。拒否されると、エラーに vpcServiceControlsUniqueIdentifier が出るので、その値で監査ログを検索すれば、どの境界とどのルールで止められたかが分かる。特定の相手だけを通すには、送信元の IP 範囲などを条件にしたアクセス レベルや、相手の ID・送信元・サービスと操作を指定した上り（ingress）のルールを使う。変更は、まずドライランの構成で違反の記録を見てから強制する。",
    points: [
      "vpcServiceControlsUniqueIdentifier のエラー → サービス境界による拒否。IAM では通れない。",
      "境界の外の特定の相手を通す → アクセス レベルや上り（ingress）のルール。",
    ],
  },
  {
    source: at(42, "4.1"),
    field: S4,
    answer: [0, 3],
    text: "IP社のセキュリティ担当者が、Cloud KMS の鍵のバージョンを止める操作について確かめている。正しい説明はどれか。2つ選べ。",
    choices: [
      {
        text: "鍵のバージョンを無効にすると、そのバージョンで暗号化したデータは、有効に戻すまで復号できない。有効に戻せば、また使える。",
        note: "無効化は元に戻せる操作である。これが正解。",
      },
      {
        text: "鍵のバージョンの破棄を予定すると、その場で鍵の素材が消え、取り消すことはできない。",
        note: "破棄は予定の期間のあとに行われ、それまでは復元できる。",
      },
      {
        text: "鍵をローテーションすると、それまでのデータも新しいバージョンで自動的に暗号化し直される。",
        note: "新しいバージョンは、それ以後の暗号化に使われるだけで、既存のデータは古いバージョンで暗号化されたままである。",
      },
      {
        text: "鍵のバージョンの破棄を予定しても、予定の期間（既定は 30 日）のうちは復元できる。期間が過ぎて破棄されると、そのバージョンで暗号化したデータは復号できなくなる。",
        note: "予定の期間は、誤った破棄から戻すための猶予である。これが正解。",
      },
    ],
    explain:
      "Cloud KMS の鍵は、キーリングの中の鍵と、その鍵のバージョンからなる。キーリングと鍵は削除できず、止めたり消したりするのはバージョンである。バージョンを無効にすると、そのバージョンでの暗号化と復号ができなくなるが、有効に戻せる。破棄を予定すると、予定の期間（既定 30 日）のあとに鍵の素材が消され、そのバージョンで暗号化したデータは二度と復号できなくなる。期間内なら復元できる。ローテーションは新しいバージョンを主に切り替えるだけなので、古いバージョンで暗号化したデータが残っている間は、古いバージョンを破棄しない。",
    points: [
      "無効化は元に戻せる。破棄は予定の期間（既定 30 日）のうちだけ復元できる。",
      "ローテーションしても既存のデータは暗号化し直されない。古いバージョンは残す。",
    ],
  },
  {
    source: at(43, "4.1"),
    field: S4,
    answer: 0,
    text: "IQ社では、元のデータを持つデータセット raw を利用者に直接見せず、共有用のデータセット share に置いたビューだけを使わせている。ビューは承認済みビューとして raw で 1 つずつ承認しているが、ビューを追加するたびに raw の設定を変える手間がかかり、承認を忘れたビューが Access Denied になることも多い。最も適切な対処はどれか。",
    choices: [
      {
        text: "raw で、データセット share を承認済みデータセットとして承認する。share の中のビューは、今後追加するものも含めて raw を読めるようになる。",
        note: "データセットの単位で承認するので、ビューごとの承認が要らなくなる。これが正解。",
      },
      {
        text: "利用者に、raw で BigQuery データ閲覧者を付与する。",
        note: "元のデータを直接見せないという方針に反する。",
      },
      {
        text: "ビューをやめて、raw のテーブルを share にコピーする。",
        note: "元のデータの更新が反映されず、コピーの管理も要る。見せたくない列も一緒に渡りうる。",
      },
      {
        text: "share のビューで、利用者に BigQuery データ編集者を付与する。",
        note: "利用者の権限の問題ではない。ビューが raw を読むための承認が無いことが原因である。",
      },
    ],
    explain:
      "承認済みビューは、ビューに元のデータセットを読む許可を与え、利用者には元のデータを見せずにビューの結果だけを使わせる仕組みである。ビューごとに承認するのが手間なら、承認済みデータセットを使う。元のデータセットで、ビューを置くデータセットを承認すると、そのデータセットの中のビュー（あとから追加するものを含む）がすべて元のデータを読めるようになる。共有用のデータセットにビューを作れる人を絞っておくことが前提になる。",
    points: [
      "ビューを置くデータセットごと承認する → 承認済みデータセット。",
      "あとから追加したビューも、個別の承認なしで元のデータを読める。",
    ],
  },
  {
    source: at(44, "4.1"),
    field: S4,
    answer: 2,
    text: "IR社の組織には、ロールの付与先を自社のドメインに限る組織のポリシー（ドメインで制限された共有、iam.allowedPolicyMemberDomains）が設定されている。広報チームが、キャンペーン用の静的サイトのバケットで allUsers にストレージ オブジェクト閲覧者を付与しようとしたところ、組織のポリシーに違反するというエラーになった。この公開は社内で承認済みである。最も適切な対処はどれか。",
    choices: [
      {
        text: "広報チームの担当者に、組織のポリシー管理者を付与して、自分で制約を外させる。",
        note: "組織全体の統制を変えられる強い権限を渡すことになる。",
      },
      {
        text: "allUsers の代わりに、allAuthenticatedUsers に付与する。",
        note: "これも自社のドメインの外の主体なので、同じく拒否される。公開の範囲もほとんど変わらない。",
      },
      {
        text: "ドメインで制限された共有は、allUsers や allAuthenticatedUsers への付与も止める。公開を承認したプロジェクトにだけ、この制約を緩める例外のポリシーを置く。",
        note: "例外を、公開が必要な場所に限って作る。これが正解。",
      },
      {
        text: "均一なバケットレベルのアクセスを無効にし、ACL でオブジェクトを公開する。",
        note: "組織の統制をすり抜けようとする対処で、承認された例外の作り方として適切でない。",
      },
    ],
    explain:
      "ドメインで制限された共有（iam.allowedPolicyMemberDomains）は、許可した組織（顧客 ID）に属さない主体へのロールの付与を拒否する。allUsers や allAuthenticatedUsers もこれに含まれるので、制約がかかった場所ではバケットを一般公開できない。公開が承認されたものは、公開用のプロジェクトを分け、そのプロジェクトにだけ制約を緩めるポリシーを置く（タグを条件にする方法もある）。統制を外す範囲をできるだけ狭くし、公開してよいものだけをそこに置く。",
    points: [
      "ドメインで制限された共有は、allUsers や allAuthenticatedUsers への付与も止める。",
      "公開が必要なら、公開用のプロジェクトにだけ例外を置く。",
    ],
  },
  {
    source: at(45, "4.1"),
    field: S4,
    answer: 3,
    text: "IS社は、BigQuery のテーブル sales に、地域ごとの営業チームが自分の地域の行だけを見られるよう、行アクセス ポリシーを作った。ところが、全社の集計をする経営企画チームが同じテーブルをクエリすると、エラーにはならないのに結果が 0 行になる。経営企画チームは、テーブルで BigQuery データ閲覧者のロールを持っている。最も適切な説明と対処はどれか。",
    choices: [
      {
        text: "データ閲覧者ではなく、データ編集者のロールが要る。",
        note: "ロールを強くしても、行アクセス ポリシーで行が絞られることは変わらない。",
      },
      {
        text: "クエリの結果のキャッシュが古いので、キャッシュを使わずに実行し直す。",
        note: "キャッシュの問題ではない。ポリシーで返す行が決まっている。",
      },
      {
        text: "行アクセス ポリシーを作ったテーブルは、テーブルの所有者しか読めない。",
        note: "そうではない。ポリシーで許された行は、権限のある利用者が読める。",
      },
      {
        text: "行アクセス ポリシーのあるテーブルでは、どのポリシーの対象にも入っていない利用者には行が返らない。経営企画チームのグループを対象にして、すべての行を許すポリシー（フィルタが TRUE）を加える。",
        note: "ポリシーのあるテーブルでは、許された行だけが返る。全部を見せたい相手にもポリシーが要る。これが正解。",
      },
    ],
    explain:
      "BigQuery の行アクセス ポリシーを 1 つでも作ると、そのテーブルを読む利用者には、自分が対象に入っているポリシーのフィルタに合う行だけが返る。どのポリシーの対象にも入っていない利用者には、エラーではなく 0 行の結果が返るので、気付きにくい。全社の集計のように全部の行を見せたい相手には、FILTER USING (TRUE) のポリシーを作って対象に入れる。ポリシーの対象は、人ではなくグループにしておくと管理しやすい。",
    points: [
      "行アクセス ポリシーの対象外の利用者には、エラーではなく 0 行が返る。",
      "全部の行を見せる相手には、フィルタが TRUE のポリシーを作る。",
    ],
  },
  {
    source: at(46, "4.2"),
    field: S4,
    answer: 1,
    text: "IT社は、既存の GKE Standard のクラスタで GKE 用 Workload Identity 連携を有効にし、Kubernetes のサービス アカウントへの付与も済ませた。新しく作ったノードプールの Pod では期待どおりに動くが、既存のノードプールで動く Pod から Google Cloud の API を呼ぶと、相変わらずノードのサービス アカウントの ID で呼ばれて権限のエラーになる。最も適切な対処はどれか。",
    choices: [
      {
        text: "ノードのサービス アカウントに、Pod が必要とするロールを付与する。",
        note: "同じノードのすべての Pod に権限が広がり、Pod ごとに ID を分けるという目的に反する。",
      },
      {
        text: "既存のノードプールで GKE のメタデータ サーバーを有効にする（gcloud container node-pools update --workload-metadata=GKE_METADATA）。",
        note: "クラスタで有効にしても、既存のノードプールには反映されない。ノードプールごとに有効にする。これが正解。",
      },
      {
        text: "Pod を再起動する。",
        note: "ノードプールの設定が変わらない限り、同じノードの上で同じ動きになる。",
      },
      {
        text: "クラスタを作り直す。",
        note: "既存のノードプールを更新すれば足りる。要件に対して過剰である。",
      },
    ],
    explain:
      "GKE 用 Workload Identity 連携では、ノードで動く GKE のメタデータ サーバーが Pod からのトークンの要求を受け、Kubernetes のサービス アカウントに対応する ID のトークンを返す。既存の Standard のクラスタで Workload Identity 連携を有効にしても、既存のノードプールは従来のメタデータ サーバーのままで、Pod はノードのサービス アカウントの ID を使う。gcloud container node-pools update で --workload-metadata=GKE_METADATA を指定して、ノードプールごとに有効にする（ノードは順に作り直される）。",
    points: [
      "既存のノードプールは、--workload-metadata=GKE_METADATA で個別に有効にする。",
      "有効でないノードの Pod は、ノードのサービス アカウントの ID を使う。",
    ],
  },
  {
    source: at(47, "4.2"),
    field: S4,
    answer: [1, 2],
    text: "IU社は、VM に Ops エージェントを入れたが、Cloud Logging にも Cloud Monitoring にも VM の中のログと指標が届かない。エージェントの状態を見ると、権限の不足で送信に失敗している。VM には専用のサービス アカウント iu-vm-sa が付いており、アクセス スコープは cloud-platform である。iu-vm-sa に付与するロールとして適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "ログ閲覧者（roles/logging.viewer）",
        note: "ログを読むためのロールで、ログを書き込むことはできない。",
      },
      {
        text: "ログ書き込み（roles/logging.logWriter）",
        note: "エージェントが Cloud Logging にログを書き込むために要る。これが正解。",
      },
      {
        text: "モニタリング指標の書き込み（roles/monitoring.metricWriter）",
        note: "エージェントが Cloud Monitoring に指標を書き込むために要る。これが正解。",
      },
      {
        text: "モニタリング閲覧者（roles/monitoring.viewer）",
        note: "指標やダッシュボードを読むためのロールで、指標を書き込むことはできない。",
      },
    ],
    explain:
      "Ops エージェントは、VM に付いたサービス アカウントの権限で、ログと指標を送る。ログの送信にはログ書き込み、指標の送信にはモニタリング指標の書き込みのロールが要る。読むためのロール（閲覧者）では書き込めない。アクセス スコープが絞られていると、ロールがあっても送れないので、スコープは cloud-platform にして権限はロールで決める。専用のサービス アカウントを使うときは、この 2 つを付け忘れやすい。",
    points: [
      "Ops エージェントの送信 → VM の SA にログ書き込みとモニタリング指標の書き込み。",
      "閲覧者のロールでは書き込めない。",
    ],
  },
  {
    source: at(48, "4.2"),
    field: S4,
    answer: 0,
    text: "IV社のサービス アカウント legacy-sa は、古い連携先のために鍵を使っている。担当者が新しい鍵を作ろうとしたところ、FAILED_PRECONDITION のエラーで作れなかった。組織のポリシーで鍵の作成は禁止されておらず、担当者にはサービス アカウント キー管理者のロールがある。gcloud iam service-accounts keys list で見ると、利用者が作った鍵がたくさん残っていた。最も適切な対処はどれか。",
    choices: [
      {
        text: "1 つのサービス アカウントに持たせられる鍵の数には上限（10 個）がある。使われていない古い鍵を確かめて削除してから、新しい鍵を作る。",
        note: "上限に達していることが原因で、使っていない鍵を消せば作れる。古い鍵を残さないことにもなる。これが正解。",
      },
      {
        text: "担当者に、プロジェクトのオーナーのロールを付与する。",
        note: "権限の問題ではない。権限が足りなければ PERMISSION_DENIED になる。",
      },
      {
        text: "新しいサービス アカウントを作り、権限を同じように付与して、そちらで鍵を作る。",
        note: "動くが、古い鍵を残したままアカウントを増やすことになり、管理が悪くなる。",
      },
      {
        text: "組織のポリシーで、鍵の有効期限を設定する。",
        note: "これから作る鍵に期限を付けるもので、今の上限の問題は解決しない。",
      },
    ],
    explain:
      "サービス アカウントには、利用者が作る鍵を最大 10 個まで持たせられる。上限に達すると、新しい鍵の作成は FAILED_PRECONDITION で失敗する。鍵が多く残っているのは、ローテーションのたびに古い鍵を消していない兆候でもあるので、Policy Analyzer のアクティビティ分析などで使われていない鍵を確かめ、削除してから新しい鍵を作る。そもそも鍵を使わない方法（割り当てたサービス アカウントや Workload Identity 連携）に移せないかも検討する。",
    points: [
      "1 つのサービス アカウントの鍵は 10 個まで。超えると FAILED_PRECONDITION。",
      "使われていない古い鍵は、確かめて削除する。",
    ],
  },
  {
    source: at(49, "4.2"),
    field: S4,
    answer: 3,
    text: "IW社は、共有 VPC のサービス プロジェクト iw-app で、ホスト プロジェクト iw-net のサブネットを使う GKE のクラスタを作ろうとしている。担当者にはそのサブネットでネットワーク ユーザーのロールが付いているが、クラスタの作成が権限のエラーで失敗する。最も適切な対処はどれか。",
    choices: [
      {
        text: "担当者に、ホスト プロジェクトで共有 VPC 管理者のロールを付与する。",
        note: "ホストとサービス プロジェクトの関係を管理するロールで、GKE が使う ID の権限の不足は解決しない。",
      },
      {
        text: "クラスタを、ホスト プロジェクト iw-net に作る。",
        note: "サービス プロジェクトでクラスタを動かすという構成を崩すことになる。",
      },
      {
        text: "担当者に、iw-app でオーナーのロールを付与する。",
        note: "足りないのは担当者の権限ではなく、GKE のサービス エージェントのホスト プロジェクトでの権限である。",
      },
      {
        text: "iw-app の GKE のサービス エージェント（service-プロジェクト番号@container-engine-robot.iam.gserviceaccount.com）に、iw-net で Kubernetes Engine ホスト サービス エージェント ユーザー（roles/container.hostServiceAgentUser）を付与し、使うサブネットでネットワーク ユーザーも付与する。",
        note: "GKE は、サービス エージェントの権限でホスト プロジェクトのネットワークのリソースを扱う。これが正解。",
      },
    ],
    explain:
      "共有 VPC のサブネットに GKE のクラスタを作ると、ノードやロードバランサ、ファイアウォール ルールなどの作成を、サービス プロジェクトの GKE のサービス エージェントがホスト プロジェクトに対して行う。そのため、GKE のサービス エージェントに、ホスト プロジェクトで Kubernetes Engine ホスト サービス エージェント ユーザー、使うサブネットでネットワーク ユーザーを付与する。サービス プロジェクトの Google API サービス エージェント（プロジェクト番号@cloudservices.gserviceaccount.com）にも、サブネットでネットワーク ユーザーが要る。",
    points: [
      "共有 VPC の GKE → GKE のサービス エージェントに、ホストで container.hostServiceAgentUser とサブネットのネットワーク ユーザー。",
      "作成を行うのは担当者ではなく、サービス エージェントである。",
    ],
  },
  {
    source: at(50, "4.2"),
    field: S4,
    answer: 2,
    text: "IX社では、VM に OS Login を使っている。運用担当者には、プロジェクトで Compute OS 管理者ログイン（roles/compute.osAdminLogin）を付与した。サービス アカウントの付いていない VM には SSH できるが、サービス アカウント ix-app-sa が付いた VM に SSH しようとすると、権限のエラーになる。最も適切な対処はどれか。",
    choices: [
      {
        text: "運用担当者に、ix-app-sa の鍵を作って渡す。",
        note: "鍵を配ることになり、SSH の権限の不足も解決しない。",
      },
      {
        text: "VM のメタデータに、運用担当者の SSH の公開鍵を追加する。",
        note: "OS Login を使う VM では、メタデータの SSH 鍵は使われない。",
      },
      {
        text: "運用担当者に、ix-app-sa に対するサービス アカウント ユーザー（roles/iam.serviceAccountUser）を付与する。",
        note: "サービス アカウントの付いた VM に入ると、その権限を使えるので、そのサービス アカウントを使う許可も要る。これが正解。",
      },
      {
        text: "VM から ix-app-sa を外す。",
        note: "VM の中のアプリケーションが、Google Cloud の API を呼べなくなる。",
      },
    ],
    explain:
      "サービス アカウントが付いた VM にログインすると、VM の中からそのサービス アカウントのトークンを取得して、その権限で操作できる。そのため OS Login では、ログインのロール（Compute OS ログインや OS 管理者ログイン）に加えて、VM に付いたサービス アカウントに対するサービス アカウント ユーザーのロールが要る。付与はプロジェクト全体ではなく、そのサービス アカウントに対して行えば、ほかのサービス アカウントには広がらない。",
    points: [
      "SA の付いた VM に OS Login で入る → その SA に対するサービス アカウント ユーザーも要る。",
      "付与は対象のサービス アカウントに対して行う。",
    ],
  },
];
