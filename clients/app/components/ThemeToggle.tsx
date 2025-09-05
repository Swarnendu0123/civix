import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ThemeToggle() {
  const { theme, colorScheme, setTheme, isDark } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return 'sun.max.fill';
      case 'dark':
        return 'moon.fill';
      case 'system':
        return 'gear';
      default:
        return 'gear';
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Theme';
      default:
        return 'System Theme';
    }
  };

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const styles = createStyles(colorScheme);

  return (
    <TouchableOpacity style={styles.container} onPress={cycleTheme}>
      <View style={styles.iconContainer}>
        <IconSymbol 
          name={getThemeIcon()} 
          size={24} 
          color={Colors[colorScheme].tint} 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Theme</Text>
        <Text style={styles.subtitle}>{getThemeText()}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <IconSymbol 
          name="chevron.right" 
          size={20} 
          color={Colors[colorScheme].tabIconDefault} 
        />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors[colorScheme].background,
    borderBottomWidth: 1,
    borderBottomColor: Colors[colorScheme].tabIconDefault + '20',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors[colorScheme].tint + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});