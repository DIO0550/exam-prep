import type { Lab } from "../types";

export const OBSERVABILITY_LABS: Lab[] = [
  {
    id: "logging",
    category: "observability",
    title: "ログ検索・ログベース指標・転送",
    summary: "障害ログを絞り込み、監視や保管につなげます。",
    steps: [
      {
        id: "logging-1",
        title: "エラーログ検索",
        task: 'Compute EngineのERROR以上のログを10件取得。フィルタは resource.type="gce_instance" AND severity>=ERROR の順で指定してください。',
        answer:
          "gcloud logging read 'resource.type=\"gce_instance\" AND severity>=ERROR' --limit=10 --project=ace-lab",
        result: "filtered: Compute Engine / ERROR+",
        explain: "リソース種別と重大度で調べる範囲を絞ります。",
        kind: "command",
        hint: "リソース種別と重大度で調べる範囲を絞ります。",
      },
      {
        id: "logging-2",
        title: "ログベース指標作成",
        task: "app-errors を説明 Application errors、フィルタseverity>=ERRORで作成してください。",
        answer:
          'gcloud logging metrics create app-errors --description="Application errors" --log-filter="severity>=ERROR" --project=ace-lab',
        result: "logging.googleapis.com/user/app-errors",
        explain: "作成後の一致ログを指標化します。過去のログはさかのぼって数えません。",
        kind: "command",
        hint: "作成後の一致ログを指標化します。過去のログはさかのぼって数えません。",
      },
      {
        id: "logging-3",
        title: "ログシンク作成",
        task: "training-errors を宛先 storage.googleapis.com/ace-lab-log-archive、フィルタseverity>=ERRORで作成してください。",
        answer:
          'gcloud logging sinks create training-errors storage.googleapis.com/ace-lab-log-archive --log-filter="severity>=ERROR" --project=ace-lab',
        result: "training-errors: writerIdentity assigned",
        explain: "宛先への書き込み権限も設定します。",
        kind: "command",
        hint: "宛先への書き込み権限も設定します。",
      },
      {
        id: "logging-4",
        title: "転送先の権限付与",
        task: "学習用writerIdentity serviceAccount:log-writer@ace-lab.iam.gserviceaccount.com に gs://ace-lab-log-archive のroles/storage.objectCreatorを付与してください。",
        answer:
          "gcloud storage buckets add-iam-policy-binding gs://ace-lab-log-archive --member=serviceAccount:log-writer@ace-lab.iam.gserviceaccount.com --role=roles/storage.objectCreator",
        result: "sink destination: write access ready",
        explain: "実環境は返されたwriterIdentityを使います。この値は演習用です。",
        kind: "command",
        hint: "実環境は返されたwriterIdentityを使います。この値は演習用です。",
      },
    ],
    references: [
      {
        title: "ログベース指標",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/logging/metrics/create",
      },
      {
        title: "ログ転送",
        url: "https://docs.cloud.google.com/logging/docs/export/configure_export_v2",
      },
    ],
    setup: [
      "project=ace-lab。ERRORログとバケット gs://ace-lab-log-archive は準備済み。",
      "log-writer は入力練習用のアカウントで実在のwriterIdentityではありません。",
    ],
  },
  {
    id: "monitoring",
    category: "observability",
    title: "稼働時間チェックとアラート",
    summary: "URLの監視と、指標のしきい値アラートを設定します。",
    steps: [
      {
        id: "monitoring-1",
        title: "稼働時間チェック作成",
        task: "表示名 Training website、resource-type=uptime-url、resource-labelsのhost=example.comとproject_id=ace-lab、path=/、period=5分でチェックを作成してください。",
        answer:
          'gcloud monitoring uptime create "Training website" --resource-type=uptime-url --resource-labels=host=example.com,project_id=ace-lab --path=/ --period=5 --project=ace-lab',
        result: "Training website: every 5 minutes",
        explain: "hostにhttps://は含めません。periodは分単位です。",
        kind: "command",
        hint: "hostにhttps://は含めません。periodは分単位です。",
      },
      {
        id: "monitoring-2",
        title: "アラートポリシーのJSON",
        task: 'displayName=App errors、combiner=OR、conditionsは1要素配列。条件のdisplayName=Error count、conditionThresholdにはfilter=metric.type="logging.googleapis.com/user/app-errors" AND resource.type="gce_instance"、comparison=COMPARISON_GT、thresholdValue=5、duration=60sを書いてください。',
        answer:
          '{\n  "displayName": "App errors",\n  "combiner": "OR",\n  "conditions": [\n    {\n      "displayName": "Error count",\n      "conditionThreshold": {\n        "filter": "metric.type=\\"logging.googleapis.com/user/app-errors\\" AND resource.type=\\"gce_instance\\"",\n        "comparison": "COMPARISON_GT",\n        "thresholdValue": 5,\n        "duration": "60s"\n      }\n    }\n  ]\n}',
        result: "policy.json: threshold > 5 / 60s",
        explain:
          "指標・比較・しきい値・継続時間を組み合わせます。通知先はこのJSONにはまだ含めません。",
        kind: "json",
        hint: "指標・比較・しきい値・継続時間を組み合わせます。通知先はこのJSONにはまだ含めません。",
      },
      {
        id: "monitoring-3",
        title: "ポリシー作成",
        task: "前のJSONを policy.json に保存済みとして、ファイルからポリシーを作成してください。",
        answer:
          "gcloud monitoring policies create --policy-from-file=policy.json --project=ace-lab",
        result: "App errors: policy created（通知先未設定）",
        explain: "通知を受けるには通知チャネルを別途関連付けます。",
        kind: "command",
        hint: "通知を受けるには通知チャネルを別途関連付けます。",
      },
    ],
    references: [
      {
        title: "稼働時間チェック",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/monitoring/uptime/create",
      },
      {
        title: "アラートAPI",
        url: "https://docs.cloud.google.com/monitoring/alerts/using-alerting-api",
      },
    ],
    setup: [
      "ログベース指標 app-errors は準備済み。project=ace-lab。",
      "JSONをpolicy.jsonに保存した状態を次の手順で想定します。",
    ],
  },
];
