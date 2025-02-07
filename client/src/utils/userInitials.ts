export const userInitials = (username: string) => {
  let firstLetters = [];

  const names = username?.split(" ");
  for (const user of names) firstLetters.push(user.charAt(0).toUpperCase());
  const initials = firstLetters.toString().replaceAll(",", "");

  return initials;
};
