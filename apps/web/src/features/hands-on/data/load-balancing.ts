import type { Lab } from "../types";

export const LOAD_BALANCING_LABS: Lab[] = [
  {
    id: "external-lb",
    category: "load-balancing",
    title: "外部Application LBと自動スケーリング",
    summary: "MIG、ヘルスチェック、バックエンド、フロントエンドまでつなぎます。",
    steps: [
      {
        id: "external-lb-1",
        title: "ヘルスチェック作成",
        task: "web-health というグローバルHTTPヘルスチェックを80番ポートで作成してください。",
        answer:
          "gcloud compute health-checks create http web-health --port=80 --global --project=ace-lab",
        result: "web-health: GLOBAL HTTP / 80",
        explain: "ヘルスチェックでアプリの応答を確認します。",
        kind: "command",
        hint: "ヘルスチェックでアプリの応答を確認します。",
      },
      {
        id: "external-lb-2",
        title: "バックエンド作成",
        task: "web-backend をグローバル、HTTP、port name=http、グローバルhealth check=web-health、EXTERNAL_MANAGED で作成してください。",
        answer:
          "gcloud compute backend-services create web-backend --global --protocol=HTTP --port-name=http --health-checks=web-health --global-health-checks --load-balancing-scheme=EXTERNAL_MANAGED --project=ace-lab",
        result: "web-backend: EXTERNAL_MANAGED / HTTP",
        explain: "各構成要素のスコープとスキームをそろえます。",
        kind: "command",
        hint: "各構成要素のスコープとスキームをそろえます。",
      },
      {
        id: "external-lb-3",
        title: "MIGを登録",
        task: "web-backend にゾーンasia-northeast1-bの web-mig を登録してください。",
        answer:
          "gcloud compute backend-services add-backend web-backend --global --instance-group=web-mig --instance-group-zone=asia-northeast1-b --project=ace-lab",
        result: "web-backend → web-mig",
        explain: "MIGはVM群、バックエンドサービスは振り分け先とヘルスチェックを管理します。",
        kind: "command",
        hint: "MIGはVM群、バックエンドサービスは振り分け先とヘルスチェックを管理します。",
      },
      {
        id: "external-lb-4",
        title: "URLマップ作成",
        task: "web-map の既定バックエンドを web-backend にしてください。",
        answer:
          "gcloud compute url-maps create web-map --default-service=web-backend --project=ace-lab",
        result: "web-map → web-backend",
        explain: "URLマップはHTTPリクエストのルーティングを扱います。",
        kind: "command",
        hint: "URLマップはHTTPリクエストのルーティングを扱います。",
      },
      {
        id: "external-lb-5",
        title: "HTTPプロキシ作成",
        task: "web-proxy を web-map に接続してください。",
        answer:
          "gcloud compute target-http-proxies create web-proxy --url-map=web-map --project=ace-lab",
        result: "web-proxy → web-map",
        explain: "学習例はHTTPです。HTTPSでは証明書とHTTPSプロキシを使います。",
        kind: "command",
        hint: "学習例はHTTPです。HTTPSでは証明書とHTTPSプロキシを使います。",
      },
      {
        id: "external-lb-6",
        title: "転送ルール作成",
        task: "web-rule をグローバル、EXTERNAL_MANAGED、80番、web-proxy宛てで作成してください。",
        answer:
          "gcloud compute forwarding-rules create web-rule --global --load-balancing-scheme=EXTERNAL_MANAGED --target-http-proxy=web-proxy --ports=80 --project=ace-lab",
        result: "web-rule: frontend ready",
        explain: "フロントエンドからMIGまでを関連付けます。",
        kind: "command",
        hint: "フロントエンドからMIGまでを関連付けます。",
      },
      {
        id: "external-lb-7",
        title: "自動スケーリング設定",
        task: "asia-northeast1-b の web-mig をCPU目標60%、最小2台、最大5台に設定してください。",
        answer:
          "gcloud compute instance-groups managed set-autoscaling web-mig --min-num-replicas=2 --max-num-replicas=5 --target-cpu-utilization=0.6 --zone=asia-northeast1-b --project=ace-lab",
        result: "web-mig: 2..5 replicas / CPU 0.6",
        explain: "目標は百分率60ではなく比率0.6で指定します。",
        kind: "command",
        hint: "目標は百分率60ではなく比率0.6で指定します。",
      },
      {
        id: "external-lb-8",
        title: "バックエンドの状態確認",
        task: "グローバル web-backend のヘルス状態を取得してください。",
        answer: "gcloud compute backend-services get-health web-backend --global --project=ace-lab",
        result: "web-mig: HEALTHY（学習用の想定）",
        explain: "アプリの待ち受けとヘルスチェック用ファイアウォールも確認対象です。",
        kind: "command",
        hint: "アプリの待ち受けとヘルスチェック用ファイアウォールも確認対象です。",
      },
    ],
    references: [
      {
        title: "外部Application LB",
        url: "https://docs.cloud.google.com/load-balancing/docs/https/setup-global-ext-https-compute",
      },
      {
        title: "自動スケーリング",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/compute/instance-groups/managed/set-autoscaling",
      },
    ],
    setup: [
      "HTTPを80番で返す web-mig が asia-northeast1-b に準備済み。project=ace-lab。",
      "web-mig の named port=http:80、ヘルスチェック・プロキシからのファイアウォール許可も準備済み。",
    ],
  },
  {
    id: "internal-lb",
    category: "load-balancing",
    title: "内部ロードバランサ",
    summary: "内部パススルーNetwork LBの構成を練習します。",
    steps: [
      {
        id: "internal-lb-1",
        title: "TCPヘルスチェック作成",
        task: "internal-health をリージョンasia-northeast1、TCP80番で作成してください。",
        answer:
          "gcloud compute health-checks create tcp internal-health --port=80 --region=asia-northeast1 --project=ace-lab",
        result: "internal-health: REGIONAL TCP / 80",
        explain: "内部VM群にも正常性確認が必要です。",
        kind: "command",
        hint: "内部VM群にも正常性確認が必要です。",
      },
      {
        id: "internal-lb-2",
        title: "内部バックエンド作成",
        task: "internal-backend をasia-northeast1、TCP、INTERNAL、health check=internal-health（asia-northeast1）で作成してください。",
        answer:
          "gcloud compute backend-services create internal-backend --protocol=TCP --load-balancing-scheme=INTERNAL --health-checks=internal-health --health-checks-region=asia-northeast1 --region=asia-northeast1 --project=ace-lab",
        result: "internal-backend: INTERNAL / TCP",
        explain: "内部パススルーLBはURLマップやHTTPプロキシを使いません。",
        kind: "command",
        hint: "内部パススルーLBはURLマップやHTTPプロキシを使いません。",
      },
      {
        id: "internal-lb-3",
        title: "MIGを登録",
        task: "internal-backend にゾーンasia-northeast1-bの internal-mig を登録してください。",
        answer:
          "gcloud compute backend-services add-backend internal-backend --instance-group=internal-mig --instance-group-zone=asia-northeast1-b --region=asia-northeast1 --project=ace-lab",
        result: "internal-backend → internal-mig",
        explain: "内部向けサービスのバックエンドにVM群を登録します。",
        kind: "command",
        hint: "内部向けサービスのバックエンドにVM群を登録します。",
      },
      {
        id: "internal-lb-4",
        title: "内部転送ルール作成",
        task: "internal-rule をtraining-vpc/app-subnet、TCP80番、IP10.20.0.10、INTERNAL、internal-backend宛て、asia-northeast1で作成してください。",
        answer:
          "gcloud compute forwarding-rules create internal-rule --network=training-vpc --subnet=app-subnet --ip-protocol=TCP --ports=80 --address=10.20.0.10 --load-balancing-scheme=INTERNAL --backend-service=internal-backend --region=asia-northeast1 --project=ace-lab",
        result: "internal-rule: 10.20.0.10:80",
        explain: "内部IPで通信を受け付けます。外部Application LBと構成要素を区別します。",
        kind: "command",
        hint: "内部IPで通信を受け付けます。外部Application LBと構成要素を区別します。",
      },
    ],
    references: [
      {
        title: "内部パススルーNetwork LB",
        url: "https://docs.cloud.google.com/load-balancing/docs/internal/setting-up-internal",
      },
    ],
    setup: [
      "training-vpc/app-subnet(10.20.0.0/24) と internal-mig は準備済み。project=ace-lab。",
      "internal-mig は asia-northeast1-b でTCP80番を待ち受け、必要なファイアウォール許可も準備済み。",
    ],
  },
];
