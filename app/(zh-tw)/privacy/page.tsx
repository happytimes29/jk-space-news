import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  route: "/privacy",
  title: "隱私權政策",
  description: "JK Space 的網站連線、匿名瀏覽統計與 PCB 工具檔案處理說明。",
});

export default function TraditionalPrivacyPage() {
  return <PrivacyPage locale="zh-TW" />;
}
