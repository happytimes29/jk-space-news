import { createRelayHandler } from "@/lib/datasheet/relay-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createRelayHandler();
