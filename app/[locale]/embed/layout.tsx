/**
 * Embed layout — hides all parent site chrome (Navbar, Footer, Breadcrumbs,
 * SearchDialog, consent banners) so the embed renders as a clean, standalone
 * widget inside an iframe.
 *
 * The EmbedLayerViewer uses position:fixed to fill the viewport independently,
 * so we only need to hide chrome and reset body background here.
 */
export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Hide ALL site chrome for embed routes */
            nav,
            footer,
            [aria-label="Breadcrumbs"],
            [role="dialog"],
            [data-consent],
            [data-service-worker] {
              display: none !important;
            }

            /* Reset body so nothing bleeds through behind the fixed viewer */
            html, body {
              background: transparent !important;
              background-image: none !important;
              background-color: transparent !important;
              overflow: hidden !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          `,
        }}
      />
      {children}
    </>
  );
}
