type DateOptionProp = {
  weekday: string;
  year: string;
  month: string;
  day: string;
};

export const formatDate = function (newDate: string) {
  const date = new Date(newDate);
  const options: DateOptionProp = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-US", options);

  return formattedDate;
};
