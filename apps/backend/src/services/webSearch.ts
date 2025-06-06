import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { DUCK_DUCK_GO_BASE_URL } from '../utils/constants';

export async function performWebSearch(prompt: string): Promise<{ title: string; link: string }[]> {
  const query = encodeURIComponent(prompt);
  const res = await fetch(`${DUCK_DUCK_GO_BASE_URL}/html/?q=${query}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const results: { title: string; link: string }[] = [];

  $('.result__a').each((i, el) => {
    if (i >= 10) return false;
    const title = $(el).text();
    const link = $(el).attr('href');
    if (title && link) results.push({ title, link });
  });

  if (results.length === 0) {
    throw new Error('No search results found.');
  }

  return results;
}
