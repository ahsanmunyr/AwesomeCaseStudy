import React, { memo } from "react";
import { StyleSheet } from "react-native";
import colors, { rarityColors } from "../theme/colors";
import { Card } from "../../types/heartstone-api/type";
import { CustomText, CustomView } from "../shared/components";
import { useTranslation } from "../shared/i18n";

interface Props {
  card: Card;
}

/**
 * The API exposes only `hasImage` booleans (no image URLs), so cards are
 * rendered as text rows. Card names stay in the API's language; the metadata
 * around them is localised.
 */
const CardItem = ({ card }: Props) => {
  const { t, tApi } = useTranslation();
  const rarityColor = rarityColors[card.rarity?.slug] ?? colors.textMuted;

  const typeName = card.type ? tApi(`cardTypes.${card.type.slug}`, card.type.name) : t("card.unknownType");
  const className = card.class ? tApi(`cardClasses.${card.class.slug}`, card.class.name) : t("card.neutralClass");
  const rarityName = card.rarity ? tApi(`cardRarities.${card.rarity.slug}`, card.rarity.name) : t("card.noRarity");

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

        {typeof card.attack === "number" && typeof card.health === "number" && (
          <CustomText variant="caption" tx="card.stats" txParams={{ attack: card.attack, health: card.health }} />
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

export default memo(CardItem);
