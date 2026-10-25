import type { WorkbenchDocument, DocumentSlot } from "./workbench-state";

export interface PdfDropzoneCopy {
  original: string;
  candidate: string;
  choose: string;
  remove: string;
  componentType: string;
  chooseType: string;
  mlcc: string;
  inductor: string;
  estimate: (pages: number, characters: number, calls: number) => string;
}

export function PdfDropzone({ slot, document, copy, disabled, onSelect, onRemove, onKind }: {
  slot: DocumentSlot;
  document?: WorkbenchDocument;
  copy: PdfDropzoneCopy;
  disabled: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onKind: (kind: NonNullable<WorkbenchDocument["componentKind"]>) => void;
}) {
  const characters = document?.parsed?.pages.reduce((total, page) => total + page.text.length, 0) ?? 0;
  const calls = characters > 0 ? Math.max(2, Math.ceil(characters / 12_000) + 1) : 0;
  return (
    <section className="datasheet-dropzone">
      <label>{slot === "original" ? copy.original : copy.candidate}
        <input
          type="file"
          accept="application/pdf,.pdf"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelect(file);
          }}
        />
      </label>
      {document && <div className="datasheet-document-summary">
        <strong>{document.file.name}</strong>
        {document.parsed && <p>{copy.estimate(document.parsed.pageCount, characters, calls)}</p>}
        {document.parsed && <label>{copy.componentType}
          <select disabled={disabled} value={document.componentKind ?? ""} onChange={(event) => onKind(event.target.value as NonNullable<WorkbenchDocument["componentKind"]>)}>
            <option value="">{copy.chooseType}</option>
            <option value="mlcc">{copy.mlcc}</option>
            <option value="shielded-power-inductor">{copy.inductor}</option>
          </select>
        </label>}
        <button type="button" disabled={disabled} onClick={onRemove}>{copy.remove}</button>
      </div>}
    </section>
  );
}

