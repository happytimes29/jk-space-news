# Datasheet Workbench public golden corpus

The version-one safety corpus includes manually checked excerpts from two public manufacturer PDFs. The repository stores factual excerpts, source URLs, page numbers, retrieval date, and the downloaded artifact SHA-256; it does not redistribute the third-party PDFs. Re-downloads must match the recorded hash or be reviewed as a new revision.

| Manufacturer | Public PDF | Checked | SHA-256 | What is covered |
| --- | --- | --- | --- | --- |
| Coilcraft | `https://www.coilcraft.com/getmedia/56db8f04-6d7a-4e93-ad3f-acf7c2a14b74/ser2000.pdf` | 2026-10-25 | `6a61e9abc453531d1f8c9c084a3b7b7f8fb8f8d4548b98124da6c04689a0a646` | Four-page family PDF, exact `SER2013-472ML_` row, mixed DCR/Isat/Irms columns. |
| Bourns | `https://bourns.com/docs/product-datasheets/pq2617.pdf?sfvrsn=4e1575f6_15` | 2026-10-25 | `8ed9a0ed43802a1f76ba5d753543f122bfc3d4ab74f893445bd742dcc6c70506` | Three-page family PDF, exact `PQ2617BHA-4R7K` row, typ/max and two saturation-current columns. |

The current deterministic evidence gate intentionally rejects these unitless multi-column row excerpts instead of guessing which numeric cell belongs to a requested field. This corpus therefore tests a safety property, not extraction accuracy. Synthetic fixtures continue to exercise successful normalized cases. No live-provider accuracy percentage is claimed, and actual OpenAI-compatible, Anthropic, or Gemini smoke tests still require an operator-owned disposable key outside recorded test output.
