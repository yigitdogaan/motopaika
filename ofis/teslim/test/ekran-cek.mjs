// 390 px ekran görüntüsü: önce `cd app && npx expo export -p web`, sonra
// `npx serve -s dist -l 8081` (ayrı terminal), sonra:
//   node ofis/teslim/test/ekran-cek.mjs   (playwright + chromium kurulu olmalı)
import { chromium } from 'playwright';

const taban = process.env.TABAN ?? 'http://localhost:8081';
const yollar = ['', 'topluluk', 'ikinci-el', 'rotalar', 'etkinlik', 'sohbet'];
const tarayici = await chromium.launch();
for (const tema of ['light', 'dark']) {
  const sayfa = await tarayici.newPage({ viewport: { width: 390, height: 844 }, colorScheme: tema });
  for (const yol of yollar) {
    await sayfa.goto(`${taban}/${yol}`);
    await sayfa.waitForLoadState('networkidle');
    await sayfa.screenshot({ path: `ofis/teslim/test/ekran/${yol || 'ana'}-${tema}.png`, fullPage: true });
  }
  await sayfa.close();
}
await tarayici.close();
