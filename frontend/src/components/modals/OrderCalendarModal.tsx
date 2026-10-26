/* CALENDARIO PARA CONSULTAR PEDIDOS POR DÍA */

import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { radius, spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useOrderCalendar } from "../../hooks/pedidos/useOrderCalendar";
import { formatSelectedDay } from "../../utils/date";

type OrderCalendarModalProps = {
  visible: boolean;
  value: string;
  today: string;
  onSelect: (day: string) => void;
  onClose: () => void;
  title?: string;
};

const weekdays = ["L", "M", "X", "J", "V", "S", "D"];

export const OrderCalendarModal = ({ visible, value, today, onSelect, onClose, title = "Fecha de los pedidos" }: OrderCalendarModalProps) => {
  const calendar = useOrderCalendar(value, today, visible);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={styles.card}
          accessibilityViewIsModal
        >
          <View style={styles.heading}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar calendario"
              style={styles.button}
            >
              <Ionicons
                name="close"
                size={21}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
          <View style={styles.heading}>
            <Pressable
              onPress={calendar.previous}
              accessibilityRole="button"
              accessibilityLabel="Mes anterior"
              style={styles.button}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={colors.primary}
              />
            </Pressable>
            <Text style={styles.month}>{calendar.label}</Text>
            <Pressable
              onPress={calendar.next}
              disabled={!calendar.canNext}
              accessibilityRole="button"
              accessibilityLabel="Mes siguiente"
              accessibilityState={{ disabled: !calendar.canNext }}
              style={styles.button}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={calendar.canNext ? colors.primary : colors.disabled}
              />
            </Pressable>
          </View>
          <View style={styles.grid}>
            {weekdays.map((day, index) => (
              <Text
                key={index}
                style={styles.weekday}
              >{day}</Text>
            ))}
            {calendar.days.map((day) => (
              <View
                key={day.key}
                style={styles.cell}
              >
                {day.number !== null && (
                  <Pressable
                    onPress={() => onSelect(day.key)}
                    disabled={day.disabled}
                    accessibilityRole="button"
                    accessibilityLabel={formatSelectedDay(day.key)}
                    accessibilityState={{ disabled: day.disabled, selected: day.key === value }}
                    style={[
                      styles.day,
                      day.key === today && styles.today,
                      day.key === value && styles.selected,
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      day.disabled && styles.disabledText,
                      day.key === value && styles.selectedText,
                    ]}>{day.number}</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
          <Pressable
            onPress={() => onSelect(today)}
            accessibilityRole="button"
            style={styles.todayButton}
          >
            <Ionicons
              name="today-outline"
              size={17}
              color={colors.primary}
            />
            <Text style={styles.todayText}>Volver a hoy</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.base,
    backgroundColor: colors.backdrop,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text,
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  month: {
    flex: 1,
    textAlign: "center",
    textTransform: "capitalize",
    color: colors.text,
    fontSize: typography.size.button,
    fontWeight: typography.weight.medium,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  weekday: {
    width: "14.2857%",
    textAlign: "center",
    paddingVertical: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.size.caption,
  },
  cell: {
    width: "14.2857%",
    paddingVertical: 2,
    alignItems: "center",
  },
  day: {
    width: "100%",
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  today: {
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    color: colors.text,
    fontSize: typography.size.button,
  },
  disabledText: {
    color: colors.disabled,
  },
  selectedText: {
    color: colors.textOnPrimary,
    fontWeight: typography.weight.semibold,
  },
  todayButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  todayText: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
});
