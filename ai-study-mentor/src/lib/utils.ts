export function toLowercaseAlphanumeric(input: string): string {
  return input
    .toLowerCase()                  // convert to lowercase
    .replace(/\s+/g, "")            // remove spaces
    .replace(/å/g, "a")             // replace å with a
    .replace(/ä/g, "a")             // replace ä with a
    .replace(/ö/g, "o")             // replace ö with o
    .replace(/[^a-z0-9-]/g, "")     // remove non-alphanumeric characters
    .replace(/-+/g, "-")            // collapse multiple hyphens
    .slice(0, 45)                   // limit to 45 characters
    .replace(/^-+|-+$/g, "");       // trim leading & trailing hyphens
}