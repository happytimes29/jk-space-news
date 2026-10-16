"use client";

import { Analytics as VercelAnalytics, type BeforeSend } from "@vercel/analytics/next";

const anonymousPageview: BeforeSend = (event) => {
  if (event.type !== "pageview") return null;

  return { type: "pageview", url: event.url.split(/[?#]/, 1)[0] };
};

export function Analytics() {
  return <VercelAnalytics beforeSend={anonymousPageview} />;
}
