// Shared helper: launch the locally installed Google Chrome with puppeteer-core.
// No browser is downloaded; set CHROME_PATH to override the default macOS location.
import puppeteer from 'puppeteer-core';

export const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export async function launchChrome() {
  return puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-first-run', '--no-default-browser-check', '--disable-extensions', '--allow-file-access-from-files']
  });
}
