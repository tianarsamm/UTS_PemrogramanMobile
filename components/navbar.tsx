import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Platform,
  Image,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null); // hover untuk desktop
  const slideAnim = useRef(new Animated.Value(300)).current; // posisi awal di kanan
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuOpen ? 0 : 300, // 0 = muncul, 300 = keluar
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [menuOpen]);

  const handleLinkPress = () => {
    if (isMobile) setMenuOpen(false);
  };

  const desktopMenuItems = [
    { title: "Beranda", href: "/" },
    { title: "Daftar Motor", href: "/explore" },
    { title: "Pengembalian", href: "/ReturnMotorScreen" },
    { title: "Kelola", href: "/AdminCRUDScreen" },
  ];

  return (
    <View style={styles.navbar}>
      {/* Logo dengan gambar */}
      <View style={styles.logoWrapper}>
        <Image
          source={require("./../assets/images/logo.png")}
          style={styles.logoImage}
        />
        <Text style={styles.logo}>RentRider</Text>
      </View>

      {/* Tombol Burger untuk Mobile */}
      {isMobile && (
        <TouchableOpacity
          style={styles.burger}
          onPress={() => setMenuOpen(!menuOpen)}
        >
          <Ionicons
            name={menuOpen ? "close" : "menu"}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      )}

      {/* Menu Desktop */}
      {!isMobile && (
        <View style={styles.navLinksDesktop}>
          {desktopMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={[
                styles.menuItem,
                hoveredIndex === index && styles.menuItemHover,
              ]}
            >
              <Link href={item.href}>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </Link>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Menu Mobile dengan animasi */}
      {isMobile && (
        <Animated.View
          style={[
            styles.navLinksMobile,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {desktopMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.link}
              onPress={handleLinkPress}
            >
              <Link href={item.href}>
                <Text style={styles.linkText}>{item.title}</Text>
              </Link>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    width: "100%",
    backgroundColor: "#1E3A8A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "relative",
    zIndex: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  logo: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  burger: {
    padding: 4,
  },
  navLinksDesktop: {
    flexDirection: "row",
    gap: 16,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderColor: "#ffffffff",
    borderWidth: 1,
    transitionDuration: "200ms", // animasi hover web
  },
  menuItemHover: {
    backgroundColor: "#6c96f0ff",
  },
  menuItemText: {
    color: "#ffffffff",
    fontWeight: "500",
    fontSize: 16,
  },
  navLinksMobile: {
    position: "absolute",
    top: Platform.OS === "web" ? 60 : 70,
    right: 0,
    backgroundColor: "#1E3A8A",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    zIndex: 100,
    elevation: 10,
    width: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  link: {
    paddingVertical: 10,
  },
  linkText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
