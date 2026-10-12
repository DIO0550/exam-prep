import type { Lab } from "../types";

export const NETWORK_LABS: Lab[] = [
  {
    id: "vpc",
    category: "network",
    title: "VPC・サブネット・ファイアウォール",
    summary: "カスタムネットワークを作り、許可する通信を明示します。",
    steps: [
      {
        id: "vpc-1",
        title: "VPC作成",
        task: "training-vpc をカスタムサブネットモードで作成してください。",
        answer:
          "gcloud compute networks create training-vpc --subnet-mode=custom --project=ace-lab",
        result: "training-vpc: CUSTOM",
        explain: "VPCはグローバル、サブネットはリージョンのリソースです。",
        kind: "command",
        hint: "VPCはグローバル、サブネットはリージョンのリソースです。",
      },
      {
        id: "vpc-2",
        title: "サブネット作成",
        task: "training-vpc のasia-northeast1に app-subnet を 10.20.0.0/24 で作成してください。",
        answer:
          "gcloud compute networks subnets create app-subnet --network=training-vpc --range=10.20.0.0/24 --region=asia-northeast1 --project=ace-lab",
        result: "app-subnet: 10.20.0.0/24",
        explain: "接続先とIP範囲が重ならないように設計します。",
        kind: "command",
        hint: "接続先とIP範囲が重ならないように設計します。",
      },
      {
        id: "vpc-3",
        title: "VM作成",
        task: "web-vm を app-subnet、e2-medium、debian-12/debian-cloud、webタグ付きで作成してください。",
        answer:
          "gcloud compute instances create web-vm --subnet=app-subnet --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud --tags=web --zone=asia-northeast1-b --project=ace-lab",
        result: "web-vm: app-subnet / tag web",
        explain: "目的のVPCとサブネットに配置します。",
        kind: "command",
        hint: "目的のVPCとサブネットに配置します。",
      },
      {
        id: "vpc-4",
        title: "HTTPを許可",
        task: "training-vpc に allow-web を作成。方向INGRESS、tcp:80、送信元10.20.0.0/24、対象タグwebを指定してください。",
        answer:
          "gcloud compute firewall-rules create allow-web --network=training-vpc --direction=INGRESS --allow=tcp:80 --source-ranges=10.20.0.0/24 --target-tags=web --project=ace-lab",
        result: "allow-web: INGRESS tcp:80 from 10.20.0.0/24",
        explain: "送信元と対象を絞ります。アプリの待ち受け設定も確認が必要です。",
        kind: "command",
        hint: "送信元と対象を絞ります。アプリの待ち受け設定も確認が必要です。",
      },
      {
        id: "vpc-5",
        title: "ルール確認",
        task: "allow-web の詳細を表示してください。",
        answer: "gcloud compute firewall-rules describe allow-web --project=ace-lab",
        result: "network: training-vpc / allowed tcp:80",
        explain: "通信できないときは方向・送信元・ポート・タグを確認します。",
        kind: "command",
        hint: "通信できないときは方向・送信元・ポート・タグを確認します。",
      },
    ],
    references: [
      {
        title: "VPC作成",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/compute/networks/create",
      },
      {
        title: "ファイアウォール",
        url: "https://docs.cloud.google.com/sdk/gcloud/reference/compute/firewall-rules/create",
      },
    ],
    setup: [
      "演習用の固定値：project=ace-lab、region=asia-northeast1、zone=asia-northeast1-b。",
      "必要な権限・APIは演習環境に準備済み。リソースと確認結果は学習用の想定です。",
    ],
  },
  {
    id: "vpn",
    category: "network",
    title: "HA VPNとCloud Router",
    summary: "ゲートウェイ、トンネル、ルーターのインターフェース、BGPを結びます。",
    steps: [
      {
        id: "vpn-1",
        title: "Cloud Router作成",
        task: "training-vpc に training-router をASN64514、asia-northeast1で作成してください。",
        answer:
          "gcloud compute routers create training-router --network=training-vpc --asn=64514 --region=asia-northeast1 --project=ace-lab",
        result: "training-router: ASN 64514",
        explain: "Cloud RouterがBGPの動的ルーティングを扱います。",
        kind: "command",
        hint: "Cloud RouterがBGPの動的ルーティングを扱います。",
      },
      {
        id: "vpn-2",
        title: "HA VPNゲートウェイ作成",
        task: "training-vpc に training-vpn をasia-northeast1で作成してください。",
        answer:
          "gcloud compute vpn-gateways create training-vpn --network=training-vpc --region=asia-northeast1 --project=ace-lab",
        result: "training-vpn: interfaces 0, 1",
        explain: "HA VPNには2つのインターフェースがあります。",
        kind: "command",
        hint: "HA VPNには2つのインターフェースがあります。",
      },
      {
        id: "vpn-3",
        title: "トンネル作成",
        task: "training-vpn のinterface 0と準備済み peer-vpn のinterface 0を結ぶ tunnel-0 を作成。router=training-router、IKEv2、学習用共有シークレット example-only を指定してください。",
        answer:
          "gcloud compute vpn-tunnels create tunnel-0 --vpn-gateway=training-vpn --interface=0 --peer-gcp-gateway=peer-vpn --router=training-router --ike-version=2 --shared-secret=example-only --region=asia-northeast1 --project=ace-lab",
        result: "tunnel-0: provisioned",
        explain: "これは片側の設定です。HA完成には2本目のトンネル・BGPと対向設定も必要です。",
        kind: "command",
        hint: "これは片側の設定です。HA完成には2本目のトンネル・BGPと対向設定も必要です。",
      },
      {
        id: "vpn-4",
        title: "ルーターのインターフェース追加",
        task: "training-router の if-0 を tunnel-0 に接続。IP169.254.0.1、マスク長30を指定してください。",
        answer:
          "gcloud compute routers add-interface training-router --interface-name=if-0 --vpn-tunnel=tunnel-0 --ip-address=169.254.0.1 --mask-length=30 --region=asia-northeast1 --project=ace-lab",
        result: "if-0: tunnel-0 / 169.254.0.1/30",
        explain: "VPNトンネルとRouterのインターフェースを関連付けます。",
        kind: "command",
        hint: "VPNトンネルとRouterのインターフェースを関連付けます。",
      },
      {
        id: "vpn-5",
        title: "BGPピア追加",
        task: "training-router に bgp-0 を追加。interface=if-0、対向IP169.254.0.2、対向ASN64515を指定してください。",
        answer:
          "gcloud compute routers add-bgp-peer training-router --peer-name=bgp-0 --interface=if-0 --peer-ip-address=169.254.0.2 --peer-asn=64515 --region=asia-northeast1 --project=ace-lab",
        result: "bgp-0: configured",
        explain: "トンネル作成だけでは経路交換は完了しません。双方のBGP設定を合わせます。",
        kind: "command",
        hint: "トンネル作成だけでは経路交換は完了しません。双方のBGP設定を合わせます。",
      },
    ],
    references: [
      {
        title: "HA VPN構築",
        url: "https://docs.cloud.google.com/network-connectivity/docs/vpn/how-to/creating-ha-vpn",
      },
    ],
    setup: [
      "project=ace-lab、region=asia-northeast1。training-vpc と対向の peer-vpn は準備済み。",
      "HA VPNの1本目の設定を練習。冗長化には2本目のトンネル・BGPと対向設定が必要です。",
    ],
  },
];
