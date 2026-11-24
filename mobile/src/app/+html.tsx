import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function RootHtml({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();
  return (
    <html {...htmlAttributes} lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#101918" />
        <meta name="color-scheme" content="dark" />
        <ScrollViewStyleReset />
        <style>{`
          html, body { background: #101918; }
          #root {
            box-sizing: border-box;
            padding: env(safe-area-inset-top) env(safe-area-inset-right)
                     env(safe-area-inset-bottom) env(safe-area-inset-left);
          }
        `}</style>
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
        <noscript>
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 12, background: '#343527', color: '#f0f3e9', zIndex: 1000 }}>
            Enable JavaScript to change scales, flute keys, and fingerings. Calculations run locally in your browser.
          </div>
        </noscript>
      </body>
    </html>
  );
}
