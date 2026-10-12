import type { Lab } from "../types";

export const APPLICATIONS_LABS: Lab[] = [
  {
    id: "cloud-run",
    category: "applications",
    title: "Cloud Runのデプロイと段階リリース",
    summary: "コンテナ公開、新リビジョン、トラフィック配分、ロールバックを練習します。",
    steps: [
      {
        id: "cloud-run-1",
        title: "初回デプロイ",
        task: "hello-api をasia-northeast1へデプロイ。イメージ asia-northeast1-docker.pkg.dev/ace-lab/apps/hello:v1、認証不要、revision suffix=v1 を指定してください。",
        answer:
          "gcloud run deploy hello-api --image=asia-northeast1-docker.pkg.dev/ace-lab/apps/hello:v1 --allow-unauthenticated --revision-suffix=v1 --region=asia-northeast1 --project=ace-lab",
        result: "hello-api-v1: 100% traffic",
        explain: "実行用サービスアカウントと呼び出しの認証は別の設定です。",
        kind: "command",
        hint: "実行用サービスアカウントと呼び出しの認証は別の設定です。",
      },
      {
        id: "cloud-run-2",
        title: "トラフィックなしで更新",
        task: "hello-api を末尾:v2のイメージ、revision suffix=v2、トラフィックなしでデプロイしてください。",
        answer:
          "gcloud run deploy hello-api --image=asia-northeast1-docker.pkg.dev/ace-lab/apps/hello:v2 --no-traffic --revision-suffix=v2 --region=asia-northeast1 --project=ace-lab",
        result: "hello-api-v2: 0% traffic",
        explain: "新リビジョン作成と利用者のトラフィック移行を分けます。",
        kind: "command",
        hint: "新リビジョン作成と利用者のトラフィック移行を分けます。",
      },
      {
        id: "cloud-run-3",
        title: "10%を切り替え",
        task: "hello-api-v2に10%、hello-api-v1に90%の順で配分してください。",
        answer:
          "gcloud run services update-traffic hello-api --to-revisions=hello-api-v2=10,hello-api-v1=90 --region=asia-northeast1 --project=ace-lab",
        result: "v2: 10% / v1: 90%",
        explain: "少量で確認し、エラー率を見ながら割合を増やします。",
        kind: "command",
        hint: "少量で確認し、エラー率を見ながら割合を増やします。",
      },
      {
        id: "cloud-run-4",
        title: "切り戻す",
        task: "hello-api-v1 に100%戻してください。",
        answer:
          "gcloud run services update-traffic hello-api --to-revisions=hello-api-v1=100 --region=asia-northeast1 --project=ace-lab",
        result: "hello-api-v1: 100%",
        explain: "正常なリビジョンへ戻してから原因を調べます。",
        kind: "command",
        hint: "正常なリビジョンへ戻してから原因を調べます。",
      },
      {
        id: "cloud-run-5",
        title: "サービス削除",
        task: "hello-api を削除してください。",
        answer: "gcloud run services delete hello-api --region=asia-northeast1 --project=ace-lab",
        result: "hello-api: deleted",
        explain: "イメージなど別リソースも必要に応じて片付けます。",
        kind: "command",
        hint: "イメージなど別リソースも必要に応じて片付けます。",
      },
    ],
    references: [
      {
        title: "デプロイ",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy",
      },
      {
        title: "トラフィック配分",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update-traffic",
      },
    ],
    setup: [
      "project=ace-lab、region=asia-northeast1。hello:v1 / hello:v2 のサンプルイメージは準備済み。",
      "リビジョン名・結果は学習用固定値で、クラウドへは実行しません。",
    ],
  },
  {
    id: "gke",
    category: "applications",
    title: "GKEのデプロイと障害確認",
    summary: "AutopilotからDeployment・Service・ロールアウトまで練習します。",
    steps: [
      {
        id: "gke-1",
        title: "Autopilotクラスタ作成",
        task: "training-gke をasia-northeast1、ace-labで作成してください。",
        answer:
          "gcloud container clusters create-auto training-gke --region=asia-northeast1 --project=ace-lab",
        result: "training-gke: Autopilot",
        explain: "ノード運用はGoogleが管理します。",
        kind: "command",
        hint: "ノード運用はGoogleが管理します。",
      },
      {
        id: "gke-2",
        title: "接続設定を取得",
        task: "training-gke の認証情報を location=asia-northeast1 で取得してください。",
        answer:
          "gcloud container clusters get-credentials training-gke --location=asia-northeast1 --project=ace-lab",
        result: "kubeconfig: training-gke",
        explain: "kubectlの操作先contextを設定します。",
        kind: "command",
        hint: "kubectlの操作先contextを設定します。",
      },
      {
        id: "gke-3",
        title: "Deployment作成",
        task: "helloというDeploymentをイメージ us-docker.pkg.dev/google-samples/containers/gke/hello-app:1.0 から作成してください。",
        answer:
          "kubectl create deployment hello --image=us-docker.pkg.dev/google-samples/containers/gke/hello-app:1.0",
        result: "deployment.apps/hello created",
        explain: "DeploymentがPodの望ましい状態を管理します。",
        kind: "command",
        hint: "DeploymentがPodの望ましい状態を管理します。",
      },
      {
        id: "gke-4",
        title: "Service公開",
        task: "helloをLoadBalancer、port=80、target-port=8080で公開してください。",
        answer: "kubectl expose deployment hello --type=LoadBalancer --port=80 --target-port=8080",
        result: "service/hello created",
        explain: "Service側とコンテナ側のポートを区別します。",
        kind: "command",
        hint: "Service側とコンテナ側のポートを区別します。",
      },
      {
        id: "gke-5",
        title: "Podを確認",
        task: "Podの一覧を取得してください。",
        answer: "kubectl get pods",
        result: "hello: Running（学習用）",
        explain: "Pendingならdescribeで配置条件、起動失敗ならイベントやログを調べます。",
        kind: "command",
        hint: "Pendingならdescribeで配置条件、起動失敗ならイベントやログを調べます。",
      },
      {
        id: "gke-6",
        title: "ロールアウトを確認",
        task: "hello Deploymentのロールアウト状態を確認してください。",
        answer: "kubectl rollout status deployment/hello",
        result: "deployment hello successfully rolled out（学習用）",
        explain: "投入しただけで完了とせず、準備状態も確認します。",
        kind: "command",
        hint: "投入しただけで完了とせず、準備状態も確認します。",
      },
    ],
    references: [
      {
        title: "アプリのデプロイ",
        url: "https://docs.cloud.google.com/kubernetes-engine/docs/deploy-app-cluster",
      },
      {
        title: "接続設定",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/get-credentials",
      },
    ],
    setup: [
      "演習用の固定値：project=ace-lab、region=asia-northeast1、zone=asia-northeast1-b。",
      "必要な権限・APIは演習環境に準備済み。リソースと確認結果は学習用の想定です。",
    ],
  },
  {
    id: "eventarc",
    category: "applications",
    title: "EventarcとCloud Run",
    summary: "イベント送信元、トリガー、宛先、実行主体を結び付けます。",
    steps: [
      {
        id: "eventarc-1",
        title: "Pub/Subトピック作成",
        task: "upload-events トピックを作成してください。",
        answer: "gcloud pubsub topics create upload-events --project=ace-lab",
        result: "upload-events: created",
        explain: "送信者と受信者をイベントで疎結合にします。",
        kind: "command",
        hint: "送信者と受信者をイベントで疎結合にします。",
      },
      {
        id: "eventarc-2",
        title: "呼び出し権限",
        task: "events-sa@ace-lab.iam.gserviceaccount.com にasia-northeast1 のcsv-loaderで roles/run.invoker を付与してください。",
        answer:
          "gcloud run services add-iam-policy-binding csv-loader --member=serviceAccount:events-sa@ace-lab.iam.gserviceaccount.com --role=roles/run.invoker --region=asia-northeast1 --project=ace-lab",
        result: "events-sa: invoker on csv-loader",
        explain: "トリガーの実行主体に宛先を呼ぶ権限を付与します。",
        kind: "command",
        hint: "トリガーの実行主体に宛先を呼ぶ権限を付与します。",
      },
      {
        id: "eventarc-3",
        title: "トリガー作成",
        task: "uploads-trigger を location=asia-northeast1、イベントtype=google.cloud.pubsub.topic.v1.messagePublished、transport-topic=upload-events、宛先csv-loader（asia-northeast1）、サービスアカウントevents-sa@ace-lab.iam.gserviceaccount.comで作成してください。",
        answer:
          "gcloud eventarc triggers create uploads-trigger --location=asia-northeast1 --event-filters=type=google.cloud.pubsub.topic.v1.messagePublished --transport-topic=upload-events --destination-run-service=csv-loader --destination-run-region=asia-northeast1 --service-account=events-sa@ace-lab.iam.gserviceaccount.com --project=ace-lab",
        result: "uploads-trigger: Pub/Sub → csv-loader",
        explain: "typeとlocation、宛先リージョンを明示します。",
        kind: "command",
        hint: "typeとlocation、宛先リージョンを明示します。",
      },
      {
        id: "eventarc-4",
        title: "イベント発行",
        task: "upload-events に training-event を発行してください。",
        answer:
          "gcloud pubsub topics publish upload-events --message=training-event --project=ace-lab",
        result: "message published → csv-loader（学習用）",
        explain: "実環境では受信ログを確認し、重複配送も考慮します。",
        kind: "command",
        hint: "実環境では受信ログを確認し、重複配送も考慮します。",
      },
    ],
    references: [
      {
        title: "Eventarc",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/eventarc/triggers/create",
      },
      {
        title: "Pub/SubとCloud Run",
        url: "https://docs.cloud.google.com/run/docs/triggering/pubsub-push",
      },
    ],
    setup: [
      "csv-loader はイベント形式に対応してデプロイ済み。project=ace-lab。",
      "events-sa、Eventarcのサービスエージェント、必要なEventarc・Pub/Sub権限は準備済み。",
    ],
  },
];
