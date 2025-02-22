
export const userInitials = function(username: string) {
  return username.split(' ').map(name => name[0]).join('').toUpperCase();
}
