import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import Navbar from "./../../components/navbar";
import { useBikesStore } from "../../store/useBikeStore";
import * as Animatable from "react-native-animatable"; // <= tambah ini

export default function ReturnMotorScreen() {
  const { bikes, updateBikeUnit } = useBikesStore();

  const [search, setSearch] = useState("");
  const [returnAmount, setReturnAmount] = useState<{ [key: string]: string }>(
    {}
  );

  const handleReturn = (bikeId: string) => {
    const jumlah = parseInt(returnAmount[bikeId] || "0");

    if (isNaN(jumlah) || jumlah <= 0) {
      Alert.alert("Input Salah", "Masukkan jumlah pengembalian yang valid.");
      return;
    }

    const bike = bikes.find((b) => b.id === bikeId);
    if (!bike) return;

    updateBikeUnit(bikeId, bike.unit + jumlah);
    setReturnAmount({ ...returnAmount, [bikeId]: "" });

    Alert.alert("✅ Sukses", `${jumlah} unit ${bike.name} berhasil dikembalikan!`);
  };

  const filteredBikes = bikes.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      {/* Animasi masuk seluruh halaman */}
      <Animatable.View animation="fadeIn" duration={600} style={styles.container}>
        <Text style={styles.pageTitle}>Pengembalian Motor</Text>
        <Text style={styles.subtitle}>
          Admin dapat menambahkan unit motor yang sudah dikembalikan.
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama motor..."
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredBikes.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada motor ditemukan</Text>
          ) : (
            filteredBikes.map((bike, index) => (
              <Animatable.View
                key={bike.id}
                animation="fadeInUp"
                duration={500}
                delay={index * 120}
                style={styles.card}
                pointerEvents="box-none" // agar tombol tetap bisa diklik ✅
              >
                <Text style={styles.bikeName}>{bike.name}</Text>
                <Text style={styles.text}>Merk: {bike.brand}</Text>
                <Text style={styles.text}>Unit Sekarang: {bike.unit}</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Jumlah unit dikembalikan"
                  keyboardType="numeric"
                  value={returnAmount[bike.id] || ""}
                  onChangeText={(text) =>
                    setReturnAmount({ ...returnAmount, [bike.id]: text })
                  }
                />

                <TouchableOpacity
                  style={styles.returnButton}
                  onPress={() => handleReturn(bike.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.returnButtonText}>Kembalikan</Text>
                </TouchableOpacity>
              </Animatable.View>
            ))
          )}
          <View>
            <Text style={styles.footer}>Dibuat Oleh RentRider dengan ❤️</Text>
          </View>
        </ScrollView>
      </Animatable.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "white",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bikeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  text: { fontSize: 14, color: "#374151", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  returnButton: {
    backgroundColor: "#22C55E",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  returnButtonText: { color: "white", fontWeight: "bold" },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
    fontSize: 16,
  },
  footer: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 20,
  },
});
