## Learned User Preferences

- Reply in Chinese. Requests, explanations, and README text are written in Chinese.
- Author new commits in this repository as the GitHub account Max919-star, using this repo's local git identity only. Leave the machine-wide git config unchanged unless asked.
- Keep GitHub-facing install steps detailed enough to follow after a clone: desktop Edge unpacked load, the mobile Tampermonkey userscript, and the uBlock Origin / AdGuard filter rules.
- Crop dialog screenshots to the popup. Leave novel text and browser chrome out of the repository.

## Learned Workspace Facts

- Public repo: https://github.com/Max919-star/bilinovel-unlock on `main`. It ships an MV3 extension, `dist/bilinovel-unlock.user.js`, and `filters/ubo-adguard.txt` to dismiss the bilinovel mobile anti-adblock dialog and its scroll lock.
- The dialog shows on the mobile template, which is what Edge on Android loads. Desktop zh-CN Windows is sent to linovelib.com and does not run the check. Hosts include linovelib.com, bilinovel.com, and bilinovel.net.
- The check is obfuscated code in `/themes/zhmb/js/readtools.js`. An `adsbygoogle.js` load error or an empty `ins.adsbygoogle` slot creates `#adblock-dialog` and adds `body.no-scroll` (`overflow: hidden !important` in `/public/mesp.css`). Leave `eval`, `setInterval`, and `chapterlog.js` chapter-text handling untouched.
- The phone install path is Tampermonkey. Edge on Android does not load unpacked extensions, and the Edge mobile add-ons list is curated, so a desktop store listing does not automatically appear there. Adblock Plus rules can hide the dialog and still leave the scroll lock in place.
- Archived chapter pages and full screenshots under `research/` contain novel text and stay out of git. README images are the cropped dialogs in `docs/`.
- Live pages sit behind Cloudflare for automated browsers. Regression uses the local fixture (`node test/serve.mjs`, `node test/run.mjs`) with headless Edge and the archived scripts.
