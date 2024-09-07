/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
export const getBaseUrl = () => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   *
   * **NOTE**: This is only for development. In production, you'll want to set the
   * baseUrl to your production API URL.
   */
  // if (process.env.NODE_ENV === "development") {
  //   return "http://localhost:3000";
  // } else {
  // return process.env.EXPO_API_SERVER_URL;
  return "https://paratus.illizen.com";
  // }
};
