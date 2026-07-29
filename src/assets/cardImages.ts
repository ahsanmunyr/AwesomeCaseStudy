import { ImageSourcePropType } from "react-native";

const CARD_IMAGES: ImageSourcePropType[] = [
  require("./1003.png"),
  require("./1006.png"),
  require("./1123.png"),
  require("./1135.png"),
  require("./1140.png"),
  require("./1142.png"),
  require("./151.png"),
  require("./1849.png"),
];

export const CARD_IMAGE_ASPECT = 375 / 518;

export function getCardImage(slug?: string): ImageSourcePropType {
  if (!slug) {
    return CARD_IMAGES[0];
  }

  let sum = 0;
  for (let index = 0; index < slug.length; index++) {
    sum += slug.charCodeAt(index);
  }

  return CARD_IMAGES[sum % CARD_IMAGES.length];
}
