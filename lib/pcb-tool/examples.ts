/** Fetch only public, synthetic examples. User-selected files never use this path. */
export async function loadExampleFiles(): Promise<{ oldContent: string; newContent: string }> {
  const [oldResponse, newResponse] = await Promise.all([
    fetch("/samples/pcb-test-point-old.html"),
    fetch("/samples/pcb-test-point-new.html"),
  ]);
  if (!oldResponse.ok || !newResponse.ok) throw new Error("範例下載失敗");
  const [oldContent, newContent] = await Promise.all([oldResponse.text(), newResponse.text()]);
  return { oldContent, newContent };
}
