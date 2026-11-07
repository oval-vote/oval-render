import type {
  Ballot,
  BallotItem,
  Campaign,
  CompiledGuide,
  Contest,
  Measure,
  Method,
  Party,
  Section,
  Stance,
} from "./model.ts";
import { compileSource } from "./compile.ts";
import { attribute, element, escape, joinLines } from "./html.ts";
import { markdown } from "./markdown.ts";
import { THEME } from "./theme.ts";

export interface RenderOptions {
  language?: string;
  stylesheet?: "inline" | "none";
  contents?: boolean;
}

interface Context {
  parties: Map<string, Party>;
  candidates: Map<string, string>;
  contents: boolean;
}

export function renderSource(source: string, options: RenderOptions = {}): string {
  return render(compileSource(source), options);
}

export function renderSourceFragment(source: string, options: RenderOptions = {}): string {
  return renderFragment(compileSource(source), options);
}

export function render(guide: CompiledGuide, options: RenderOptions = {}): string {
  const language = options.language ?? "en";
  const stylesheet = options.stylesheet ?? "inline";
  return joinLines([
    "<!doctype html>",
    `<html lang="${escape(language)}">`,
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escape(guide.guide.name)}</title>`,
    stylesheet === "inline" && `<style>${THEME}</style>`,
    "</head>",
    "<body>",
    renderFragment(guide, options),
    "</body>",
    "</html>",
    "",
  ]);
}

export function renderFragment(guide: CompiledGuide, options: RenderOptions = {}): string {
  const context: Context = {
    parties: new Map(guide.parties.map((party) => [party.id, party])),
    candidates: new Map(guide.candidates.map((candidate) => [candidate.id, candidate.name])),
    contents: options.contents ?? true,
  };
  return element("article", ' class="oval-guide"', [
    element("header", "", [
      `<h1>${escape(guide.guide.name)}</h1>`,
      `<p class="oval-election">${escape(guide.guide.election)} <span class="oval-muted">(${escape(guide.guide.date)})</span></p>`,
      guide.guide.note === undefined ? "" : markdown(guide.guide.note),
    ]),
    context.contents ? renderContents(guide) : "",
    ...guide.ballots.map((ballot) => renderBallot(ballot, 2, context)),
  ]);
}

function renderContents(guide: CompiledGuide): string {
  const items = guide.ballots.map(
    (ballot) =>
      `<li><a href="#${escape(anchor("ballot", ballot.id))}">${escape(ballot.title)}</a>${contentsOf(ballot)}</li>`,
  );
  return element("nav", ' class="oval-contents" aria-label="Contents"', [
    `<ul>${items.join("")}</ul>`,
  ]);
}

function contentsOf(ballot: Ballot): string {
  const items = ballot.items.flatMap((item) => {
    switch (item.kind) {
      case "section":
        return item.items.map(questionLink);
      case "ballot":
        return [
          `<li><a href="#${escape(anchor("ballot", item.id))}">${escape(item.title)}</a>${contentsOf(item)}</li>`,
        ];
      default:
        return [questionLink(item)];
    }
  });
  return items.length === 0 ? "" : `<ul>${items.join("")}</ul>`;
}

function questionLink(question: Contest | Measure): string {
  return `<li><a href="#${escape(anchor(question.kind, question.id))}">${escape(question.title)}</a></li>`;
}

function anchor(kind: string, id: string): string {
  return `${kind}-${id}`;
}

function heading(level: number, text: string, attributes = ""): string {
  const tag = `h${Math.min(level, 6)}`;
  return `<${tag}${attributes}>${text}</${tag}>`;
}

function renderBallot(ballot: Ballot, level: number, context: Context): string {
  return element("section", ` class="oval-ballot" id="${escape(anchor("ballot", ballot.id))}"`, [
    heading(level, escape(ballot.title)),
    ballot.eligibility === undefined
      ? ""
      : `<p class="oval-muted">${escape(ballot.eligibility)}</p>`,
    ballot.note === undefined ? "" : markdown(ballot.note),
    ...ballot.items.map((item) => renderItem(item, level + 1, context)),
  ]);
}

function renderItem(item: BallotItem, level: number, context: Context): string {
  switch (item.kind) {
    case "ballot":
      return renderBallot(item, level, context);
    case "section":
      return renderSection(item, level, context);
    case "contest":
      return renderContest(item, level, context);
    case "measure":
      return renderMeasure(item, level);
  }
}

function renderSection(section: Section, level: number, context: Context): string {
  return element("section", ' class="oval-section"', [
    heading(level, escape(section.title)),
    section.note === undefined ? "" : markdown(section.note),
    ...section.items.map((item) => renderItem(item, level + 1, context)),
  ]);
}

function renderContest(contest: Contest, level: number, context: Context): string {
  const { recommendation } = contest;
  return element("section", ` class="oval-contest" id="${escape(anchor("contest", contest.id))}"`, [
    heading(level, escape(contest.title)),
    `<p class="oval-subtitle oval-muted">${escape(contest.subtitle ?? describeMethod(contest.method))}</p>`,
    contest.subtitle === undefined
      ? ""
      : `<p class="oval-muted">${escape(describeMethod(contest.method))}</p>`,
    contest.note === undefined ? "" : markdown(contest.note),
    `<ul class="oval-campaigns">${contest.campaigns.map((campaign) => renderCampaign(campaign, context)).join("")}</ul>`,
    element("div", ' class="oval-recommendation"', [
      recommendation.no_position
        ? '<p class="oval-position">No position</p>'
        : renderStances(contest, context),
      recommendation.justification === undefined ? "" : markdown(recommendation.justification),
      recommendation.note === undefined ? "" : markdown(recommendation.note),
    ]),
    contest.tabulation === undefined
      ? ""
      : `<p class="oval-muted">Tabulation: ${escape(contest.tabulation)}</p>`,
  ]);
}

export function describeMethod(method: Method): string {
  switch (method.kind) {
    case "single":
      return "Vote for one";
    case "multiple":
      return `Vote for up to ${method.seats}`;
    case "ranked":
      return method.max === undefined ? "Rank the candidates" : `Rank up to ${method.max}`;
    case "retention":
      return "Yes or no";
  }
}

function renderCampaign(campaign: Campaign, context: Context): string {
  const classes = ["oval-campaign", campaign.withdrawn && "oval-withdrawn"].filter(Boolean);
  const party = campaign.party === undefined ? undefined : context.parties.get(campaign.party);
  const members = campaign.members.map((member) => {
    const name = context.candidates.get(member.candidate) ?? member.candidate;
    const role =
      member.role === undefined ? "" : ` <span class="oval-muted">(${escape(member.role)})</span>`;
    return `${escape(name)}${role}`;
  });
  return element("li", ` class="${classes.join(" ")}"`, [
    renderStanceMark(campaign.stance),
    element("div", "", [
      `<span class="oval-label">${members.join(" / ")}</span>`,
      party === undefined
        ? ""
        : `<span class="oval-badge"${attribute("title", party.name)}>${escape(party.abbreviation ?? party.name)}</span>`,
      campaign.incumbent ? '<span class="oval-badge">Incumbent</span>' : "",
      campaign.withdrawn ? '<span class="oval-badge">Withdrawn</span>' : "",
      campaign.website === undefined ? "" : ` <a href="${escape(campaign.website)}">Website</a>`,
      campaign.note === undefined ? "" : markdown(campaign.note),
    ]),
  ]);
}

function renderStanceMark(stance: Stance): string {
  switch (stance.position) {
    case "support":
      return `<span class="oval-mark oval-mark-support">${stance.tier === 0 ? "Recommended" : `Choice ${stance.tier + 1}`}</span>`;
    case "oppose":
      return '<span class="oval-mark oval-mark-oppose">Oppose</span>';
    case "none":
      return '<span class="oval-mark oval-mark-none"></span>';
  }
}

function renderStances(contest: Contest, context: Context): string {
  const label = (index: number) => {
    const campaign = contest.campaigns[index];
    return campaign === undefined ? "" : escape(campaign.label);
  };
  const tiers = contest.recommendation.support_campaigns.map((tier, position) => {
    const names = tier.map(label).join(", ");
    const prefix =
      contest.recommendation.support_campaigns.length > 1
        ? `${ordinal(position + 1)} choice: `
        : "";
    return `<p class="oval-position oval-position-yes">${prefix}${names}</p>`;
  });
  const opposed = contest.recommendation.oppose_campaigns.map(label);
  void context;
  return joinLines([
    ...tiers,
    opposed.length === 0
      ? ""
      : `<p class="oval-position oval-position-no">Oppose: ${opposed.join(", ")}</p>`,
  ]);
}

function ordinal(number: number): string {
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const remainder = number % 100;
  const suffix = remainder >= 11 && remainder <= 13 ? "th" : (suffixes[number % 10] ?? "th");
  return `${number}${suffix}`;
}

function renderMeasure(measure: Measure, level: number): string {
  const { recommendation } = measure;
  const facts: [string, string | undefined][] = [
    ["Placement", measure.placement],
    ["Passes with", measure.tabulation],
    ["Fiscal impact", measure.fiscal_impact],
    ["Supporters", list(measure.supporters)],
    ["Opponents", list(measure.opponents)],
  ];
  const present = facts.filter((fact): fact is [string, string] => fact[1] !== undefined);
  return element("section", ` class="oval-measure" id="${escape(anchor("measure", measure.id))}"`, [
    heading(level, escape(measure.title)),
    measure.subtitle === undefined
      ? ""
      : `<p class="oval-subtitle oval-muted">${escape(measure.subtitle)}</p>`,
    measure.description === undefined
      ? ""
      : element("blockquote", "", [markdown(measure.description)]),
    measure.if_yes === undefined && measure.if_no === undefined
      ? ""
      : element("dl", "", [
          measure.if_yes === undefined
            ? ""
            : `<dt>If it passes</dt><dd>${markdown(measure.if_yes)}</dd>`,
          measure.if_no === undefined
            ? ""
            : `<dt>If it fails</dt><dd>${markdown(measure.if_no)}</dd>`,
        ]),
    present.length === 0
      ? ""
      : element(
          "dl",
          "",
          present.map(([term, value]) => `<dt>${escape(term)}</dt><dd>${escape(value)}</dd>`),
        ),
    measure.note === undefined ? "" : markdown(measure.note),
    element("div", ' class="oval-recommendation"', [
      renderPosition(recommendation.position),
      recommendation.justification === undefined ? "" : markdown(recommendation.justification),
      recommendation.note === undefined ? "" : markdown(recommendation.note),
    ]),
  ]);
}

function renderPosition(position: "yes" | "no" | "no-position"): string {
  switch (position) {
    case "yes":
      return '<p class="oval-position oval-position-yes">Vote yes</p>';
    case "no":
      return '<p class="oval-position oval-position-no">Vote no</p>';
    case "no-position":
      return '<p class="oval-position">No position</p>';
  }
}

function list(items: string[] | undefined): string | undefined {
  if (items === undefined) {
    return undefined;
  }
  return items.length === 0 ? "None known" : items.join(", ");
}
