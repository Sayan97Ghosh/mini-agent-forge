export function parseSearchResults(responseText: string): { title: string; url: string }[] {
  const matches = [...responseText.matchAll(/\d+\.\s(.+?)\s+\((\/\/.+?)\)/g)];
  return matches.map(([, title, url]) => ({
    title,
    url: `https:${url}`, 
  }));
}