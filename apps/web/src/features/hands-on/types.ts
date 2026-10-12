export type InputKind = "command" | "hcl" | "json" | "yaml";

export type LabStep = {
  id: string;
  title: string;
  task: string;
  kind: InputKind;
  answer: string;
  hint: string;
  result: string;
  explain: string;
};

export type Lab = {
  id: string;
  category: string;
  title: string;
  summary: string;
  setup: string[];
  references: { title: string; url: string }[];
  steps: [LabStep, ...LabStep[]];
};

export type LabProgress = {
  completed: string[];
  drafts: Record<string, string>;
  assisted: string[];
};

export type HandsOnRecord = {
  version: 1;
  labs: Record<string, LabProgress>;
};
