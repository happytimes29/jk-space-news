export interface PublicDatasheetGoldenCase {
  manufacturer: string;
  sourceUrl: string;
  sourceSha256: string;
  checkedAt: string;
  page: number;
  pageCount: number;
  orderingCode: string;
  tableHeader: string;
  exactRowText: string;
  expected: Readonly<Record<string, string>>;
}

// These excerpts were manually checked against the named public manufacturer PDFs.
// The third-party PDFs are not redistributed in this repository; URL + SHA-256 make
// the validation artifact reproducible without silently substituting a new revision.
export const PUBLIC_DATASHEET_GOLDEN_CASES: readonly PublicDatasheetGoldenCase[] = [
  {
    manufacturer: "Coilcraft",
    sourceUrl: "https://www.coilcraft.com/getmedia/56db8f04-6d7a-4e93-ad3f-acf7c2a14b74/ser2000.pdf",
    sourceSha256: "6a61e9abc453531d1f8c9c084a3b7b7f8fb8f8d4548b98124da6c04689a0a646",
    checkedAt: "2026-10-25",
    page: 2,
    pageCount: 4,
    orderingCode: "SER2013-472ML_",
    tableHeader: "Part number | Inductance (μH) | DCR typ (mΩ) | DCR max (mΩ) | SRF typ (MHz) | Isat (A) | Irms 20°C rise (A) | Irms 40°C rise (A) | Height (mm)",
    exactRowText: "SER2013-472ML_ 4.7 1.70 1.82 30 18 23 30 12,95",
    expected: { inductance: "4.7 µH", dcrMax: "1.82 mΩ", saturationCurrent: "18 A", rmsCurrent40C: "30 A" },
  },
  {
    manufacturer: "Bourns",
    sourceUrl: "https://bourns.com/docs/product-datasheets/pq2617.pdf?sfvrsn=4e1575f6_15",
    sourceSha256: "8ed9a0ed43802a1f76ba5d753543f122bfc3d4ab74f893445bd742dcc6c70506",
    checkedAt: "2026-10-25",
    page: 1,
    pageCount: 3,
    orderingCode: "PQ2617BHA-4R7K",
    tableHeader: "Bourns Part Number | Inductance L (µH) | Tol. (%) | SRF (MHz) Typ. | DCR (mΩ) Typ. | DCR (mΩ) Max. | Irms (A) Typ. | Isat1 (A) Typ. | Isat2 (A) Typ.",
    exactRowText: "PQ2617BHA-4R7K 4.7 ± 10 30 2.16 2.50 28 61.2 62.4",
    expected: { inductance: "4.7 µH", dcrMax: "2.50 mΩ", rmsCurrent: "28 A", saturationCurrent: "61.2 A" },
  },
];
