export interface ContactLink {
  label: string;
  href: string;
  kind: "github" | "telegram" | "email";
}

export interface SiteConfig {
  name: string;
  url: string;
  title: string;
  tagline: string;
  description: string;
  navigation: { label: string; href: string }[];
  contacts: ContactLink[];
}

export const siteConfig: SiteConfig = {
  name: "JK Space",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://jk-space.com").replace(/\/+$/, ""),
  title: "JK Space — 個人工程實驗室",
  tagline: "把工程上的麻煩事，做成好用的工具。",
  description: "硬體研發、AI 自動化、工程工具與技術觀點。",
  navigation: [
    { label: "首頁", href: "/" },
    { label: "專案", href: "/projects" },
    { label: "工具", href: "/tools" },
    { label: "筆記與觀點", href: "/notes" },
    { label: "關於我", href: "/about" },
    { label: "聯絡", href: "/contact" },
  ],
  contacts: [
    { label: "GitHub", href: "https://github.com/happytimes29", kind: "github" },
    { label: "Telegram", href: "https://t.me/JK_Sapce", kind: "telegram" },
  ],
};

export function getEnabledContactLinks(config: SiteConfig): ContactLink[] {
  return config.contacts;
}
