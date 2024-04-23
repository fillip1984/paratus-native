import { Duration, format, intervalToDuration, parseISO } from "date-fns";

import { yyyyMMddHyphenated } from "@/utils/date";

export type SunInfoResponse = {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: number;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: string;
};

export type SunInfo = {
  sunrise: Date;
  sunset: Date;
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
  const formatted = 0;

  // TODO: looks like the api has been refactored and updated but somehow backward compatible???
  // provided by: https://sunrise-sunset.org/api
  // changing formatted to 1 changes response values!
  console.log({ date, latitude, longitude });
  const sunInfoResponse = await fetch(
    `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${formattedDate}&formatted=${formatted}`,
  );

  if (!sunInfoResponse.ok) {
    console.warn(
      "Error occurred while fetching sunrise/sunset info, info is nice to have so not throwing an error",
    );
    return null;
  }

  const sunInfoResponseData = (await sunInfoResponse.json()) as SunInfoResponse;

  const sunrise = parseISO(sunInfoResponseData.results.sunrise);
  const firstLight = parseISO(sunInfoResponseData.results.civil_twilight_begin);
  const sunset = parseISO(sunInfoResponseData.results.sunset);
  const lastLight = parseISO(sunInfoResponseData.results.civil_twilight_end);
  // See: https://stackoverflow.com/questions/48776140/format-a-duration-from-seconds-using-date-fns
  const dayLength = intervalToDuration({
    start: 0,
    end: sunInfoResponseData.results.day_length * 1000,
  });

  const sunInfo: SunInfo = {
    sunrise,
    sunset,
    firstLight,
    lastLight,
    dayLength,
  };

  return sunInfo;
}
