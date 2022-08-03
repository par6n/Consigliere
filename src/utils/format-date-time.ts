import { DateTime } from 'luxon';

/**
 * Formats a Date object to a format that's acceptable for Microsoft.
 * @param {Date} dateTime
 * @return {string}
 */
export const formatDateTime = (dateTime: Date): string => {
  return DateTime.fromJSDate(dateTime).toString().substring(0, 23);
};
