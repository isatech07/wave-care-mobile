import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../contexts/UserContext";
import { useNavigation } from '@react-navigation/native';

const TABS = ["dados", "pedidos", "favoritos", "capilar"];

export default function PerfilScreen() {
  const { user, logout, updateUser } = useUser();
  const navigation = useNavigation();
  const [tab, setTab] = useState("dados");
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
  });

  if (!user) {
  return (
    <View style={styles.center}>
      <Text style={{ marginBottom: 10 }}>Você precisa estar logado</Text>
      <TouchableOpacity 
        style={styles.loginBtn}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ir para Login</Text>
      </TouchableOpacity>
    </View>
  );
}

  const getInitials = () => {
    if (!user.name) return "?";
    return user.name.slice(0, 2).toUpperCase();
  };

  const STATUS = {
    aguardando: { label: "Aguardando", color: "#f59e0b", step: 0 },
    confirmado: { label: "Confirmado", color: "#3b82f6", step: 1 },
    enviado: { label: "Enviado", color: "#8b5cf6", step: 2 },
    entregue: { label: "Entregue", color: "#10b981", step: 3 },
  };

  const steps = ["Aguardando", "Confirmado", "Enviado", "Entregue"];

  const save = () => {
    updateUser(form);
    setEditing(false);
  };

  const renderDadosTab = () => (
    <View style={styles.card}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nome</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder="Seu nome"
          />
        ) : (
          <Text style={styles.value}>{user.name || "Não informado"}</Text>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        ) : (
          <Text style={styles.value}>{user.email || "Não informado"}</Text>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Telefone</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{user.phone || "Não informado"}</Text>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Cidade</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={form.city}
            onChangeText={(text) => setForm({ ...form, city: text })}
            placeholder="Sua cidade"
          />
        ) : (
          <Text style={styles.value}>{user.city || "Não informado"}</Text>
        )}
      </View>

      {editing ? (
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={save}>
            <Text style={styles.btnText}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnCancel]}
            onPress={() => setEditing(false)}
          >
            <Text style={styles.btnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setEditing(true)}>
          <Text style={styles.edit}>✏️ Editar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPedidosTab = () => {
    if (!user.orders || user.orders.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
        </View>
      );
    }

    return (
      <View>
        {user.orders.map((order, i) => {
          const status = order.status || "aguardando";
          const config = STATUS[status] || STATUS.aguardando;
          
          return (
            <View key={i} style={styles.card}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Pedido #{order.id || i + 1}</Text>
                <View style={[styles.badge, { backgroundColor: config.color }]}>
                  <Text style={styles.badgeText}>{config.label}</Text>
                </View>
              </View>

              {/* Timeline */}
              <View style={styles.timeline}>
                {steps.map((step, idx) => (
                  <View key={idx} style={styles.step}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor:
                            idx <= config.step ? "#2d6a5a" : "#e0e0e0",
                        },
                      ]}
                    />
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              {/* Produtos */}
              {order.products && order.products.length > 0 && (
                <View style={styles.productsList}>
                  <Text style={styles.sectionTitle}>Produtos:</Text>
                  {order.products.map((p, idx) => (
                    <View key={idx} style={styles.productRow}>
                      <Text style={styles.productName}>{p.name || p}</Text>
                      <Text style={styles.productPrice}>
                        R$ {typeof p.price === 'number' ? p.price.toFixed(2) : p.price}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  R$ {typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderFavoritosTab = () => {
    if (!user.favorites || user.favorites.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum favorito adicionado</Text>
        </View>
      );
    }

    return (
      <View style={styles.grid}>
        {user.favorites.map((item, i) => (
          <View key={i} style={styles.product}>
            <View style={styles.productImage}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
            <Text style={styles.productName}>{item.name || item}</Text>
            <Text style={styles.productPrice}>
              R$ {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCapilarTab = () => (
    <View style={styles.card}>
      {user.hairProfile ? (
        <>
          <View style={styles.hairInfo}>
            <Ionicons name="water-outline" size={24} color="#2d6a5a" />
            <Text style={styles.hairLabel}>Tipo de cabelo:</Text>
            <Text style={styles.hairValue}>{user.hairProfile.type}</Text>
          </View>
          <View style={styles.hairInfo}>
            <Ionicons name="git-compare-outline" size={24} color="#2d6a5a" />
            <Text style={styles.hairLabel}>Porosidade:</Text>
            <Text style={styles.hairValue}>{user.hairProfile.porosity}</Text>
          </View>
          <View style={styles.hairInfo}>
            <Ionicons name="copy-outline" size={24} color="#2d6a5a" />
            <Text style={styles.hairLabel}>Densidade:</Text>
            <Text style={styles.hairValue}>{user.hairProfile.density}</Text>
          </View>
        </>
      ) : (
        <View style={styles.quizPrompt}>
          <Ionicons name="analytics-outline" size={50} color="#2d6a5a" />
          <Text style={styles.quizText}>Faça o quiz capilar</Text>
          <TouchableOpacity style={styles.quizBtn}>
            <Text style={styles.quizBtnText}>Começar Quiz</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.name}>{user.name || "Usuário"}</Text>
          <Text style={styles.email}>{user.email || "email@exemplo.com"}</Text>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}>
              <Text style={[styles.tab, tab === t && styles.activeTab]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TAB CONTENT */}
        {tab === "dados" && renderDadosTab()}
        {tab === "pedidos" && renderPedidosTab()}
        {tab === "favoritos" && renderFavoritosTab()}
        {tab === "capilar" && renderCapilarTab()}

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="#d32f2f" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f0",
  },

  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2d6a5a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 28,
  },

  name: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 5,
  },

  email: {
    color: "#777",
    fontSize: 14,
    marginTop: 4,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 12,
    marginHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },

  tab: {
    color: "#777",
    fontSize: 14,
    paddingHorizontal: 8,
  },

  activeTab: {
    color: "#2d6a5a",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  fieldGroup: {
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
    textTransform: "uppercase",
  },

  value: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 14,
  },

  edit: {
    color: "#2d6a5a",
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 8,
  },

  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  btnSave: {
    backgroundColor: "#2d6a5a",
  },

  btnCancel: {
    backgroundColor: "#ccc",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  orderId: {
    fontWeight: "bold",
    fontSize: 16,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },

  timeline: {
    flexDirection: "row",
    marginVertical: 16,
  },

  step: {
    flex: 1,
    alignItems: "center",
  },

  bar: {
    height: 4,
    width: "100%",
    marginBottom: 6,
    borderRadius: 2,
  },

  stepText: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
  },

  productsList: {
    marginTop: 8,
  },

  sectionTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
  },

  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  productName: {
    fontSize: 14,
    color: "#333",
  },

  productPrice: {
    fontSize: 14,
    color: "#2d6a5a",
    fontWeight: "500",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },

  totalLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },

  totalValue: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2d6a5a",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },

  product: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },

  productImage: {
    width: 80,
    height: 80,
    backgroundColor: "#f5f5f5",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  hairInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  hairLabel: {
    fontSize: 14,
    color: "#777",
    marginLeft: 12,
    width: 80,
  },

  hairValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },

  quizPrompt: {
    alignItems: "center",
    padding: 20,
  },

  quizText: {
    fontSize: 16,
    color: "#666",
    marginVertical: 12,
  },

  quizBtn: {
    backgroundColor: "#2d6a5a",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },

  quizBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },

  emptyText: {
    color: "#999",
    marginTop: 12,
    fontSize: 14,
  },

  logout: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    marginTop: 20,
    marginBottom: 30,
    gap: 8,
  },

  logoutText: {
    color: "#d32f2f",
    fontWeight: "bold",
    fontSize: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loginBtn: {
    backgroundColor: "#2d6a5a",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
});