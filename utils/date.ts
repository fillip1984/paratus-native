import { format, parse, set } from "date-fns";

export const yyyyMMddHyphenated = "yyyy-MM-dd";
export const MMddSlash = "MM/dd";
export const HH_mm_aka24hr = "HH:mm";

// TODO: probably a better way to do this
export const parseDateOrToday = (str: string) => {
  if (!str) {
    return new Date();
  }

  const d = parse(str, "MM/dd", new Date());
  if (isNaN(d.getDate())) {
    return new Date();
  }

  return d;
};

export const parseYYYY_MM_dd = (d: string) => {
  return parse(d, yyyyMMddHyphenated, new Date());
};

export const formatYYYY_MM_dd = (d: Date) => {
  const r = format(d, yyyyMMddHyphenated);
  return r;
};

export const formatMM_dd = (d: Date) => {
  return format(d, MMddSlash);
};

export const parseHH_mm = (d: string) => {
  return parse(d, HH_mm_aka24hr, new Date());
};

export const formatHH_mm = (d: Date) => {
  return format(d, HH_mm_aka24hr);
};

/**
 * Combines a Date (yyyy-MM-dd) with time (HH:mm 24hr format) returning a new date (UTC timezone)
 */
export const combineDateAndTime = (
  datePart: Date,
  time: string,
  // timezone: string,
) => {
  const timePart = parse(time, HH_mm_aka24hr, new Date());
  const combined = set(datePart, {
    hours: timePart.getHours(),
    minutes: timePart.getMinutes(),
    seconds: 0,
  });
  console.log({ datePart, timePart, combined });
  return combined;
  // const combined = datePart + "T" + timePart;
  // const result = parse(
  //   combined,
  //   yyyyMMddHyphenated + "T" + HH_mm_aka24hr,
  //   new Date(),
  // );
  // console.log({ datePart, timePart, combined });
  // return combined;
  // const timePart = parse(time, HH_mm_aka24hr, new Date());

  // const date = new Date(
  //   datePart.getFullYear(),
  //   datePart.getMonth(),
  //   datePart.getDate(),
  //   timePart.getHours(),
  //   timePart.getMinutes(),
  //   timePart.getSeconds(),
  // );
  // return date;
  // return zonedTimeToUtc(date, timezone);
};
