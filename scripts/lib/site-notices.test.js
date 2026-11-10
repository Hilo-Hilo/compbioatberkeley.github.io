import assert from "node:assert/strict";
import test from "node:test";
import { activeNotices, renderNoticeGuide, validateNotices } from "../../src/data/siteNotices.js";

const notice = {
  id: "example-study-session", title: "Example study session",
  startsAt: "2026-11-16T19:00:00-08:00", endsAt: "2026-11-16T22:00:00-08:00",
  dateLabel: "Monday, November 16, 2026", shortDateLabel: "Mon, Nov 16",
  timeLabel: "7–10 p.m. Pacific time", description: "Please RSVP.",
  url: "https://example.com/rsvp", linkLabel: "RSVP",
};

test("notices expire at the exact event end across the Pacific-to-UTC date boundary", () => {
  assert.equal(activeNotices([notice], Date.parse("2026-11-17T05:59:59.999Z")).length, 1);
  assert.deepEqual(activeNotices([notice], Date.parse("2026-11-17T06:00:00Z")), []);
  assert.deepEqual(activeNotices([notice], Date.parse("2026-11-17T06:10:00Z")), []);
});

test("invalid times, duplicate IDs, unsafe links, and private extra fields block publication", () => {
  for (const change of [{ endsAt: "2026-11-16T22:00:00" }, { endsAt: notice.startsAt }, { url: "javascript:alert(1)" }, { email: "private@example.com" }]) {
    assert.throws(() => validateNotices([{ ...notice, ...change }]));
  }
  assert.throws(() => validateNotices([notice, notice]));
});

test("expiration removes the notice and RSVP from the guide while preserving other resources", () => {
  const template = "# Guide\n<!-- notices:start -->\nstale event\n<!-- notices:end -->\n## Resources\n- Keep me";
  const active = renderNoticeGuide(template, [notice]);
  assert.ok(active.includes(notice.url));
  const expired = renderNoticeGuide(active, []);
  assert.ok(!expired.includes(notice.url));
  assert.ok(!expired.includes("## Current notices"));
  assert.ok(expired.includes("## Resources\n- Keep me"));
  assert.equal(renderNoticeGuide(expired, []), expired);
});
