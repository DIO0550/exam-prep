import { expect, it } from "vitest";
import { checkInput } from "./check-input";

it("コマンドのフラグ順・空白・引用符・継続行の違いを許容する", () => {
  const answer = 'gcloud projects create ace-lab --name="ACE Practice" --folder=123';
  const input =
    "gcloud projects create ace-lab " + "\\" + "\n    --folder 123 --name 'ACE Practice'";
  expect(checkInput("command", answer, input)).toBe(true);
});

it("値なしフラグを位置引数の前に置いてもリソース名を消費しない", () => {
  expect(
    checkInput(
      "command",
      "gcloud compute backend-services create web --global --protocol=HTTP",
      "gcloud compute backend-services create --global web --protocol HTTP",
    ),
  ).toBe(true);
});

it.each([
  "gcloud projects create prod --name='ACE Practice'",
  "gcloud projects create ace-lab --name='ACE Practice' --project=production",
  "gcloud projects create ace-lab --name='ACE Practice'; curl example.com",
  "gcloud projects create ace-lab --name='ACE Practice' && echo done",
  "gcloud projects create ace-lab --name='ACE Practice' --name=another",
  "gcloud projects create ace-lab --name='ACE Practice",
])("操作先・余分なフラグ・追加コマンド・壊れた引用符を拒否する: %s", (input) => {
  expect(checkInput("command", "gcloud projects create ace-lab --name='ACE Practice'", input)).toBe(
    false,
  );
});

it("繰り返すNICフラグは順序と個数を保つ", () => {
  const answer =
    "gcloud compute instances create bastion --network-interface=subnet=dev --network-interface=subnet=prod";
  expect(checkInput("command", answer, answer.replace("subnet=dev", "subnet=other"))).toBe(false);
  expect(
    checkInput(
      "command",
      answer,
      "gcloud compute instances create bastion --network-interface=subnet=prod --network-interface=subnet=dev",
    ),
  ).toBe(false);
});

it("ログフィルタ内の引用符を残し、条件変更を検出する", () => {
  const answer = `gcloud logging read 'resource.type="gce_instance" AND severity>=ERROR' --limit=10`;
  expect(checkInput("command", answer, answer)).toBe(true);
  expect(checkInput("command", answer, answer.replace("ERROR", "WARNING"))).toBe(false);
});

it("HCLの空白とコメントを許容し、文字列内の空白と値は区別する", () => {
  const answer = 'resource "google_compute_network" "vpc" { name = "dev vpc" }';
  expect(
    checkInput(
      "hcl",
      answer,
      '# 学習用\nresource "google_compute_network" "vpc" {\nname="dev vpc" // 名前\n}',
    ),
  ).toBe(true);
  expect(checkInput("hcl", answer, answer.replace("dev vpc", "devvpc"))).toBe(false);
  expect(checkInput("hcl", answer, answer.replace("dev vpc", "prod vpc"))).toBe(false);
});

it("JSONのキー順を許容し、型と壊れたJSONは区別する", () => {
  const answer = '{"threshold":5,"condition":{"enabled":true}}';
  expect(checkInput("json", answer, '{"condition":{"enabled":true},"threshold":5}')).toBe(true);
  expect(checkInput("json", answer, '{"condition":{"enabled":true},"threshold":"5"}')).toBe(false);
  expect(checkInput("json", answer, "{broken}")).toBe(false);
});

it("YAMLの改行コードと行末空白を許容し、ネスト変更を拒否する", () => {
  const answer = "spec:\n  resources:\n    storage: 1Gi";
  expect(checkInput("yaml", answer, "spec:  \r\n  resources:\r\n    storage: 1Gi\r\n")).toBe(true);
  expect(checkInput("yaml", answer, "spec:\nresources:\n    storage: 1Gi")).toBe(false);
});
