/**
 * A Markdown body with its common indentation removed, line terminators normalized to \n, and no trailing terminator.
 */
export type Markdown = string;
/**
 * An entity identifier without its leading @.
 */
export type Identifier = string;
/**
 * One entry of a ballot: a section, contest, measure, or sub-ballot.
 */
export type BallotItem = Section | Contest | Measure | Ballot;
/**
 * The voting method, from the contest header.
 */
export type Method =
  | {
      /**
       * One of `single`, `multiple`, `ranked`, or `retention`.
       */
      kind: "single";
    }
  | {
      kind: "multiple";
      /**
       * How many candidates are elected, from `multiple`.
       */
      seats: number;
    }
  | {
      kind: "ranked";
      /**
       * How many candidates a voter may rank, from `max`, when the contest limits it.
       */
      max?: number;
    }
  | {
      kind: "retention";
    };
/**
 * Derived. What the contest's recommendation says about this campaign.
 */
export type Stance =
  | {
      /**
       * One of `support`, `oppose`, or `none`.
       */
      position: "support";
      /**
       * Zero-based index of the support tier the campaign appears in.
       */
      tier: number;
    }
  | {
      position: "oppose";
    }
  | {
      position: "none";
    };

/**
 * The canonical output of compiling an Oval document: the data model with every reference resolved, plus derived fields for renderers. Keys mirror the language's keywords.
 */
export interface CompiledGuide {
  /**
   * The major version of the Oval language the document declares in its version marker.
   */
  oval: number;
  guide: Guide;
  /**
   * Every party declared at the top level or inline, in document order.
   */
  parties: Party[];
  /**
   * Every candidate declared at the top level or inline, in document order.
   */
  candidates: Candidate[];
  /**
   * Root ballots, in presentation order.
   *
   * @minItems 1
   */
  ballots: [Ballot, ...Ballot[]];
  /**
   * Derived. Every contest and measure in ballot order, with where it sits in the tree.
   */
  questions: QuestionEntry[];
  counts: Counts;
}
/**
 * The document-level fields: what the guide is and which election it covers.
 */
export interface Guide {
  /**
   * The guide's title, from `guide`.
   */
  name: string;
  /**
   * The election as named on the ballot, from `election`.
   */
  election: string;
  /**
   * Election day as `YYYY-MM-DD`, from `date`.
   */
  date: string;
  note?: Markdown;
}
/**
 * A political party.
 */
export interface Party {
  id: Identifier;
  /**
   * The party's name as printed on the ballot.
   */
  name: string;
  /**
   * The short form printed beside candidates, from `abbreviation`.
   */
  abbreviation?: string;
  /**
   * The party's website, from `website`.
   */
  website?: string;
  note?: Markdown;
  /**
   * Derived. Identifiers of every candidate whose party this is, in document order.
   */
  candidates: Identifier[];
}
/**
 * A person who appears in one or more campaigns.
 */
export interface Candidate {
  id: Identifier;
  /**
   * The candidate's name as printed on the ballot.
   */
  name: string;
  /**
   * The occupation or title printed beside the name, from `designation`.
   */
  designation?: string;
  party?: Identifier;
  note?: Markdown;
  /**
   * Derived. Identifiers of every contest in which the candidate is a campaign member, in ballot order.
   */
  contests: Identifier[];
}
/**
 * A ballot: a root ballot or a sub-ballot for a narrower electorate.
 */
export interface Ballot {
  /**
   * Always `ballot`.
   */
  kind: "ballot";
  id: Identifier;
  /**
   * The jurisdiction or grouping the ballot covers.
   */
  title: string;
  /**
   * Who receives this ballot, from `eligibility`.
   */
  eligibility?: string;
  note?: Markdown;
  /**
   * Derived. Identifiers of the enclosing ballots, outermost first, not including this one. Empty for a root.
   */
  path: Identifier[];
  /**
   * Sections, contests, measures, and sub-ballots in ballot order.
   */
  items: BallotItem[];
}
/**
 * A titled group of contests and measures within a ballot.
 */
export interface Section {
  /**
   * Always `section`.
   */
  kind: "section";
  /**
   * The section's title as printed on the ballot.
   */
  title: string;
  note?: Markdown;
  /**
   * Contests and measures in ballot order.
   */
  items: (Contest | Measure)[];
}
/**
 * A race between campaigns for an office.
 */
export interface Contest {
  /**
   * Always `contest`.
   */
  kind: "contest";
  id: Identifier;
  /**
   * The contest as named on the ballot.
   */
  title: string;
  /**
   * A line printed under the title, from `subtitle`.
   */
  subtitle?: string;
  method: Method;
  /**
   * How votes are counted, from `tabulation`.
   */
  tabulation?: string;
  note?: Markdown;
  location: Location;
  /**
   * In ballot order. A campaign is referred to by its index in this array.
   *
   * @minItems 1
   */
  campaigns: [Campaign, ...Campaign[]];
  recommendation: ContestRecommendation;
}
/**
 * Derived. Where a question sits in the ballot tree.
 */
export interface Location {
  ballot: Identifier;
  /**
   * Title of the enclosing section, when there is one.
   */
  section?: string;
  /**
   * Identifiers of every enclosing ballot, outermost first, ending with `ballot`.
   *
   * @minItems 1
   */
  path: [Identifier, ...Identifier[]];
}
/**
 * One or more candidates running together for a contest.
 */
export interface Campaign {
  /**
   * Derived. Position in the contest's campaigns array.
   */
  index: number;
  /**
   * Derived. The members' names joined with " / ", head of ticket first.
   */
  label: string;
  head: Identifier;
  party?: Identifier;
  /**
   * The campaign's candidates, head of ticket first.
   *
   * @minItems 1
   */
  members: [Member, ...Member[]];
  /**
   * Whether the campaign currently occupies the office, from the `incumbent` flag.
   */
  incumbent: boolean;
  /**
   * Whether the campaign has ended but remains on the ballot, from the `withdrawn` flag.
   */
  withdrawn: boolean;
  /**
   * The campaign's website, from `website`.
   */
  website?: string;
  note?: Markdown;
  stance: Stance;
}
/**
 * A candidate's place on a campaign.
 */
export interface Member {
  candidate: Identifier;
  /**
   * The member's role on the ticket, from `as`.
   */
  role?: string;
  note?: Markdown;
}
/**
 * The author's recommendation on a contest.
 */
export interface ContestRecommendation {
  /**
   * Whether the author takes no position, from `recommend no-position`.
   */
  no_position: boolean;
  /**
   * Tiers as written: candidate identifiers, most preferred tier first. Empty when no_position.
   */
  support: [Identifier, ...Identifier[]][];
  /**
   * Candidate identifiers as written. Empty when no_position.
   */
  oppose: Identifier[];
  /**
   * Derived. The same tiers resolved to campaign indices.
   */
  support_campaigns: [number, ...number[]][];
  /**
   * Derived. The opposed campaigns as indices.
   */
  oppose_campaigns: number[];
  justification?: Markdown;
  note?: Markdown;
}
/**
 * A ballot measure: a question answered yes or no.
 */
export interface Measure {
  description?: Markdown;
  /**
   * Always `measure`.
   */
  kind: "measure";
  id: Identifier;
  /**
   * The measure as named on the ballot.
   */
  title: string;
  /**
   * A line printed under the title, from `subtitle`.
   */
  subtitle?: string;
  if_yes?: Markdown;
  if_no?: Markdown;
  /**
   * How the measure reached the ballot, from `placement`.
   */
  placement?: string;
  /**
   * What it takes to pass, from `tabulation`.
   */
  tabulation?: string;
  /**
   * The measure's fiscal impact, from `fiscal_impact`.
   */
  fiscal_impact?: string;
  /**
   * Organizations supporting the measure, from `supporters`. Omitted when not researched; empty when researched and none known.
   */
  supporters?: string[];
  /**
   * Organizations opposing the measure, from `opponents`. Omitted when not researched; empty when researched and none known.
   */
  opponents?: string[];
  note?: Markdown;
  location: Location;
  recommendation: MeasureRecommendation;
}
/**
 * The author's recommendation on a measure.
 */
export interface MeasureRecommendation {
  /**
   * The recommended vote, from `recommend`.
   */
  position: "yes" | "no" | "no-position";
  justification?: Markdown;
  note?: Markdown;
}
/**
 * Derived. One contest or measure in the document's flat index of questions.
 */
export interface QuestionEntry {
  /**
   * Whether the question is a `contest` or a `measure`.
   */
  kind: "contest" | "measure";
  id: Identifier;
  /**
   * The question's title.
   */
  title: string;
  location: Location;
}
/**
 * Derived. Totals across the whole document.
 */
export interface Counts {
  /**
   * Every ballot, roots and sub-ballots alike.
   */
  ballots: number;
  /**
   * Every section.
   */
  sections: number;
  /**
   * Every contest.
   */
  contests: number;
  /**
   * Every measure.
   */
  measures: number;
  /**
   * Every campaign.
   */
  campaigns: number;
  /**
   * Every candidate.
   */
  candidates: number;
  /**
   * Every party.
   */
  parties: number;
}
