import React, { memo } from "react";
import { StyleSheet } from "react-native";
import colors, { rarityColors } from "../theme/colors";
import { CardWithId } from "../../types/heartstone-api/type";
import { CustomText, CustomView } from "../shared/components";
import { TranslationKey, useTranslation } from "../shared/i18n";

interface Props {
  card: CardWithId;
}

/**
 * One row of the list.
 *
 * The API only tells us whether a card has an image, it gives no image URL, so
 * a card is drawn as text. The card name stays in the API language, everything
 * around it is translated.
 */
const CardItem = ({ card }: Props) => {
  const { t } = useTranslation();

  const rarityColor = rarityColors[card.rarity?.slug] ?? colors.textMuted;

  // The slugs come from the API, so TypeScript cannot know these keys in
  // advance. `defaultValue` shows the English name the server sent whenever we
  // have no translation for a slug.
  const apiName = (key: string, fallback: string) => t(key as TranslationKey, { defaultValue: fallback });

  const typeName = card.type ? apiName(`cardTypes.${card.type.slug}`, card.type.name) : t("card.unknownType");
  const className = card.class ? apiName(`cardClasses.${card.class.slug}`, card.class.name) : t("card.neutralClass");
  const rarityName = card.rarity ? apiName(`cardRarities.${card.rarity.slug}`, card.rarity.name) : t("card.noRarity");

  // Spells have no attack or health, so those two lines are optional.
  const { attack, health } = card;

  return (
    <CustomView testID={`card-${card.slug}`} row variant="card" style={styles.container}>
      <CustomView center style={styles.mana}>
        <CustomText variant="buttonPrimary">{card.manaCost ?? 0}</CustomText>
      </CustomView>

      <CustomView style={styles.body}>
        <CustomText variant="bodyStrong" numberOfLines={1}>
          {card.name}
        </CustomText>

        <CustomView row style={styles.metaRow}>
          <CustomText variant="accent">{typeName}</CustomText>
          <CustomText variant="caption" color={colors.border}>
            ·
          </CustomText>
          <CustomText variant="caption">{className}</CustomText>
          <CustomText variant="caption" color={colors.border}>
            ·
          </CustomText>
          <CustomText variant="caption" color={rarityColor}>
            {rarityName}
          </CustomText>
        </CustomView>

        {typeof attack === "number" && typeof health === "number" && (
          <CustomText variant="caption">{t("card.stats", { attack, health })}</CustomText>
        )}
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12, marginBottom: 10 },
  mana: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent },
  body: { flex: 1, gap: 3 },
  metaRow: { gap: 5, flexWrap: "wrap" },
});

// memo means a row only re-renders when its own card changes, not when the
// screen re-renders for something else (a new page, a filter change).
export default memo(CardItem);
