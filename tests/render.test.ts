import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  InvalidDocument,
  describeMethod,
  render,
  renderFragment,
  renderSource,
  COMPONENTS,
  THEME,
  TOKENS,
} from "../src/index.ts";
import type { BallotItem, Campaign, CompiledGuide } from "../src/index.ts";

const guide: CompiledGuide = JSON.parse(
  readFileSync(new URL("./fixtures/franklin.oval.json", import.meta.url), "utf8"),
);

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

test("the document is complete HTML with the guide's name as its title", () => {
  const html = render(guide);
  assert.ok(html.startsWith('<!doctype html>\n<html lang="en">'));
  assert.ok(html.includes(`<title>${guide.guide.name}</title>`));
  assert.ok(html.includes("<style>"));
  assert.ok(html.endsWith("</html>\n"));
  assert.ok(!render(guide, { stylesheet: "none" }).includes("<style>"));
});

test("the document links the brand fonts unless asked not to", () => {
  assert.ok(render(guide).includes("fonts.googleapis.com/css2?family=Newsreader"));
  assert.ok(!render(guide, { fonts: "none" }).includes("fonts.googleapis.com"));
  assert.ok(!render(guide, { stylesheet: "none" }).includes("fonts.googleapis.com"));
  assert.ok(!renderFragment(guide).includes("fonts.googleapis.com"));
});

test("the stylesheet is the brand package's tokens and components, then the guide's rules", () => {
  assert.ok(THEME.startsWith(TOKENS.trim()));
  assert.ok(TOKENS.includes("--oval-paper:"));
  assert.ok(COMPONENTS.includes(".oval-ballot-row"));
  assert.ok(THEME.includes(COMPONENTS.trim()));
  assert.ok(THEME.includes(".oval-guide"));
});

test("every ballot, contest, and measure is rendered once with an anchor", () => {
  const html = renderFragment(guide);
  assert.equal(count(html, 'class="oval-contest"'), guide.counts.contests);
  assert.equal(count(html, 'class="oval-measure"'), guide.counts.measures);
  assert.equal(count(html, 'class="oval-ballot"'), guide.counts.ballots);
  for (const question of guide.questions) {
    assert.ok(html.includes(`id="${question.kind}-${question.id}"`), question.id);
    assert.ok(html.includes(`href="#${question.kind}-${question.id}"`), question.id);
  }
});

test("campaigns carry their stance, party, and flags", () => {
  const html = renderFragment(guide);
  assert.equal(count(html, '<li class="oval-campaign'), guide.counts.campaigns);
  const president = guide.questions.find((question) => question.id === "president");
  assert.ok(president);
  assert.ok(html.includes('Hana Nakamura <span class="oval-muted">(President)</span>'));
  assert.ok(html.includes('class="oval-badge" title="Democratic">D</span>'));
  assert.ok(html.includes('<span class="oval-badge">Incumbent</span>'));
  assert.ok(html.includes('<span class="oval-stance oval-stance-support">Recommended</span>'));
});

test("a supported campaign's oval is filled in and every other oval is empty", () => {
  const html = renderFragment(guide);
  const campaigns = (items: BallotItem[]): Campaign[] =>
    items.flatMap((item) => {
      switch (item.kind) {
        case "ballot":
        case "section":
          return campaigns(item.items);
        case "contest":
          return item.campaigns;
        case "measure":
          return [];
      }
    });
  const all = guide.ballots.flatMap((ballot) => campaigns(ballot.items));
  const supported = all.filter((campaign) => campaign.stance.position === "support").length;
  assert.ok(supported > 0);
  assert.equal(all.length, guide.counts.campaigns);
  assert.equal(count(html, 'class="oval-bubble oval-bubble-filled"'), supported);
  assert.equal(count(html, 'class="oval-bubble"'), guide.counts.campaigns - supported);
});

test("markdown bodies become HTML with the profile's constructs and nothing else", () => {
  const html = renderFragment({
    ...guide,
    ballots: [guide.ballots[0]],
    questions: [],
    guide: {
      ...guide.guide,
      note: "A **bold** [link](https://a.example) and <b>raw</b> text.\n\n| a | b |\n|---|---|\n| 1 | 2 |",
    },
  });
  assert.ok(html.includes("<strong>bold</strong>"));
  assert.ok(html.includes('<a href="https://a.example">link</a>'));
  assert.ok(html.includes("&lt;b&gt;raw&lt;/b&gt;"));
  assert.ok(html.includes("<table>"));
  assert.ok(!html.includes("<b>"));
});

test("text from the guide is escaped", () => {
  const html = renderFragment({
    ...guide,
    ballots: [guide.ballots[0]],
    questions: [],
    guide: { ...guide.guide, name: 'Tom & Jerry <script>alert("x")</script>' },
  });
  assert.ok(html.includes("Tom &amp; Jerry &lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
});

test("voting methods are described in words", () => {
  assert.equal(describeMethod({ kind: "single" }), "Vote for one");
  assert.equal(describeMethod({ kind: "multiple", seats: 3 }), "Vote for up to 3");
  assert.equal(describeMethod({ kind: "ranked", max: 5 }), "Rank up to 5");
  assert.equal(describeMethod({ kind: "ranked" }), "Rank the candidates");
  assert.equal(describeMethod({ kind: "retention" }), "Yes or no");
});

test("an Oval document renders the same as its compiled output", () => {
  const source = readFileSync(new URL("./fixtures/franklin.oval", import.meta.url), "utf8");
  assert.equal(renderSource(source), render(guide));
});

test("an invalid document throws its diagnostics", () => {
  assert.throws(
    () => renderSource('oval 1\nguide "G"\n'),
    (thrown: unknown) => {
      assert.ok(thrown instanceof InvalidDocument);
      assert.ok(thrown.diagnostics.some((d) => d.code === "missing-guide-field"));
      assert.match(thrown.message, /errors?/);
      return true;
    },
  );
});
