/**
 * @fileoverview Date and time utilities for DiscoveryOS.
 * Provides type-safe date/time handling with ISO 8601 and Unix timestamps.
 */

import type { ISODate, Timestamp } from "../types/primitives.js";

/**
 * Gets current date as ISO 8601 string
 * Returns full datetime with milliseconds and Z timezone
 * @returns Current date in ISO 8601 format
 */
export function getCurrentISODate(): ISODate {
  return new Date().toISOString() as ISODate;
}

/**
 * Gets current Unix timestamp in milliseconds
 * @returns Current timestamp since Unix epoch in milliseconds
 */
export function getCurrentTimestamp(): Timestamp {
  return Date.now() as Timestamp;
}

/**
 * Formats a Date object as ISO 8601 string
 * @param date - Date to format
 * @returns ISO 8601 formatted date string
 */
export function formatISODate(date: Date): ISODate {
  return date.toISOString() as ISODate;
}

/**
 * Parses an ISO 8601 date string to Date object
 * @param isoDate - ISO 8601 date string
 * @returns Parsed Date object
 * @throws Error if date string is not valid ISO 8601
 */
export function parseISODate(isoDate: ISODate): Date {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date format: ${isoDate}`);
  }
  return date;
}

/**
 * Converts Unix timestamp to ISO 8601 date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns ISO 8601 formatted date string
 */
export function timestampToISODate(timestamp: Timestamp): ISODate {
  return new Date(timestamp).toISOString() as ISODate;
}

/**
 * Converts ISO 8601 date string to Unix timestamp
 * @param isoDate - ISO 8601 date string
 * @returns Unix timestamp in milliseconds
 */
export function isoDateToTimestamp(isoDate: ISODate): Timestamp {
  return new Date(isoDate).getTime() as Timestamp;
}

/**
 * Checks if a date string represents a past date
 * Compares against current time
 * @param isoDate - ISO 8601 date string to check
 * @returns True if date is in the past
 */
export function isPastDate(isoDate: ISODate): boolean {
  const dateTime = new Date(isoDate).getTime();
  const now = Date.now();
  return now > dateTime;
}

/**
 * Checks if a date string represents a future date
 * Compares against current time
 * @param isoDate - ISO 8601 date string to check
 * @returns True if date is in the future
 */
export function isFutureDate(isoDate: ISODate): boolean {
  const dateTime = new Date(isoDate).getTime();
  const now = Date.now();
  return dateTime > now;
}

/**
 * Calculates the difference between two dates in milliseconds
 * @param isoDate1 - First ISO 8601 date
 * @param isoDate2 - Second ISO 8601 date
 * @returns Difference in milliseconds (positive if date1 > date2)
 */
export function getDateDifference(isoDate1: ISODate, isoDate2: ISODate): number {
  const time1 = new Date(isoDate1).getTime();
  const time2 = new Date(isoDate2).getTime();
  return time1 - time2;
}

/**
 * Checks if two dates fall on the same calendar day
 * Compares year, month, and day components
 * @param isoDate1 - First ISO 8601 date
 * @param isoDate2 - Second ISO 8601 date
 * @returns True if dates are the same day
 */
export function isSameDay(isoDate1: ISODate, isoDate2: ISODate): boolean {
  const date1 = new Date(isoDate1);
  const date2 = new Date(isoDate2);
  const sameYear = date1.getUTCFullYear() === date2.getUTCFullYear();
  const sameMonth = date1.getUTCMonth() === date2.getUTCMonth();
  const sameDate = date1.getUTCDate() === date2.getUTCDate();
  return sameYear && sameMonth && sameDate;
}

/**
 * Adds days to an ISO date string
 * @param isoDate - ISO 8601 date string
 * @param days - Number of days to add (can be negative)
 * @returns New ISO 8601 date string
 */
export function addDays(isoDate: ISODate, days: number): ISODate {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString() as ISODate;
}

/**
 * Adds hours to an ISO date string
 * @param isoDate - ISO 8601 date string
 * @param hours - Number of hours to add (can be negative)
 * @returns New ISO 8601 date string
 */
export function addHours(isoDate: ISODate, hours: number): ISODate {
  const date = new Date(isoDate);
  date.setUTCHours(date.getUTCHours() + hours);
  return date.toISOString() as ISODate;
}

/**
 * Gets start of day for a given date
 * @param isoDate - ISO 8601 date string
 * @returns ISO 8601 string for start of that day (00:00:00 UTC)
 */
export function getStartOfDay(isoDate: ISODate): ISODate {
  const date = new Date(isoDate);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString() as ISODate;
}

/**
 * Gets end of day for a given date
 * @param isoDate - ISO 8601 date string
 * @returns ISO 8601 string for end of that day (23:59:59.999 UTC)
 */
export function getEndOfDay(isoDate: ISODate): ISODate {
  const date = new Date(isoDate);
  date.setUTCHours(23, 59, 59, 999);
  return date.toISOString() as ISODate;
}
