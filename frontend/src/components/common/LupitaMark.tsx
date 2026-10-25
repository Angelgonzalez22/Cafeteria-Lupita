/* MARCA DE CAFETERÍA LUPITA */

import Svg, { Path } from "react-native-svg";

import { colors } from "../../constants/colors";

type LupitaMarkProps = {
  size?: number;
  color?: string;
};

export const LupitaMark = ({
  size = 88,
  color = colors.primary,
}: LupitaMarkProps) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      accessible={false}
    >
      <Path
        d="M24 43H69V65C69 77 59 83 47 83C34 83 24 76 24 65V43ZM69 47H77C90 47 90 65 77 65H70M18 90H77M35 30C24 20 44 18 35 8M51 30C40 20 60 18 51 8M67 30C56 20 76 18 67 8"
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};