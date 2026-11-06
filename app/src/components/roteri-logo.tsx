import Svg, { Path } from 'react-native-svg';

const YUKSEKLIK = 413.5;
/** Harfler arasındaki eşit boşluk (logo birimi). */
const ARA = 72;
/** O ile T arası optik olarak geniş göründüğü için biraz daraltılır. */
const O_T_EK = -16;
const R_DARALTMA = 0.82; // sondaki R yatayda biraz daraltılmıştır

// Her harf: [yol, özgün sol kenar, özgün genişlik, yatay ölçek]. İlk R vurgu renginde, diğerleri `renk`tedir.
const HARFLER: { d: string; sol: number; en: number; olcek?: number; ek?: number }[] = [
  { d: 'M0,0 H308 A129,129 0 0 1 308,258 H283 V174 H304.5 A43.5,43.5 0 0 0 304.5,87 H87 V413.5 H0 Z M127,128.5 H214 A198,198 0 0 0 437,324.9 V413.5 H412 A285,285 0 0 1 127,128.5 Z', sol: 0, en: 437 },
  { d: 'M489,206.8 A206.8,206.8 0 1 1 902.5,206.8 A206.8,206.8 0 1 1 489,206.8 Z M576,206.8 A119.8,119.8 0 1 0 815.5,206.8 A119.8,119.8 0 1 0 576,206.8 Z', sol: 489, en: 413.5 },
  { ek: O_T_EK, d: 'M942.5,0 H1322.5 V87 H1176 V413.5 H1089 V87 H942.5 Z', sol: 942.5, en: 380 },
  { d: 'M1368.5,0 H1698.5 V87 H1455.5 V163.2 H1663.5 V250.2 H1455.5 V326.5 H1698.5 V413.5 H1368.5 Z', sol: 1368.5, en: 330 },
  { d: 'M1756.5,0 H2064.5 A129,129 0 0 1 2064.5,258 H1843.5 V413.5 H1756.5 Z M1843.5,87 V171 H2064.5 A42,42 0 0 0 2064.5,87 Z M1941.5,240 H2046.5 L2151.5,413.5 H2046.5 Z', sol: 1756.5, en: 437, olcek: R_DARALTMA },
  { d: 'M2243.5,0 H2330.5 V413.5 H2243.5 Z', sol: 2243.5, en: 87 },
];

// Harfleri soldan sağa, aralarında eşit ARA bırakarak diz.
let x = 0;
const YERLESIM = HARFLER.map((h) => {
  const olcek = h.olcek ?? 1;
  x += h.ek ?? 0;
  const dx = x - h.sol * olcek;
  x += h.en * olcek + ARA;
  return { ...h, olcek, dx };
});
const GENISLIK = x - ARA;

/** Roteri yazı logosu (vektör). `yukseklik` px cinsinden; ilk R `isaret` renginde, diğer harfler `renk`tedir. */
export function RoteriLogo({
  yukseklik = 24,
  renk = '#FFFFFF',
  isaret = '#FFB800',
}: {
  yukseklik?: number;
  renk?: string;
  isaret?: string;
}) {
  return (
    <Svg
      width={(yukseklik * GENISLIK) / YUKSEKLIK}
      height={yukseklik}
      viewBox={`0 0 ${GENISLIK} ${YUKSEKLIK}`}
      accessibilityRole="header"
      accessibilityLabel="Roteri">
      {YERLESIM.map((h, i) => (
        <Path
          key={i}
          d={h.d}
          fill={i === 0 ? isaret : renk}
          fillRule="nonzero"
          transform={`translate(${h.dx} 0) scale(${h.olcek} 1)`}
        />
      ))}
    </Svg>
  );
}
