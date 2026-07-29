import React, { memo } from "react";
import { StyleSheet, Image, TouchableOpacity } from "react-native";
import colors, { rarityColors } from "../theme/colors";
import { CardWithId } from "../../types/heartstone-api/type";
import { CustomText, CustomView } from "../shared/components";
import { cleanCardText, getClassIconUrl } from "../screens/MainScreen/utils/cardFilters";

interface Props {
  card: CardWithId;
  onSetData: (card: CardWithId) => void;
}

const CardItem = ({ card, onSetData }: Props) => {
  const rarityColor = rarityColors[card?.rarity?.slug] ?? colors.textMuted;
  const attack = card?.attack;
  const health = card?.health;
  const classIconUri = getClassIconUrl(card?.class?.name);

  return (
    <TouchableOpacity
      onPress={() => {
        onSetData(card);
      }}
      testID={`card-pressable-${card?.slug}`}>
      <CustomView testID={`card-${card?.slug}`} style={[styles.container, { borderLeftColor: rarityColor }]}>
        <CustomView style={styles.imageWrapper}>
          <Image source={{ uri: classIconUri }} style={styles.classAvatar} resizeMode="cover" />
          <CustomView center style={styles.manaBadge}>
            <CustomText style={styles.manaText}>{card?.manaCost ?? 0}</CustomText>
          </CustomView>
        </CustomView>

        <CustomView style={styles.body}>
          <CustomView row style={styles.titleRow}>
            <CustomText variant="bodyStrong" numberOfLines={1} style={styles.cardName}>
              {card?.name || ""}
            </CustomText>
            <CustomText variant="caption" style={styles.classText}>
              {card?.class?.name || "Neutral"}
            </CustomText>
          </CustomView>

          <CustomView row style={styles.metaRow}>
            <CustomText variant="accent" style={styles.typeTag}>
              {card?.type?.name || ""}
            </CustomText>
            {card?.rarity?.name && (
              <CustomText variant="caption" style={{ color: rarityColor, fontWeight: "600" }}>
                • {card.rarity.name}
              </CustomText>
            )}
          </CustomView>

          {!!card?.text && (
            <CustomText variant="caption" numberOfLines={2} style={styles.cardDescription}>
              {cleanCardText(card.text)}
            </CustomText>
          )}

          <CustomView row style={styles.statsRow}>
            {attack !== undefined && (
              <CustomView center style={styles.attackBadge}>
                <CustomText style={styles.statText}>⚔ {attack}</CustomText>
              </CustomView>
            )}
            {health !== undefined && (
              <CustomView center style={styles.healthBadge}>
                <CustomText style={styles.statText}>♥ {health}</CustomText>
              </CustomView>
            )}
          </CustomView>
        </CustomView>
      </CustomView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1b2130",
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  imageWrapper: {
    position: "relative",
    marginRight: 14,
  },
  classAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#334155",
    backgroundColor: "#0f172a",
  },
  manaBadge: {
    position: "absolute",
    top: -4,
    left: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0284c7",
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  manaText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  body: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardName: {
    flex: 1,
    fontSize: 15,
    color: "#f8fafc",
    marginRight: 6,
  },
  classText: {
    color: "#94a3b8",
    fontSize: 11,
  },
  metaRow: {
    alignItems: "center",
    gap: 6,
  },
  typeTag: {
    color: "#f59e0b",
    fontWeight: "600",
    fontSize: 12,
  },
  cardDescription: {
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  statsRow: {
    gap: 8,
    marginTop: 6,
  },
  attackBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#854d0e",
  },
  healthBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#991b1b",
  },
  statText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
});

export default memo(CardItem);
