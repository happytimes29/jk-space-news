import { AboutPage } from "@/components/pages/AboutPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  route: "/about",
  title: "關於我",
  description: "15+ 年硬體研發經驗，從高頻電路與系統架構，延伸至 AI 自動化與獨立產品實驗。",
});

export default function TraditionalAboutPage() {
  return <AboutPage locale="zh-TW" />;
}
