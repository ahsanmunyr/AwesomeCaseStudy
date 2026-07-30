import React, { memo, useMemo } from "react";
import { Modal, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { CardWithId } from "../../types/heartstone-api/type";
import colors, { rarityColors } from "../theme/colors";
import { CustomText, CustomView } from "../shared/components";
import { useTranslation } from "../shared/i18n";
import { cleanCardText, getClassIconUrl } from "../screens/MainScreen/utils/cardFilters";
import { getCardImage } from "../assets/cardImages";

interface Props {
  card: CardWithId | null;
  cards: CardWithId[];
  onClose: () => void;
  onSelectCard: (card: CardWithId) => void;
}

const RELATED_LIMIT = 20;

const CardDetailSheet = ({ card, cards, onClose, onSelectCard }: Props) => {
  const { t } = useTranslation();

  const relatedCards = useMemo(() => {
    if (!card) {
      return [];
    }
    return cards.filter(other => other?.id !== card?.id && other.type?.slug === card.type?.slug).slice(0, RELATED_LIMIT);
  }, [card, cards]);

  if (!card) {
    return null;
  }

  console.log(card, "card");

  //   const dummyCard: Card = {
  //     collectible: 1,
  //     slug: "adorable-infestation",
  //     artistName: "Ivan Fomin",
  //     manaCost: 1,
  //     name: "Adorable Infestation",
  //     text: "Give a minion +1/+1. Summon a 1/1 Cub. Add a Cub to your hand.",
  //     flavorText: "Some cards are strong by sheer power; others draw strength from love.",
  //     duels: {
  //       relevant: true,
  //       constructed: true,
  //     },
  //     hasImage: true,
  //     hasImageGold: false,
  //     hasCropImage: true,
  //     keywords: [],
  //     rarity: {
  //       slug: "common",
  //       craftingCost: [40, 400],
  //       dustValue: [5, 50],
  //       name: "Common",
  //     },
  //     class: {
  //       slug: "hunter",
  //       name: "Hunter",
  //     },
  //     type: {
  //       slug: "spell",
  //       name: "Spell",
  //       gameModes: [],
  //     },
  //     cardSet: {
  //       name: "Scholomance Academy",
  //       slug: "scholomance-academy",
  //       type: "expansion",
  //       collectibleCount: 135,
  //       collectibleRevealedCount: 135,
  //       nonCollectibleCount: 194,
  //       nonCollectibleRevealedCount: 56,
  //     },
  //     spellSchool: null,
  //     id: "31",
  //   };

  const rarityColor = rarityColors[card.rarity?.slug] ?? colors.textMuted;
  const typeName = card.type?.name || t("card.unknownType");
  const cardText = cleanCardText(card.text);
  const flavorText = cleanCardText(card.flavorText);

  const classIconUri = getClassIconUrl(card.class?.name);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <CustomView style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} accessibilityLabel={t("detail.close")} onPress={onClose} />
        <CustomView testID="card-detail-sheet" style={styles.sheetContainer}>
          <CustomView row style={styles.header}>
            <CustomView style={styles.headerTitleContainer}>
              <CustomText variant="title" numberOfLines={1}>
                {card.name}
              </CustomText>
              <CustomText variant="caption" color={rarityColor}>
                {typeName} • {card.rarity?.name || t("card.noRarity")}
              </CustomText>
            </CustomView>

            <TouchableOpacity
              testID="card-detail-close"
              accessibilityRole="button"
              accessibilityLabel={t("detail.close")}
              style={styles.closeBtn}
              onPress={onClose}>
              <CustomText style={styles.closeBtnText}>✕</CustomText>
            </TouchableOpacity>
          </CustomView>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <CustomView row style={styles.mainRow}>
              {!!card.slug && <Image source={getCardImage(card.slug)} style={styles.cardThumbnail} resizeMode="contain" />}
              <CustomView style={styles.detailsRight}>
                <CustomView row style={styles.statsContainer}>
                  <StatBadge label={t("detail.mana")} value={card.manaCost ?? 0} color={statColors.mana} />
                  {card.attack !== undefined && <StatBadge label={t("detail.attack")} value={card.attack} color={statColors.attack} />}
                  {card.health !== undefined && <StatBadge label={t("detail.health")} value={card.health} color={statColors.health} />}
                </CustomView>

                <CustomView row style={styles.classInfo}>
                  {!!classIconUri && <Image source={{ uri: classIconUri }} style={styles.classIcon} />}
                  <CustomText variant="bodyStrong">{card.class?.name || t("card.neutralClass")}</CustomText>
                </CustomView>

                {!!card.cardSet?.name && (
                  <CustomText variant="caption" color={colors.textMuted}>
                    {t("detail.set")}: {card.cardSet.name}
                  </CustomText>
                )}
                {!!card.artistName && (
                  <CustomText variant="caption" color={colors.textMuted}>
                    {t("detail.artist")}: {card.artistName}
                  </CustomText>
                )}
              </CustomView>
            </CustomView>

            {!!cardText && (
              <CustomView style={styles.sectionBlock}>
                <CustomText variant="label" style={styles.sectionTitle}>
                  {t("detail.text")}
                </CustomText>
                <CustomText style={styles.bodyText}>{cardText}</CustomText>
              </CustomView>
            )}

            {!!flavorText && (
              <CustomView style={styles.sectionBlock}>
                <CustomText variant="label" style={styles.sectionTitle}>
                  {t("detail.flavor")}
                </CustomText>
                <CustomText style={[styles.bodyText, styles.italicText]}>{flavorText}</CustomText>
              </CustomView>
            )}
          </ScrollView>

          <CustomView style={styles.relatedSection}>
            <CustomText variant="label" style={styles.relatedTitle}>
              {t("detail.related", { type: typeName })}
            </CustomText>

            {relatedCards.length === 0 ? (
              <CustomText variant="caption" style={styles.bodyText}>
                {t("detail.noRelated", { type: typeName })}
              </CustomText>
            ) : (
              <FlashList
                horizontal
                testID="related-cards-list"
                data={relatedCards}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flashListContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    testID={`related-card-${item.slug}`}
                    accessibilityRole="button"
                    style={styles.relatedCardItem}
                    onPress={() => onSelectCard(item)}>
                    {!!item.slug && <Image source={getCardImage(item.slug)} style={styles.relatedImage} resizeMode="contain" />}
                    <CustomText variant="caption" numberOfLines={2} style={styles.relatedText}>
                      {item.name}
                    </CustomText>
                  </TouchableOpacity>
                )}
              />
            )}
          </CustomView>
        </CustomView>
      </CustomView>
    </Modal>
  );
};

const StatBadge = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <CustomView style={[styles.statBadge, { borderColor: color }]}>
    <CustomText style={[styles.statValue, { color }]}>{value}</CustomText>
    <CustomText variant="caption" style={styles.statLabel}>
      {label}
    </CustomText>
  </CustomView>
);

const statColors = {
  mana: "#0284c7",
  attack: "#d97706",
  health: "#dc2626",
} as const;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheetContainer: {
    maxHeight: "85%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 12,
  },
  header: {
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    color: colors.text,
    fontSize: 16,
  },
  scrollContent: {
    gap: 14,
    paddingVertical: 6,
  },
  mainRow: {
    gap: 16,
    alignItems: "center",
  },
  cardThumbnail: {
    width: 110,
    height: 155,
  },
  detailsRight: {
    flex: 1,
    gap: 8,
  },
  statsContainer: {
    gap: 8,
  },
  statBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
  },
  statValue: {
    fontWeight: "bold",
    fontSize: 14,
  },
  statLabel: {
    fontSize: 10,
  },
  classInfo: {
    alignItems: "center",
    gap: 8,
  },
  classIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  sectionBlock: {
    backgroundColor: colors.surfaceAlt,
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 12,
  },
  bodyText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  italicText: {
    fontStyle: "italic",
    color: colors.textMuted,
  },
  relatedSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    gap: 8,
  },
  relatedTitle: {
    fontWeight: "bold",
  },
  flashListContent: {
    paddingVertical: 10,
  },
  relatedCardItem: {
    width: 130,
    alignItems: "center",
    gap: 4,
  },
  relatedImage: {
    width: 120,
    height: 155,
  },
  relatedText: {
    textAlign: "center",
    color: colors.text,
    fontSize: 14,
    width: 110,
  },
});

export default memo(CardDetailSheet);
