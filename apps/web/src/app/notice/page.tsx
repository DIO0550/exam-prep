import type { Metadata } from "next";

import { NoticePage } from "@/features/notice/components/notice-page";

export const metadata: Metadata = {
  title: "収録範囲・出典・ご利用上の注意 | 試験対策ドリル",
};

const Notice = () => {
  return <NoticePage />;
};

export default Notice;
