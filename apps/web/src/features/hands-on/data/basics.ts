import type { Lab } from "../types";

export const BASICS_LABS: Lab[] = [
  {
    id: "project-api",
    category: "basics",
    title: "プロジェクト・Cloud Shell・API",
    summary: "操作先をそろえ、プロジェクト作成からAPIの有効化まで練習します。",
    steps: [
      {
        id: "project-api-1",
        title: "プロジェクトを作成",
        task: "プロジェクトID ace-lab、表示名 ACE Practice でプロジェクトを作成してください。",
        answer: 'gcloud projects create ace-lab --name="ACE Practice"',
        result: "project: ace-lab\nname: ACE Practice",
        explain: "プロジェクトIDと表示名は別の値です。config set はプロジェクトを作成しません。",
        kind: "command",
        hint: "gcloud projects create の位置引数がID、--name が表示名です。",
      },
      {
        id: "project-api-2",
        title: "操作先を設定",
        task: "Cloud Shell の gcloud 既定プロジェクトを ace-lab に設定してください。",
        answer: "gcloud config set project ace-lab",
        result: "core/project: ace-lab",
        explain: "操作前にアカウントと操作先を確認します。",
        kind: "command",
        hint: "操作前にアカウントと操作先を確認します。",
      },
      {
        id: "project-api-3",
        title: "APIを有効化",
        task: "ace-lab のCompute EngineとCloud StorageのAPIを、この順に列挙して有効化してください。",
        answer:
          "gcloud services enable compute.googleapis.com storage.googleapis.com --project=ace-lab",
        result: "compute.googleapis.com: ENABLED\nstorage.googleapis.com: ENABLED",
        explain: "API利用の権限と、APIを有効化する作業は別です。",
        kind: "command",
        hint: "API利用の権限と、APIを有効化する作業は別です。",
      },
      {
        id: "project-api-4",
        title: "有効化を確認",
        task: "ace-lab で有効なAPIを一覧表示してください。",
        answer: "gcloud services list --enabled --project=ace-lab",
        result: "Compute Engine API\nCloud Storage API",
        explain: "実行後に操作先と設定内容を確認します。",
        kind: "command",
        hint: "実行後に操作先と設定内容を確認します。",
      },
    ],
    references: [
      {
        title: "プロジェクト作成",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/projects/create",
      },
      {
        title: "API有効化",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/services/enable",
      },
    ],
    setup: [
      "ログイン済みのCloud Shellを想定。最初の手順では ace-lab は存在しません。",
      "プロジェクト作成や課金は実際には行われません。",
    ],
  },
  {
    id: "iam",
    category: "basics",
    title: "IAMとサービスアカウント",
    summary: "作成・最小権限の付与・ポリシー確認・取り消しを練習します。",
    steps: [
      {
        id: "iam-1",
        title: "サービスアカウント作成",
        task: "ace-lab にID reports-reader、表示名 Reports Reader のサービスアカウントを作成してください。",
        answer:
          'gcloud iam service-accounts create reports-reader --display-name="Reports Reader" --project=ace-lab',
        result: "reports-reader@ace-lab.iam.gserviceaccount.com",
        explain: "人のアカウントとアプリの実行主体を分けます。",
        kind: "command",
        hint: "人のアカウントとアプリの実行主体を分けます。",
      },
      {
        id: "iam-2",
        title: "読み取り権限を付与",
        task: "reports-reader@ace-lab.iam.gserviceaccount.com に ace-lab の roles/storage.objectViewer を無条件で付与してください。",
        answer:
          "gcloud projects add-iam-policy-binding ace-lab --member=serviceAccount:reports-reader@ace-lab.iam.gserviceaccount.com --role=roles/storage.objectViewer --condition=None",
        result: "role: roles/storage.objectViewer",
        explain:
          "この例はプロジェクト単位です。特定バケットだけならバケット単位の付与も検討します。",
        kind: "command",
        hint: "この例はプロジェクト単位です。特定バケットだけならバケット単位の付与も検討します。",
      },
      {
        id: "iam-3",
        title: "ポリシーを確認",
        task: "ace-lab のIAMポリシーを取得してください。",
        answer: "gcloud projects get-iam-policy ace-lab",
        result: "bindings: storage.objectViewer → reports-reader",
        explain: "付与先のメンバーとロールが意図どおりか確認します。",
        kind: "command",
        hint: "付与先のメンバーとロールが意図どおりか確認します。",
      },
      {
        id: "iam-4",
        title: "権限を取り消す",
        task: "同じメンバーの storage.objectViewer を同じ無条件の指定で取り消してください。",
        answer:
          "gcloud projects remove-iam-policy-binding ace-lab --member=serviceAccount:reports-reader@ace-lab.iam.gserviceaccount.com --role=roles/storage.objectViewer --condition=None",
        result: "binding removed",
        explain: "使い終わった権限も片付けます。対象とロール・条件をそろえます。",
        kind: "command",
        hint: "使い終わった権限も片付けます。対象とロール・条件をそろえます。",
      },
    ],
    references: [
      {
        title: "IAM付与",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding",
      },
      {
        title: "サービスアカウント",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/iam/service-accounts/create",
      },
    ],
    setup: [
      "演習用の固定値：project=ace-lab、region=asia-northeast1、zone=asia-northeast1-b。",
      "必要な権限・APIは演習環境に準備済み。リソースと確認結果は学習用の想定です。",
    ],
  },
  {
    id: "billing",
    category: "basics",
    title: "課金・予算・ラベル",
    summary: "課金のリンク、費用の分類、予算通知の役割を練習します。",
    steps: [
      {
        id: "billing-1",
        title: "課金をリンク",
        task: "ace-lab を学習用の請求先アカウント 000000-000000-000000 にリンクしてください。",
        answer: "gcloud billing projects link ace-lab --billing-account=000000-000000-000000",
        result: "billingEnabled: true",
        explain: "プロジェクト側と請求先側の必要な権限を確認します。",
        kind: "command",
        hint: "プロジェクト側と請求先側の必要な権限を確認します。",
      },
      {
        id: "billing-2",
        title: "分類用ラベルを設定",
        task: "ace-lab に environment=training、team=platform の順でラベルを設定してください。",
        answer: "gcloud projects update ace-lab --update-labels=environment=training,team=platform",
        result: "environment=training, team=platform",
        explain: "ラベルは費用分類や検索に使います。IAMの境界にはなりません。",
        kind: "command",
        hint: "ラベルは費用分類や検索に使います。IAMの境界にはなりません。",
      },
      {
        id: "billing-3",
        title: "予算を作成",
        task: "請求先アカウントの予算を、表示名 ACE monthly、100USD、実費の80%で通知する設定で作成してください。",
        answer:
          'gcloud billing budgets create --billing-account=000000-000000-000000 --display-name="ACE monthly" --budget-amount=100USD --threshold-rule=percent=0.8,basis=current-spend',
        result: "budget: ACE monthly / 100 USD / threshold 80%",
        explain: "予算アラートは通知です。しきい値を超えてもリソースは自動停止しません。",
        kind: "command",
        hint: "予算アラートは通知です。しきい値を超えてもリソースは自動停止しません。",
      },
    ],
    references: [
      {
        title: "予算",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/billing/budgets/create",
      },
      {
        title: "課金リンク",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/billing/projects/link",
      },
    ],
    setup: [
      "演習用の固定値：project=ace-lab、region=asia-northeast1、zone=asia-northeast1-b。",
      "必要な権限・APIは演習環境に準備済み。リソースと確認結果は学習用の想定です。",
    ],
  },
];
