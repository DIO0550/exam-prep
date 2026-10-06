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
 * このセットが問う層は「各プロダクトの役割と、gcloud・kubectl・Helm・Terraform の基本操作」。
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
    text: "B社のプラットフォーム チームは、決済チーム用の開発プロジェクトを、組織の下にあるフォルダ payments（フォルダ ID 345678901234）の中に gcloud CLI で作りたい。社内の命名規則では、プロジェクト ID を「部門-環境-連番」の形（例: pay-dev-01）にすると決まっている。作り方と、プロジェクト ID の扱いの説明として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud projects create pay-dev-01 --folder=345678901234 --name=pay-dev を実行する。プロジェクト ID は後から変えられないので、命名規則に沿った値を作成時に決めておく。",
        note: "--folder で親のフォルダを指定でき、フォルダに付けた IAM ロールや組織ポリシーがそのまま効く。プロジェクト ID は全体で一意で、作成後は変更できない。これが正解。",
      },
      {
        text: "ID を仮の値にして gcloud projects create を組織の直下に実行し、後から gcloud projects update でプロジェクト ID を命名規則どおりに付け直す。",
        note: "gcloud projects update で変えられるのは表示用の名前などで、プロジェクト ID は変えられない。組織の直下に作ると、payments フォルダの設定も引き継がれない。",
      },
      {
        text: "gcloud resource-manager folders create --display-name=pay-dev-01 --folder=345678901234 を実行する。",
        note: "payments の下に子フォルダを作るコマンドで、プロジェクトは作られない。",
      },
      {
        text: "gcloud config set project pay-dev-01 を実行し、続けて gcloud services enable compute.googleapis.com を実行する。",
        note: "config set project は手元の既定値を書き換えるだけで、プロジェクトを作りはしない。存在しないプロジェクトでは API も有効にできない。",
      },
    ],
    explain:
      "プロジェクトは gcloud projects create で作り、親を --folder か --organization で指定する。フォルダの下に作れば、フォルダで付与したロールや組織ポリシーが新しいプロジェクトにも継承される。プロジェクトには、作る人が決めて Google Cloud 全体で一意になるプロジェクト ID、自動で振られるプロジェクト番号、表示用のプロジェクト名の 3 つの識別子がある。名前は後から変えられるが、ID は作成後に変更できず、削除したプロジェクトの ID を再び使うこともできない。命名規則は作り始める前に決めておく。",
    points: [
      "親の指定は --folder または --organization。フォルダの下に作れば、その設定が継承される。",
      "プロジェクト ID は全体で一意で、作成後は変えられない。変えられるのはプロジェクト名。",
    ],
    figure: {
      type: "table",
      caption: "プロジェクトを表す 3 つの識別子",
      headers: ["識別子", "決め方", "後からの変更"],
      rows: [
        ["プロジェクト ID", "作成時に利用者が指定する（全体で一意）", "できない"],
        ["プロジェクト番号", "Google が自動で割り当てる", "できない"],
        ["プロジェクト名", "利用者が指定する（一意でなくてよい）", "できる"],
      ],
    },
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
    text: "新しく配属された開発者が、手元の PC で Cloud Storage のクライアント ライブラリを使う Python スクリプトを試している。gcloud auth login でログイン済みで、gcloud storage ls gs://dev-reports は成功する。ところがスクリプトを実行すると、アプリケーションのデフォルト認証情報（ADC）が見つからないという趣旨のエラーで止まる。チームの方針でサービス アカウント キーは使わない。対処として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud auth login をもう一度実行する。",
        note: "gcloud CLI 自身が使う認証情報を取り直すだけで、クライアント ライブラリが探す ADC の置き場所には何も書かれない。",
      },
      {
        text: "gcloud auth application-default login を実行する。",
        note: "ブラウザでログインすると、ライブラリが自動で読み込む ADC 用の認証情報ファイルが手元に作られる。これが正解。",
      },
      {
        text: "サービス アカウント キーを作って JSON を保存し、環境変数 GOOGLE_APPLICATION_CREDENTIALS にそのパスを設定する。",
        note: "ADC としては読み込まれるが、長期間有効なキーを手元に置くことになり、キーを使わない方針に反する。",
      },
      {
        text: "gcloud config set project で、スクリプトが使うプロジェクトを既定にする。",
        note: "既定のプロジェクトを決めるだけで、認証情報が見つからないというエラーは解消しない。",
      },
    ],
    explain:
      "gcloud CLI が使う認証情報（gcloud auth login で取得）と、クライアント ライブラリが使うアプリケーションのデフォルト認証情報（ADC）は別々に管理されている。ADC は、環境変数 GOOGLE_APPLICATION_CREDENTIALS が指すファイル、gcloud auth application-default login で手元に作ったファイル、実行環境に割り当てたサービス アカウント（メタデータ サーバー経由）の順に探される。手元では application-default login を使い、Compute Engine や Cloud Run の上では割り当てたサービス アカウントがそのまま使われるので、どちらでもコードを書き換えずに動かせる。",
    points: [
      "gcloud auth login は CLI 用、gcloud auth application-default login はライブラリ（ADC）用。",
      "Google Cloud 上で動かすときは、割り当てたサービス アカウントが ADC として使われる。",
    ],
  },
  {
    source: at(5, "1.2"),
    field: S1,
    answer: 0,
    text: "D社の財務チームは、請求先アカウントに紐づく全プロジェクトの費用を確認し、部門ごとの予算とアラートを自分たちで作成・変更したい。一方で、支払い方法の変更、プロジェクトのリンクやリンク解除、請求先アカウントへの権限の付与はさせたくない。財務チームのグループに、請求先アカウントで付与するロールとして最も適切なものはどれか。",
    choices: [
      {
        text: "請求先アカウント費用管理者（roles/billing.costsManager）",
        note: "予算の作成・管理と費用情報の閲覧ができ、支払い方法やリンク、権限の管理はできない。これが正解。",
      },
      {
        text: "請求先アカウント管理者（roles/billing.admin）",
        note: "予算も扱えるが、支払い方法の管理、権限の付与、リンクの管理まですべてできてしまう。要件より広い。",
      },
      {
        text: "請求先アカウント ユーザー（roles/billing.user）",
        note: "プロジェクトをこの請求先アカウントにリンクするためのロールで、予算は作れない。させたくない操作のほうを許すことになる。",
      },
      {
        text: "請求先アカウント閲覧者（roles/billing.viewer）",
        note: "費用や取引を見ることはできるが、予算を作ったり変えたりはできない。",
      },
    ],
    explain:
      "請求先アカウントのロールは、扱える操作の範囲で分かれている。管理者はすべて、ユーザーはプロジェクトのリンク、閲覧者は費用と取引の閲覧、費用管理者は予算の管理と費用情報の閲覧・エクスポートが中心である。財務部門のように「費用は見て予算も組みたいが、支払いや構成には触れさせない」立場には費用管理者が合う。これらのロールはプロジェクトではなく、請求先アカウントに対して付与する。",
    points: [
      "予算の作成と費用の閲覧だけを任せるなら、請求先アカウント費用管理者。",
      "リンクはユーザー、すべての管理は管理者、見るだけなら閲覧者。",
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
    text: "G社のデータ分析プロジェクト ana-prod は、月の予算が 50 万円である。これまでは実際の費用に対して 50%・90%・100% のしきい値で予算アラートを出していた。ところが先月は月の後半に費用が急に伸び、100% の通知が届いたのは月末の 2 日前で、手を打つ時間が無かった。月の途中でも「このままでは月末に予算を超える」と見込まれた時点で知らせてほしい。予算の設定として最も適切なものはどれか。",
    choices: [
      {
        text: "実際の費用に対するしきい値を、10%・20%・30% のように細かく増やす。",
        note: "通知の回数は増えるが、どれも「ここまで使った」という実績の知らせで、月末に超えそうかどうかは分からない。",
      },
      {
        text: "予算の期間を、月単位から四半期単位に変える。",
        note: "集計の区切りが長くなるだけで、早く気付くことにはつながらない。月ごとに管理するという目的からも外れる。",
      },
      {
        text: "Cloud Monitoring で、ana-prod の VM の CPU 使用率にアラートを設定する。",
        note: "使用率は費用そのものではなく、BigQuery など VM 以外の費用の伸びも捉えられない。",
      },
      {
        text: "予算の対象を ana-prod に絞ったうえで、基準を予測額（forecasted）にしたしきい値（例: 予測額の 100%）を追加する。",
        note: "月末の予測額がしきい値を超えると見込まれた時点で通知されるので、月の途中で手を打てる。これが正解。",
      },
    ],
    explain:
      "Cloud Billing の予算では、しきい値ごとに「実際の費用」と「予測額」のどちらを基準にするかを選べる。実際の費用を基準にすると使った額が達したときに、予測額を基準にするとそれまでの使い方から見積もった月末の額が超えそうになったときに通知が届く。予算の対象はプロジェクト、サービス、ラベルなどで絞れるので、見張りたい範囲だけを対象にする。gcloud billing budgets create では、--threshold-rule に basis=forecasted-spend を付けて予測額の基準を指定する。",
    points: [
      "予測額を基準にしたしきい値なら、月末に超える見込みの段階で通知される。",
      "予算の対象は、プロジェクト・サービス・ラベルなどで絞り込める。",
    ],
  },
  {
    source: at(10, "1.2"),
    field: S1,
    answer: 1,
    text: "H社では、1 つのプロジェクト shared-apps の中に、受注チームと在庫チームの VM が混在している。財務部は来月から、Compute Engine の費用をチーム別に分けて、請求レポートや BigQuery にエクスポートした課金データで確認したい。運用担当者が行う作業として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud compute instances add-tags web-1 --zone=asia-northeast1-b --tags=team-order のように、各 VM にネットワーク タグを付ける。",
        note: "ネットワーク タグはファイアウォール ルールやルートの適用先を選ぶための目印で、費用の内訳には使われない。",
      },
      {
        text: "gcloud compute instances add-labels web-1 --zone=asia-northeast1-b --labels=team=order のように、各 VM にチームを表すラベルを付ける。",
        note: "ラベルは課金データにキーと値として記録され、レポートやエクスポートでチーム別に集計できる。これが正解。",
      },
      {
        text: "チームごとに請求先アカウントを作り、各 VM をそれぞれの請求先アカウントにリンクする。",
        note: "請求先アカウントにリンクできるのはプロジェクトで、VM 単位では紐づけられない。",
      },
      {
        text: "Cloud Monitoring で VM ごとの CPU 使用率を集計し、その比率で費用を按分する。",
        note: "使用率から推し量るだけで実際の金額にはならず、ディスクやネットワークの費用も分けられない。",
      },
    ],
    explain:
      "ラベルはリソースに付けるキーと値の組（例: team=order、env=prod）で、Cloud Billing の請求レポートでの絞り込みや、BigQuery にエクスポートした課金データの集計に使える。ラベルが費用に反映されるのは付けた後の使用分からで、それより前の費用にさかのぼって付くことはないので、早めに付けておく。gcloud では作成時の --labels のほか、add-labels / remove-labels で後から付け外しできる。ファイアウォールの適用先を選ぶネットワーク タグや、IAM・組織ポリシーの条件に使うリソース マネージャのタグとは目的が違う。",
    points: [
      "費用をチームや環境で分けたいなら、リソースにラベルを付ける。",
      "ラベルは付けた後の費用にだけ反映される。",
    ],
    figure: {
      type: "table",
      caption: "名前の似た 3 つの目印",
      headers: ["仕組み", "形", "主な用途"],
      rows: [
        ["ラベル", "キーと値（team=order など）", "費用の集計、リソースの整理と検索"],
        ["ネットワーク タグ", "文字列（web など）", "ファイアウォール ルールやルートの適用先"],
        [
          "タグ（リソース マネージャ）",
          "組織などで定義したキーと値",
          "IAM や組織ポリシーの条件、Cloud NGFW のセキュア タグ",
        ],
      ],
    },
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
    text: "I社の Web チームは、検証用の VM を必要なときに作っては消している。VM を作るたびに nginx のインストールと設定ファイルの配置を手作業で行っていたが、これを自動にしたい。手順は手元のシェル スクリプト setup.sh にまとめてあり、カスタム イメージを作って保守するほどの規模ではない。VM を作るときの指定として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud compute instances create web-test --zone=asia-northeast1-b --metadata-from-file=shutdown-script=setup.sh",
        note: "shutdown-script は VM が停止・削除されるときに走るスクリプトで、起動時の準備には使えない。",
      },
      {
        text: "gcloud compute instances create web-test --zone=asia-northeast1-b --metadata=enable-guest-attributes=TRUE",
        note: "ゲスト属性は VM の中から値を書き込み、外から読み取るための仕組みで、スクリプトを実行させる機能ではない。",
      },
      {
        text: "VM を作った後に gcloud compute ssh で接続し、setup.sh を実行する手順書を整える。",
        note: "手作業が残り、自動にしたいという要件を満たさない。",
      },
      {
        text: "gcloud compute instances create web-test --zone=asia-northeast1-b --metadata-from-file=startup-script=setup.sh",
        note: "スクリプトがメタデータの startup-script に登録され、VM の起動時に自動で実行される。これが正解。",
      },
    ],
    explain:
      "起動スクリプトは、インスタンスのメタデータ（Linux なら startup-script）に入れておくと、VM が起動するたびにゲスト環境が実行してくれるスクリプトである。手元のファイルなら --metadata-from-file、Cloud Storage に置いたファイルならメタデータの startup-script-url で指定する。インスタンス テンプレートに入れておけば、MIG で増えた VM にも同じ準備が行われる。起動のたびに走るので、何度実行しても同じ結果になるように書いておく。準備に時間がかかって起動が遅くなる場合は、必要なものを入れたカスタム イメージを使う方法と比べて選ぶ。",
    points: [
      "起動時の準備は startup-script、停止時の後片付けは shutdown-script。",
      "起動スクリプトは起動のたびに実行されるので、繰り返しても問題ない作りにする。",
    ],
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
    text: "データ基盤チームは、asia-northeast1 のサブネット app-subnet（10.20.0.0/24）に、自前で運用するデータベース用の VM db-1 を置く。アプリの設定ファイルやオンプレミス側のファイアウォールに DB の IP アドレスを直接書いているため、db-1 を削除して作り直しても 10.20.0.10 を使い続けたい。作り直しの間に、そのアドレスが他の VM に割り当てられてもならない。手順として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud compute addresses create db-ip --region=asia-northeast1 でアドレスを予約し、db-1 の作成時に --address=db-ip を指定する。",
        note: "--subnet を付けずに予約すると外部 IP アドレスになる。内部 IP アドレスの固定にはならない。",
      },
      {
        text: "gcloud compute addresses create db-ip --region=asia-northeast1 --subnet=app-subnet --addresses=10.20.0.10 で静的内部 IP アドレスを予約し、db-1 の作成時に --private-network-ip=10.20.0.10 を指定する。",
        note: "予約した内部 IP アドレスは VM を削除しても手放されず、他の VM に割り当てられない。これが正解。",
      },
      {
        text: "予約はせず、db-1 の作成時に --private-network-ip=10.20.0.10 だけを指定する。",
        note: "VM がある間はそのアドレスを使えるが、VM を削除するとアドレスは解放され、作り直すまでに他の VM に割り当てられることがある。",
      },
      {
        text: "Cloud DNS の限定公開ゾーンに db.internal のレコードを作り、アプリからは名前で接続させる。",
        note: "名前で接続するのはよい習慣だが、オンプレミスのファイアウォールのように IP アドレスそのものを書いている箇所は解決しない。",
      },
    ],
    explain:
      "VM の内部 IP アドレスは停止・起動では変わらないが、VM を削除すると解放される。作り直しても同じアドレスを使いたいときは、静的内部 IP アドレスとして予約しておく。gcloud compute addresses create に --subnet（具体的な値を決めたいなら --addresses も）を付けると内部アドレスの予約になり、付けなければ外部アドレスの予約になる。予約したアドレスは、VM を作るときに --private-network-ip で指定する。予約済みのアドレスは、使っていない間も他のリソースには割り当てられない。",
    points: [
      "内部 IP は停止・起動では変わらないが、VM の削除で解放される。",
      "addresses create に --subnet を付けると内部、付けないと外部のアドレスを予約する。",
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
    text: "P社のアプリ チームは、GKE 上の Web アプリを Helm チャート（./chart）で管理している。ステージングと本番ではレプリカ数やリソースの要求量が違うため、環境ごとの値を values-staging.yaml と values-prod.yaml に分けている。CI からは、本番クラスタにリリース web がまだ無ければインストールし、あれば新しい版に更新する処理を 1 つのコマンドで行いたい。更新後に問題が出たときは、チャートが作ったリソース一式を前の状態へまとめて戻したい。方法として最も適切なものはどれか。",
    choices: [
      {
        text: "helm upgrade --install web ./chart -f values-prod.yaml --namespace=web で入れるか更新し、問題が出たら helm history web でリビジョンを確かめて、helm rollback web 4 のように前のリビジョンへ戻す。",
        note: "--install 付きの upgrade は、リリースが無ければ作成し、あれば更新する。Helm はリリースのリビジョンを記録しているので、rollback でリソース一式を前の状態に戻せる。これが正解。",
      },
      {
        text: "helm template web ./chart -f values-prod.yaml で書き出したマニフェストを kubectl apply -f で適用し、戻すときは前回書き出したファイルを探して適用し直す。",
        note: "適用はできるが、Helm のリリースとして記録されないので履歴を使った切り戻しができない。前回のファイルの保管や、新しい版で増えたリソースの後片付けも自分で行うことになる。",
      },
      {
        text: "helm install web ./chart -f values-prod.yaml を毎回実行し、戻すときは kubectl rollout undo deployment/web を実行する。",
        note: "同じ名前のリリースがあると helm install は失敗する。rollout undo は 1 つの Deployment を戻すだけで、ConfigMap などチャートの他のリソースは戻らず、Helm の記録とも食い違う。",
      },
      {
        text: "Config Connector にチャートと values-prod.yaml を登録し、クラスタへ同期させる。",
        note: "Config Connector は Cloud SQL や Pub/Sub などの Google Cloud リソースを Kubernetes のリソースとして管理する仕組みで、Helm チャートを展開するものではない。",
      },
    ],
    explain:
      "Helm は、Kubernetes のマニフェストをテンプレートと値（values）に分け、チャートとしてまとめて配布・管理するツールである。環境ごとの違いは -f で渡す値ファイルに寄せ、チャート本体は共通にする。-f を複数渡すと後ろのファイルが優先され、--set の指定はさらに優先される。helm upgrade --install はリリースの有無にかかわらず同じコマンドで使えるので、CI に向く。Helm はリリースのたびにリビジョンを記録しており、helm history で一覧を確かめ、helm rollback で指定したリビジョンの内容に戻せる。",
    points: [
      "インストールと更新を 1 つのコマンドで行うなら helm upgrade --install。環境の差は -f の値ファイルで渡す。",
      "切り戻しは helm history で確かめてから helm rollback。チャートのリソース一式が前のリビジョンに戻る。",
    ],
    figure: {
      type: "table",
      caption: "Helm の主なコマンド",
      headers: ["コマンド", "役割"],
      rows: [
        ["helm upgrade --install", "リリースが無ければインストールし、あれば更新する"],
        ["helm history", "リリースのリビジョンの一覧を表示する"],
        ["helm rollback", "指定したリビジョンの内容に戻す"],
        ["helm template", "値を当てたマニフェストを書き出すだけで、クラスタには適用しない"],
      ],
    },
  },

  // ───────── セクション3 運用（問26〜問40） ─────────
  {
    source: at(26, "3.1"),
    field: S3,
    answer: [1, 3],
    text: "Q社の社内向け帳票サーバー app-1（asia-northeast1-b、e2-standard-2）は、月末の処理で CPU とメモリが足りなくなっている。夜間なら 10 分程度止めてよいことになったので、ディスクや設定はそのままに、マシンタイプを e2-standard-8 に変えたい。必要な操作として適切なものはどれか。2つ選べ。",
    choices: [
      {
        text: "VM を動かしたまま、コンソールの VM の編集画面でマシンタイプを e2-standard-8 に変えて保存する。",
        note: "マシンタイプは VM を停止している間にしか変えられない。動いたままでは変更できない。",
      },
      {
        text: "gcloud compute instances stop app-1 --zone=asia-northeast1-b で VM を停止する。",
        note: "マシンタイプを変える前に、まず VM を停止しておく必要がある。これが正解。",
      },
      {
        text: "gcloud compute disks resize app-1 --zone=asia-northeast1-b --size=200GB でブートディスクを広げる。",
        note: "ディスクの容量が増えるだけで、vCPU やメモリは変わらない。",
      },
      {
        text: "gcloud compute instances set-machine-type app-1 --zone=asia-northeast1-b --machine-type=e2-standard-8 を実行し、その後 VM を起動する。",
        note: "停止した VM のマシンタイプを変える。ディスクのデータや内部 IP アドレスはそのまま引き継がれる。これが正解。",
      },
    ],
    explain:
      "既存の VM のマシンタイプは、VM を停止してから gcloud compute instances set-machine-type（コンソールなら編集画面）で変え、起動し直して反映させる。ディスクの中身、メタデータ、内部 IP アドレスは引き継がれる。どのサイズが合うかは、使用状況をもとに出される Compute Engine のマシンタイプの推奨も参考になる。なお、MIG で管理している VM は個別に変えず、新しいインスタンス テンプレートに差し替えて入れ替える。",
    points: [
      "マシンタイプの変更は「停止 → set-machine-type → 起動」の順。",
      "ディスク容量の変更（disks resize）と、vCPU・メモリの変更は別の操作。",
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
        note: "水平 Pod 自動スケーリング（HPA）を作り、CPU 使用率 60% を目標に Pod 数を 2〜10 で調整させる。新しい kubectl では同じ指定を --cpu=60% とも書ける。これが正解。",
      },
    ],
    explain:
      "GKE の自動スケーリングには 3 つの層がある。HPA は Pod の数、VPA は Pod 1 つあたりのリクエスト値、クラスタ オートスケーラはノードの数を調整する。CPU 使用率で HPA を動かす場合、使用率は Pod のリクエストに対する割合で計算されるため、リクエストを設定しておく必要がある。HPA で Pod が増えてノードに載り切らなくなったときに、クラスタ オートスケーラがノードを足す、という組み合わせがよく使われる。なお、新しい kubectl（1.34 以降）では目標を --cpu=60% の形で指定するフラグが加わり、--cpu-percent は非推奨になった（当面は引き続き使える）。",
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
    text: "物流会社の BB社の基幹システムは、Cloud SQL for MySQL のインスタンス erp-db で動いている。監査法人に、データベース orders の月末時点の内容を、SQL のダンプ ファイルとして Cloud Storage のバケット gs://erp-audit-dumps に置いて渡すことになった。インスタンス全体ではなく orders だけを出力したい。方法として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud sql backups create --instance=erp-db でオンデマンド バックアップを取る。",
        note: "バックアップは Cloud SQL の中で管理される復元用のもので、ファイルとして取り出して渡すことはできない。対象もインスタンス全体になる。",
      },
      {
        text: "gcloud sql instances clone erp-db erp-audit で複製のインスタンスを作り、監査法人に接続させる。",
        note: "インスタンス全体の複製で、ファイルを渡すという要件に合わない。動かしている間の費用もかかり、orders 以外のデータベースも見えてしまう。",
      },
      {
        text: "gcloud sql export sql erp-db gs://erp-audit-dumps/orders-202609.sql.gz --database=orders を実行する。インスタンスのサービス アカウントには、このバケットへの書き込み権限を付けておく。",
        note: "指定したデータベースだけを SQL ダンプとして Cloud Storage に書き出せる。書き込むのはインスタンスのサービス アカウントなので、バケットの権限が要る。これが正解。",
      },
      {
        text: "gcloud storage cp で、erp-db のデータ ディスクから直接バケットへファイルをコピーする。",
        note: "Cloud SQL のディスクは利用者から直接触れられないので、ファイルとしてコピーすることはできない。",
      },
    ],
    explain:
      "Cloud SQL のデータをファイルとして外へ出すときは、エクスポートを使う。gcloud sql export sql は SQL のダンプを、gcloud sql export csv はクエリの結果を CSV で Cloud Storage に書き出し、--database で対象のデータベースを絞れる。ファイル名を .gz で終えると圧縮して書き出される。書き込みは Cloud SQL インスタンスのサービス アカウント（gcloud sql instances describe の serviceAccountEmailAddress で確認できる）が行うので、バケットへの書き込みロールをそのアカウントに付けておく。取り込むときは gcloud sql import sql を使う。自動・オンデマンドのバックアップは Cloud SQL への復元のためのもので、ファイルとして渡す用途には使えない。",
    points: [
      "Cloud SQL からファイルとして取り出すのは export（SQL ダンプまたは CSV）。",
      "書き込むのはインスタンスのサービス アカウント。バケットの権限を付けておく。",
    ],
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
    source: at(36, "3.4"),
    field: S3,
    answer: 3,
    text: "CC社の社内規程で、業務アプリが Cloud Logging に書き出すログを 1 年間、ログ エクスプローラから検索できる状態で残すことになった。ログは既定の構成のまま _Default ログバケットに入っている。新しい仕組みはなるべく増やしたくない。行う操作として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud logging buckets update _Required --location=global --retention-days=365 を実行する。",
        note: "_Required バケットは管理アクティビティ監査ログなどのための専用のバケットで、保持期間（400 日）は変えられない。アプリのログもここには入らない。",
      },
      {
        text: "ログ ルーターに Cloud Storage を宛先とするシンクを作り、アプリのログを 1 年間バケットに残す。",
        note: "保管はできるが、Cloud Storage に出したログはログ エクスプローラで検索できない。シンクとバケットの管理も増える。",
      },
      {
        text: "gcloud logging sinks update _Default --retention-days=365 を実行する。",
        note: "シンクはログの送り先を決めるもので、保持期間を持たない。保持期間はログバケットの設定である。",
      },
      {
        text: "gcloud logging buckets update _Default --location=global --retention-days=365 を実行する。",
        note: "_Default バケットの保持期間を延ばせば、いまの置き場所のまま 1 年間検索できる。これが正解。",
      },
    ],
    explain:
      "Cloud Logging のログは、ログ ルーターのシンクを通ってログバケットに保存される。プロジェクトには最初から _Required と _Default の 2 つのバケットがあり、_Required は管理アクティビティ監査ログなどを 400 日保持し、その期間は変えられない。それ以外の多くのログが入る _Default の保持期間は既定で 30 日で、gcloud logging buckets update の --retention-days で延ばせる（30 日を超えて保持する分には保管の料金がかかる）。Cloud Storage や BigQuery へのシンクは長期の保管や分析に向くが、ログ エクスプローラでの検索の対象からは外れる。",
    points: [
      "保持期間はシンクではなくログバケットの設定。_Default は既定 30 日で、延ばせる。",
      "_Required バケットは 400 日固定で、変更できない。",
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
    text: "U社の決済 API は Cloud Run で動いている。外部の決済代行との通信がタイムアウトすると、アプリは PAYMENT_TIMEOUT という文字列を含むエラーログを出す。この文字列を含むログが 5 分間に 10 件を超えたら、運用チームに通知したい。構成として最も適切なものはどれか。",
    choices: [
      {
        text: "Cloud Run のサービスに Ops エージェントをインストールし、ログを集めさせる。",
        note: "Cloud Run のログは何も入れなくても Cloud Logging に届く。Ops エージェントは Compute Engine の VM に入れるもので、件数による通知も行わない。",
      },
      {
        text: "稼働時間チェックで決済 API の URL を 1 分ごとに呼び出し、失敗したら通知する。",
        note: "外から応答の有無を確かめる仕組みで、アプリの中で起きた決済代行とのタイムアウトの件数は分からない。",
      },
      {
        text: "ログ ルーターのシンクでエラーログを BigQuery に送り、毎朝クエリで件数を確認する。",
        note: "後から集計はできるが、5 分ごとの件数ですぐに通知する要件を満たさない。",
      },
      {
        text: 'gcloud logging metrics create で、フィルタ（例: textPayload:"PAYMENT_TIMEOUT"）に一致するログを数えるログベースの指標を作り、その値が 5 分間で 10 を超えたら通知するアラート ポリシーを設定する。',
        note: "ログの件数を Cloud Monitoring の指標として扱えるので、しきい値でアラートを出せる。これが正解。",
      },
    ],
    explain:
      "ログベースの指標は、フィルタに一致するログの件数（カウンタ）や、ログに含まれる数値の分布を、Cloud Monitoring の指標にする仕組みである。gcloud logging metrics create に指標の名前と --log-filter を渡して作ると、logging.googleapis.com/user/指標名 という指標になり、アラート ポリシーの条件やダッシュボードで使える。数え始めるのは指標を作った後に届いたログからで、過去のログはさかのぼって数えない。",
    points: [
      "特定のログの出現数でアラートを出すなら、ログベースの指標 ＋ アラート ポリシー。",
      "ログベースの指標は、作成した後のログから数える。",
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
    source: at(45, "4.1"),
    field: S4,
    answer: 3,
    text: "DD社のプロジェクト dd-prod の管理者は、委託先のメンバーに Cloud Storage のオブジェクトの読み取りだけを許したいと考え、Storage オブジェクト閲覧者（roles/storage.objectViewer）を候補にしている。付与する前に、このロールにどの権限（storage.objects.get や storage.objects.list など）が入っているかを gcloud CLI で確かめたい。使うコマンドとして最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud projects get-iam-policy dd-prod",
        note: "プロジェクトで誰にどのロールが付いているかを表示するもので、ロールに含まれる権限は表示されない。",
      },
      {
        text: "gcloud iam list-grantable-roles //cloudresourcemanager.googleapis.com/projects/dd-prod",
        note: "そのリソースで付与できるロールの一覧を表示するもので、個々のロールの中身の権限までは分からない。",
      },
      {
        text: "gcloud iam roles list --project=dd-prod",
        note: "このプロジェクトで定義したカスタムロールの一覧で、事前定義ロールの中身は表示されない。",
      },
      {
        text: "gcloud iam roles describe roles/storage.objectViewer",
        note: "ロールの説明と、含まれる権限の一覧（includedPermissions）が表示される。これが正解。",
      },
    ],
    explain:
      "ロールは権限の集まりで、事前定義ロールの中身は Google が更新することもある。付与の前に gcloud iam roles describe で includedPermissions を確かめれば、必要な権限が入っているか、余計な権限が入っていないかを判断できる。カスタムロールなら --project や --organization を付けて同じように確認する。逆に、ある権限を含むロールを探したいときは、コンソールの「ロール」のページで権限名から絞り込める。",
    points: [
      "ロールに含まれる権限は gcloud iam roles describe で確かめる。",
      "get-iam-policy は「誰に何が付いているか」、roles describe は「ロールに何が入っているか」。",
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
    text: "EE社では、Cloud Run のサービス frontend（サービス アカウント frontend-sa@shop-prod.iam.gserviceaccount.com で実行）から、内部向けの Cloud Run サービス backend（asia-northeast1）を呼び出す。backend は認証を必須にしており、インターネットの利用者には呼び出させたくない。frontend からの呼び出しを許可する設定として最も適切なものはどれか。",
    choices: [
      {
        text: "プロジェクト全体で、frontend-sa に Cloud Run 起動元（roles/run.invoker）を付与する。",
        note: "呼び出せるようにはなるが、プロジェクト内のすべての Cloud Run サービスを呼び出せてしまう。backend だけに絞るほうが最小権限に沿う。",
      },
      {
        text: "gcloud run services add-iam-policy-binding backend --region=asia-northeast1 --member=serviceAccount:frontend-sa@shop-prod.iam.gserviceaccount.com --role=roles/run.invoker を実行し、frontend は ID トークンを付けて呼び出す。",
        note: "backend のサービスに対してだけ起動元のロールを付けるので、呼び出せる相手を絞れる。これが正解。",
      },
      {
        text: "backend を --allow-unauthenticated で更新する。",
        note: "誰でも呼び出せる公開サービスになり、要件に反する。",
      },
      {
        text: "backend に対して、frontend-sa に Cloud Run 閲覧者（roles/run.viewer）を付与する。",
        note: "サービスの設定を見るためのロールで、呼び出しの権限（run.routes.invoke）は含まない。",
      },
    ],
    explain:
      "認証を必須にした Cloud Run サービスを呼び出すには、呼び出す側のプリンシパルが、そのサービスに対する Cloud Run 起動元のロールを持っている必要がある。サービス間の呼び出しでは、呼び出す側の実行用サービス アカウントにこのロールを付け、呼び出す側はメタデータ サーバーから、呼び出し先の URL を audience にした ID トークンを取得して Authorization ヘッダーに付ける。gcloud run services add-iam-policy-binding で個々のサービスに付ければ、呼び出せる先を必要なサービスだけに限れる。",
    points: [
      "サービス間の呼び出しは、呼び出し先のサービスで、呼び出し元の SA に roles/run.invoker を付ける。",
      "呼び出す側は、呼び出し先の URL を audience にした ID トークンを付ける。",
    ],
  },
  {
    source: at(48, "4.2"),
    field: S4,
    answer: 2,
    text: "Z社の注文 API は Cloud Run で、専用のサービス アカウント order-sa で動いている。データベースのパスワードは、いまはデプロイ時に --set-env-vars で平文のまま環境変数に入れており、サービスの設定を見られる人なら誰でも値を読めてしまう。パスワードを Secret Manager で管理し、アプリにはこれまでどおり環境変数 DB_PASS として渡したい。手順として最も適切なものはどれか。",
    choices: [
      {
        text: "パスワードを Dockerfile の ENV に書いてイメージに含め、--set-env-vars をやめる。",
        note: "イメージを取得できる人なら誰でも値を読める。ソースのリポジトリにも残り、かえって広く漏れる。",
      },
      {
        text: "gcloud secrets create db-pass --data-file=pass.txt でシークレットを作り、デプロイする開発者にだけ Secret Manager のシークレット アクセサー（roles/secretmanager.secretAccessor）を付与して、--set-secrets=DB_PASS=db-pass:latest でデプロイする。",
        note: "シークレットを読み出すのはサービスの実行用サービス アカウントの order-sa である。開発者に付けても、order-sa に権限が無ければサービスは値を読めない。",
      },
      {
        text: "gcloud secrets create db-pass --data-file=pass.txt でシークレットを作り、order-sa に db-pass のシークレット アクセサー（roles/secretmanager.secretAccessor）を付与して、gcloud run deploy に --set-secrets=DB_PASS=db-pass:latest を付けてデプロイする。",
        note: "値は Secret Manager に置いたまま、実行用のサービス アカウントだけが読み出せる。Cloud Run がその値を環境変数として渡す。これが正解。",
      },
      {
        text: "パスワードを書いたファイルを Cloud Storage のバケットに置き、allAuthenticatedUsers に読み取りを許可する。",
        note: "Google アカウントを持つ人なら誰でも読めることになり、平文の環境変数よりも危険。",
      },
    ],
    explain:
      "Secret Manager は、パスワードや API キーなどの機密の値をバージョン付きで保管し、IAM で読み出しを制御するサービスである。gcloud secrets create で作り（--data-file で最初の値を入れられる）、値を読む主体にシークレット アクセサーのロールを付ける。Cloud Run では --set-secrets でシークレットを環境変数またはファイルとして渡せ、読み出しはサービスの実行用サービス アカウントの権限で行われる。環境変数で渡す latest はインスタンスの起動時点の最新バージョンを指すので、値の切り替えを確実に管理したいときはバージョン番号で固定する。",
    points: [
      "シークレットは Secret Manager に置き、読む主体（実行用 SA）にシークレット アクセサーを付ける。",
      "Cloud Run には --set-secrets で、環境変数またはファイルとして渡す。",
    ],
  },
  {
    source: at(49, "4.2"),
    field: S4,
    answer: 0,
    text: "FF社の棚卸しで、作成者の分からないサービス アカウント legacy-batch@ops-prod.iam.gserviceaccount.com が見つかった。ここ数か月は使われていないように見えるが、月に一度だけ動く処理などで使われている可能性も捨てきれない。誤って本番の処理を止めてしまったときに、すぐ元に戻せる形で使用を止めたい。最初の対応として最も適切なものはどれか。",
    choices: [
      {
        text: "gcloud iam service-accounts disable legacy-batch@ops-prod.iam.gserviceaccount.com で無効にし、問題が出たら gcloud iam service-accounts enable で戻す。",
        note: "無効にするとこのアカウントでは認証できなくなるが、アカウントもロールの付与も残るので、enable ですぐ元に戻せる。これが正解。",
      },
      {
        text: "gcloud iam service-accounts delete legacy-batch@ops-prod.iam.gserviceaccount.com で削除する。",
        note: "影響が大きい。同じ名前で作り直しても別のアカウントとして扱われ、元のロールの付与はそのままでは効かない。",
      },
      {
        text: "このアカウントのユーザー管理のキーを、すべて削除する。",
        note: "VM などに割り当てて使われている場合はキーを使わないので、使用は止まらない。消したキーも元に戻せない。",
      },
      {
        text: "このアカウントに付いているロールを、すべてのプロジェクトから外す。",
        note: "止める効果はあるが、どこに何が付いていたかを記録して付け直す手間がかかり、すぐには戻しにくい。付与先の見落としも起きやすい。",
      },
    ],
    explain:
      "使われていないかもしれないサービス アカウントは、いきなり削除せず、まず無効にして様子を見るのが安全である。無効にしたアカウントは認証に使えなくなるので、依存している処理があればエラーで気付けるが、アカウントもロールの付与も残っているため、enable で元どおりに戻せる。しばらく問題が出ないことを確かめてから削除する。削除したアカウントと同じ名前で作り直しても、内部の ID が違う別のアカウントになる点にも注意する。",
    points: [
      "使われていないかもしれない SA は、まず disable。戻すときは enable。",
      "削除した SA は、同じ名前で作り直しても別のアカウントになる。",
    ],
  },
  {
    source: at(50, "4.1"),
    field: S4,
    answer: 3,
    text: "AA社は、顧客の契約書を Cloud Storage のバケット gs://aa-contracts に保管している。以前、別のバケットで担当者が誤って allUsers に閲覧のロールを付け、インターネットに公開してしまう事故があった。このバケットについては、今後だれが IAM や ACL を変更しても、インターネットから読める状態にならないようにしたい。設定として最も適切なものはどれか。",
    choices: [
      {
        text: "いまの IAM ポリシーに allUsers と allAuthenticatedUsers の付与が無いことを確かめ、手順書に「公開しないこと」と書き足す。",
        note: "現状の確認にはなるが、今後の誤操作を仕組みで防ぐことはできない。",
      },
      {
        text: "バケットで均一なバケットレベルのアクセスを有効にする。",
        note: "ACL を使えなくして IAM に一本化する設定で、IAM で allUsers にロールを付ければ公開できてしまう。",
      },
      {
        text: "顧客管理の暗号鍵（CMEK）でバケットを暗号化する。",
        note: "保存時の暗号化の鍵を自社で管理する仕組みで、権限のある相手には復号して返される。公開の設定を防ぐものではない。",
      },
      {
        text: "gcloud storage buckets update gs://aa-contracts --public-access-prevention を実行し、公開アクセスの防止を強制する。",
        note: "allUsers や allAuthenticatedUsers を通じた公開ができなくなり、インターネットから読めない状態が保たれる。これが正解。",
      },
    ],
    explain:
      "公開アクセスの防止（public access prevention）は、IAM や ACL の設定にかかわらず、バケットのデータが allUsers や allAuthenticatedUsers を通じて公開されるのを止める設定である。バケットごとに gcloud storage buckets update の --public-access-prevention で強制でき、組織やフォルダ全体にかけたいときは組織ポリシーの制約 storage.publicAccessPrevention を使う。均一なバケットレベルのアクセスは ACL を無効にして IAM に一本化する設定で、公開そのものを禁止するものではない。両方を組み合わせて使うことが多い。",
    points: [
      "公開を仕組みで防ぐのは公開アクセスの防止。組織全体なら制約 storage.publicAccessPrevention。",
      "均一なバケットレベルのアクセスは ACL を無くすだけで、公開は禁止しない。",
    ],
  },
];
