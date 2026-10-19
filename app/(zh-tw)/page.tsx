import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function TraditionalHomePage() {
  return HomePage({ locale: "zh-TW" });
}
