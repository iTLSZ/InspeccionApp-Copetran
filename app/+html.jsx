// app/+html.jsx
// Plantilla HTML personalizada de Expo Router.
// Inyecta CSS para que en PC la app se vea dentro de un marco de celular centrado.

export default function Root({ children }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* ── Fondo de escritorio ── */
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              background-color: #09090B;
            }

            /* ── Contenedor que centra la "pantalla del celular" ── */
            #root {
              display: flex;
              justify-content: center;
              align-items: stretch;
              height: 100%;
              background-color: #09090B;
            }

            /* ── Marco del "celular" en escritorio ── */
            @media (min-width: 600px) {
              html, body {
                overflow: hidden;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
              }

              #root {
                align-items: center;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
              }

              /* El primer hijo de #root es el contenedor de la app */
              #root > div {
                width: 100%;
                max-width: 430px;
                height: 100dvh;
                max-height: 900px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7),
                            0 0 0 1px rgba(255,255,255,0.08);
                position: relative;
              }
            }

            /* ── En móvil ocupa toda la pantalla ── */
            @media (max-width: 599px) {
              html, body {
                overflow: hidden;
              }
              #root > div {
                width: 100%;
                height: 100dvh;
                border-radius: 0;
              }
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
