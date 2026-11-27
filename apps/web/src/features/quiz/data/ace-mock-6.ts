import type { Question, Source } from "../types";

/**
 * Google Cloud Associate Cloud Engineer 対策 模擬試験 6（問1〜問50）。
 *
 * IPA の過去問題と違い、**問題文・選択肢・正解・解説のすべてを本サイトで書き下ろしている**。
 * どこかの認定試験の実際の設問ではなく、公式の模擬試験でもない。
 *
 * 典拠にした公開資料:
 * - Google Cloud「Associate Cloud Engineer 認定試験ガイド」（4 セクションの出題範囲。reference には節番号を書く）
 *
 * このセットが問う層は「移行と自動化」。オンプレミスや他の場所からの移し方（Migrate to Virtual
 * Machines、Database Migration Service、Transfer Appliance、BigQuery Data Transfer Service、
 * BigLake テーブル）と、手作業を仕組みに置き換える方法（Terraform の gcs バックエンドと import、
 * Infrastructure Manager、gcloud の --filter と --format、グループのメンバーシップ、スケジュールされた
 * クエリ、Artifact Registry のクリーンアップ ポリシー）を中心に置いた。自動化に使う ID の最小権限
 * （HMAC キー、アプリごとのサービス アカウント、トークンの有効期間の延長）も扱う。
 *
 * 作り方の方針:
 * - 設問は「立場と制約のある場面」から始め、覚えた言葉ではなく選び方を問う
 * - 選択肢は 4 つのうち 1〜2 つを**正解と紛らわしいもの**にする（似たロール、1 段ずれた範囲、
 *   似たコマンドやフラグ、要件に対して過剰な対処など）。残りは明確に誤りとする
 * - なぜその選択肢が違うのかは choice.note に 1 つずつ書く
 * - 模擬試験1〜5 で問うた論点を、場面だけ変えて同じ問い方で出すことはしない
 * - 上限値や料金のように確信の持てない数値は出題しない
 */

const GUIDE = "Google Cloud「Associate Cloud Engineer 認定試験ガイド」";

const at = (no: number, section: string): Source => ({
  kind: "original",
  deck: "ace-mock-6",
  label: "ACE 模擬6",
  no,
  reference: `${GUIDE} ${section}`,
});

const S1 = "セクション1 環境の設定";
const S2 = "セクション2 計画と実装";
const S3 = "セクション3 運用";
const S4 = "セクション4 アクセスとセキュリティ";

export const ACE_MOCK_6: [Question, ...Question[]] = [
  // ───────── セクション1 環境の設定（問1〜問10） ─────────
  {
    source: at(1, "1.1"),
    field: S1,
    answer: 2,
    text: "BA社のセキュリティ方針では、ファイアウォール ルールの緩い default ネットワークを使わせないことにしている。ところが新しいプロジェクトで Compute Engine API を有効にすると、default ネットワークが自動で作られてしまう。組織にはすでに、default ネットワークを持つプロジェクトが 40 ほどある。対応として最も適切なものはどれか。",
    choices: [
      {
        text: "組織で制約 compute.vmExternalIpAccess をすべて拒否にする。",
        note: "VM に外部 IP アドレスを付けさせない制約で、default ネットワークの自動作成は止まらない。",
      },
      {
        text: "組織で制約 compute.skipDefaultNetworkCreation を有効にする。これで今後の作成が止まり、既存のプロジェクトの default ネットワークも自動で削除される。",
        note: "前半は正しいが、この制約が効くのはプロジェクトを作るときだけである。すでにある default ネットワークは消えない。",
      },
      {
        text: "組織で制約 compute.skipDefaultNetworkCreation を有効にして今後の作成を止め、既存の 40 の default ネットワークは、使っているリソースが無いことを確かめてから個別に削除する。",
        note: "これから作るプロジェクトは制約で防ぎ、既存のものは別に片付ける。これが正解。",
      },
      {
        text: "各プロジェクトのオーナーに、プロジェクトを作ったらすぐ default ネットワークを手作業で削除するよう依頼する。",
        note: "人の作業に頼るので漏れが出る。削除されるまでの間は default ネットワークが残る。",
      },
    ],
    explain:
      "新しいプロジェクトで Compute Engine API を有効にすると、自動モードの VPC ネットワーク default と、内部通信や SSH・RDP などを許すファイアウォール ルールが作られる。ブール型の制約 compute.skipDefaultNetworkCreation を組織やフォルダで有効にすると、その下に新しく作るプロジェクトでは default ネットワークが作られなくなる。ただし組織のポリシーは、多くの場合、リソースを作ったり変えたりするときに評価されるもので、すでにあるリソースを遡って消したり直したりはしない。既存の default ネットワークは、VM などが使っていないことを確かめてから削除する。",
    points: [
      "default ネットワークの自動作成を止める → compute.skipDefaultNetworkCreation。",
      "組織のポリシーは既存のリソースを遡って消さない。既存分は別に片付ける。",
    ],
  },
  {
    source: at(2, "1.1"),
    field: S1,
    answer: 0,
    text: "BB社の開発者は、手元の PC で gcloud auth application-default login を実行し、クライアント ライブラリから Cloud Vision API を呼ぶ処理を試している。実行すると「ローカルのアプリケーションのデフォルト認証情報（ADC）で認証しているが、この API には割り当てプロジェクト（quota project）が必要で、設定されていない」という趣旨のエラーになった。費用と割り当ては検証用のプロジェクト dev-nlp に付けたい。最も適切な対処はどれか。",
    choices: [
      {
        text: "gcloud auth application-default set-quota-project dev-nlp を実行する。",
        note: "ADC の認証情報ファイルに割り当てプロジェクトを書き込み、ライブラリからの呼び出しの割り当てと費用を dev-nlp に付ける。これが正解。",
      },
      {
        text: "gcloud config set project dev-nlp を実行する。",
        note: "gcloud CLI の既定のプロジェクトが変わるだけで、すでに作られた ADC の認証情報ファイルの中身は変わらない。",
      },
      {
        text: "dev-nlp にサービス アカウントを作って鍵をダウンロードし、環境変数 GOOGLE_APPLICATION_CREDENTIALS にそのパスを設定する。",
        note: "動きはするが、長期間有効な鍵を手元に置くことになり、漏えいの危険が増える。設定 1 つで済む問題に対して過剰である。",
      },
      {
        text: "Cloud Vision API の割り当ての増加をリクエストする。",
        note: "上限に達したのではなく、どのプロジェクトの割り当てを使うかが決まっていないことが原因である。",
      },
    ],
    explain:
      "ユーザーの認証情報で ADC を作った場合、一部の API では、どのプロジェクトの割り当てと費用を使うかを示す割り当てプロジェクト（quota project）が必要になる。gcloud auth application-default set-quota-project で、ADC の認証情報ファイルにこれを設定できる。設定する人は、そのプロジェクトで serviceusage.services.use の権限（Service Usage ユーザーのロールなど）を持っている必要がある。gcloud config set project は CLI の既定のプロジェクトを変える設定で、ADC とは別物である。",
    points: [
      "ADC の割り当てプロジェクト → gcloud auth application-default set-quota-project。",
      "gcloud の既定のプロジェクトと、ADC の割り当てプロジェクトは別の設定。",
    ],
  },
  {
    source: at(3, "1.1"),
    field: S1,
    answer: 3,
    text: "BC社では、社内規程でログを含むすべてのデータを日本国内に保存することになっている。調べると、プロジェクトを作ると自動で作られる _Default と _Required のログバケットの場所が global になっていた。今後作るプロジェクトでは、これらのログバケットが最初から asia-northeast1 に作られるようにしたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "プロジェクトを作るたびに gcloud logging buckets update _Default --location=asia-northeast1 を実行する。",
        note: "ログバケットの場所は、作ったあとから変えられない。毎回の手作業にもなる。",
      },
      {
        text: "VPC Service Controls のサービス境界で Cloud Logging を囲む。",
        note: "境界の外へのデータの持ち出しを防ぐ仕組みで、ログの保存場所は変わらない。",
      },
      {
        text: "すべてのログを東京の Cloud Storage バケットへ送るシンクを作る。",
        note: "コピーが東京にできるだけで、_Required と _Default のログバケットには引き続き global で保存される。",
      },
      {
        text: "組織に対する Cloud Logging の既定の設定で、ストレージの場所を asia-northeast1 にする（gcloud logging settings update --organization=ORG_ID --storage-location=asia-northeast1）。",
        note: "これ以降に組織の下で作られるプロジェクトの _Default と _Required のログバケットが、指定した場所に作られる。これが正解。",
      },
    ],
    explain:
      "Cloud Logging では、組織やフォルダに対して既定の設定を決めておける。ストレージの場所を指定しておくと、その後に作られるプロジェクトの _Default と _Required のログバケットがその場所に作られる。ログバケットの場所は作成後に変更できないので、規程が決まった時点で先に設定しておくことが大切である。すでにあるプロジェクトについては、東京に新しいログバケットを作り、_Default のシンクの送り先をそこに変えるといった対応を別に行う。",
    points: [
      "新しいプロジェクトのログバケットの場所 → 組織やフォルダの Cloud Logging の既定の設定。",
      "ログバケットの場所は作成後に変えられない。",
    ],
  },
  {
    source: at(4, "1.1"),
    field: S1,
    answer: 1,
    text: "BD社の運用担当者は Cloud Shell で作業している。apt で入れたツールが、しばらくして Cloud Shell を開き直すと消えてしまう。一方、ホーム ディレクトリに置いた設定ファイルは残っている。追加のツールを毎回手で入れ直さずに使えるようにしたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "Cloud Shell のタブを閉じずに開いたままにしておく。",
        note: "操作の無いセッションは一定時間で終わり、そのたびに環境は作り直される。根本的な対処にならない。",
      },
      {
        text: "ホーム ディレクトリの .customize_environment にインストールの手順を書いておき、Cloud Shell の起動のたびに自動で入れさせる。",
        note: "ホーム ディレクトリは残るので、そこに置いたスクリプトが起動時に実行され、ツールが入り直す。これが正解。",
      },
      {
        text: "Cloud Shell の VM のスナップショットを取り、次回はそこから起動する。",
        note: "Cloud Shell の VM は Google が管理するもので、利用者がスナップショットを取ったり、そこから起動したりはできない。",
      },
      {
        text: "ツールを /usr/local にインストールすれば、次回も残る。",
        note: "残るのはホーム ディレクトリ（$HOME）だけで、/usr/local を含むそれ以外の場所は作り直しのたびに初期状態に戻る。",
      },
    ],
    explain:
      "Cloud Shell は、使うたびに一時的な VM の上に作られるシェル環境である。保存されて次回も使えるのは、5 GB のホーム ディレクトリ（$HOME）だけで、apt などでシステムの場所に入れたものはセッションが終わると失われる。$HOME/.customize_environment というスクリプトを置いておくと、Cloud Shell の起動時に実行されるので、追加のツールを毎回自動で入れられる。なお、長い期間 Cloud Shell を使わないとホーム ディレクトリも削除されることがあるので、大事なファイルはリポジトリなどに置いておく。",
    points: [
      "Cloud Shell で残るのはホーム ディレクトリだけ。",
      "追加のツールは $HOME/.customize_environment で起動のたびに入れる。",
    ],
  },
  {
    source: at(5, "1.1"),
    field: S1,
    answer: [0, 3],
    text: "BE社のセキュリティ チームは、組織全体に次の 2 つの方針を組織のポリシーで適用したい。設定する制約として適切なものはどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "方針A: Cloud Run のサービスを、インターネットから run.app の URL で直接呼べないようにする。外部からの利用は、外部アプリケーション ロードバランサを経由したものだけにする",
          "方針B: Cloud Storage では、オブジェクトごとの ACL を使わせず、アクセスの管理を IAM だけで行わせる",
        ],
      },
    },
    choices: [
      {
        text: "run.allowedIngress で、許可する値を internal-and-cloud-load-balancing にする",
        note: "Cloud Run のサービスに設定できる上り（ingress）の値を制限する。内部とロードバランサ経由だけに限れば方針A に合う。これが正解。",
      },
      {
        text: "compute.vmExternalIpAccess をすべて拒否にする",
        note: "Compute Engine の VM に外部 IP アドレスを付けさせない制約で、Cloud Run のサービスへの入口は変わらない。",
      },
      {
        text: "storage.publicAccessPrevention を有効にする",
        note: "バケットやオブジェクトの一般公開を防ぐ制約で、公開しない範囲での ACL の利用は止められない。",
      },
      {
        text: "storage.uniformBucketLevelAccess を有効にする",
        note: "バケットで均一なバケットレベルのアクセスを強制し、ACL を無効にして IAM だけで管理させる。方針B に合う。これが正解。",
      },
    ],
    explain:
      "組織のポリシーには、サービスごとの設定のしかたを縛る制約が用意されている。run.allowedIngress は、Cloud Run のサービスで選べる上り（ingress）の設定を制限するリスト型の制約で、internal や internal-and-cloud-load-balancing に限れば、run.app の URL でインターネットから直接呼ぶことを防げる。storage.uniformBucketLevelAccess は、バケットに均一なバケットレベルのアクセスを強制するブール型の制約で、ACL を使えなくし、アクセスを IAM だけで管理させる。storage.publicAccessPrevention は一般公開を防ぐ制約で、目的が異なる。",
    points: [
      "Cloud Run の入口の制限 → run.allowedIngress。",
      "ACL を使わせず IAM だけにする → storage.uniformBucketLevelAccess。公開の防止は publicAccessPrevention。",
    ],
  },
  {
    source: at(6, "1.1"),
    field: S1,
    answer: 2,
    text: "BF社では、夜間のスクリプトで数千件のリソースの情報を Compute Engine API から次々に取得している。最近、途中で HTTP 429（RESOURCE_EXHAUSTED）のエラーが出て処理が止まるようになった。エラーには「1 分あたりの読み取りリクエスト」の割り当てを超えたと書かれている。最も適切な対処はどれか。",
    choices: [
      {
        text: "リージョンの CPUS の割り当ての増加をリクエストする。",
        note: "CPUS は作れる vCPU の数の割り当てで、API を呼ぶ回数の割り当てとは別物である。",
      },
      {
        text: "スクリプトを Cloud Shell から実行するように変える。",
        note: "どこから呼んでも、同じプロジェクトの API のレートの割り当てを使う。結果は変わらない。",
      },
      {
        text: "429 を受けたら待ち時間を指数的に延ばして再試行する（指数バックオフ）ようにし、呼び出しの間隔を空ける。それでも足りない量が恒常的に必要なら、そのレートの割り当ての増加をリクエストする。",
        note: "時間あたりの呼び出し回数の割り当てに当たっているので、まず呼び出し方を直し、必要なら上限を上げる。これが正解。",
      },
      {
        text: "対象の VM をいったん削除して作り直し、取得する件数を減らす。",
        note: "リソースを作り直しても、API を呼ぶ回数の割り当ては変わらない。本番のリソースを消す危険な対処でもある。",
      },
    ],
    explain:
      "Google Cloud の割り当てには、作れるリソースの量を決めるもの（vCPU の数など）と、一定時間あたりに API を呼べる回数を決めるもの（レートの割り当て）がある。レートの割り当てを超えると、HTTP 429 と RESOURCE_EXHAUSTED が返る。この場合はクライアント側で、待ち時間を指数的に延ばしながら再試行する指数バックオフを入れ、呼び出しを分散させるのが基本である。業務として恒常的にそれ以上の呼び出しが必要なら、割り当ての増加をリクエストする。",
    points: [
      "HTTP 429 RESOURCE_EXHAUSTED → レートの割り当て。指数バックオフで再試行する。",
      "恒常的に足りなければ、そのレートの割り当ての増加をリクエストする。",
    ],
  },
  {
    source: at(7, "1.1"),
    field: S1,
    answer: 0,
    text: "BG社では、開発者に必要な IAM のロールを Google グループ dev-team@bg.example.com に付与している。人事部門は入社手続きのスクリプトから、新しく入った開発者に自動で権限が付くようにしたい。会社に Active Directory などのディレクトリは無く、ユーザーは Cloud Identity で直接管理している。スクリプトが行う処理として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud identity groups memberships add --group-email=dev-team@bg.example.com --member-email=新しい開発者のアドレス を実行し、グループに追加する。",
        note: "ロールはグループに付いているので、メンバーに加えるだけで権限が付く。退職時もメンバーから外すだけで済む。これが正解。",
      },
      {
        text: "開発者が使う各プロジェクトで、新しい開発者に gcloud projects add-iam-policy-binding でロールを 1 つずつ付与する。",
        note: "権限は付くが、人ごとの付与がプロジェクトの数だけ増え、退職や異動のときに外し漏れが起きやすい。",
      },
      {
        text: "Google Cloud Directory Sync（GCDS）を導入して、グループのメンバーを同期させる。",
        note: "GCDS は Active Directory や LDAP の内容を同期する道具で、同期元のディレクトリが無い BG社には使えない。",
      },
      {
        text: "dev-team@ を誰でも参加できる設定にし、新しい開発者に自分で参加してもらう。",
        note: "誰でも参加できると、開発者でない人も参加して権限を得られてしまう。",
      },
    ],
    explain:
      "IAM のロールは、人ごとではなくグループに付与しておくのが基本である。そうすれば、入社・異動・退職のときに変えるのはグループのメンバーシップだけになる。Cloud Identity のグループのメンバーシップは、gcloud identity groups memberships add などのコマンドや Cloud Identity Groups API から操作できるので、入社手続きのスクリプトに組み込める。スクリプトの実行に使う ID には、そのグループを管理できる権限（グループのマネージャーやオーナー、またはグループ管理者のロールなど）が必要になる。",
    points: [
      "ロールはグループに付け、人の出入りはメンバーシップで管理する。",
      "メンバーの追加は gcloud identity groups memberships add などで自動化できる。",
    ],
  },
  {
    source: at(8, "1.2"),
    field: S1,
    answer: [1, 2],
    text: "BH社では、分析基盤の 3 つのプロジェクト（ana-dev、ana-stg、ana-prod）で使う BigQuery の費用を、合わせて月 50 万円以内に収めたい。同じ請求先アカウントには、ほかの部門のプロジェクトも多数ある。Cloud Billing の予算を作るときの範囲の指定として適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "範囲をすべてのプロジェクトにする",
        note: "ほかの部門のプロジェクトの費用まで合算され、分析基盤の BigQuery の費用だけを見ることにならない。",
      },
      {
        text: "プロジェクトで ana-dev、ana-stg、ana-prod の 3 つを選ぶ",
        note: "予算の対象を、分析基盤の 3 つのプロジェクトに絞れる。これが正解。",
      },
      {
        text: "サービスで BigQuery を選ぶ",
        note: "予算の対象を BigQuery の費用に絞れる。プロジェクトの指定と組み合わせれば要件に合う。これが正解。",
      },
      {
        text: "予算の代わりに BigQuery のカスタム割り当てを設定し、それに達したときの通知を予算の代わりにする",
        note: "カスタム割り当ては 1 日に処理できるデータ量を制限する仕組みで、月の費用に対する予算の通知にはならない。",
      },
    ],
    explain:
      "Cloud Billing の予算は、どの費用を対象にするかを細かく絞り込める。範囲にはプロジェクト、フォルダや組織、サービス、ラベル、サブアカウントなどを指定でき、複数の条件を組み合わせれば「この 3 つのプロジェクトの BigQuery の費用」のような予算を作れる。予算は金額のしきい値を超えたときに通知する仕組みで、利用そのものは止めない。BigQuery のカスタム割り当ては、処理するデータ量に上限を設けて使いすぎを防ぐ別の仕組みである。",
    points: [
      "予算の範囲は、プロジェクト・サービス・ラベルなどを組み合わせて絞れる。",
      "予算は通知だけ。処理量の上限は BigQuery のカスタム割り当てで設ける。",
    ],
  },
  {
    source: at(9, "1.2"),
    field: S1,
    answer: 3,
    text: "BI社は、プロジェクトの費用が前の月から急に増えたときにすぐ気付きたい。費用は事業の成長とともに毎月少しずつ増えているので、固定の金額で予算を作ると、毎月金額を見直す手間がかかる。最も適切な予算の設定はどれか。",
    choices: [
      {
        text: "固定の金額で予算を作り、毎月初めに担当者が金額を手で書き換える。",
        note: "できるが、毎月の手作業が残り、書き換えを忘れると通知が役に立たなくなる。",
      },
      {
        text: "固定の金額で予算を作り、しきい値を 200% にして、大きく超えたときだけ通知させる。",
        note: "費用が増えていくと、急な増加が無くてもいずれ 200% に近づく。急増の検知にもならない。",
      },
      {
        text: "課金データを BigQuery にエクスポートし、月末に担当者が前月と見比べる。",
        note: "分析はできるが、月末まで気付けない。自動の通知にもならない。",
      },
      {
        text: "予算の金額の種類を「先月の費用」にし、しきい値（例: 110%）を超えたら通知させる。",
        note: "予算の金額が毎月、前の月の実績に合わせて自動で変わる。前月からの急な増加に気付ける。これが正解。",
      },
    ],
    explain:
      "Cloud Billing の予算の金額は、固定の金額のほかに「先月の費用」を選べる。先月の費用を選ぶと、その月の予算が前の月の実際の費用になり、毎月自動で更新される。前月比で何割増えたら知らせる、という使い方に向いている。しきい値には、実際の費用に対するものと、月末までの予測に対するものを設定できるので、予測のしきい値を使えば月の途中でも早めに気付ける。",
    points: [
      "前月比で見たい → 予算の金額を「先月の費用」にする。",
      "予測に対するしきい値を使うと、月の途中でも早めに気付ける。",
    ],
  },
  {
    source: at(10, "1.2"),
    field: S1,
    answer: 1,
    text: "BJ社では、予算のしきい値を超えたときのメールが、請求先アカウントの管理者にしか届いていない。各部門の部門長にも同じ通知を届けたい。部門長には費用の設定を変える権限は持たせたくない。最も適切な方法はどれか。",
    choices: [
      {
        text: "部門長全員に、請求先アカウント管理者のロールを付与する。",
        note: "通知は届くようになるが、支払い方法の変更やプロジェクトのリンクまでできてしまい、権限が大きすぎる。",
      },
      {
        text: "部門長のメールアドレスで Cloud Monitoring のメールの通知チャネルを作り、予算の通知先として紐づける。",
        note: "請求先アカウントの権限を持たない人にも、予算の通知を送れる。これが正解。",
      },
      {
        text: "部門長に Cloud Billing のレポートの画面を案内し、毎日自分で費用を確かめてもらう。",
        note: "見る権限も別に要るうえ、人の確認に頼るので、しきい値を超えたときの通知の代わりにならない。",
      },
      {
        text: "請求先アカウントの管理者が、届いたメールを毎回部門長へ転送する。",
        note: "手作業で遅れや漏れが出る。管理者が不在のときに止まる。",
      },
    ],
    explain:
      "予算のメール通知は、既定では請求先アカウントの管理者とユーザーに届く。それ以外の人に知らせたいときは、Cloud Monitoring の通知チャネル（メールなど）を作って予算に紐づける。こうすれば、請求先アカウントの権限を与えずに通知だけを届けられる。通知をきっかけに処理を自動で動かしたいときは、予算から Pub/Sub のトピックへ通知を送る方法もある。",
    points: [
      "予算の通知を権限の無い人にも送る → Cloud Monitoring の通知チャネルを紐づける。",
      "自動の処理につなげたいときは Pub/Sub へ通知する。",
    ],
  },
  // ───────── セクション2 計画と実装（問11〜問25） ─────────
  {
    source: at(11, "2.1"),
    field: S2,
    answer: 3,
    text: "BK社は、オンプレミスの VMware 上で動く 120 台の仮想マシンを、Compute Engine へ移すことにした。業務への影響を抑えるため、移行の前に Google Cloud 側でテスト用の複製を起動して動作を確かめ、本番の切り替えでは停止時間を短くしたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "Storage Transfer Service で仮想マシンのディスクのファイルを Cloud Storage に転送し、そこから VM を作る。",
        note: "Storage Transfer Service はファイルやオブジェクトを移すサービスで、仮想マシンの複製や切り替えの仕組みは持たない。",
      },
      {
        text: "Database Migration Service で、仮想マシンごと Compute Engine に移す。",
        note: "Database Migration Service はデータベースを Cloud SQL などへ移すサービスで、仮想マシンは扱わない。",
      },
      {
        text: "各仮想マシンのディスクを手作業でエクスポートし、1 台ずつイメージとして取り込んで VM を作る。",
        note: "できなくはないが、120 台を 1 台ずつ扱う手間がかかり、取り込みの間の変更の追従やテスト用の複製の仕組みも自分で用意することになる。",
      },
      {
        text: "Migrate to Virtual Machines を使い、ディスクを継続的に複製しながらテスト用のクローンで動作を確かめ、準備ができたら切り替え（カットオーバー）を行う。",
        note: "複製を続けたまま試験用の VM を起動でき、切り替えのときは最後の差分だけを反映すればよい。これが正解。",
      },
    ],
    explain:
      "Migrate to Virtual Machines は、VMware などのオンプレミスや他のクラウドの仮想マシンを Compute Engine へ移すサービスである。元の仮想マシンを動かしたままディスクのデータを継続的に複製し、その複製からテスト用のクローンを起動して、本番に影響を与えずに動作を確かめられる。準備ができたら切り替え（カットオーバー）を行い、元の仮想マシンを止めて最後の差分を反映してから Compute Engine の VM を起動する。台数が多い場合も、グループにまとめて同じ手順で進められる。",
    points: [
      "仮想マシンを Compute Engine へ移す → Migrate to Virtual Machines。",
      "複製を続けたままテスト用のクローンで確かめ、最後にカットオーバーする。",
    ],
  },
  {
    source: at(12, "2.1"),
    field: S2,
    answer: 0,
    text: "BL社は GKE の Autopilot クラスタで、夜間の画像変換のジョブを動かしている。ジョブは途中で止まっても再実行すれば済むので、費用を抑えるために Spot の容量で動かしたい。ほかのワークロードは今のまま通常の容量で動かす。最も適切な方法はどれか。",
    choices: [
      {
        text: 'ジョブの Pod の仕様に nodeSelector として cloud.google.com/gke-spot: "true" を指定する。',
        note: "Autopilot では、Pod の仕様で Spot を求めれば、GKE が Spot のノードを用意してそこに置く。これが正解。",
      },
      {
        text: "クラスタに Spot VM のノードプールを追加し、ジョブをそこに置く。",
        note: "Autopilot ではノードプールを利用者が作って管理しない。Spot を使うかどうかは Pod の仕様で指定する。",
      },
      {
        text: "クラスタを Standard で作り直し、すべてのノードを Spot VM にする。",
        note: "ほかのワークロードまで中断されうる容量で動くことになり、要件に合わない。作り直す手間も大きい。",
      },
      {
        text: "ジョブの Pod のリソース リクエストを小さくする。",
        note: "使う量は減るかもしれないが、Spot の容量で動かすことにはならない。小さくしすぎると処理が遅れたり失敗したりする。",
      },
    ],
    explain:
      'GKE Autopilot では、ノードは GKE が用意して管理し、利用者は Pod の仕様で必要なものを伝える。Spot の容量を使いたい Pod には、nodeSelector（またはノード アフィニティ）で cloud.google.com/gke-spot: "true" を指定する。Spot の Pod は、容量が必要になったときに止められることがあるので、途中で止まっても再実行できる処理に使う。終了の猶予（terminationGracePeriodSeconds）は短めにしておくとよい。',
    points: [
      'Autopilot で Spot を使う → Pod の nodeSelector に cloud.google.com/gke-spot: "true"。',
      "Autopilot ではノードプールを作らず、Pod の仕様で求める。",
    ],
  },
  {
    source: at(13, "2.1"),
    field: S2,
    answer: 2,
    text: "BM社の GKE Standard クラスタには、決済の処理のためにセキュリティを強めたノードプール pay-pool がある。決済の Pod は必ず pay-pool で動かし、ほかの Pod は pay-pool に置かせたくない。最も適切な設定はどれか。",
    choices: [
      {
        text: "決済の Pod に、nodeSelector で cloud.google.com/gke-nodepool: pay-pool を指定するだけにする。",
        note: "決済の Pod は pay-pool に置かれるが、ほかの Pod が pay-pool に置かれることは防げない。",
      },
      {
        text: "pay-pool に taint を付けるだけにする。",
        note: "ほかの Pod は置かれなくなるが、決済の Pod も toleration が無いので pay-pool に置けない。ほかのノードに置かれることも防げない。",
      },
      {
        text: "pay-pool に taint（例: dedicated=payments:NoSchedule）を付け、決済の Pod には対応する toleration と、pay-pool を指定する nodeSelector の両方を付ける。",
        note: "taint でほかの Pod を締め出し、toleration で決済の Pod だけを許し、nodeSelector で決済の Pod の行き先を pay-pool に限る。これが正解。",
      },
      {
        text: "決済の Pod を専用の Namespace に入れる。",
        note: "Namespace は名前や権限を分ける単位で、どのノードで動くかは決まらない。",
      },
    ],
    explain:
      "特定のノードプールを特定のワークロード専用にするには、2 つの向きの制御を組み合わせる。taint を付けたノードには、対応する toleration を持たない Pod が置かれなくなる（ほかの Pod を締め出す）。nodeSelector やノード アフィニティは、Pod を条件に合うノードにだけ置かせる（決済の Pod の行き先を限る）。toleration は「置いてもよい」という許可にすぎないので、それだけでは決済の Pod がほかのノードに置かれることもある。GKE では、ノードプールの作成時に --node-taints や --node-labels で taint やラベルを付けられ、各ノードにはノードプール名のラベル cloud.google.com/gke-nodepool が自動で付く。",
    points: [
      "ほかの Pod を締め出す → taint。決済の Pod を許す → toleration。",
      "決済の Pod の行き先を限る → nodeSelector（ノード アフィニティ）。専用化には両方を組み合わせる。",
    ],
  },
  {
    source: at(14, "2.1"),
    field: S2,
    answer: [1, 2],
    text: "BN社は、オンプレミスの 2 つのシステムを Compute Engine に移す。それぞれのマシンの選び方として適切なものはどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "要件A: 数 TB のメモリを使うインメモリ データベース（SAP HANA など）を 1 台の VM で動かす",
          "要件B: コアあたりの性能が処理時間を左右する科学技術計算（HPC）を、多数の VM で並列に動かす",
        ],
      },
    },
    choices: [
      {
        text: "要件A に、費用を抑えやすい汎用の E2 シリーズを使う",
        note: "E2 は日常的な用途で費用を抑えるためのシリーズで、数 TB のメモリを積んだ構成は用意されていない。",
      },
      {
        text: "要件A に、メモリ最適化の M シリーズを使う",
        note: "vCPU あたりのメモリが多く、数 TB のメモリを持つ構成がある。大きなインメモリ データベースに向く。これが正解。",
      },
      {
        text: "要件B に、コンピューティング最適化の H3 や C2 などのシリーズを使う",
        note: "コアあたりの性能を重視したシリーズで、HPC のような計算の重い処理に向く。これが正解。",
      },
      {
        text: "要件B に、アクセラレータ最適化の A3 シリーズを使う",
        note: "GPU を使う機械学習などのためのシリーズである。CPU のコアあたりの性能が効く処理なら、GPU の費用をかける理由が無い。",
      },
    ],
    explain:
      "Compute Engine のマシン ファミリーは、用途で選ぶ。汎用（E2、N2、N4 など）は Web サーバーや一般的な業務に、メモリ最適化（M シリーズ）は SAP HANA のような大きなインメモリ データベースに、コンピューティング最適化（C2、H3 など）はコアあたりの性能が効く HPC やゲーム サーバーなどに、アクセラレータ最適化（A3 など）は GPU を使う機械学習などに向く。要件の中心が「メモリの量」なのか「CPU の性能」なのか「GPU」なのかを見極めて選ぶ。",
    points: [
      "大量のメモリ → メモリ最適化（M シリーズ）。",
      "コアあたりの性能が効く HPC → コンピューティング最適化（H3、C2 など）。GPU はアクセラレータ最適化。",
    ],
  },
  {
    source: at(15, "2.2"),
    field: S2,
    answer: 1,
    text: "BO社は、オンプレミスの MySQL（約 2 TB）を Cloud SQL for MySQL に移す。データベースは 24 時間更新され続けており、切り替えのために止められるのは 30 分ほどだけである。最も適切な方法はどれか。",
    choices: [
      {
        text: "週末に mysqldump でデータをすべて書き出し、Cloud SQL に取り込んでから切り替える。",
        note: "書き出しから取り込みが終わるまで更新を止める必要があり、2 TB では 30 分に収まらない。",
      },
      {
        text: "Database Migration Service で継続的な移行ジョブを作り、初期のコピーのあとも変更を複製し続け、切り替えのときに更新を止めて移行先を昇格（プロモート）する。",
        note: "最初の全体のコピーのあとも変更が追従するので、止めるのは最後の差分の反映と切り替えの間だけで済む。これが正解。",
      },
      {
        text: "Storage Transfer Service で MySQL のデータ ファイルを Cloud Storage に転送し、Cloud SQL に読み込む。",
        note: "動いているデータベースのファイルをそのまま移しても整合が取れない。データベースの移行の仕組みではない。",
      },
      {
        text: "BigQuery Data Transfer Service で MySQL のデータを転送する。",
        note: "BigQuery へデータを取り込むためのサービスで、Cloud SQL への移行には使わない。",
      },
    ],
    explain:
      "Database Migration Service は、MySQL や PostgreSQL などを Cloud SQL や AlloyDB へ移すマネージド サービスである。継続的な移行では、最初にデータ全体をコピーし、その後は元のデータベースの変更を移行先へ複製し続ける。元の側を動かしたまま準備を進められるので、切り替えのときに更新を止め、差分が追い付いたのを確かめて移行先を昇格させれば、停止時間を短くできる。元のデータベースでは、変更の複製に必要な設定（MySQL ならバイナリログなど）を有効にしておく。",
    points: [
      "停止時間を短くしてデータベースを移す → Database Migration Service の継続的な移行。",
      "変更を複製し続け、切り替えのときに移行先を昇格させる。",
    ],
  },
  {
    source: at(16, "2.2"),
    field: S2,
    answer: 2,
    text: "BP社は、データセンターにある 600 TB のアーカイブを Cloud Storage に移す。移行は 2 か月以内に終えたい。データセンターからインターネットへの回線は 200 Mbps で、ほかの業務でも使っている。最も適切な方法はどれか。",
    choices: [
      {
        text: "gcloud storage cp を複数並べて実行し、回線をできるだけ使って送る。",
        note: "並列にしても回線の速さが上限になる。回線を使い切ると、ほかの業務にも影響する。",
      },
      {
        text: "Storage Transfer Service のエージェントをデータセンターに置き、ネットワーク経由で転送する。",
        note: "オンプレミスからの大量の転送には向くが、回線が細いと時間はかかる。200 Mbps では 2 か月に収まらない。",
      },
      {
        text: "Transfer Appliance を申し込み、データを機器に書き込んで Google に送る。",
        note: "回線の速さに左右されずに大量のデータを運べる。計算すると回線では 9 か月ほどかかるので、これが向く。これが正解。",
      },
      {
        text: "データを圧縮してから rsync で少しずつ送る。",
        note: "アーカイブはすでに圧縮されていることが多く、大きくは縮まない。回線の制約は変わらない。",
      },
    ],
    explain:
      "大量のデータを移すときは、まず回線で送ったときにかかる時間を見積もる。600 TB を 200 Mbps で送ると、回線を常に使い切っても約 278 日（9 か月ほど）かかり、2 か月という期限に収まらない。Transfer Appliance は、Google から届く大容量のストレージ機器にデータを書き込んで送り返すと、Google がそれを Cloud Storage に取り込むサービスで、回線が細い・データが多い・期限が短いときに向く。回線で間に合う量なら、オンプレミスのデータは Storage Transfer Service のエージェントで転送できる。",
    points: [
      "まず回線で送ったときの所要時間を計算する。",
      "回線では期限に間に合わない大量のデータ → Transfer Appliance。",
    ],
    figure: {
      type: "calc",
      caption: "ネットワークで送ったときの所要時間",
      lines: [
        {
          expr: "600 TB = 600 × 8 × 10¹² ビット = 4.8 × 10¹⁵ ビット",
          note: "データ量をビットに直す",
        },
        { expr: "4.8 × 10¹⁵ ÷ (200 × 10⁶) = 2.4 × 10⁷ 秒", note: "200 Mbps で割る" },
        { expr: "2.4 × 10⁷ 秒 ÷ 86,400 ≒ 278 日", note: "日に直すと 9 か月ほど" },
      ],
    },
  },
  {
    source: at(17, "2.2"),
    field: S2,
    answer: 3,
    text: "BQ社の基幹システムは、毎晩その日の売上を CSV ファイルにして、Cloud Storage の gs://bq-sales/daily/ に置いている。これを毎朝 BigQuery のテーブル sales に追記したい。サーバーの管理はしたくない。最も適切な方法はどれか。",
    choices: [
      {
        text: "Compute Engine の VM を 1 台用意し、cron で毎朝 bq load を実行する。",
        note: "動くが、VM の運用（パッチや監視）が要る。サーバーを管理したくないという条件に合わない。",
      },
      {
        text: "Storage Transfer Service で、毎朝 gs://bq-sales/daily/ のファイルを転送する。",
        note: "ストレージの間でファイルを移すサービスで、BigQuery のテーブルには読み込まない。",
      },
      {
        text: "バケットのストレージ クラスを Archive にする。",
        note: "保存の費用の話で、BigQuery への取り込みとは関係が無い。毎日読むデータを Archive に置くと取り出しの費用もかかる。",
      },
      {
        text: "BigQuery Data Transfer Service で Cloud Storage からの転送を作り、毎朝の実行のスケジュールと、追記先のテーブル sales を指定する。",
        note: "Cloud Storage のファイルを BigQuery のテーブルへ定期的に読み込むマネージドな仕組みで、サーバーは要らない。これが正解。",
      },
    ],
    explain:
      "BigQuery Data Transfer Service は、外部のデータを BigQuery へ定期的に取り込むマネージド サービスである。転送元には Cloud Storage のほか、Google の広告サービスや他のクラウドのストレージ、他のデータ ウェアハウスなどがある。Cloud Storage からの転送では、読み込むファイルのパス（ワイルドカードも使える）、実行のスケジュール、書き込み先のテーブルと書き込み方（追記・上書き）を指定する。Storage Transfer Service は、ストレージからストレージへファイルを移すサービスで、役割が違う。",
    points: [
      "Cloud Storage のファイルを BigQuery へ定期的に読み込む → BigQuery Data Transfer Service。",
      "Storage Transfer Service はストレージ間のファイルの転送。",
    ],
  },
  {
    source: at(18, "2.2"),
    field: S2,
    answer: 3,
    text: "BR社は、Cloud Storage に Parquet 形式で数百 TB のアクセスログを貯めている。分析チームはこのログを BigQuery の SQL で調べたいが、同じデータを BigQuery の中にもう 1 つ持つのは避けたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "毎日 bq load で Parquet のファイルを BigQuery のテーブルに読み込む。",
        note: "SQL で調べられるようにはなるが、同じデータを BigQuery の中にも持つことになり、条件に合わない。",
      },
      {
        text: "Dataflow のパイプラインで、Parquet のファイルを BigQuery のテーブルへ書き込む。",
        note: "これもデータを BigQuery の中に複製する方法で、条件に合わない。パイプラインの運用も要る。",
      },
      {
        text: "Parquet のファイルを Cloud SQL に取り込み、SQL で調べる。",
        note: "Cloud SQL はトランザクション処理向けのデータベースで、数百 TB の分析には向かない。データの複製にもなる。",
      },
      {
        text: "Cloud Storage のファイルを参照する外部テーブル（BigLake テーブル）を BigQuery に作り、SQL で調べる。",
        note: "データは Cloud Storage に置いたまま、BigQuery から SQL で読める。これが正解。",
      },
    ],
    explain:
      "BigQuery では、データを読み込まずに Cloud Storage のファイルを直接 SQL で調べられる。外部テーブルは、Cloud Storage のパスと形式（Parquet、ORC、Avro、CSV、JSON など）を指定して作るテーブルで、クエリのたびにファイルを読む。BigLake テーブルは外部テーブルを発展させたもので、接続（コネクション）のサービス アカウントを介してファイルを読むため、利用者に Cloud Storage への直接の権限を与えずに済み、行や列の単位のアクセス制御もかけられる。頻繁に重いクエリを流すなら、読み込んだネイティブのテーブルのほうが速いこともあるので、使い方で選ぶ。",
    points: [
      "データを複製せずに Cloud Storage のファイルを SQL で調べる → 外部テーブル（BigLake テーブル）。",
      "BigLake テーブルなら利用者にバケットの権限を与えずに済む。",
    ],
  },
  {
    source: at(19, "2.2"),
    field: S2,
    answer: [0, 3],
    text: "BS社の店舗の POS は、売上のイベントを Pub/Sub の 2 つのトピックに送っている。それぞれのデータを BigQuery に入れる方法として適切なものはどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "トピックA（pos-raw）: メッセージを加工せず、そのまま BigQuery のテーブルに書き込みたい。処理のためのサーバーやパイプラインは持ちたくない",
          "トピックB（pos-detail）: 個人を特定できる項目の伏せ字、商品マスタとの結合、5 分ごとの集計をしてから BigQuery に書き込みたい",
        ],
      },
    },
    choices: [
      {
        text: "トピックA に BigQuery サブスクリプションを作り、書き込み先のテーブルを指定する",
        note: "Pub/Sub が受け取ったメッセージを、そのまま BigQuery のテーブルへ書き込む。加工の要らないトピックA に合う。これが正解。",
      },
      {
        text: "トピックA から BigQuery Data Transfer Service で定期的に取り込む",
        note: "BigQuery Data Transfer Service の転送元に Pub/Sub は無い。ストリームのデータの取り込みには使わない。",
      },
      {
        text: "トピックB から Storage Transfer Service で BigQuery へ転送する",
        note: "Storage Transfer Service はストレージ間でファイルを移すサービスで、Pub/Sub も BigQuery も扱わない。",
      },
      {
        text: "トピックB は Dataflow のパイプラインで受け取り、伏せ字・結合・集計をしてから BigQuery に書き込む",
        note: "ストリームのデータを加工し、時間の窓で集計してから書き込める。トピックB に合う。これが正解。",
      },
    ],
    explain:
      "Pub/Sub のデータを BigQuery に入れる方法は、加工が要るかどうかで選ぶ。BigQuery サブスクリプションは、Pub/Sub が受け取ったメッセージを BigQuery のテーブルへ直接書き込む種類のサブスクリプションで、処理のための仕組みを自分で持たずに済む。伏せ字や結合、時間の窓での集計のような加工が要るなら、Dataflow のパイプライン（用意されたテンプレートや独自のパイプライン）を使う。BigQuery Data Transfer Service や Storage Transfer Service は、ストリームのメッセージを扱うものではない。",
    points: [
      "Pub/Sub から加工せず BigQuery へ → BigQuery サブスクリプション。",
      "加工・結合・集計をしてから入れる → Dataflow。",
    ],
  },
  {
    source: at(20, "2.3"),
    field: S2,
    answer: 1,
    text: "BT社は、Cloud Run で動くカートのサービスから、VPC の中にある Memorystore for Redis のインスタンス（内部 IP アドレス 10.20.0.5）につなぎたい。今のままでは接続がタイムアウトする。最も適切な方法はどれか。",
    choices: [
      {
        text: "Memorystore のインスタンスに外部 IP アドレスを付けて、Cloud Run からはそのアドレスにつなぐ。",
        note: "Memorystore for Redis は VPC の内部 IP アドレスで使うサービスで、外部 IP アドレスで公開する形にはならない。",
      },
      {
        text: "Cloud Run のサービスで、Direct VPC egress（またはサーバーレス VPC アクセスのコネクタ）を設定し、VPC のサブネットを通して内部 IP アドレスへ送れるようにする。",
        note: "Cloud Run から VPC の中のリソースへ、内部 IP アドレスで通信できるようになる。これが正解。",
      },
      {
        text: "Cloud Run のサービスの上り（ingress）の設定を internal にする。",
        note: "ingress は Cloud Run が受ける通信の入口の設定で、Cloud Run から外へ出ていく通信の経路は変わらない。",
      },
      {
        text: "Cloud Run のサービス アカウントに、Redis の管理者のロールを付与する。",
        note: "IAM のロールではネットワークの経路はできない。届かない原因は経路にある。",
      },
    ],
    explain:
      "Cloud Run は既定では VPC の外で動くので、VPC の中の内部 IP アドレス（Memorystore、内部ロードバランサ、VM など）には届かない。VPC へ出ていく経路を作るには、Direct VPC egress を設定する（gcloud run deploy の --network と --subnet、--vpc-egress など）か、サーバーレス VPC アクセスのコネクタを使う。Direct VPC egress はコネクタのための VM を持たずに済み、新しく作るなら第一の候補になる。ingress は受ける側の設定、egress は出ていく側の設定と分けて覚える。",
    points: [
      "Cloud Run から VPC の内部 IP へ → Direct VPC egress（またはサーバーレス VPC アクセスのコネクタ）。",
      "ingress は入口、egress は出口の設定。",
    ],
  },
  {
    source: at(21, "2.3"),
    field: S2,
    answer: 0,
    text: "BU社は、取引先（別の組織）の VPC ネットワークと VPC ネットワーク ピアリングでつなぎ、内部 IP アドレスで通信しようとした。ところがピアリングが有効にならず、IP アドレスの範囲に関するエラーが出た。両社のサブネットは表のとおりである。原因として最も適切なものはどれか。",
    choices: [
      {
        text: "取引先のサブネット 10.0.8.0/21 が、自社のサブネット 10.0.0.0/20 の範囲と重なっている。",
        note: "10.0.0.0/20 は 10.0.0.0〜10.0.15.255 で、10.0.8.0/21 の 10.0.8.0〜10.0.15.255 を含む。ピアリングでは範囲が重なってはならない。これが正解。",
      },
      {
        text: "VPC ネットワーク ピアリングは、同じ組織の VPC ネットワークどうしでしか作れない。",
        note: "ピアリングは組織やプロジェクトをまたいでも作れる。同じ組織に限られるのは共有 VPC である。",
      },
      {
        text: "VPC ネットワーク ピアリングは推移的でないため、3 つ目のネットワークを経由する必要がある。",
        note: "推移的でないのは、つないだ相手のさらに先へは届かないという話である。2 つのネットワークを直接つなぐことには関係しない。",
      },
      {
        text: "ピアリングするサブネットは同じリージョンにある必要がある。",
        note: "VPC ネットワークはグローバルで、リージョンの違うサブネットどうしでもピアリングで通信できる。",
      },
    ],
    explain:
      "VPC ネットワーク ピアリングでは、つなぐ 2 つの VPC ネットワークのサブネットの範囲（セカンダリ範囲を含む）が重なってはならない。CIDR の範囲は、プレフィックス長から広さを計算して比べる。/20 は 4,096 個のアドレスで、10.0.0.0/20 は 10.0.0.0〜10.0.15.255 になる。/21 は 2,048 個で、10.0.8.0/21 は 10.0.8.0〜10.0.15.255 なので、自社の範囲の後半とそっくり重なる。重なりを解消するには、どちらかのサブネットを作り直すなどの変更が要るため、つなぐ予定のあるネットワークでは、最初から範囲を計画しておく。",
    points: [
      "ピアリングは、両方のサブネットの範囲が重なると作れない。",
      "/20 は 4,096 個、/21 は 2,048 個。範囲は始まりと終わりを計算して比べる。",
    ],
    figure: {
      type: "table",
      caption: "両社のサブネットの範囲",
      headers: ["サブネット", "アドレスの範囲"],
      rows: [
        ["自社 10.0.0.0/20", "10.0.0.0〜10.0.15.255"],
        ["自社 10.1.0.0/20", "10.1.0.0〜10.1.15.255"],
        ["取引先 10.0.8.0/21", "10.0.8.0〜10.0.15.255"],
      ],
    },
  },
  {
    source: at(22, "2.3"),
    field: S2,
    answer: 1,
    text: "BV社は、マネージド インスタンス グループの VM を、グローバル外部アプリケーション ロードバランサのバックエンドにした。ところが、バックエンドの状態がすべて UNHEALTHY のままになっている。VM の中では Web サーバーが TCP 80 で動いており、VPC のファイアウォール ルールは 10.0.0.0/8 からの TCP 80 だけを許可している。最も適切な対処はどれか。",
    choices: [
      {
        text: "マネージド インスタンス グループの VM をすべて作り直す。",
        note: "VM に問題があるわけではないので、作り直しても同じルールで止められる。",
      },
      {
        text: "Google のヘルスチェックの送信元の範囲（35.191.0.0/16 と 130.211.0.0/22）から、TCP 80 への上りを許可するファイアウォール ルールを追加する。",
        note: "ヘルスチェックはこの範囲から届くので、許可しないと VM が正常と判断されない。これが正解。",
      },
      {
        text: "すべての VM に外部 IP アドレスを付ける。",
        note: "ロードバランサやヘルスチェックは外部 IP アドレスが無くても VM に届く。届かない原因はファイアウォール ルールにある。",
      },
      {
        text: "ヘルスチェックの間隔を長くし、失敗とみなすまでの回数を増やす。",
        note: "判定を緩めても、ヘルスチェックの通信がファイアウォールで止められていれば成功しない。",
      },
    ],
    explain:
      "ロードバランサのヘルスチェックは、Google が持つ決まった IP アドレスの範囲から送られる。グローバル外部アプリケーション ロードバランサなど多くのロードバランサでは、35.191.0.0/16 と 130.211.0.0/22 である。VPC のファイアウォール ルールでこの範囲からのバックエンドのポートへの上りを許可しないと、VM が動いていても正常と判断されず、トラフィックが送られない。対象をネットワーク タグやサービス アカウントで絞って許可するとよい。",
    points: [
      "ヘルスチェックの送信元（35.191.0.0/16、130.211.0.0/22）をファイアウォールで許可する。",
      "バックエンドが全部 UNHEALTHY なら、まずファイアウォール ルールを疑う。",
    ],
  },
  {
    source: at(23, "2.4"),
    field: S2,
    answer: 3,
    text: "BW社では、5 人のチームが Terraform で Google Cloud のリソースを管理している。今は各自の PC にある状態ファイル（terraform.tfstate）で apply しているため、同時に実行して状態が食い違ったり、どれが最新か分からなくなったりしている。最も適切な対処はどれか。",
    choices: [
      {
        text: "状態ファイルを Git のリポジトリにコミットして共有する。",
        note: "同時の実行を防ぐロックが無く、取り込み忘れで古い状態のまま apply してしまう。状態ファイルには機密の値が含まれることもあり、リポジトリに置くのは避ける。",
      },
      {
        text: "apply は 1 人の担当者だけが行うことにし、ほかの人は plan だけにする。",
        note: "人の運用で食い違いを減らすだけで、担当者の PC に状態が閉じ込められ、不在のときに作業が止まる。",
      },
      {
        text: "apply のたびに、terraform import ですべてのリソースを状態に取り込み直す。",
        note: "状態を毎回作り直すのは手間が大きく誤りも起きやすい。同時の実行を防ぐこともできない。",
      },
      {
        text: '状態ファイルを Cloud Storage のバケットに置く backend "gcs" を設定し、バケットのオブジェクトのバージョニングを有効にする。',
        note: "状態をチーム全員で 1 か所から読み書きでき、実行中は状態がロックされる。バージョニングで以前の状態にも戻せる。これが正解。",
      },
    ],
    explain:
      'Terraform の状態ファイルには、管理しているリソースと実際のリソースとの対応が書かれている。チームで使うときは、リモートのバックエンドに状態を置く。Google Cloud では backend "gcs" で Cloud Storage のバケットを指定でき、apply などの実行中は状態がロックされるので、同時に実行しても壊れない。バケットではオブジェクトのバージョニングを有効にして以前の状態に戻せるようにし、状態に機密の値が入りうるので、アクセスできる人を IAM で絞っておく。',
    points: [
      'チームで Terraform を使う → 状態は backend "gcs" で Cloud Storage に置く（ロックが効く）。',
      "状態のバケットはバージョニングを有効にし、アクセスを絞る。",
    ],
  },
  {
    source: at(24, "2.4"),
    field: S2,
    answer: 1,
    text: "BX社は、これまで手作業で作ってきたリソースを Terraform で管理し始めた。すでにある Cloud Storage のバケット bx-archive も、中のデータを残したまま Terraform の管理下に入れたい。設定ファイルには、このバケットの google_storage_bucket のリソースを書いた。次に行うこととして最も適切なものはどれか。",
    choices: [
      {
        text: "そのまま terraform apply を実行する。",
        note: "Terraform はこのバケットを知らないので新しく作ろうとし、同じ名前のバケットがすでにあるためエラーになる。",
      },
      {
        text: "terraform import（または設定ファイルの import ブロック）で既存のバケットを状態に取り込み、terraform plan で差分が出ないことを確かめる。",
        note: "既存のリソースを作り直さずに状態に結び付けられる。plan で設定と実際の違いを確かめ、設定を合わせる。これが正解。",
      },
      {
        text: "バケットを削除してから terraform apply で作り直し、データをあとから戻す。",
        note: "データの移し替えと停止が要り、手間も危険も大きい。バケット名もすぐには再利用できないことがある。",
      },
      {
        text: "terraform state rm を実行してから apply する。",
        note: "state rm は状態からリソースを外すコマンドで、まだ状態に無いバケットに使っても意味が無い。",
      },
    ],
    explain:
      "Terraform の外で作られたリソースを管理下に入れるには、そのリソースを状態に取り込む。terraform import コマンドで設定ファイルのリソースのアドレスと実際のリソースの ID を指定するか、設定ファイルに import ブロックを書いて plan と apply で取り込む。取り込んだあとは terraform plan を実行し、設定ファイルと実際の設定の違い（差分）が出ないように設定を合わせる。差分が残ったまま apply すると、意図しない変更がかかることがある。",
    points: [
      "既存のリソースを Terraform の管理下に入れる → terraform import（import ブロック）。",
      "取り込んだら plan で差分が無いことを確かめる。",
    ],
  },
  {
    source: at(25, "2.4"),
    field: S2,
    answer: 2,
    text: "BY社は、Terraform の実行をマネージドな仕組みに任せたい。担当者の PC や自前の CI サーバーではなく Google Cloud の中で実行し、状態の保存場所や、いつ誰がどの構成をデプロイしたかの履歴も管理させたい。最も適切なサービスはどれか。",
    choices: [
      {
        text: "Config Connector",
        note: "Google Cloud のリソースを Kubernetes のリソースとして宣言して管理する仕組みで、Terraform の構成を実行するものではない。",
      },
      {
        text: "Cloud Deploy",
        note: "アプリケーションを GKE や Cloud Run などに順に届けるための配信パイプラインで、インフラの Terraform の実行と状態の管理はしない。",
      },
      {
        text: "Infrastructure Manager",
        note: "Terraform の構成を Google Cloud の中で実行し、状態の保存とデプロイの履歴（リビジョン）を管理する。これが正解。",
      },
      {
        text: "Cloud Scheduler",
        note: "決まった時刻にジョブを起動するサービスで、Terraform の状態や履歴を管理する仕組みは持たない。",
      },
    ],
    explain:
      "Infrastructure Manager は、Terraform の構成を Google Cloud の中で実行するマネージド サービスである。Git のリポジトリや Cloud Storage に置いた構成を指定してデプロイすると、Cloud Build を使って Terraform が実行され、状態は Infrastructure Manager が管理する。デプロイのたびにリビジョンが残るので、いつどの構成が適用されたかを追える。実行にはデプロイ用のサービス アカウントを指定し、そこに必要なロールだけを付与する。",
    points: [
      "Terraform の実行・状態・履歴をマネージドに → Infrastructure Manager。",
      "Config Connector は Kubernetes のリソースとして Google Cloud を管理する別の仕組み。",
    ],
  },
  // ───────── セクション3 運用（問26〜問40） ─────────
  {
    source: at(26, "3.1"),
    field: S3,
    answer: 0,
    text: "BZ社の Windows Server の VM win-app には外部 IP アドレスが無く、ファイアウォール ルールで 35.235.240.0/20 からの TCP 3389 を許可している。新しく担当になった運用者が、Windows のユーザー ops-admin で RDP 接続できるようにしたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "gcloud compute reset-windows-password win-app --user=ops-admin で、そのユーザーとパスワードを用意し、IAP の TCP 転送（gcloud compute start-iap-tunnel win-app 3389 --local-host-port=localhost:3389 など）を通して RDP で接続する。",
        note: "ユーザーが無ければ作ってパスワードを発行し、外部 IP アドレスの無い VM には IAP 経由で RDP をつなげる。これが正解。",
      },
      {
        text: "gcloud compute ssh win-app を実行する。SSH 鍵が VM に配られ、その鍵で RDP にもログインできる。",
        note: "RDP のログインに使うのは Windows のユーザーとパスワードで、SSH 鍵ではない。",
      },
      {
        text: "起動スクリプトのメタデータに、net user コマンドとパスワードを書いて VM を再起動し、ユーザーを作る。",
        note: "ユーザーは作れるが、メタデータを読める人には誰にでもパスワードが見えてしまう。",
      },
      {
        text: "VM に外部 IP アドレスを付け、0.0.0.0/0 からの TCP 3389 を許可するファイアウォール ルールを追加する。",
        note: "RDP のポートをインターネット全体に開くことになり、攻撃を受けやすくなる。",
      },
    ],
    explain:
      "Windows の VM に RDP で入るには、Windows のユーザーとパスワードが要る。gcloud compute reset-windows-password（またはコンソールの「Windows パスワードを設定」）を使うと、指定したユーザーが無ければ作り、パスワードを発行して表示する。外部 IP アドレスの無い VM には、IAP の TCP 転送で、手元のポートから VM の 3389 へトンネルを張って接続できる。そのためには、ファイアウォール ルールで IAP の範囲（35.235.240.0/20）からの通信を許可し、接続する人に IAP で保護されたトンネル ユーザーのロールを付与しておく。",
    points: [
      "Windows のユーザーとパスワードの用意 → gcloud compute reset-windows-password。",
      "外部 IP の無い VM への RDP → IAP の TCP 転送。",
    ],
  },
  {
    source: at(27, "3.1"),
    field: S3,
    answer: 2,
    text: "CA社の GKE のアプリの Pod が、負荷の高い時間帯に何度も再起動している。kubectl describe pod で見ると、直前のコンテナの終了理由は OOMKilled、終了コードは 137 で、コンテナのメモリのリクエストと上限（limits）はどちらも 256Mi になっている。最も適切な対処はどれか。",
    choices: [
      {
        text: "コンテナの CPU の上限を引き上げる。",
        note: "止められた原因はメモリで、CPU の上限を変えてもメモリの上限を超えれば同じように止められる。",
      },
      {
        text: "Deployment のレプリカ数を減らす。",
        note: "コンテナ 1 つあたりのメモリの上限は変わらない。むしろ 1 つあたりの負荷が増えて、メモリを多く使うようになりうる。",
      },
      {
        text: "コンテナのメモリの使い方を確かめ、メモリのリクエストと上限を、実際に必要な量に合わせて引き上げる。あわせてメモリリークが無いかも調べる。",
        note: "OOMKilled はメモリの上限を超えて止められたことを示す。必要な量に合わせて設定を見直す。これが正解。",
      },
      {
        text: "liveness probe を外して、再起動されないようにする。",
        note: "OOMKilled は probe の失敗ではなく、メモリの上限を超えたことで止められたものである。probe を外しても止まる。",
      },
    ],
    explain:
      "Kubernetes では、コンテナのメモリの使用量が上限（limits）を超えると、そのコンテナは強制終了される。このとき終了理由は OOMKilled、終了コードは 137 になる。対処は、実際に必要なメモリの量を Cloud Monitoring の指標などで確かめ、リクエストと上限をそれに合わせて引き上げることである。使用量が時間とともに増え続けるなら、アプリのメモリリークを疑う。CPU は上限を超えても止められず、処理が抑えられる（スロットリング）だけなので、症状の出方が違う。",
    points: [
      "OOMKilled（終了コード 137）→ メモリの上限を超えた。リクエストと上限を見直す。",
      "CPU の上限を超えるとスロットリング、メモリの上限を超えると強制終了。",
    ],
  },
  {
    source: at(28, "3.1"),
    field: S3,
    answer: 0,
    text: "CB社の Artifact Registry のリポジトリ app-images には、CI がビルドのたびにコンテナ イメージを送り込んでおり、保存の費用が増え続けている。本番で使う release- で始まるタグの付いたイメージと、直近の 10 個のバージョンは残し、それ以外で 30 日を過ぎたものは自動で消したい。最も適切な方法はどれか。",
    choices: [
      {
        text: "リポジトリにクリーンアップ ポリシーを設定する。release- で始まるタグと最新の 10 個のバージョンを残す条件、30 日を過ぎたものを削除する条件を書き、まずドライランで消える対象を確かめる。",
        note: "残す条件と消す条件を組み合わせて、リポジトリが自動で古いイメージを消す。ドライランで影響を先に確かめられる。これが正解。",
      },
      {
        text: "毎月リポジトリを削除して作り直す。",
        note: "本番で使うイメージまで消えてしまう。作り直す間はイメージを取得できず、デプロイが止まる。",
      },
      {
        text: "Cloud Storage のオブジェクトのライフサイクル ルールで、30 日を過ぎたイメージを消す。",
        note: "Artifact Registry のイメージは、Cloud Storage のバケットのオブジェクトとして利用者が管理するものではない。ライフサイクル ルールは使えない。",
      },
      {
        text: "Cloud Scheduler から毎日スクリプトを起動し、古いイメージを探して削除する。",
        note: "作れなくはないが、残す条件の判定や失敗時の扱いを自分で作って保守することになる。用意された機能で済む。",
      },
    ],
    explain:
      "Artifact Registry のクリーンアップ ポリシーは、条件に合うアーティファクトを自動で削除する仕組みである。削除の条件（タグの有無やタグの接頭辞、作成からの経過時間など）と、残す条件（特定の接頭辞のタグ、最新の N 個のバージョンなど）を組み合わせられ、残す条件が削除の条件より優先される。ドライランにしておくと、実際には消さずに、どれが消える対象になるかを確かめられる。本番に影響しないことを確かめてから、ドライランを外して有効にする。",
    points: [
      "古いイメージの自動削除 → Artifact Registry のクリーンアップ ポリシー。",
      "残す条件が削除の条件より優先される。まずドライランで確かめる。",
    ],
  },
  {
    source: at(29, "3.1"),
    field: S3,
    answer: 3,
    text: "CC社の運用担当者は、毎週の棚卸しのレポートのために、ラベル env=dev が付いた VM のうち、いま動いている（RUNNING の）ものの名前とゾーンだけを一覧にしたい。ゾーンは URL ではなく asia-northeast1-b のような名前で出したい。最も適切なコマンドはどれか。",
    choices: [
      {
        text: "gcloud compute instances list --labels=env=dev --status=RUNNING",
        note: "instances list に --labels や --status というフラグは無い。絞り込みは --filter で行う。",
      },
      {
        text: 'gcloud compute instances list --filter="env=dev"',
        note: "ラベルは labels というフィールドの下にあるので、env=dev だけでは何も一致しない。動いているかどうかの条件も無い。",
      },
      {
        text: 'gcloud compute instances describe --filter="labels.env=dev"',
        note: "describe は名前を指定した 1 つの VM の詳細を出すコマンドで、条件に合う VM の一覧は作れない。",
      },
      {
        text: 'gcloud compute instances list --filter="labels.env=dev AND status=RUNNING" --format="value(name,zone.basename())"',
        note: "--filter でラベルと状態の両方の条件を付け、--format で名前とゾーンの名前だけを出す。これが正解。",
      },
    ],
    explain:
      "gcloud の list 系のコマンドでは、--filter で条件に合うものだけに絞り、--format で出す項目や形式を決められる。ラベルは labels.キー のように指定し、AND や OR で条件を組み合わせられる。VM の状態は status フィールドに入っている。--format の value(...) は値だけを並べて出すのでスクリプトに渡しやすく、zone のように URL で入っている項目は basename() で最後の名前だけにできる。どの項目があるかは、describe の出力を --format=json で見ると分かる。",
    points: [
      "絞り込みは --filter（ラベルは labels.キー）、出し方は --format。",
      "URL の項目は basename() で名前だけにできる。",
    ],
  },
  {
    source: at(30, "3.1"),
    field: S3,
    answer: [1, 2],
    text: "CD社の GKE で新しいバージョンをデプロイしたところ、Pod の状態が ImagePullBackOff のまま起動しない。原因を調べるために最初に使うコマンドとして適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "kubectl logs で、その Pod のコンテナのログを見る",
        note: "イメージを取得できずコンテナが一度も起動していないので、アプリのログはまだ無い。",
      },
      {
        text: "kubectl describe pod で、その Pod の Events を見る",
        note: "イメージの名前やタグの誤り、取得の権限が無いことなど、取得に失敗した理由が Events に出る。これが正解。",
      },
      {
        text: "kubectl get events で、Namespace のイベントを時刻順に見る",
        note: "イメージの取得の失敗や再試行のイベントを、ほかの出来事と合わせて時系列で確かめられる。これが正解。",
      },
      {
        text: "kubectl top pod で、Pod の CPU とメモリの使用量を見る",
        note: "コンテナが動いていないので使用量は出ない。イメージの取得の失敗の理由も分からない。",
      },
    ],
    explain:
      "ImagePullBackOff は、ノードがコンテナ イメージを取得できず、間隔を空けながら再試行している状態である。よくある原因は、イメージの名前やタグの書き間違い、イメージがまだ存在しないこと、ノード（またはそのサービス アカウント）にリポジトリから取得する権限が無いことなどである。コンテナが起動していないのでアプリのログは無く、手がかりは Kubernetes のイベントにある。kubectl describe pod の Events や kubectl get events で、取得に失敗したときのメッセージを確かめる。",
    points: [
      "ImagePullBackOff → イメージの取得に失敗している。アプリのログは無い。",
      "原因は kubectl describe pod の Events や kubectl get events で見る。",
    ],
  },
  {
    source: at(31, "3.2"),
    field: S3,
    answer: 3,
    text: "CE社は、US マルチリージョンに作った BigQuery のデータセット analytics を、データの保管場所に関する規程に合わせて asia-northeast1 に移すことになった。テーブルは数百あり、移行の作業中も毎日データが追加される。最も適切な方法はどれか。",
    choices: [
      {
        text: "bq update でデータセット analytics の場所を asia-northeast1 に変更する。",
        note: "データセットの場所は作成後に変更できない。",
      },
      {
        text: "東京にデータセットを作れば、同じプロジェクトの US のデータセットから自動でデータが複製される。",
        note: "データセットを作っただけでは何も複製されない。データを移す仕組みが別に要る。",
      },
      {
        text: "テーブルを 1 つずつ Cloud Storage にエクスポートし、東京のデータセットへ読み込むスクリプトを書いて実行する。",
        note: "できなくはないが、数百のテーブルを扱う処理と、作業中に追加されるデータの追従を自分で作ることになる。",
      },
      {
        text: "東京に新しいデータセットを作り、BigQuery Data Transfer Service のデータセットのコピーでリージョンをまたいで転送する。定期実行で追加分を追従させ、最後に参照先を切り替える。",
        note: "リージョンをまたいでデータセットのテーブルをまとめてコピーでき、スケジュールで繰り返し実行できる。これが正解。",
      },
    ],
    explain:
      "BigQuery のデータセットの場所（リージョンやマルチリージョン）は、作成後に変更できない。別の場所へ移すには、移行先に新しいデータセットを作ってデータを移す。BigQuery Data Transfer Service のデータセットのコピーを使うと、リージョンをまたいでデータセットのテーブルをまとめてコピーでき、スケジュールを設定して繰り返し実行すれば、作業中に追加されたデータも追従させられる。移し終えたらクエリやアプリケーションの参照先を新しいデータセットに切り替え、元のデータセットを片付ける。",
    points: [
      "BigQuery のデータセットの場所は後から変えられない。",
      "別のリージョンへ移す → BigQuery Data Transfer Service のデータセットのコピー。",
    ],
  },
  {
    source: at(32, "3.2"),
    field: S3,
    answer: 0,
    text: "CF社では、BigQuery のデータセット scratch を、アナリストが一時的な集計結果を置く場所として使っている。作ったテーブルを消し忘れることが多く、保存の費用が増えている。今後このデータセットに作られるテーブルは、作成から 7 日で自動的に消えるようにしたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "データセット scratch の既定のテーブルの有効期限を 7 日に設定する（bq update --default_table_expiration 604800 scratch）。",
        note: "設定したあとにこのデータセットで作られるテーブルには、作成から 7 日の有効期限が自動で付く。これが正解。",
      },
      {
        text: "データセットのタイムトラベルの期間を 2 日にする。",
        note: "タイムトラベルは、変更や削除の前の状態に戻すための期間である。テーブルを自動で消す設定ではない。",
      },
      {
        text: "90 日以上変更されないテーブルは長期保存の料金になるので、そのまま置いておく。",
        note: "長期保存になると保存の料金は下がるが、テーブルは消えない。費用が増え続ける問題は残る。",
      },
      {
        text: "毎週金曜日に担当者が scratch のテーブルを一覧にし、手作業で削除する。",
        note: "人に頼るので消し忘れが起き、消してはいけないものを誤って消すおそれもある。",
      },
    ],
    explain:
      "BigQuery では、データセットに既定のテーブルの有効期限を設定できる。設定すると、その後にデータセットで作られるテーブルには、作成時刻から計算した有効期限が自動で付き、期限が来るとテーブルは削除される。既定の有効期限は、設定する前からあるテーブルには付かないので、必要なら既存のテーブルには個別に有効期限を設定する。パーティション分割テーブルでは、パーティションごとの有効期限で古いパーティションだけを消すこともできる。",
    points: [
      "一時的なテーブルの自動削除 → データセットの既定のテーブルの有効期限。",
      "既定の有効期限は、設定後に作られるテーブルにだけ付く。",
    ],
  },
  {
    source: at(33, "3.2"),
    field: S3,
    answer: 1,
    text: "CG社では、Pub/Sub の push サブスクリプションで注文のメッセージを Cloud Run に届けている。形式の壊れたメッセージが混じると、Cloud Run が毎回エラーを返し、そのメッセージが何度も再配信されて処理の妨げになっている。壊れたメッセージは捨てずに別に保管して、あとで調べたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "サブスクリプションの確認応答の期限を延ばす。",
        note: "処理に時間がかかる場合の設定で、毎回エラーになるメッセージの再配信は止まらない。",
      },
      {
        text: "サブスクリプションにデッドレター トピックを設定し、最大配信試行回数を超えたメッセージをそこへ移す。",
        note: "決めた回数だけ配信しても処理できなかったメッセージを、別のトピックへ移して保管できる。これが正解。",
      },
      {
        text: "メッセージの保持期間を短くし、壊れたメッセージが早く消えるようにする。",
        note: "壊れたメッセージが失われ、あとで調べられない。正常なメッセージまで消えるおそれもある。",
      },
      {
        text: "Cloud Run で、処理に失敗したときも成功の応答を返すように変える。",
        note: "再配信は止まるが、壊れたメッセージは確認応答されて消え、あとで調べられない。",
      },
    ],
    explain:
      "Pub/Sub のデッドレター トピックは、何度配信しても処理できないメッセージを、別のトピックへ移す仕組みである。サブスクリプションにデッドレター トピックと最大配信試行回数（5〜100 回）を設定すると、その回数を超えたメッセージがデッドレター トピックへ転送される。そこにサブスクリプションを作っておけば、あとで中身を調べられる。転送は Pub/Sub のサービス エージェントが行うので、デッドレター トピックへのパブリッシュの権限と、元のサブスクリプションへのサブスクライブの権限をサービス エージェントに付与しておく。",
    points: [
      "処理できないメッセージを別に保管する → デッドレター トピックと最大配信試行回数。",
      "Pub/Sub のサービス エージェントにパブリッシャーとサブスクライバーの権限が要る。",
    ],
  },
  {
    source: at(34, "3.2"),
    field: S3,
    answer: 2,
    text: "CH社の分析担当者は、毎朝 7 時に BigQuery で前日の売上を集計する SQL を手で実行し、結果をテーブル daily_summary に書き込んでいる。休みの日にも結果が必要なので、これを自動にしたい。追加のサーバーは持ちたくない。最も適切な方法はどれか。",
    choices: [
      {
        text: "Compute Engine の VM を 1 台用意し、cron で毎朝 bq query を実行する。",
        note: "動くが、VM の運用が必要になる。追加のサーバーを持たないという条件に合わない。",
      },
      {
        text: "Dataflow のストリーミング パイプラインで、売上を集計し続ける。",
        note: "1 日 1 回の集計に、常に動くパイプラインは過剰である。費用と運用の手間がかかる。",
      },
      {
        text: "BigQuery のスケジュールされたクエリで、毎朝 7 時にその SQL を実行し、結果を daily_summary に書き込むように設定する。",
        note: "BigQuery の中で SQL を定期的に実行し、結果を指定したテーブルに書き込める。サーバーは要らない。これが正解。",
      },
      {
        text: "Cloud Storage のオブジェクトのライフサイクル ルールで、毎朝クエリを起動する。",
        note: "ライフサイクル ルールはオブジェクトのクラスの変更や削除を行う仕組みで、クエリは起動できない。",
      },
    ],
    explain:
      "BigQuery のスケジュールされたクエリは、SQL を決まった間隔や時刻に自動で実行する機能である（内部では BigQuery Data Transfer Service の仕組みを使う）。結果を書き込むテーブルと、追記か上書きかを指定でき、@run_time や @run_date といったパラメータで実行日に応じた条件も書ける。実行に使う ID としてサービス アカウントを指定でき、担当者が異動してもクエリが止まらないようにできる。",
    points: [
      "定期的な SQL の実行 → BigQuery のスケジュールされたクエリ。",
      "実行の ID にはサービス アカウントを指定でき、人の異動の影響を受けない。",
    ],
  },
  {
    source: at(35, "3.2"),
    field: S3,
    answer: [1, 3],
    text: "CI社の Cloud SQL for PostgreSQL のインスタンスで、ディスクの空きが少なくなってきた。Cloud SQL のストレージについての説明として正しいものはどれか。2つ選べ。",
    choices: [
      {
        text: "自動で増えたストレージの容量は、データを削除すれば自動で元の大きさに戻る。",
        note: "データを消しても、割り当てられたストレージの容量は小さくならない。",
      },
      {
        text: "ストレージの自動増量を有効にしておくと、空きが少なくなったときに容量が自動で増える。",
        note: "空きが少なくなると Cloud SQL が容量を自動で増やし、ディスクが一杯になって止まるのを防ぐ。これが正解。",
      },
      {
        text: "ストレージの容量を増やすには、インスタンスを作り直す必要がある。",
        note: "容量は動いているインスタンスのまま増やせる。作り直す必要は無い。",
      },
      {
        text: "一度増やしたストレージの容量は、あとから減らすことができない。",
        note: "容量は増やせるが減らせない。自動増量には上限を設定しておくと、増えすぎを防げる。これが正解。",
      },
    ],
    explain:
      "Cloud SQL のストレージの容量は、動いているインスタンスのまま増やせる。ストレージの自動増量を有効にしておくと、空きが少なくなったときに容量が自動で追加される。一方で、容量は一度増やすと減らせず、データを削除しても割り当てた容量の分の費用はかかり続ける。一時的なデータの増加で容量が増えすぎないよう、自動増量には上限を設定しておくことができる。容量を小さくしたいときは、小さいインスタンスを作ってデータを移す必要がある。",
    points: [
      "Cloud SQL のストレージは増やせるが減らせない。",
      "自動増量で一杯になるのを防ぎ、上限で増えすぎを防ぐ。",
    ],
  },
  {
    source: at(36, "3.3"),
    field: S3,
    answer: 1,
    text: "CJ社では、過去の検証のために予約した静的外部 IP アドレスが、どの VM やロードバランサにも付いていないまま数十個残っている。費用の見直しの担当者として、対応として最も適切なものはどれか。",
    choices: [
      {
        text: "使われていない静的外部 IP アドレスには料金がかからないので、そのままにしておく。",
        note: "予約したまま使われていない静的外部 IP アドレスにも料金がかかる。",
      },
      {
        text: 'gcloud compute addresses list --filter="status=RESERVED" で使われていないアドレスを洗い出し、今後も使わないものは gcloud compute addresses delete で解放する。',
        note: "使われていない予約を見つけて解放すれば、その料金はかからなくなる。これが正解。",
      },
      {
        text: "アドレスを残したまま、適当な VM に付けておく。",
        note: "使用中の外部 IP アドレスにも料金がかかるうえ、不要な VM を外部に公開することになる。",
      },
      {
        text: "プロジェクトと請求先アカウントのリンクを外す。",
        note: "プロジェクトのすべてのリソースが止まる。使っているサービスまで影響を受ける。",
      },
    ],
    explain:
      "静的外部 IP アドレスは、予約すると VM などから外しても同じアドレスを持ち続けられる。その代わり、何にも付いていない予約のままでも料金がかかる。gcloud compute addresses list の status を見ると、使用中は IN_USE、どこにも付いていないものは RESERVED になっているので、--filter で RESERVED のものを洗い出し、今後も使う予定が無ければ gcloud compute addresses delete で解放する。解放したアドレスは同じものを取り戻せないので、DNS などで参照していないかを確かめてから行う。",
    points: [
      "使われていない静的外部 IP アドレスにも料金がかかる。",
      "status が RESERVED のものを洗い出し、不要なら解放する。",
    ],
  },
  {
    source: at(37, "3.3"),
    field: S3,
    answer: 0,
    text: "CK社の共有 VPC には、長年の運用でファイアウォール ルールが 400 以上たまっている。ほかのルールに隠れて一度も効いていないルールや、範囲が広すぎるルール、最近まったく使われていないルールを見つけて整理したい。最も適切な方法はどれか。",
    choices: [
      {
        text: "Network Intelligence Center のファイアウォール インサイトで、隠れているルールや使われていないルール、許可の範囲が広すぎるルールを確かめる。",
        note: "ルールの構成とファイアウォール ルールのロギングの記録を分析して、整理の候補を示してくれる。これが正解。",
      },
      {
        text: "すべてのファイアウォール ルールをいったん削除し、通信が止まったところだけ作り直す。",
        note: "本番の通信が止まり、影響が大きすぎる。どのルールが必要だったかも分からなくなる。",
      },
      {
        text: "Cloud Armor のセキュリティ ポリシーに置き換える。",
        note: "Cloud Armor は外部のロードバランサの前で働く防御の仕組みで、VPC の中のファイアウォール ルールの代わりにはならない。",
      },
      {
        text: "ルールを表計算ソフトに書き出し、担当者が 1 つずつ見比べる。",
        note: "400 以上のルールの重なりや使われ方を、人の目で正しく判断するのは難しい。実際に通信に使われたかも分からない。",
      },
    ],
    explain:
      "ファイアウォール インサイトは、Network Intelligence Center の機能の 1 つで、VPC のファイアウォール ルールの構成と使われ方を分析する。優先度の高いほかのルールに覆われて一度も評価されない（シャドウされた）ルール、一定期間ヒットしていないルール、許可の範囲が必要以上に広いルールなどを示す。使われ方の分析にはファイアウォール ルールのロギングの記録を使うので、対象のルールでロギングを有効にしておく。示された候補は、影響を確かめてから無効化や削除を行う。",
    points: [
      "ファイアウォール ルールの整理 → ファイアウォール インサイト。",
      "使われ方の分析には、ファイアウォール ルールのロギングを有効にしておく。",
    ],
  },
  {
    source: at(38, "3.4"),
    field: S3,
    answer: 3,
    text: "CL社の VM には Ops エージェントが入っており、システムのログは Cloud Logging に届いている。ところが、業務アプリが /var/log/orderapp/ に書き出すログは Cloud Logging に届いていない。このログも Cloud Logging で検索できるようにしたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "VM のアクセス スコープに Cloud Logging の書き込みを加える。",
        note: "システムのログはすでに届いているので、書き込みの権限は足りている。足りないのは、どのファイルを集めるかの設定である。",
      },
      {
        text: "Cloud Logging のシンクを作り、/var/log/orderapp/ のログを送り先に指定する。",
        note: "シンクは Cloud Logging に届いたログの送り先を決めるもので、VM の中のファイルを集めることはしない。",
      },
      {
        text: "業務アプリを Cloud Run に移す。",
        note: "標準出力のログは自動で集まるようになるが、ログを集めるために移行するのは過剰である。",
      },
      {
        text: "Ops エージェントの設定ファイル（/etc/google-cloud-ops-agent/config.yaml）に、/var/log/orderapp/ のファイルを読む files 型のレシーバーと、それを使うパイプラインを追加し、エージェントを再起動する。",
        note: "Ops エージェントは、設定したファイルのログを集めて Cloud Logging に送る。これが正解。",
      },
    ],
    explain:
      "Ops エージェントは、既定ではシステムのログ（syslog など）を集める。アプリが独自の場所に書き出すログを集めるには、設定ファイル /etc/google-cloud-ops-agent/config.yaml の logging の部分に、type: files のレシーバー（読むファイルのパスを include_paths で指定）と、そのレシーバーを使うパイプラインを追加し、エージェントを再起動する。JSON などの形式なら、プロセッサで解析して項目ごとに検索できるようにもできる。多くの VM に同じ設定を配るときは、構成管理やエージェント ポリシーと組み合わせる。",
    points: [
      "アプリ独自のログ ファイル → Ops エージェントの config.yaml に files 型のレシーバーとパイプラインを追加。",
      "シンクは届いたログの送り先を決めるもので、集める設定ではない。",
    ],
  },
  {
    source: at(39, "3.4"),
    field: S3,
    answer: 2,
    text: "CM社は、Cloud Monitoring で API の可用性の SLO（30 日間で 99.9%）を定義した。今は、エラー率が少しでも上がるたびにアラートが鳴り、夜間の呼び出しが多すぎると不満が出ている。一方で、SLO を守れなくなるような事態には早めに気付きたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "アラートをすべて止め、毎朝ダッシュボードで SLO の達成状況を確かめる。",
        note: "呼び出しは減るが、SLO を守れなくなる事態に気付くのが翌朝になる。",
      },
      {
        text: "エラー率のアラートのしきい値を 100% にする。",
        note: "すべてのリクエストが失敗しない限り鳴らなくなり、SLO を守れなくなる事態を見逃す。",
      },
      {
        text: "SLO に対するバーンレート（エラー バジェットを消費する速さ）のアラートを作り、このままでは予算を使い切る速さになったときだけ通知する。",
        note: "一時的な小さな揺れでは鳴らず、SLO に影響する速さでエラーが出ているときに知らせる。これが正解。",
      },
      {
        text: "稼働時間チェックの間隔を短くする。",
        note: "チェックの回数が増えるだけで、アラートの鳴り方の問題は解決しない。",
      },
    ],
    explain:
      "SLO（サービスレベル目標）を決めると、目標に対して許される失敗の量であるエラー バジェットが決まる。99.9% なら、30 日間のリクエストの 0.1% までは失敗してよい。バーンレートは、このエラー バジェットを消費している速さで、1 なら期間の終わりにちょうど使い切る速さになる。Cloud Monitoring では、SLO に対してバーンレートのアラート ポリシーを作れるので、「短い時間でも急速に消費している」ときや「長めの時間で着実に消費している」ときにだけ通知させれば、小さな揺れで呼び出されず、本当に問題のあるときに気付ける。",
    points: [
      "SLO を守れなくなる事態にだけ知らせる → バーンレートのアラート。",
      "バーンレートはエラー バジェットを消費する速さ。1 で期間の終わりにちょうど使い切る。",
    ],
  },
  {
    source: at(40, "3.4"),
    field: S3,
    answer: 0,
    text: "CN社の VM db-1 が、誰も作業していないはずの夜間に再起動していた。原因が、Google 側のホストのメンテナンスや障害に伴う処理なのか、誰かの操作なのかを確かめたい。最初に調べるべき監査ログとして最も適切なものはどれか。",
    choices: [
      {
        text: "システム イベント監査ログ",
        note: "Google のシステムが行った変更が記録される。ホストの障害による VM の再起動（compute.instances.hostError）などが残る。これが正解。",
      },
      {
        text: "データアクセス監査ログ",
        note: "データや設定の読み取りなどを記録するログで、VM の再起動の原因の手がかりにはならない。BigQuery 以外では既定で無効でもある。",
      },
      {
        text: "VPC フロー ログ",
        note: "VM のネットワークの通信を記録するもので、再起動したかどうかやその理由は分からない。",
      },
      {
        text: "ポリシー拒否監査ログ",
        note: "VPC Service Controls などのセキュリティ ポリシーでアクセスが拒否されたことを記録するもので、VM の再起動とは関係が無い。",
      },
    ],
    explain:
      "Cloud Audit Logs のうち、システム イベント監査ログには、人ではなく Google のシステムが行ったリソースの変更が記録される。Compute Engine では、ホストの障害による VM の自動再起動（compute.instances.hostError）や、ホストのメンテナンスに伴うライブ マイグレーション（compute.instances.migrateOnHostMaintenance）などがこれにあたる。誰かが操作して再起動したのであれば、管理アクティビティ監査ログにその操作と実行した人が残る。両方を見比べれば、人の操作か Google 側の処理かを切り分けられる。",
    points: [
      "Google のシステムによる変更（ホストの障害による再起動など）→ システム イベント監査ログ。",
      "人の操作による変更 → 管理アクティビティ監査ログ。",
    ],
    figure: {
      type: "table",
      caption: "監査ログの種類",
      headers: ["種類", "記録するもの", "既定"],
      rows: [
        ["管理アクティビティ", "ユーザーによる構成の変更", "常に記録（無効にできない）"],
        ["システム イベント", "Google のシステムによる構成の変更", "常に記録（無効にできない）"],
        ["データアクセス", "データや設定の読み取りなど", "BigQuery 以外は無効"],
        ["ポリシー拒否", "セキュリティ ポリシーによる拒否", "記録される（除外はできる）"],
      ],
    },
  },
  // ───────── セクション4 アクセスとセキュリティ（問41〜問50） ─────────
  {
    source: at(41, "4.1"),
    field: S4,
    answer: 2,
    text: "CO社の BigQuery のテーブル sales.orders には全国の注文が入っており、列 region に地域名が入っている。関西の営業チームのグループ kansai-sales@co.example.com には、region が「関西」の行だけを読ませたい。テーブルを分けたりコピーを作ったりはしたくない。最も適切な方法はどれか。",
    choices: [
      {
        text: "列 region にポリシータグを付け、関西の営業チームにだけ、そのタグの付いた列の閲覧を許す。",
        note: "ポリシータグは列の単位で読める人を分ける仕組みで、行を地域で絞ることはできない。",
      },
      {
        text: "データセット sales に対する BigQuery データ閲覧者のロールを、kansai-sales@ に付与する。",
        note: "データセットのすべてのテーブルのすべての行が読めてしまう。",
      },
      {
        text: "CREATE ROW ACCESS POLICY kansai ON sales.orders GRANT TO ('group:kansai-sales@co.example.com') FILTER USING (region = '関西') で行アクセス ポリシーを作る。",
        note: "テーブルを 1 つのまま、kansai-sales@ には条件に合う行だけを見せられる。これが正解。",
      },
      {
        text: "毎晩、region が「関西」の行だけを別のテーブルにコピーし、そのテーブルだけを kansai-sales@ に読ませる。",
        note: "読ませる範囲は絞れるが、コピーを作らないという条件に反する。コピーの処理の運用と、データの遅れも生じる。",
      },
    ],
    explain:
      "BigQuery の行アクセス ポリシーは、テーブルの行を条件で絞り、指定したプリンシパルには条件に合う行だけを見せる仕組みである。CREATE ROW ACCESS POLICY の GRANT TO で対象のユーザーやグループを、FILTER USING で見せる行の条件を書く。テーブルを読むための権限（BigQuery データ閲覧者など）は別に必要で、行アクセス ポリシーはその中で見える行を絞る。列の単位で読める人を分けたいときは、ポリシータグを使う列レベルのアクセス制御を使う。",
    points: [
      "行を条件で絞る → 行アクセス ポリシー（CREATE ROW ACCESS POLICY）。",
      "列を隠す → ポリシータグ（列レベルのアクセス制御）。",
    ],
  },
  {
    source: at(42, "4.1"),
    field: S4,
    answer: 1,
    text: "CP社の PMO の担当者は、組織の中にどのようなフォルダとプロジェクトがあるかを把握し、プロジェクトの台帳を最新に保ちたい。VM やバケットなど、プロジェクトの中のリソースは見せたくない。組織ノードで付与するロールとして最も適切なものはどれか。",
    choices: [
      {
        text: "閲覧者（roles/viewer）",
        note: "フォルダとプロジェクトに加えて、プロジェクトの中のほとんどのリソースの設定まで読めてしまう。",
      },
      {
        text: "ブラウザ（roles/browser）",
        note: "組織・フォルダ・プロジェクトの階層と、その許可ポリシーを閲覧できるが、プロジェクトの中のリソースは見られない。これが正解。",
      },
      {
        text: "組織の管理者（roles/resourcemanager.organizationAdmin）",
        note: "組織の IAM ポリシーを変えられる強い権限で、閲覧したいだけの担当者には大きすぎる。",
      },
      {
        text: "フォルダ作成者（roles/resourcemanager.folderCreator）",
        note: "フォルダを作るための権限で、閲覧だけをしたいという目的に合わない。作る権限まで渡すことになる。",
      },
    ],
    explain:
      "ブラウザ（roles/browser）は、リソース階層をたどるためのロールで、組織・フォルダ・プロジェクトとその許可ポリシーを閲覧できる。プロジェクトの中の VM やバケットなどのリソースを見る権限は含まない。閲覧者（roles/viewer）は、ほとんどのサービスのリソースを読み取れる基本ロールで、範囲が広い。「どんなプロジェクトがあるか」だけを知りたい人には、ブラウザのように目的に合った最小のロールを付与する。",
    points: [
      "階層（フォルダとプロジェクト）だけを見せる → ブラウザ（roles/browser）。",
      "閲覧者（roles/viewer）はリソースの中まで読めるので範囲が広い。",
    ],
  },
  {
    source: at(43, "4.1"),
    field: S4,
    answer: [0, 2],
    text: "CQ社の監査担当者は、取引先のアカウント partner@external.example.com に付与されている権限を洗い出している。プロジェクト cq-data の IAM ポリシーには partner@ は出てこないが、データの受け渡しに使っているバケット cq-exchange と、BigQuery のデータセット shared_ds に、リソースの単位で付与されている可能性がある。確認に使うコマンドとして適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "gcloud storage buckets get-iam-policy gs://cq-exchange",
        note: "バケットに設定された IAM ポリシーを表示する。バケットの単位で付けた付与はここに出る。これが正解。",
      },
      {
        text: "gcloud iam roles describe roles/storage.objectViewer",
        note: "ロールに含まれる権限の一覧を出すコマンドで、そのロールを誰に付けたかは分からない。",
      },
      {
        text: "bq show --format=prettyjson cq-data:shared_ds",
        note: "データセットの情報とあわせて、データセットに対するアクセスの設定が表示される。これが正解。",
      },
      {
        text: 'gcloud projects get-iam-policy cq-data --flatten="bindings[].members" --filter="bindings.members:partner@external.example.com"',
        note: "プロジェクトの IAM ポリシーしか見ないので、バケットやデータセットに付けた付与は出てこない。",
      },
    ],
    explain:
      "IAM の付与は、組織・フォルダ・プロジェクトだけでなく、バケットやデータセット、トピック、サービス アカウントなどの個々のリソースにも設定できる。リソースに付けた付与はそのリソースの IAM ポリシーに書かれるので、プロジェクトのポリシーを見ても出てこない。バケットは gcloud storage buckets get-iam-policy、データセットは bq show（アクセスの設定）など、リソースごとのコマンドで確かめる。組織全体からまとめて探すなら、gcloud asset search-all-iam-policies でポリシーを横断して検索する方法もある。",
    points: [
      "リソースに付けた付与は、そのリソースの IAM ポリシーにだけ書かれる。",
      "バケット → gcloud storage buckets get-iam-policy、データセット → bq show。",
    ],
  },
  {
    source: at(44, "4.1"),
    field: S4,
    answer: [1, 3],
    text: "CR社は外部の監査法人に、組織全体のアクセス管理の点検を依頼した。監査人には次の 2 つだけを許し、設定の変更やリソースの中身の閲覧はさせたくない。組織ノードで監査人のグループに付与するロールとして適切なものはどれか。2つ選べ。",
    stem: {
      list: {
        items: [
          "要件A: すべてのフォルダとプロジェクトの IAM の許可ポリシーを読む",
          "要件B: 管理アクティビティ監査ログを読み、誰がいつ権限を変えたかを確かめる",
        ],
      },
    },
    choices: [
      {
        text: "閲覧者（roles/viewer）",
        note: "ほとんどのリソースの設定まで読めてしまい、リソースの中身を見せないという条件に合わない。",
      },
      {
        text: "セキュリティ審査担当者（roles/iam.securityReviewer）",
        note: "IAM の許可ポリシーを一覧・取得する権限を持ち、変更はできない。要件A に合う。これが正解。",
      },
      {
        text: "組織の管理者（roles/resourcemanager.organizationAdmin）",
        note: "IAM ポリシーを変更できてしまい、点検のための権限としては大きすぎる。",
      },
      {
        text: "ログ閲覧者（roles/logging.viewer）",
        note: "管理アクティビティ監査ログを含むログを読める。データアクセス監査ログは含まない。要件B に合う。これが正解。",
      },
    ],
    explain:
      "監査のような読み取りだけの仕事には、目的ごとに範囲の狭いロールを組み合わせる。セキュリティ審査担当者（roles/iam.securityReviewer）は、リソースの IAM の許可ポリシーを読めるが変えられない。ログ閲覧者（roles/logging.viewer）は、管理アクティビティ監査ログなどのログを読めるロールで、組織ノードで付与すれば配下のプロジェクトのログも読める。データアクセス監査ログには利用者の情報が含まれうるため、読むにはプライベート ログ閲覧者（roles/logging.privateLogViewer）が別に要る。",
    points: [
      "IAM ポリシーを読むだけ → セキュリティ審査担当者（roles/iam.securityReviewer）。",
      "監査ログを読む → ログ閲覧者。データアクセス監査ログはプライベート ログ閲覧者が要る。",
    ],
  },
  {
    source: at(45, "4.1"),
    field: S4,
    answer: 3,
    text: "CS社の管理者は、データ分析の担当に加わったメンバーを Google グループ analysts@cs.example.com に追加した。analysts@ には、バケット cs-reports に対する Storage オブジェクト閲覧者のロールが付いている。追加した直後にメンバーがオブジェクトを読もうとすると、403 エラーになった。最も適切な対応はどれか。",
    choices: [
      {
        text: "IAM の変更は毎日 0 時にまとめて反映されるので、翌日まで待つ。",
        note: "IAM の変更は決まった時刻にまとめて反映されるものではない。多くは数分のうちに反映される。",
      },
      {
        text: "メンバーに、プロジェクトのオーナーのロールを直接付与する。",
        note: "権限が大きすぎる。反映に時間がかかっているだけなら、強いロールを足しても同じように待つことになる。",
      },
      {
        text: "メンバーの Google アカウントを作り直す。",
        note: "アカウントの問題ではない。作り直すとグループのメンバーシップも付け直しになり、かえって遠回りになる。",
      },
      {
        text: "IAM やグループのメンバーシップの変更が反映されるまでには時間がかかることがあるので、少し待ってから再試行する。しばらくしても 403 のままなら、付与したバケット・ロール・グループに誤りが無いかを見直す。",
        note: "変更が反映されるまでの遅れを考え、待ってから確かめ、それでも駄目なら設定を見直す。これが正解。",
      },
    ],
    explain:
      "IAM の許可ポリシーの変更は、すぐにすべての場所で効くわけではなく、反映されるまでに通常は数分程度、場合によってはそれ以上かかる。グループのメンバーシップの変更は、さらに時間がかかることがある。追加した直後の 403 は、この反映の遅れであることが多いので、少し待ってから再試行する。それでも拒否されるなら、付与したリソースやロール、メンバーを追加したグループを見直し、Policy Troubleshooter でなぜ拒否されるかを確かめる。",
    points: [
      "IAM やグループのメンバーシップの変更は、反映までに時間がかかることがある。",
      "待っても拒否されるなら、付与の内容を見直し、Policy Troubleshooter で確かめる。",
    ],
  },
  {
    source: at(46, "4.2"),
    field: S4,
    answer: 0,
    text: "CT社では、受注・在庫・請求の 3 つのアプリがそれぞれ別の Cloud Run サービスとして動いており、すべて共通のサービス アカウント common-sa で動いている。common-sa には、3 つのアプリが必要とするロール（Cloud SQL クライアント、Storage オブジェクト管理者、Pub/Sub 編集者）がまとめてプロジェクトで付いている。監査ログからどのアプリの操作か分からないことと、1 つのアプリが侵害されると 3 つ分の権限が使われてしまうことが問題になった。最も適切な対処はどれか。",
    choices: [
      {
        text: "アプリごとに専用のサービス アカウントを作り、それぞれに必要なロールだけを、できるだけ使うリソースの単位で付けて、各 Cloud Run サービスに割り当てる。",
        note: "監査ログにはアプリごとのサービス アカウントが残り、侵害されても使える権限はそのアプリの分に限られる。これが正解。",
      },
      {
        text: "common-sa はそのままにして、各 Cloud Run サービスにラベルを付け、監査ログでラベルから区別する。",
        note: "監査ログに残る操作の主体は common-sa のままで、権限がまとまっている問題も解決しない。",
      },
      {
        text: "common-sa の鍵を作り、毎週ローテーションする。",
        note: "Cloud Run は鍵を使わずにサービス アカウントで動ける。鍵を作るとかえって漏えいの危険が増え、権限の問題も残る。",
      },
      {
        text: "3 つのサービスを Compute Engine のデフォルトのサービス アカウントで動かす。",
        note: "共有のサービス アカウントのままで、多くの場合さらに広い権限を持つ。問題がより悪くなる。",
      },
    ],
    explain:
      "サービス アカウントは、アプリ（ワークロード）ごとに分けて作るのが基本である。分けておけば、監査ログでどのアプリが操作したかを区別でき、1 つのアプリが侵害されても、使われる権限はそのアプリに付けた分に限られる。ロールは必要なものだけを、プロジェクト全体ではなく使うリソース（バケットやトピックなど）の単位で付ける。サービス アカウントには、用途や担当が分かる名前と説明を付けておくと、あとの棚卸しが楽になる。",
    points: [
      "サービス アカウントはアプリごとに分け、必要なロールだけを付ける。",
      "共有すると、監査で区別できず、侵害時の影響も広がる。",
    ],
  },
  {
    source: at(47, "4.2"),
    field: S4,
    answer: 1,
    text: "CU社は、社内向けの静的なポータルの画面を配信するだけの VM を Compute Engine に作る。この VM には Ops エージェントも入れず、VM 上のソフトウェアは Google Cloud の API を一切呼ばない。セキュリティの観点から最も適切な VM の作り方はどれか。",
    choices: [
      {
        text: "既定の設定のまま、Compute Engine のデフォルトのサービス アカウントを付けて作る。",
        note: "使わないのに、VM 上から取得できるサービス アカウントの認証情報を与えることになる。デフォルトのサービス アカウントは権限が広いことも多い。",
      },
      {
        text: "gcloud compute instances create に --no-service-account と --no-scopes を付け、サービス アカウントの付かない VM として作る。",
        note: "API を呼ばない VM には認証情報を持たせない。侵害されても Google Cloud の権限を悪用されない。これが正解。",
      },
      {
        text: "閲覧者のロールを付けた専用のサービス アカウントを作り、VM に付ける。",
        note: "読み取りだけでも、使わない権限を与えることになる。侵害されるとプロジェクトの情報を読まれてしまう。",
      },
      {
        text: "デフォルトのサービス アカウントを付けたまま、アクセス スコープを最小にする。",
        note: "スコープは古い仕組みで、サービス アカウントの認証情報は VM から取得できるままである。使わないなら付けないほうがよい。",
      },
    ],
    explain:
      "VM にサービス アカウントを付けると、VM 上のソフトウェアはメタデータ サーバーからそのサービス アカウントのアクセス トークンを取得できる。VM が侵害されれば、そのトークンで付与された権限を使われてしまう。Google Cloud の API を呼ばない VM なら、--no-service-account と --no-scopes を付けてサービス アカウントの無い VM として作るのが最小権限になる。API を呼ぶ VM には、用途ごとの専用のサービス アカウントを作り、必要なロールだけを付けて割り当てる。",
    points: [
      "API を呼ばない VM には、サービス アカウントを付けない（--no-service-account --no-scopes）。",
      "付けると、VM から取得できるトークンが侵害時に悪用されうる。",
    ],
  },
  {
    source: at(48, "4.2"),
    field: S4,
    answer: 2,
    text: "CV社の社内のバックアップ製品は、保存先に S3 互換の API（アクセス キーとシークレット）でしか接続できない。保存先を Cloud Storage のバケット cv-backup にしたい。特定の人のアカウントに依存させず、権限はこのバケットのオブジェクトの読み書きに限りたい。最も適切な方法はどれか。",
    choices: [
      {
        text: "サービス アカウントの JSON 形式の鍵を作り、バックアップ製品に設定する。",
        note: "この製品が扱えるのは S3 互換のアクセス キーとシークレットで、サービス アカウントの JSON の鍵は使えない。",
      },
      {
        text: "API キーを作って Cloud Storage API に制限し、バックアップ製品に設定する。",
        note: "API キーはバケットへの書き込みを認可する認証情報にならない。誰の権限で書くかを表せない。",
      },
      {
        text: "専用のサービス アカウントを作ってバケット cv-backup に対する Storage オブジェクト ユーザーのロールを付け、そのサービス アカウントの HMAC キーを作って、アクセス ID とシークレットを製品に設定する。",
        note: "HMAC キーは S3 互換のツールから Cloud Storage を使うための認証情報で、サービス アカウントに結び付けられる。これが正解。",
      },
      {
        text: "バケットの allUsers にオブジェクトの書き込みを許可し、認証なしで書き込ませる。",
        note: "誰でもバックアップを書き換えたり読んだりできるようになり、重大な問題になる。",
      },
    ],
    explain:
      "Cloud Storage の XML API は、S3 互換のツールからも使えるように作られており、その認証には HMAC キー（アクセス ID とシークレットの組）を使う。HMAC キーはサービス アカウント（またはユーザー アカウント）に結び付けて作り、そのアカウントに付けた IAM のロールの範囲で操作できる。人の異動に左右されないよう、専用のサービス アカウントに作るのがよい。シークレットは作成時にしか表示されないので安全に保管し、不要になったキーは無効にしてから削除する。",
    points: [
      "S3 互換のツールから Cloud Storage を使う → サービス アカウントの HMAC キー。",
      "HMAC キーの権限は、結び付けたアカウントの IAM のロールで決まる。",
    ],
  },
  {
    source: at(49, "4.2"),
    field: S4,
    answer: 0,
    text: "CW社の受注 API は、サービス アカウント order-api-sa で動いている。このアプリは Pub/Sub のトピック orders にメッセージを送るだけで、同じプロジェクトにあるほかのトピックやサブスクリプションには触れない。order-api-sa に付与する権限として最も適切なものはどれか。",
    choices: [
      {
        text: "トピック orders に対する Pub/Sub パブリッシャー（roles/pubsub.publisher）",
        note: "メッセージを送る権限だけを、このトピックに限って与えられる。これが正解。",
      },
      {
        text: "プロジェクトに対する Pub/Sub パブリッシャー（roles/pubsub.publisher）",
        note: "ロールは合っているが、プロジェクトのすべてのトピックへ送れるようになり、範囲が広い。",
      },
      {
        text: "トピック orders に対する Pub/Sub 編集者（roles/pubsub.editor）",
        note: "送るだけのアプリに、トピックやサブスクリプションの作成や削除の権限まで与えることになる。",
      },
      {
        text: "プロジェクトに対する Pub/Sub 管理者（roles/pubsub.admin）",
        note: "IAM ポリシーの変更まで含む強い権限を、プロジェクト全体に与えることになる。",
      },
    ],
    explain:
      "最小権限は、ロールの中身（何ができるか）と付与の範囲（どこでできるか）の両方で考える。Pub/Sub では、トピックやサブスクリプションごとに IAM ポリシーを持てるので、メッセージを送るだけのアプリには、そのトピックに対してだけ Pub/Sub パブリッシャーを付与する。受け取る側には、そのサブスクリプションに対して Pub/Sub サブスクライバーを付与する。プロジェクトで付与すると、今後作られるトピックも含めてすべてが対象になる。",
    points: [
      "送るだけ → トピックに対する Pub/Sub パブリッシャー。受け取るだけ → サブスクリプションに対するサブスクライバー。",
      "最小権限は、ロールの中身と付与の範囲の両方で絞る。",
    ],
  },
  {
    source: at(50, "4.2"),
    field: S4,
    answer: 3,
    text: "CX社の夜間のデータ移行は、サービス アカウント batch-sa の権限を借用して取得したアクセス トークンで、6 時間かかる処理を行っている。使っている市販のツールは、開始時に渡したトークンを使い続ける作りで、途中で取り直すことができない。トークンは既定の 1 時間で切れるため、処理が途中で失敗する。サービス アカウントの鍵は使わない方針である。最も適切な対処はどれか。",
    choices: [
      {
        text: "batch-sa の鍵を作り、ツールに読み込ませる。",
        note: "鍵を使わない方針に反する。長期間有効な鍵は漏えいしたときの危険も大きい。",
      },
      {
        text: "batch-sa にプロジェクトのオーナーのロールを付与する。",
        note: "ロールの強さはトークンの有効期間とは関係が無い。権限が大きすぎるだけになる。",
      },
      {
        text: "トークンを取得するときに、有効期間として 21600 秒（6 時間）を指定するだけでよい。",
        note: "既定では、取得できるアクセス トークンの有効期間は最大 1 時間である。延ばすには組織のポリシーで許可が要る。",
      },
      {
        text: "組織のポリシーの制約 iam.allowServiceAccountCredentialLifetimeExtension で batch-sa を許可し、トークンの取得時に必要な有効期間（最大 12 時間）を指定する。",
        note: "許可したサービス アカウントに限り、アクセス トークンの有効期間を 1 時間より長くできる。これが正解。",
      },
    ],
    explain:
      "サービス アカウントの権限借用で取得する短期間のアクセス トークンは、既定では最長 1 時間で切れる。途中でトークンを取り直せる処理ならそれで十分だが、取り直せないツールで長い処理をするなら、組織のポリシーのリスト型の制約 iam.allowServiceAccountCredentialLifetimeExtension に対象のサービス アカウントを加える。そうすると、そのサービス アカウントについては、トークンを取得するときに最大 12 時間の有効期間を指定できるようになる。有効期間の長いトークンは漏れたときの影響も長く続くので、許可するサービス アカウントは必要なものに限る。",
    points: [
      "権限借用のアクセス トークンは既定で最長 1 時間。",
      "延ばすには iam.allowServiceAccountCredentialLifetimeExtension で対象のサービス アカウントを許可する（最大 12 時間）。",
    ],
  },
];
