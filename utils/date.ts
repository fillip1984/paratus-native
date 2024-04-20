import { parse } from "date-fns";

export const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeStyle: "short",
});

export const MM_DD_Formatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
});

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
