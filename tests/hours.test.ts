import { describe, expect, it } from "vitest";
import { hoursText, type OpeningHours } from "@/entities/place";

describe("hoursText", () => {
  it("is null without hours, so the copy's own line stands", () => {
    expect(hoursText(null, "fr")).toBeNull();
    expect(hoursText([], "en")).toBeNull();
  });

  it("writes a run of days as a range and each row's clock in the page's language", () => {
    const hours: OpeningHours[] = [
      { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "19:00" },
      { days: ["Saturday"], opens: "09:00", closes: "12:30" },
    ];
    expect(hoursText(hours, "fr")).toBe("lun.–ven. 8 h–19 h · sam. 9 h–12 h 30");
    expect(hoursText(hours, "en")).toBe("Mon–Fri 8:00–19:00 · Sat 9:00–12:30");
  });

  it("lists days that do not make a run of three one by one, in week order", () => {
    expect(hoursText([{ days: ["Sunday", "Saturday", "Tuesday"], opens: "10:00", closes: "16:00" }], "en")).toBe(
      "Tue, Sat, Sun 10:00–16:00",
    );
  });
});
