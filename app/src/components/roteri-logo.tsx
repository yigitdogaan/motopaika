import Svg, { Path } from 'react-native-svg';

const GENISLIK = 2286.5;
const YUKSEKLIK = 413.5;
const YOL =
  'M0,0 H308 A129,129 0 0 1 308,258 H283 V174 H304.5 A43.5,43.5 0 0 0 304.5,87 H87 V413.5 H0 Z M127,128.5 H214 A198,198 0 0 0 437,324.9 V413.5 H412 A285,285 0 0 1 127,128.5 Z M489,206.8 A206.8,206.8 0 1 1 902.5,206.8 A206.8,206.8 0 1 1 489,206.8 Z M576,206.8 A119.8,119.8 0 1 0 815.5,206.8 A119.8,119.8 0 1 0 576,206.8 Z M942.5,0 H1322.5 V87 H1176 V413.5 H1089 V87 H942.5 Z M1368.5,0 H1698.5 V87 H1455.5 V163.2 H1663.5 V250.2 H1455.5 V326.5 H1698.5 V413.5 H1368.5 Z M1756.5,0 H2064.5 A129,129 0 0 1 2064.5,258 H1843.5 V413.5 H1756.5 Z M1843.5,87 V171 H2064.5 A42,42 0 0 0 2064.5,87 Z M1941.5,240 H2046.5 L2151.5,413.5 H2046.5 Z M2199.5,0 H2286.5 V413.5 H2199.5 Z';

/** Roteri yazı logosu (vektör). `yukseklik` px cinsinden; genişlik orana göre hesaplanır. */
export function RoteriLogo({ yukseklik = 24, renk = '#FFFFFF' }: { yukseklik?: number; renk?: string }) {
  return (
    <Svg
      width={(yukseklik * GENISLIK) / YUKSEKLIK}
      height={yukseklik}
      viewBox={`0 0 ${GENISLIK} ${YUKSEKLIK}`}
      accessibilityRole="header"
      accessibilityLabel="Roteri">
      <Path d={YOL} fill={renk} fillRule="nonzero" />
    </Svg>
  );
}
