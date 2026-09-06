# Demo sandbox

Open `https://tax-evidence-pack.sociobot.in/demo` or choose **Try it with sample
data** on the landing page. The browser demo immediately shows five realistic 2025
evidence records: four supported documents and one missing mileage log.

Its only persistent key is `demo:tax-evidence-pack:records`. It never reads or
writes any key used for a real binder. **Reset demo** removes that key and restores
the bundled sample in memory. **Start for real** returns to the desktop download.

The sample export is generated in the browser. It contains a PDF review index plus
sample original-file entries, so verifiers can inspect a complete populated output
without a passphrase, account, network service, or real documents.

The desktop app also offers **Load sample project** on its first-run screen. That
preview is read-only, remains in memory, and never opens or writes a user vault.
