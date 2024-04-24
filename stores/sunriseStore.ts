import { Duration, format, intervalToDuration, parse } from "date-fns";

import { yyyyMMddHyphenated } from "@/utils/date";

/**
 *  Raw response from api call
 */
export type SunInfoResponse = {
  results: {
    date: string;
    sunrise: string;
    sunset: string;
    first_light: string;
    last_light: string;
    dawn: string;
    dusk: string;
    solar_noon: string;
    golden_hour: string;
    day_length: string;
    timezone: string;
    utc_offset: number;
  };
  status: string;
};

/**
 * Tailored down response returned to app
 */
export type SunInfo = {
  firstLight: Date;
  lastLight: Date;
  dayLength: Duration;
};

// TODO: maybe move to a service?
export default async function fetchSunInfo(
  date: Date,
  latitude: number,
  longitude: number,
) {
  const formattedDate = format(date, yyyyMMddHyphenated);
  const apiUrl = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&date=${formattedDate}`;
  console.log({ apiUrl });
  const response = await fetch(apiUrl);

  if (!response.ok) {
    console.warn(
      "Error occurred while fetching sunrise/sunset info, info is nice to have only so not throwing an error",
    );
    return null;
  }

  const rawResponse = (await response.json()) as SunInfoResponse;
  console.log({ rawResponse });
  const firstLight = parse(
    rawResponse.results.first_light,
    "h:mm:ss a",
    new Date(),
  );
  const lastLight = parse(
    rawResponse.results.last_light,
    "h:mm:ss a",
    new Date(),
  );

  const dayLength = intervalToDuration({
    start: firstLight,
    end: lastLight,
  });

  const sunInfo: SunInfo = {
    firstLight,
    lastLight,
    dayLength,
  };

  return { sunInfo, rawResponse };
}
