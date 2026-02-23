import { Metric } from "./metrics";

export type Severity = "low" | "med" | "high";

export function severity(
  metric: Metric,
  beforeVal: number,
  afterVal: number,
  delta: number
): Severity {
  let ratio = beforeVal > 0 ? delta / beforeVal : Infinity;
  switch (metric) {
    case "score":
      if ((beforeVal > 0 && ratio >= 0.25) || (beforeVal === 0 && afterVal >= 5)) return "high";
      return "med";
    case "commits":
      if (delta >= 5 || (beforeVal > 0 && ratio >= 0.25)) return "high";
      return "med";
    case "churn":
      if (delta >= 200 || (beforeVal > 0 && ratio >= 0.25)) return "high";
      return "med";
    case "authors":
      if (delta >= 3 || (beforeVal > 0 && ratio >= 0.5)) return "high";
      return "med";
    default:
      return "med";
  }
}
