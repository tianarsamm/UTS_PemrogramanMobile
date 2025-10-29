import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme, colors, isDark } = useTheme();

  const themes: Array<{ value: 'light' | 'dark' | 'auto'; label: string; icon: string }> = [
    { value: 'light', label: 'Terang', icon: '☀️' },
    { value: 'dark', label: 'Gelap', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '⚙️' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Tema Aplikasi</Text>
      <View style={styles.buttonsContainer}>
        {themes.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[
              styles.button,
              { 
                backgroundColor: theme === t.value ? colors.primary : 'transparent',
                borderColor: colors.border,
              }
            ]}
            onPress={() => setTheme(t.value)}
          >
            <Text style={styles.icon}>{t.icon}</Text>
            <Text style={[
              styles.label,
              { color: theme === t.value ? '#fff' : colors.text }
            ]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});