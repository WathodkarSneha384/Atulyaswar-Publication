type VolumeIssueConfig = {
  baseYear: number;
  baseVolume: number;
};

export type VolumeIssueDetails = {
  year: number;
  month: number;
  monthLabel: string;
  volumeNumber: number;
  issueNumber: 1 | 2;
  periodLabel: "January-June" | "July-December";
  headerLabel: string;
};

// Example mapping required by the publication:
// 2026 -> Volume 15
// This implies base year 2012 as Volume 1.
const DEFAULT_CONFIG: VolumeIssueConfig = {
  baseYear: 2012,
  baseVolume: 1,
};

function getVolumeNumberForYear(year: number, config: VolumeIssueConfig) {
  return config.baseVolume + (year - config.baseYear);
}

function getIssueWindow(issueNumber: 1 | 2, year: number) {
  if (issueNumber === 1) {
    return {
      monthLabel: "January",
      periodLabel: "January-June" as const,
      headerLabel: `Volume ${getVolumeNumberForYear(year, DEFAULT_CONFIG)}, Issue 1 (January ${year})`,
    };
  }

  return {
    monthLabel: "July",
    periodLabel: "July-December" as const,
    headerLabel: `Volume ${getVolumeNumberForYear(year, DEFAULT_CONFIG)}, Issue 2 (July ${year})`,
  };
}

export function getVolumeIssueDetails(
  inputDate: Date = new Date(),
  config: VolumeIssueConfig = DEFAULT_CONFIG,
): VolumeIssueDetails {
  const year = inputDate.getFullYear();
  const month = inputDate.getMonth(); // 0 = January, 11 = December
  const monthLabel = inputDate.toLocaleString("en-US", { month: "long" });

  const issueNumber: 1 | 2 = month < 6 ? 1 : 2;
  const periodLabel = issueNumber === 1 ? "January-June" : "July-December";

  // Each new year increments volume by 1.
  const volumeNumber = getVolumeNumberForYear(year, config);

  return {
    year,
    month,
    monthLabel,
    volumeNumber,
    issueNumber,
    periodLabel,
    headerLabel: `Volume ${volumeNumber}, Issue ${issueNumber} (${monthLabel} ${year})`,
  };
}

export function getVolumeIssueByYearAndIssue(
  year: number,
  issueNumber: 1 | 2,
  config: VolumeIssueConfig = DEFAULT_CONFIG,
): VolumeIssueDetails {
  const month = issueNumber === 1 ? 0 : 6; // January / July
  const window = getIssueWindow(issueNumber, year);
  const volumeNumber = getVolumeNumberForYear(year, config);

  return {
    year,
    month,
    monthLabel: window.monthLabel,
    volumeNumber,
    issueNumber,
    periodLabel: window.periodLabel,
    headerLabel: `Volume ${volumeNumber}, Issue ${issueNumber} (${window.monthLabel} ${year})`,
  };
}
