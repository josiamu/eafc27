export const REPO_URL = "https://github.com/josiamu/eafc27";
export const ISSUES_URL = `${REPO_URL}/issues`;
export const NEW_ISSUE_URL = `${ISSUES_URL}/new`;

/** Where GitHub Pages serves the site; metadata needs absolute URLs. */
export const SITE_URL = new URL(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`, "https://josiamu.github.io");
