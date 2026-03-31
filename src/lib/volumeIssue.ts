type VolumeIssueConfig = {
  baseYear: number;
  baseVolume: number;
};

export type VolumeIssueDetails = {
  /** Calendar year shown in the masthead (July Y or January Y). */
  year: number;
  month: number;
  monthLabel: string;
  volumeNumber: number;
  issueNumber: 1 | 2;
  periodLabel: "January-June" | "July-December";
  headerLabel: string;
};

// Volume index uses the July that starts each cycle (July → following June = one volume year).
// Example: base year 2012 → Volume 1; July 2026–Jun 2027 = one volume step.
const DEFAULT_CONFIG: VolumeIssueConfig = {
  baseYear: 2012,
  baseVolume: 1,
};

export function getVolumeNumberForYear(
  volumeStartYear: number,
  config: VolumeIssueConfig = DEFAULT_CONFIG,
) {
  return config.baseVolume + (volumeStartYear - config.baseYear);
}

/** Masthead year + issue no → July-start calendar year for that volume. */
export function getVolumeStartYearFromIssueRecord(
  yearStr: string,
  issueNoStr: string,
): number | null {
  const y = Number.parseInt(yearStr.trim(), 10);
  const n = Number.parseInt(issueNoStr.trim(), 10);
  if (!Number.isFinite(y) || !Number.isFinite(n)) return null;
  if (n !== 1 && n !== 2) return null;
  return n === 2 ? y - 1 : y;
}

export type NewIssueVolumeFields = {
  year: string;
  volume: string;
  issueNo: string;
  issueNumber: 1 | 2;
  volumeStartYear: number;
  displayYear: number;
};

/**
 * From "create issue" date: Jan–Jun → Issue 2 (Jan–Jun of that year); Jul–Dec → Issue 1 (Jul–Dec of that year).
 * Volume is shared across Issue 1 and Issue 2 in the same July–June span.
 */
export function getIssueFieldsFromPublicationDate(
  publicationDate: Date,
  config: VolumeIssueConfig = DEFAULT_CONFIG,
): NewIssueVolumeFields {
  const calYear = publicationDate.getFullYear();
  const month = publicationDate.getMonth();
  const issueNumber: 1 | 2 = month < 6 ? 2 : 1;
  const volumeStartYear = issueNumber === 1 ? calYear : calYear - 1;
  const displayYear = calYear;

  return {
    year: String(displayYear),
    volume: String(getVolumeNumberForYear(volumeStartYear, config)),
    issueNo: String(issueNumber),
    issueNumber,
    volumeStartYear,
    displayYear,
  };
}

/** Current half-issue implied by today's date (July–Dec = 1, Jan–Jun = 2 of cycle that started last July). */
export function getVolumeIssueDetails(
  inputDate: Date = new Date(),
  config: VolumeIssueConfig = DEFAULT_CONFIG,
): VolumeIssueDetails {
  const calYear = inputDate.getFullYear();
  const month = inputDate.getMonth();
  const issueNumber: 1 | 2 = month < 6 ? 2 : 1;
  const volumeStartYear = issueNumber === 1 ? calYear : calYear - 1;
  const displayYear = calYear;
  const volumeNumber = getVolumeNumberForYear(volumeStartYear, config);
  const monthLabel = issueNumber === 1 ? "July" : "January";
  const periodLabel =
    issueNumber === 1 ? ("July-December" as const) : ("January-June" as const);

  return {
    year: displayYear,
    month: issueNumber === 1 ? 6 : 0,
    monthLabel,
    volumeNumber,
    issueNumber,
    periodLabel,
    headerLabel: `Volume ${volumeNumber}, Issue ${issueNumber} (${monthLabel} ${displayYear})`,
  };
}

/** @param volumeStartYear Calendar year of the July that opens this volume (Issue 1 masthead year). */
export function getVolumeIssueByVolumeStartYear(
  volumeStartYear: number,
  issueNumber: 1 | 2,
  config: VolumeIssueConfig = DEFAULT_CONFIG,
): VolumeIssueDetails {
  const volumeNumber = getVolumeNumberForYear(volumeStartYear, config);
  const displayYear = issueNumber === 1 ? volumeStartYear : volumeStartYear + 1;
  const monthLabel = issueNumber === 1 ? "July" : "January";
  const periodLabel =
    issueNumber === 1 ? ("July-December" as const) : ("January-June" as const);

  return {
    year: displayYear,
    month: issueNumber === 1 ? 6 : 0,
    monthLabel,
    volumeNumber,
    issueNumber,
    periodLabel,
    headerLabel: `Volume ${volumeNumber}, Issue ${issueNumber} (${monthLabel} ${displayYear})`,
  };
}

export type StoredIssueDisplayLabels = {
  headerLabel: string;
  periodLabel: "January-June" | "July-December";
  volumeLabel: string;
  issueNoLabel: string;
};

type ParsedIssueTitle = {
  volume: string;
  issueNo: string;
  monthLabel: "January" | "July";
  year: string;
};

function parseIssueTitleLabels(title?: string): ParsedIssueTitle | null {
  if (!title) return null;
  const match = title
    .trim()
    .match(/^vol\.?\s*(\d+)\s*no\.?\s*(\d+)\s*\(\s*([a-zA-Z]+)\s+(\d{4})\s*\)$/i);
  if (!match) return null;

  const rawMonth = match[3].toLowerCase();
  const monthLabel: "January" | "July" = rawMonth.startsWith("jan") ? "January" : "July";

  return {
    volume: match[1],
    issueNo: match[2],
    monthLabel,
    year: match[4],
  };
}

/**
 * Current Issue page: masthead lines from admin-stored year / volume / issueNo only.
 * No "today" formula fallback — avoids stale static pages looking like fixed numbers.
 * Publication window + month in header follow issue number (1 = Jul–Dec, 2 = Jan–Jun).
 */
export function getStoredIssueDisplayLabels(issue: {
  year: string;
  volume: string;
  issueNo: string;
  title?: string;
}): StoredIssueDisplayLabels {
  const fromTitle = parseIssueTitleLabels(issue.title);
  if (fromTitle) {
    const periodLabel =
      fromTitle.monthLabel === "January"
        ? ("January-June" as const)
        : ("July-December" as const);

    return {
      headerLabel: `Volume ${fromTitle.volume}, Issue ${fromTitle.issueNo} (${fromTitle.monthLabel} ${fromTitle.year})`,
      periodLabel,
      volumeLabel: fromTitle.volume,
      issueNoLabel: fromTitle.issueNo,
    };
  }

  const yearStr = issue.year?.trim() ?? "";
  const volumeStr = issue.volume?.trim() ?? "";
  const issueNoStr = issue.issueNo?.trim() ?? "";

  const issueNoParsed = Number.parseInt(issueNoStr, 10);
  const half: 1 | 2 = issueNoParsed === 2 ? 2 : 1;

  const monthLabel = half === 2 ? "January" : "July";
  const periodLabel =
    half === 2 ? ("January-June" as const) : ("July-December" as const);

  const volumeLabel = volumeStr || "—";
  const issueNoLabel = issueNoStr || "—";
  const displayYear = yearStr || "—";

  return {
    headerLabel: `Volume ${volumeLabel}, Issue ${issueNoLabel} (${monthLabel} ${displayYear})`,
    periodLabel,
    volumeLabel,
    issueNoLabel,
  };
}
