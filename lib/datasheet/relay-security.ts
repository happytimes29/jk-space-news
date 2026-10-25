import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { ProviderKind } from "./providers";

export interface RelayTarget {
  url: string;
  provider: ProviderKind;
}

export interface ResolvedHost {
  address: string;
  family: 4 | 6;
}

export type HostResolver = (hostname: string) => Promise<readonly ResolvedHost[]>;

export interface SafeRelayTarget {
  url: URL;
  addresses: ResolvedHost[];
}

export type RelaySecurityErrorCode = "RELAY_DNS_EMPTY" | "RELAY_TARGET_BLOCKED";

export class RelaySecurityError extends Error {
  constructor(public readonly code: RelaySecurityErrorCode) {
    super(code);
    this.name = "RelaySecurityError";
  }
}

export const defaultHostResolver: HostResolver = async (hostname) => {
  const result = await lookup(hostname, { all: true, verbatim: true });
  return result.map(({ address, family }) => ({ address, family: family as 4 | 6 }));
};

const OFFICIAL_TARGETS: Partial<Record<ProviderKind, { hostname: string; pathPrefix: string }>> = {
  anthropic: { hostname: "api.anthropic.com", pathPrefix: "/v1/messages" },
  gemini: { hostname: "generativelanguage.googleapis.com", pathPrefix: "/v1beta/models/" },
};

function ipv4Parts(address: string): number[] | null {
  if (isIP(address) !== 4) return null;
  const parts = address.split(".").map(Number);
  return parts.length === 4 && parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255) ? parts : null;
}

function isPublicIpv4(address: string): boolean {
  const parts = ipv4Parts(address);
  if (!parts) return false;
  const [a, b, c] = parts;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
  if (a === 192 && b === 88 && c === 99) return false;
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  return true;
}

function expandIpv6(address: string): number[] | null {
  const value = address.toLowerCase().split("%")[0];
  if (isIP(value) !== 6) return null;
  const embeddedIpv4 = value.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  let normalized = value;
  if (embeddedIpv4) {
    const parts = ipv4Parts(embeddedIpv4[2]);
    if (!parts) return null;
    normalized = `${embeddedIpv4[1]}${((parts[0] << 8) | parts[1]).toString(16)}:${((parts[2] << 8) | parts[3]).toString(16)}`;
  }
  const [leftRaw, rightRaw, ...extra] = normalized.split("::");
  if (extra.length > 0) return null;
  const left = leftRaw ? leftRaw.split(":").filter(Boolean) : [];
  const right = rightRaw ? rightRaw.split(":").filter(Boolean) : [];
  const zeros = normalized.includes("::") ? 8 - left.length - right.length : 0;
  const groups = [...left, ...Array.from({ length: zeros }, () => "0"), ...right].map((group) => Number.parseInt(group, 16));
  return groups.length === 8 && groups.every((group) => Number.isInteger(group) && group >= 0 && group <= 0xffff) ? groups : null;
}

function isPublicIpv6(address: string): boolean {
  const groups = expandIpv6(address);
  if (!groups) return false;
  const [first, second] = groups;
  const allZeroPrefix = groups.slice(0, 6).every((group) => group === 0);
  const mappedIpv4Prefix = groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff;
  if (groups.every((group) => group === 0) || groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1) return false;
  if (mappedIpv4Prefix) {
    const mapped = `${groups[6] >> 8}.${groups[6] & 0xff}.${groups[7] >> 8}.${groups[7] & 0xff}`;
    return isPublicIpv4(mapped);
  }
  if (allZeroPrefix) return false;
  if ((first & 0xfe00) === 0xfc00 || (first & 0xffc0) === 0xfe80 || (first & 0xff00) === 0xff00) return false;
  if (first === 0x0064 && second === 0xff9b) return false;
  if (first === 0x0100 && groups.slice(1, 4).every((group) => group === 0)) return false;
  if (first === 0x2001 && second === 0x0db8) return false;
  if (first === 0x2001 && (second & 0xfff0) === 0x0010) return false;
  return true;
}

export function isPublicAddress(address: string): boolean {
  const version = isIP(address.split("%")[0]);
  if (version === 4) return isPublicIpv4(address);
  if (version === 6) return isPublicIpv6(address);
  return false;
}

function validateUrlShape(target: RelayTarget): URL {
  let url: URL;
  try {
    url = new URL(target.url);
  } catch {
    throw new RelaySecurityError("RELAY_TARGET_BLOCKED");
  }
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) {
    throw new RelaySecurityError("RELAY_TARGET_BLOCKED");
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new RelaySecurityError("RELAY_TARGET_BLOCKED");
  }
  const official = OFFICIAL_TARGETS[target.provider];
  if (official && (hostname !== official.hostname || !url.pathname.startsWith(official.pathPrefix))) {
    throw new RelaySecurityError("RELAY_TARGET_BLOCKED");
  }
  return url;
}

export async function validateRelayTarget(input: RelayTarget, resolver: HostResolver = defaultHostResolver): Promise<SafeRelayTarget> {
  const url = validateUrlShape(input);
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const directVersion = isIP(hostname);
  const resolved = directVersion
    ? [{ address: hostname, family: directVersion as 4 | 6 }]
    : await resolver(hostname);
  if (resolved.length === 0) throw new RelaySecurityError("RELAY_DNS_EMPTY");
  if (resolved.some(({ address }) => !isPublicAddress(address))) throw new RelaySecurityError("RELAY_TARGET_BLOCKED");
  return { url, addresses: [...resolved] };
}

