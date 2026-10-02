import { Head, Html, Main, NextScript } from "next/document";

// Runs before first paint: decides whether the session intro plays and enables
// the CSS that pre-hides elements the hero choreographs (avoids a flash of
// fully-rendered content that then snaps hidden when GSAP takes over).
const bootScript = `(function(){try{var d=document.documentElement;var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var seen=false;try{seen=sessionStorage.getItem('ag-intro-seen')==='1'}catch(e){}d.dataset.intro=(r||seen)?'skip':'play';if(!r)d.classList.add('js-motion');}catch(e){}})();`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
