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
 * Combines a Date with time (HH:mm 24hr format) returning a new date
 */
export const combineDateAndTime = (datePart: Date, time: string) => {
  const timePart = parse(time, HH_mm_aka24hr, new Date());
  const combined = set(datePart, {
    hours: timePart.getHours(),
    minutes: timePart.getMinutes(),
    seconds: 0,
  });

  return combined;
};
