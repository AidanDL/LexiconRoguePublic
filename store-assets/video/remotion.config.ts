import { Config } from '@remotion/cli/config';

// The downloaded headless shell crashes on this Mac; use the installed Chrome.
Config.setBrowserExecutable('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
Config.setChromeMode('headless-shell');
