import { defaultLocale, LOCALE_STORAGE_KEY, locales } from "@/i18n/config";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Static hosting has no server redirects, so the choice happens in the browser.
const redirectScript = `(function(){var l="${defaultLocale}";try{var s=localStorage.getItem("${LOCALE_STORAGE_KEY}");if(${JSON.stringify(locales)}.indexOf(s)>-1)l=s}catch(e){}location.replace("${basePath}/"+l+"/")})()`;

export default function RootPage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      <p>
        <a href={`${basePath}/th/`}>ภาษาไทย</a> · <a href={`${basePath}/en/`}>English</a>
      </p>
    </main>
  );
}
