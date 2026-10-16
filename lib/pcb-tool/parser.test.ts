import { describe, expect, it } from "vitest";
import { parseHTML, parseTargetList } from "./parser";

describe("OrCAD report parsing", () => {
  it("finds headers below report metadata and removes coordinate thousands separators", () => {
    expect(parseHTML(`<table><tr><td>Placement report</td></tr><tr><th>RefDes</th><th>SYM_X</th><th>SYM_Y</th></tr><tr><td>TP1</td><td>1,200.5</td><td>-2,000</td></tr></table>`)).toEqual([{ refDes: "TP1", x: 1200.5, y: -2000 }]);
  });

  it("skips missing names, missing coordinates and non-numeric rows", () => {
    expect(parseHTML(`<table><tr><th>RefDes</th><th>SYM_X</th><th>SYM_Y</th></tr><tr><td></td><td>1</td><td>2</td></tr><tr><td>TP1</td><td></td><td>2</td></tr><tr><td>TP2</td><td>invalid</td><td>2</td></tr><tr><td>TP3</td><td>0</td><td>0</td></tr></table>`)).toEqual([{ refDes: "TP3", x: 0, y: 0 }]);
  });

  it("deduplicates trimmed comma and newline separated targets without changing case", () => {
    expect([...parseTargetList(" TP1,TP2\r\nTP1\n tp3,, ")]).toEqual(["TP1", "TP2", "tp3"]);
  });
});
