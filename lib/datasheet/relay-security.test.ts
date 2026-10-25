import { describe, expect, it } from "vitest";
import { validateRelayTarget, type HostResolver } from "./relay-security";

function resolver(...addresses: string[]): HostResolver {
  return async () => addresses.map((address) => ({ address, family: address.includes(":") ? 6 as const : 4 as const }));
}

async function expectBlocked(url: string, addresses: string[] = ["93.184.216.34"], code = "RELAY_TARGET_BLOCKED") {
  await expect(validateRelayTarget({ url, provider: "openai-compatible" }, resolver(...addresses))).rejects.toMatchObject({ code });
}

describe("validateRelayTarget", () => {
  it("allows_an_https_host_only_when_every_dns_answer_is_public", async () => {
    const result = await validateRelayTarget(
      { url: "https://models.example.com/v1/chat/completions", provider: "openai-compatible" },
      resolver("93.184.216.34", "2606:2800:220:1:248:1893:25c8:1946"),
    );

    expect(result.url.href).toBe("https://models.example.com/v1/chat/completions");
    expect(result.addresses).toEqual([
      { address: "93.184.216.34", family: 4 },
      { address: "2606:2800:220:1:248:1893:25c8:1946", family: 6 },
    ]);
  });

  it.each([
    "http://models.example.com/v1",
    "https://user:pass@models.example.com/v1",
    "https://models.example.com:8443/v1",
    "https://localhost/v1",
  ])("blocks_an_unsafe_url_form: %s", async (url) => {
    await expectBlocked(url);
  });

  it.each([
    "0.0.0.1",
    "10.0.0.1",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.0.2.1",
    "192.168.1.1",
    "198.18.0.1",
    "198.51.100.10",
    "203.0.113.2",
    "224.0.0.1",
    "240.0.0.1",
  ])("blocks_private_reserved_or_documentation_ipv4: %s", async (address) => {
    await expectBlocked("https://models.example.com/v1", [address]);
  });

  it.each([
    "::",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
    "fd12:3456::1",
    "fe80::1",
    "ff02::1",
    "2001:db8::1",
  ])("blocks_private_reserved_or_mapped_ipv6: %s", async (address) => {
    await expectBlocked("https://models.example.com/v1", [address]);
  });

  it("blocks_a_dns_rebinding_candidate_when_only_one_answer_is_private", async () => {
    await expectBlocked("https://models.example.com/v1", ["93.184.216.34", "10.0.0.4"]);
  });

  it("blocks_a_redirect_target_that_resolves_to_link_local_metadata", async () => {
    const location = new URL("/latest/meta-data", "https://169.254.169.254").href;

    await expectBlocked(location, ["169.254.169.254"]);
  });

  it("rejects_an_empty_dns_answer", async () => {
    await expect(validateRelayTarget(
      { url: "https://models.example.com/v1", provider: "openai-compatible" },
      resolver(),
    )).rejects.toMatchObject({ code: "RELAY_DNS_EMPTY" });
  });
});
