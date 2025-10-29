import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useBikesStore } from "../../store/useBikeStore";
import Navbar from "../../components/navbar";

export default function AdminCRUDScreen() {
  const { bikes, setBikes, updateBikeUnit } = useBikesStore();
  
  // State untuk modal tambah/edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBikeId, setCurrentBikeId] = useState<string | null>(null);
  
  // State untuk form
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    fuel: "Bensin",
    cc: "",
    unit: "",
    price: "",
    image: null as string | null,
  });

  // Ref untuk input file (web)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Request permissions saat component mount (hanya untuk mobile)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaStatus !== 'granted') {
          console.log('Media library permission denied');
        }
        
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          console.log('Camera permission denied');
        }
      })();
    }
  }, []);

  // Fungsi untuk reset form
  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      category: "",
      fuel: "Bensin",
      cc: "",
      unit: "",
      price: "",
      image: null,
    });
    setEditMode(false);
    setCurrentBikeId(null);
  };

  // Fungsi untuk handle file input di web
  const handleWebImagePick = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        Alert.alert("Error", "Harap pilih file gambar!");
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Alert.alert("Error", "Ukuran file maksimal 5MB!");
        return;
      }

      // Convert ke base64 atau blob URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, image: base64String }));
        console.log("Image selected successfully");
      };
      reader.onerror = () => {
        Alert.alert("Error", "Gagal membaca file gambar");
      };
      reader.readAsDataURL(file);
    }
  };

  // Fungsi untuk memilih gambar dari galeri (mobile)
  const pickImageMobile = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          "Izin Diperlukan", 
          "Aplikasi memerlukan izin untuk mengakses galeri foto Anda."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setFormData(prev => ({ ...prev, image: imageUri }));
        Alert.alert("Berhasil", "Gambar berhasil dipilih!");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Terjadi kesalahan saat memilih gambar");
    }
  };

  // Fungsi untuk mengambil foto dengan kamera (mobile)
  const takePhotoMobile = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          "Izin Diperlukan", 
          "Aplikasi memerlukan izin untuk mengakses kamera Anda."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setFormData(prev => ({ ...prev, image: imageUri }));
        Alert.alert("Berhasil", "Foto berhasil diambil!");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Terjadi kesalahan saat mengambil foto");
    }
  };

  // Fungsi untuk menampilkan pilihan gambar
  const showImagePickerOptions = () => {
    if (Platform.OS === 'web') {
      // Di web, langsung trigger file input
      fileInputRef.current?.click();
    } else {
      // Di mobile, tampilkan alert pilihan
      Alert.alert(
        "Pilih Gambar Motor",
        "Pilih sumber gambar",
        [
          {
            text: "Batal",
            style: "cancel"
          },
          {
            text: "Ambil Foto",
            onPress: takePhotoMobile
          },
          {
            text: "Pilih dari Galeri",
            onPress: pickImageMobile
          }
        ]
      );
    }
  };

  // Fungsi untuk membuka modal tambah
  const handleAddNew = () => {
    resetForm();
    setModalVisible(true);
  };

  // Fungsi untuk membuka modal edit
  const handleEdit = (bike: any) => {
    setFormData({
      name: bike.name,
      brand: bike.brand,
      category: bike.category,
      fuel: bike.fuel,
      cc: bike.cc.toString(),
      unit: bike.unit.toString(),
      price: bike.price.toString(),
      image: bike.image,
    });
    setCurrentBikeId(bike.id);
    setEditMode(true);
    setModalVisible(true);
  };

  // Fungsi untuk menyimpan (tambah/edit)
  const handleSave = () => {
    // Validasi input
    if (!formData.name || !formData.brand || !formData.category || 
        !formData.cc || !formData.unit || !formData.price) {
      Alert.alert("Error", "Harap isi semua field!");
      return;
    }

    if (!formData.image) {
      Alert.alert("Error", "Harap pilih gambar motor!");
      return;
    }

    const cc = parseInt(formData.cc);
    const unit = parseInt(formData.unit);
    const price = parseInt(formData.price);

    if (isNaN(cc) || isNaN(unit) || isNaN(price)) {
      Alert.alert("Error", "CC, Unit, dan Harga harus berupa angka!");
      return;
    }

    if (editMode && currentBikeId) {
      // Mode Edit
      const updatedBikes = bikes.map((bike) =>
        bike.id === currentBikeId
          ? {
              ...bike,
              name: formData.name,
              brand: formData.brand,
              category: formData.category,
              fuel: formData.fuel,
              cc,
              unit,
              price,
              image: formData.image,
            }
          : bike
      );
      setBikes(updatedBikes);
      Alert.alert("✅ Sukses", "Motor berhasil diupdate!");
    } else {
      // Mode Tambah
      const newBike = {
        id: Date.now().toString(),
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        fuel: formData.fuel,
        cc,
        unit,
        price,
        image: formData.image,
      };
      setBikes([...bikes, newBike]);
      Alert.alert("✅ Sukses", "Motor baru berhasil ditambahkan!");
    }

    setModalVisible(false);
    resetForm();
  };

  // Fungsi untuk hapus motor
  const handleDelete = (bikeId: string, bikeName: string) => {
    Alert.alert(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus ${bikeName}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            const updatedBikes = bikes.filter((bike) => bike.id !== bikeId);
            setBikes(updatedBikes);
            Alert.alert("✅ Sukses", "Motor berhasil dihapus!");
          },
        },
      ]
    );
  };

  return (
    <>
      <Navbar />
      <View style={styles.container}>
        <Text style={styles.pageTitle}>⚙️ Kelola Data Motor</Text>
        <Text style={styles.subtitle}>
          Tambah, Edit, atau Hapus data motor rental
        </Text>

        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <Text style={styles.addButtonText}>+ Tambah Motor Baru</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {bikes.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada data motor</Text>
          ) : (
            bikes.map((bike) => (
              <View key={bike.id} style={styles.card}>
                {bike.image && (
                  <Image 
                    source={typeof bike.image === 'string' ? { uri: bike.image } : bike.image} 
                    style={styles.bikeImage} 
                    resizeMode="contain"
                  />
                )}
                
                <View style={styles.cardHeader}>
                  <Text style={styles.bikeName}>{bike.name}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEdit(bike)}
                    >
                      <Text style={styles.editButtonText}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(bike.id, bike.name)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️ Hapus</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Merk:</Text>
                  <Text style={styles.value}>{bike.brand}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Kategori:</Text>
                  <Text style={styles.value}>{bike.category}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Bahan Bakar:</Text>
                  <Text style={styles.value}>{bike.fuel}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>CC:</Text>
                  <Text style={styles.value}>{bike.cc} cc</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Unit Tersedia:</Text>
                  <Text style={styles.value}>{bike.unit}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Harga/Hari:</Text>
                  <Text style={styles.value}>
                    Rp {bike.price.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          )}
          <View>
            <Text style={styles.footer}>Dibuat Oleh RentRider dengan ❤️</Text>
          </View>
        </ScrollView>
      </View>

      {/* Modal Form Tambah/Edit */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editMode ? "✏️ Edit Motor" : "➕ Tambah Motor Baru"}
              </Text>

              {/* Hidden file input for web */}
              {Platform.OS === 'web' && (
                <input
                  ref={fileInputRef as any}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleWebImagePick}
                />
              )}

              {/* Image Picker Section */}
              <View style={styles.imageSection}>
                <Text style={styles.inputLabel}>Gambar Motor *</Text>
                {formData.image ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: formData.image }} 
                      style={styles.imagePreview} 
                      resizeMode="contain"
                    />
                    <TouchableOpacity 
                      style={styles.changeImageButton}
                      onPress={showImagePickerOptions}
                    >
                      <Text style={styles.changeImageText}>🔄 Ganti Gambar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.imagePickerButton}
                    onPress={showImagePickerOptions}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.imagePickerIcon}>📷</Text>
                    <Text style={styles.imagePickerText}>
                      {Platform.OS === 'web' 
                        ? 'Klik untuk Pilih Gambar' 
                        : 'Tap untuk Pilih Gambar Motor'}
                    </Text>
                    <Text style={styles.imagePickerSubtext}>
                      {Platform.OS === 'web' 
                        ? 'Format: JPG, PNG (Max 5MB)' 
                        : 'Kamera atau Galeri'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.inputLabel}>Nama Motor *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Yamaha NMAX"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />

              <Text style={styles.inputLabel}>Merk *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Yamaha"
                value={formData.brand}
                onChangeText={(text) =>
                  setFormData({ ...formData, brand: text })
                }
              />

              <Text style={styles.inputLabel}>Kategori *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Matic, Sport"
                value={formData.category}
                onChangeText={(text) =>
                  setFormData({ ...formData, category: text })
                }
              />

              <Text style={styles.inputLabel}>Bahan Bakar *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Bensin"
                value={formData.fuel}
                onChangeText={(text) =>
                  setFormData({ ...formData, fuel: text })
                }
              />

              <Text style={styles.inputLabel}>CC (Kapasitas Mesin) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 155"
                keyboardType="numeric"
                value={formData.cc}
                onChangeText={(text) =>
                  setFormData({ ...formData, cc: text })
                }
              />

              <Text style={styles.inputLabel}>Jumlah Unit *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 5"
                keyboardType="numeric"
                value={formData.unit}
                onChangeText={(text) =>
                  setFormData({ ...formData, unit: text })
                }
              />

              <Text style={styles.inputLabel}>Harga Sewa per Hari *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 80000"
                keyboardType="numeric"
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {editMode ? "💾 Update Motor" : "💾 Simpan Motor"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>❌ Batal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
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
  addButton: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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
  bikeImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#ffffffff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bikeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    width: 120,
  },
  value: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 40,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1E3A8A",
  },
  imageSection: {
    marginBottom: 16,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: "#2563EB",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 30,
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    cursor: "pointer",
  },
  imagePickerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  imagePickerText: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 4,
  },
  imagePickerSubtext: {
    fontSize: 12,
    color: "#6B7280",
  },
  imagePreviewContainer: {
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#ffffffff",
  },
  changeImageButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  changeImageText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f9fafb",
  },
  saveButton: {
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 20,
  },
});