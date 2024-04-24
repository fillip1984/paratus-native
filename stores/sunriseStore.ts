import { Duration, format, intervalToDuration, parse } from "date-fns";

import { h_mm_ss_ampm, yyyyMMddHyphenated } from "@/utils/date";

/**
 *  Raw response from api call
 */
type SunInfoResponse = {
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
  dawn: Date;
  sunrise: Date;
  sunset: Date;
  dusk: Date;
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

  const response = await fetch(apiUrl);

  if (!response.ok) {
    console.warn(
      "Error occurred while fetching sunrise/sunset info, info is nice to have only so not throwing an error",
    );
    return null;
  }

  const rawResponse = (await response.json()) as SunInfoResponse;
  const dawn = parse(rawResponse.results.dawn, h_mm_ss_ampm, new Date());
  const sunrise = parse(rawResponse.results.sunrise, h_mm_ss_ampm, new Date());
  const sunset = parse(rawResponse.results.sunset, h_mm_ss_ampm, new Date());
  const dusk = parse(rawResponse.results.dusk, h_mm_ss_ampm, new Date());
  const dayLength = intervalToDuration({
    start: dawn,
    end: dusk,
  });

  const sunInfo: SunInfo = {
    dawn,
    sunrise,
    sunset,
    dusk,
    dayLength,
  };

  return sunInfo;
}
