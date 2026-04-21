export type DateInput = Date | string | number | null | undefined;

export interface FormateDateOptions {
  locale?: string | string[];
  timeZone?: string;
  dateStyle?: Intl.DateTimeFormatOptions["dateStyle"];
  timeStyle?: Intl.DateTimeFormatOptions["timeStyle"];
  weekday?: Intl.DateTimeFormatOptions["weekday"];
  year?: Intl.DateTimeFormatOptions["year"];
  month?: Intl.DateTimeFormatOptions["month"];
  day?: Intl.DateTimeFormatOptions["day"];
  hour?: Intl.DateTimeFormatOptions["hour"];
  minute?: Intl.DateTimeFormatOptions["minute"];
  second?: Intl.DateTimeFormatOptions["second"];
  hour12?: boolean;
  fallback?: string;
}

const DEFAULT_FALLBACK = "-";

function toValidDate(input: DateInput) {
  if (input === null || input === undefined || input === "") {
    return null;
  }

  const date =
    input instanceof Date ? new Date(input.getTime()) : new Date(input);

  return Number.isNaN(date.getTime()) ? null : date;
}

function buildFormatterOptions(
  options: FormateDateOptions,
): Intl.DateTimeFormatOptions {
  return {
    dateStyle: options.dateStyle,
    timeStyle: options.timeStyle,
    weekday: options.weekday,
    year: options.year,
    month: options.month,
    day: options.day,
    hour: options.hour,
    minute: options.minute,
    second: options.second,
    hour12: options.hour12,
    timeZone: options.timeZone,
  };
}

export function formateDate(
  input: DateInput,
  options: FormateDateOptions = {},
) {
  const date = toValidDate(input);

  if (!date) {
    return options.fallback ?? DEFAULT_FALLBACK;
  }

  return new Intl.DateTimeFormat(
    options.locale ?? undefined,
    buildFormatterOptions(options),
  ).format(date);
}

export function formatDate(input: DateInput, options: FormateDateOptions = {}) {
  return formateDate(input, options);
}

export default formateDate;
