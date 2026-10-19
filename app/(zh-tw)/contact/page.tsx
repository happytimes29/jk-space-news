import { ContactPage } from "@/components/pages/ContactPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  route: "/contact",
  title: "聯絡我",
  description: "JK Space 的技術交流、工具回饋與合作討論管道。",
});

export default function TraditionalContactPage() {
  return <ContactPage locale="zh-TW" />;
}
