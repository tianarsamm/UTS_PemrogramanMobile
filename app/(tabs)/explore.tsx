import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Navbar from "./../../components/navbar";
import { useBikesStore } from "../../store/useBikeStore";
import * as Animatable from "react-native-animatable"; 

const initialBikes = [
  {
    id: "1",
    name: "Yamaha NMAX",
    brand: "Yamaha",
    category: "Matic",
    fuel: "Bensin",
    cc: 155,
    unit: 3,
    price: 80000,
    image: require("@/assets/images/nmax.jpeg"),
  },
  {
    id: "2",
    name: "Honda Vario 125",
    brand: "Honda",
    category: "Matic",
    fuel: "Bensin",
    cc: 125,
    unit: 1,
    price: 70000,
    image: require("@/assets/images/vario.jpeg"),
  },
  {
    id: "3",
    name: "Kawasaki Ninja 250",
    brand: "Kawasaki",
    category: "Sport",
    fuel: "Bensin",
    cc: 250,
    unit: 0,
    price: 200000,
    image: require("@/assets/images/ninja.jpeg"),
  },
  {
    id: "4",
    name: "Honda CBR 150R",
    brand: "Honda",
    category: "Sport",
    fuel: "Bensin",
    cc: 150,
    unit: 2,
    price: 150000,
    image: require("@/assets/images/cbr.jpeg"),
  },
];

export default function ListMotorScreen() {
  const { bikes, setBikes, updateBikeUnit } = useBikesStore();
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedBike, setSelectedBike] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [nama, setNama] = useState("");
  const [lamaSewa, setLamaSewa] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [fileUri, setFileUri] = useState<string | null>(null);

  useEffect(() => {
    if (!bikes || bikes.length === 0) {
      setBikes(initialBikes);
    }
  }, []);

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  const handleRent = (bike: any) => {
    if (bike.unit === 0) {
      Alert.alert("Unit Habis", `${bike.name} tidak tersedia untuk disewa.`);
      return;
    }
    setSelectedBike(bike);
    setFormVisible(true);
  };

  const handleConfirmRent = async () => {
    if (!nama || !lamaSewa) {
      Alert.alert("Error", "Harap isi semua data!");
      return;
    }

    const days = parseInt(lamaSewa);
    const totalHarga = selectedBike.price * days;

    updateBikeUnit(selectedBike.id, selectedBike.unit - 1);

    const content = `
📄 Bukti Booking Motor RentRide

Nama Penyewa : ${nama}
Motor        : ${selectedBike.name}
Merk         : ${selectedBike.brand}
Kategori     : ${selectedBike.category}
Lama Sewa    : ${days} hari
Harga / Hari : Rp ${selectedBike.price.toLocaleString()}
Total Bayar  : Rp ${totalHarga.toLocaleString()}

⚠️ Pembayaran hanya bisa dilakukan secara CASH di RentRide.
Tunjukkan bukti ini kepada admin saat pembayaran dan pengambilan unit.

Terima kasih telah menggunakan layanan RentRide 🛵
`;

    try {
      if (Platform.OS === "web") {
        const blob = new Blob([content], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        setFileUri(url);
      } else {
        const file = `${FileSystem.documentDirectory}BuktiBooking_${selectedBike.name}_${nama}.txt`;
        await FileSystem.writeAsStringAsync(file, content);
        setFileUri(file);
      }
      setSuccessModal(true);
    } catch (error) {
      Alert.alert("Gagal Membuat Bukti", (error as Error).message);
    }

    setFormVisible(false);
  };

  const handleDownloadBooking = async () => {
    if (!fileUri) return;

    try {
      if (Platform.OS === "web") {
        const a = document.createElement("a");
        a.href = fileUri;
        a.download = "BuktiBooking_RentRide.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(fileUri);
      } else {
        await Sharing.shareAsync(fileUri);
      }
      setSuccessModal(false);
      setNama("");
      setLamaSewa("");
      setSelectedBike(null);
    } catch {
      Alert.alert("Error", "Gagal mendownload bukti booking.");
    }
  };

  const filteredBikes = (bikes || []).filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByCategory = filteredBikes.reduce((groups: any, b) => {
    if (!groups[b.category]) groups[b.category] = [];
    groups[b.category].push(b);
    return groups;
  }, {});

  const renderBikeImage = (imageSource: any) => {
    if (typeof imageSource === "string") {
      return <Image source={{ uri: imageSource }} style={styles.image} resizeMode="contain" />;
    } else {
      return <Image source={imageSource} style={styles.image} resizeMode="contain" />;
    }
  };

  // Hanya tambahkan Animatable.View dengan pointerEvents="box-none" -> anak tetap menerima touch
  const renderBike = (bike: any) => (
    <Animatable.View
      key={bike.id}
      animation="fadeInUp"
      duration={600}
      style={styles.card}
      pointerEvents="box-none" // <- penting: jangan menyerap touch
    >
      {bike.image && renderBikeImage(bike.image)}
      <Text style={styles.title}>{bike.name}</Text>
      <Text style={styles.text}>Merk: {bike.brand}</Text>
      <Text style={styles.text}>Kategori: {bike.category}</Text>
      <Text style={styles.text}>
        Harga: Rp {bike.price.toLocaleString()} /hari
      </Text>
      <Text style={styles.text}>Unit Tersedia: {bike.unit}</Text>

      <TouchableOpacity
        style={[styles.button, bike.unit === 0 && styles.disabledButton]}
        disabled={bike.unit === 0}
        onPress={() => handleRent(bike)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {bike.unit === 0 ? "Tidak Tersedia" : "Sewa Motor"}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <>
      <Navbar />
      {/* wrapper halaman tetap, tapi pointerEvents default oke di sini */}
      <Animatable.View animation="fadeIn" duration={700} style={styles.container}>
        <Text style={styles.pageTitle}>Daftar Motor Tersedia</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama motor..."
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {Object.keys(groupedByCategory).length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada motor tersedia</Text>
          ) : (
            Object.keys(groupedByCategory).map((category) => {
              const isExpanded = expandedCategories.includes(category);
              return (
                <View key={category} style={{ marginTop: 15 }}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <Text style={styles.icon}>{isExpanded ? "▲" : "▼"}</Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    // wrapper kategori juga jangan menyerap touch (anak-anak tetap clickable)
                    <Animatable.View animation="fadeIn" duration={500} pointerEvents="box-none">
                      {groupedByCategory[category].map((bike: any) =>
                        renderBike(bike)
                      )}
                    </Animatable.View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </Animatable.View>

      {/* Modal Form */}
      <Modal visible={formVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Form Sewa {selectedBike?.name}
            </Text>
            <TextInput
              placeholder="Nama Penyewa"
              value={nama}
              onChangeText={setNama}
              style={styles.input}
            />
            <TextInput
              placeholder="Lama Sewa (hari)"
              keyboardType="numeric"
              value={lamaSewa}
              onChangeText={setLamaSewa}
              style={styles.input}
            />
            {lamaSewa ? (
              <Text style={styles.totalText}>
                Total: Rp{" "}
                {(selectedBike?.price * parseInt(lamaSewa)).toLocaleString()}
              </Text>
            ) : null}
            <Text style={styles.noteText}>
              ⚠️ Pembayaran hanya bisa dilakukan secara cash di RentRide.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleConfirmRent}
            >
              <Text style={styles.modalButtonText}>Sewa Sekarang</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFormVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Sukses */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successBox}>
            <Text style={styles.modalTitle}>✅ Sewa Berhasil!</Text>
            <Text style={{ textAlign: "center", marginBottom: 15 }}>
              Download bukti booking Anda dan tunjukkan ke admin RentRide saat
              pembayaran dan pengambilan unit.
            </Text>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadBooking}
            >
              <Text style={styles.downloadText}>Download Bukti Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View>
        <Text style={styles.footer}>Dibuat Oleh RentRider dengan ❤️</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 16,
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "white",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
  },
  categoryTitle: { fontSize: 18, fontWeight: "bold", color: "#2563EB" },
  icon: { fontSize: 18, color: "#2563EB" },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  text: { fontSize: 14, color: "#374151", marginTop: 4 },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  disabledButton: { backgroundColor: "#9CA3AF" },
  buttonText: { color: "white", fontWeight: "bold" },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 40,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "85%",
  },
  successBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 25,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  totalText: {
    marginTop: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  noteText: {
    marginTop: 10,
    color: "#EF4444",
    fontStyle: "italic",
  },
  modalButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  modalButtonText: { color: "white", fontWeight: "bold" },
  cancelButton: { alignItems: "center", marginTop: 10 },
  cancelText: { color: "#6B7280" },
  downloadButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  footer: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  downloadText: { color: "white", fontWeight: "bold" },
});
