interface DateOptionProp {
  weekday: "long" | "short" | "narrow";
  year: "numeric" | "2-digit";
  month: "long" | "short" | "narrow" | "numeric" | "2-digit";
  day: "numeric" | "2-digit";
}

export function formattedDate(date: Date): string {
  const options: DateOptionProp = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleString("en-US", options);
}
