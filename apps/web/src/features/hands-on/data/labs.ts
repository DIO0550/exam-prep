import type { Lab } from "../types";
import { APPLICATIONS_LABS } from "./applications";
import { BASICS_LABS } from "./basics";
import { CHALLENGE_LABS } from "./challenge";
import { COMPUTE_STORAGE_LABS } from "./compute-storage";
import { LOAD_BALANCING_LABS } from "./load-balancing";
import { NETWORK_LABS } from "./network";
import { OBSERVABILITY_LABS } from "./observability";
import { TERRAFORM_LABS } from "./terraform";

// Google Cloud公式資料を基に作成した独自の操作手順トレーニング。結果は学習用。
export const CATEGORIES = [
  {
    id: "basics",
    label: "導入・IAM・課金",
  },
  {
    id: "compute-storage",
    label: "VM・ストレージ・DB",
  },
  {
    id: "network",
    label: "ネットワーク",
  },
  {
    id: "load-balancing",
    label: "負荷分散・スケーリング",
  },
  {
    id: "applications",
    label: "Cloud Run・GKE・イベント",
  },
  {
    id: "observability",
    label: "監視・ログ",
  },
  {
    id: "terraform",
    label: "Terraform",
  },
  {
    id: "challenge",
    label: "総合演習",
  },
] as const;

export const LABS: Lab[] = [
  ...BASICS_LABS,
  ...COMPUTE_STORAGE_LABS,
  ...NETWORK_LABS,
  ...LOAD_BALANCING_LABS,
  ...APPLICATIONS_LABS,
  ...OBSERVABILITY_LABS,
  ...TERRAFORM_LABS,
  ...CHALLENGE_LABS,
];
