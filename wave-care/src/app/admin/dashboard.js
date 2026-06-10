

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { create } from 'zustand';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

// ─────────────────────────────────────────────
// COLORS - Same as your app
// ─────────────────────────────────────────────

const COLORS = {
  primary: '#2D5A45',
  primaryLight: '#4A7B64',
  primaryDark: '#1E3F2F',
  background: '#FCFBFA',
  card: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#6B6B6F',
  muted: '#8E8E93',
  border: '#F0EDED',
  accent: '#F0F7F4',
  success: '#4CAF50',
  successBg: '#E8F5E9',
  warning: '#FF9800',
  warningBg: '#FFF3E0',
  danger: '#F44336',
  dangerBg: '#FFEBEE',
  info: '#2196F3',
  infoBg: '#E3F2FD',
  purple: '#9C27B0',
  purpleBg: '#F3E5F5',
};

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

const MOCK_ORDERS = [
  { id: 'ORD-001', client: 'Ana Lima', email: 'ana.lima@email.com', total: 189.90, status: 'pending', date: '2025-01-10', items: ['Shampoo Wave Care', 'Condicionador Deep'], address: 'Rua das Flores, 123 - SP' },
  { id: 'ORD-002', client: 'Carlos Melo', email: 'carlos.melo@email.com', total: 95.00, status: 'confirmed', date: '2025-01-09', items: ['Máscara Hidratante'], address: 'Av. Paulista, 1000 - SP' },
  { id: 'ORD-003', client: 'Beatriz Costa', email: 'beatriz.costa@email.com', total: 320.50, status: 'shipped', date: '2025-01-08', items: ['Kit Verão', 'Óleo Capilar'], address: 'Rua do Comércio, 55 - RJ' },
  { id: 'ORD-004', client: 'Diego Silva', email: 'diego.silva@email.com', total: 65.00, status: 'delivered', date: '2025-01-05', items: ['Finalizador Wave'], address: 'Rua Nova, 77 - MG' },
  { id: 'ORD-005', client: 'Fernanda Rocha', email: 'fernanda.rocha@email.com', total: 450.00, status: 'pending', date: '2025-01-11', items: ['Shampoo Wave Care', 'Condicionador Deep', 'Máscara Hidratante'], address: 'Rua das Acácias, 45 - SP' },
];

const MOCK_PRODUCTS = [
  { id: 'PROD-001', name: 'Shampoo Wave Care', price: 89.90, category: 'Hair Care', stock: 42, active: true },
  { id: 'PROD-002', name: 'Condicionador Deep Moisture', price: 99.90, category: 'Hair Care', stock: 5, active: true },
  { id: 'PROD-003', name: 'Máscara Hidratante Intensa', price: 149.90, category: 'Treatment', stock: 20, active: true },
  { id: 'PROD-004', name: 'Óleo Capilar Brilho', price: 75.00, category: 'Styling', stock: 0, active: false },
];

const MOCK_BLOGS = [
  { id: 'POST-001', title: 'Guia completo para cuidados capilares', excerpt: 'Aprenda as melhores práticas para manter seus cabelos saudáveis.', status: 'published', date: '2025-01-08', views: 1240, author: 'Dra. Ana Paula' },
  { id: 'POST-002', title: 'Rotina capilar para cabelos cacheados', excerpt: 'Um guia detalhado para quem busca definição e hidratação.', status: 'published', date: '2025-01-03', views: 870, author: 'Carlos Silva' },
  { id: 'POST-003', title: 'Lançamentos Coleção Inverno 2025', excerpt: 'Conheça os novos produtos para os meses mais frios.', status: 'draft', date: '2025-01-12', views: 0, author: 'Mariana Santos' },
];

const MOCK_CHATS = [
  {
    id: 'CHAT-001', clientName: 'Ana Lima', clientEmail: 'ana.lima@email.com',
    lastMessage: 'Meu pedido está com atraso na entrega?', unread: 2, status: 'open',
    messages: [
      { id: 'm1', from: 'client', text: 'Olá! Fiz o pedido ORD-001 há 5 dias e ainda não recebi.', time: '10:30' },
      { id: 'm2', from: 'admin', text: 'Olá Ana! Deixa-me verificar o status do seu pedido.', time: '10:35' },
      { id: 'm3', from: 'client', text: 'Meu pedido está com atraso na entrega?', time: '10:40' },
    ],
  },
  {
    id: 'CHAT-002', clientName: 'Carlos Melo', clientEmail: 'carlos.melo@email.com',
    lastMessage: 'Muito obrigado pelo suporte!', unread: 0, status: 'resolved',
    messages: [
      { id: 'm4', from: 'client', text: 'Gostaria de realizar uma troca de produto.', time: '09:00' },
      { id: 'm5', from: 'admin', text: 'Claro! Informe o número do pedido.', time: '09:05' },
      { id: 'm6', from: 'client', text: 'Muito obrigado pelo suporte!', time: '09:20' },
    ],
  },
];

// ─────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────

const ORDER_STATUS = {
  pending: { label: 'Pendente', bg: COLORS.warningBg, color: COLORS.warning },
  confirmed: { label: 'Confirmado', bg: COLORS.infoBg, color: COLORS.info },
  shipped: { label: 'Enviado', bg: COLORS.purpleBg, color: COLORS.purple },
  delivered: { label: 'Entregue', bg: COLORS.successBg, color: COLORS.success },
  cancelled: { label: 'Cancelado', bg: COLORS.dangerBg, color: COLORS.danger },
};

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────

const useStore = create((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  orders: [...MOCK_ORDERS],
  products: [...MOCK_PRODUCTS],
  blogs: [...MOCK_BLOGS],
  chats: [...MOCK_CHATS],
  selectedChatId: MOCK_CHATS[0]?.id,
  setSelectedChatId: (id) => set({ selectedChatId: id }),
  
  updateOrderStatus: (orderId) => {
    const { orders } = get();
    const order = orders.find(o => o.id === orderId);
    const nextStatus = NEXT_STATUS[order?.status];
    if (nextStatus) {
      set({
        orders: orders.map(o =>
          o.id === orderId ? { ...o, status: nextStatus } : o
        ),
      });
    }
  },
  
  cancelOrder: (orderId) => {
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ),
    });
  },
  
  toggleProduct: (productId) => {
    set({
      products: get().products.map(p =>
        p.id === productId ? { ...p, active: !p.active } : p
      ),
    });
  },
  
  toggleBlog: (blogId) => {
    set({
      blogs: get().blogs.map(b =>
        b.id === blogId
          ? { ...b, status: b.status === 'published' ? 'draft' : 'published' }
          : b
      ),
    });
  },
  
  sendMessage: (chatId, text) => {
    const msg = {
      id: Date.now().toString(),
      from: 'admin',
      text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    set({
      chats: get().chats.map(c =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, msg], lastMessage: text, unread: 0 }
          : c
      ),
    });
  },
  
  toggleChatStatus: (chatId) => {
    set({
      chats: get().chats.map(c =>
        c.id === chatId
          ? { ...c, status: c.status === 'open' ? 'resolved' : 'open' }
          : c
      ),
    });
  },
}));

// ─────────────────────────────────────────────
// STATUS BADGE COMPONENT
// ─────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const config = ORDER_STATUS[status] || ORDER_STATUS.pending;
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: config.color }]} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────

const StatCard = ({ title, value, icon, color }) => (
  <View style={styles.statCard}>
    <View style={styles.statCardHeader}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

// ─────────────────────────────────────────────
// DASHBOARD SCREEN
// ─────────────────────────────────────────────

const DashboardScreen = () => {
  const { orders, products, chats, setActiveTab } = useStore();
  
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeProducts = products.filter(p => p.active).length;
  const openChats = chats.filter(c => c.status === 'open').length;
  
  const recentOrders = orders.slice(0, 4);
  const recentChats = chats.slice(0, 3);
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Receita Total"
          value={`R$ ${totalRevenue.toFixed(2).replace('.', ',')}`}
          icon="cash-outline"
          color={COLORS.success}
        />
        <StatCard
          title="Pedidos Pendentes"
          value={String(pendingOrders)}
          icon="hourglass-outline"
          color={COLORS.warning}
        />
        <StatCard
          title="Produtos Ativos"
          value={String(activeProducts)}
          icon="cube-outline"
          color={COLORS.info}
        />
        <StatCard
          title="Chats Abertos"
          value={String(openChats)}
          icon="chatbubbles-outline"
          color={COLORS.purple}
        />
      </View>
      
      {/* Recent Orders */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pedidos Recentes</Text>
          <TouchableOpacity onPress={() => setActiveTab('orders')}>
            <Text style={styles.sectionLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        
        {recentOrders.map((order, index) => (
          <React.Fragment key={order.id}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.recentItem}>
              <View>
                <Text style={styles.recentItemTitle}>{order.id}</Text>
                <Text style={styles.recentItemSubtitle}>{order.client}</Text>
              </View>
              <View style={styles.recentItemRight}>
                <Text style={styles.recentItemPrice}>
                  R$ {order.total.toFixed(2).replace('.', ',')}
                </Text>
                <StatusBadge status={order.status} />
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>
      
      {/* Recent Chats */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suporte Recente</Text>
          <TouchableOpacity onPress={() => setActiveTab('chat')}>
            <Text style={styles.sectionLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        
        {recentChats.map((chat, index) => (
          <React.Fragment key={chat.id}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.chatItem}>
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>
                  {chat.clientName.charAt(0)}
                </Text>
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{chat.clientName}</Text>
                <Text style={styles.chatMessage} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
              </View>
              <View>
                {chat.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unread}</Text>
                  </View>
                )}
                <Text style={[
                  styles.chatStatus,
                  chat.status === 'open' ? styles.statusOpen : styles.statusResolved
                ]}>
                  {chat.status === 'open' ? 'Aberto' : 'Resolvido'}
                </Text>
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
};

// ─────────────────────────────────────────────
// ORDERS SCREEN
// ─────────────────────────────────────────────

const OrdersScreen = () => {
  const { orders, updateOrderStatus, cancelOrder } = useStore();
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Todos os Pedidos</Text>
          <Text style={styles.sectionCount}>{orders.length} pedidos</Text>
        </View>
        
        {orders.map((order, index) => {
          const canUpdate = NEXT_STATUS[order.status];
          const isCancellable = order.status !== 'cancelled' && order.status !== 'delivered';
          
          return (
            <React.Fragment key={order.id}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <StatusBadge status={order.status} />
                </View>
                
                <Text style={styles.orderClient}>{order.client}</Text>
                <Text style={styles.orderEmail}>{order.email}</Text>
                
                <View style={styles.orderItems}>
                  <Text style={styles.orderItemsLabel}>Itens:</Text>
                  <Text style={styles.orderItemsText}>{order.items.join(', ')}</Text>
                </View>
                
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>
                    Total: R$ {order.total.toFixed(2).replace('.', ',')}
                  </Text>
                  <View style={styles.orderActions}>
                    {canUpdate && (
                      <TouchableOpacity
                        style={styles.orderButtonPrimary}
                        onPress={() => updateOrderStatus(order.id)}
                      >
                        <Text style={styles.orderButtonText}>Atualizar</Text>
                      </TouchableOpacity>
                    )}
                    {isCancellable && (
                      <TouchableOpacity
                        style={styles.orderButtonDanger}
                        onPress={() => {
                          Alert.alert(
                            'Cancelar Pedido',
                            `Deseja cancelar o pedido ${order.id}?`,
                            [
                              { text: 'Não', style: 'cancel' },
                              { text: 'Sim', style: 'destructive', onPress: () => cancelOrder(order.id) },
                            ]
                          );
                        }}
                      >
                        <Text style={styles.orderButtonDangerText}>Cancelar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </ScrollView>
  );
};

// ─────────────────────────────────────────────
// PRODUCTS SCREEN
// ─────────────────────────────────────────────

const ProductsScreen = () => {
  const { products, toggleProduct } = useStore();
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Novo Produto</Text>
        </TouchableOpacity>
      </View>
      
      {products.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <View style={styles.productRow}>
              <Text style={styles.productPrice}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </Text>
              <Text style={[
                styles.productStock,
                product.stock === 0 && styles.stockOut,
                product.stock <= 10 && styles.stockLow,
              ]}>
                {product.stock === 0 ? 'Esgotado' : `${product.stock} unidades`}
              </Text>
            </View>
          </View>
          
          <View style={styles.productActions}>
            <TouchableOpacity
              style={[styles.productStatusBtn, product.active && styles.productActiveBtn]}
              onPress={() => toggleProduct(product.id)}
            >
              <Text style={[
                styles.productStatusText,
                product.active && styles.productActiveText
              ]}>
                {product.active ? 'Ativo' : 'Inativo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.productEditBtn}>
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// ─────────────────────────────────────────────
// BLOG SCREEN
// ─────────────────────────────────────────────

const BlogScreen = () => {
  const { blogs, toggleBlog } = useStore();
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Novo Artigo</Text>
        </TouchableOpacity>
      </View>
      
      {blogs.map((post) => (
        <View key={post.id} style={styles.blogCard}>
          <View style={styles.blogHeader}>
            <View style={[
              styles.blogStatus,
              post.status === 'published' ? styles.statusPublished : styles.statusDraft
            ]}>
              <Text style={[
                styles.blogStatusText,
                post.status === 'published' ? styles.statusPublishedText : styles.statusDraftText
              ]}>
                {post.status === 'published' ? 'Publicado' : 'Rascunho'}
              </Text>
            </View>
            <Text style={styles.blogDate}>
              {new Date(post.date).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          
          <Text style={styles.blogTitle}>{post.title}</Text>
          <Text style={styles.blogAuthor}>Por {post.author}</Text>
          <Text style={styles.blogExcerpt} numberOfLines={2}>{post.excerpt}</Text>
          
          {post.status === 'published' && (
            <Text style={styles.blogViews}>
              <Ionicons name="eye-outline" size={14} /> {post.views} visualizações
            </Text>
          )}
          
          <View style={styles.blogActions}>
            <TouchableOpacity
              style={post.status === 'published' ? styles.blogUnpublishBtn : styles.blogPublishBtn}
              onPress={() => toggleBlog(post.id)}
            >
              <Text style={post.status === 'published' ? styles.blogUnpublishText : styles.blogPublishText}>
                {post.status === 'published' ? 'Despublicar' : 'Publicar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.blogEditBtn}>
              <Text style={styles.blogEditText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// ─────────────────────────────────────────────
// CHAT SCREEN
// ─────────────────────────────────────────────

const ChatScreen = () => {
  const { chats, selectedChatId, setSelectedChatId, sendMessage, toggleChatStatus } = useStore();
  const [inputMessage, setInputMessage] = useState('');
  const [showChatList, setShowChatList] = useState(!IS_TABLET);
  const scrollRef = useRef(null);
  
  const selectedChat = chats.find(c => c.id === selectedChatId);
  
  const handleSend = () => {
    if (inputMessage.trim() && selectedChat) {
      sendMessage(selectedChat.id, inputMessage.trim());
      setInputMessage('');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };
  
  const ChatListComponent = () => (
    <View style={styles.chatList}>
      <View style={styles.chatListHeader}>
        <Text style={styles.chatListTitle}>Conversas</Text>
      </View>
      <ScrollView>
        {chats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={[styles.chatListItem, selectedChatId === chat.id && styles.chatListItemActive]}
            onPress={() => {
              setSelectedChatId(chat.id);
              if (!IS_TABLET) setShowChatList(false);
            }}
          >
            <View style={styles.chatListAvatar}>
              <Text style={styles.chatListAvatarText}>{chat.clientName.charAt(0)}</Text>
              {chat.status === 'open' && <View style={styles.chatOnlineDot} />}
            </View>
            <View style={styles.chatListInfo}>
              <View style={styles.chatListNameRow}>
                <Text style={styles.chatListName}>{chat.clientName}</Text>
                {chat.unread > 0 && (
                  <View style={styles.chatUnreadBadge}>
                    <Text style={styles.chatUnreadText}>{chat.unread}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.chatListMessage} numberOfLines={1}>{chat.lastMessage}</Text>
              <Text style={[
                styles.chatListStatus,
                chat.status === 'open' ? styles.statusOpen : styles.statusResolved
              ]}>
                {chat.status === 'open' ? 'Aberto' : 'Resolvido'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
  
  const ChatWindowComponent = () => (
    <View style={styles.chatWindow}>
      {selectedChat ? (
        <>
          <View style={styles.chatWindowHeader}>
            {!IS_TABLET && (
              <TouchableOpacity onPress={() => setShowChatList(true)} style={styles.chatBackBtn}>
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.chatWindowName}>{selectedChat.clientName}</Text>
              <Text style={styles.chatWindowEmail}>{selectedChat.clientEmail}</Text>
            </View>
            <TouchableOpacity
              style={selectedChat.status === 'open' ? styles.chatResolveBtn : styles.chatReopenBtn}
              onPress={() => toggleChatStatus(selectedChat.id)}
            >
              <Text style={selectedChat.status === 'open' ? styles.chatResolveText : styles.chatReopenText}>
                {selectedChat.status === 'open' ? 'Resolver' : 'Reabrir'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            ref={scrollRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {selectedChat.messages.map((msg) => (
              <View
                key={msg.id}
                style={[styles.messageRow, msg.from === 'admin' && styles.messageRowRight]}
              >
                {msg.from === 'client' && (
                  <View style={styles.messageAvatar}>
                    <Text style={styles.messageAvatarText}>{selectedChat.clientName.charAt(0)}</Text>
                  </View>
                )}
                <View style={[
                  styles.messageBubble,
                  msg.from === 'admin' && styles.messageBubbleAdmin
                ]}>
                  <Text style={[
                    styles.messageText,
                    msg.from === 'admin' && styles.messageTextAdmin
                  ]}>
                    {msg.text}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    msg.from === 'admin' && styles.messageTimeAdmin
                  ]}>
                    {msg.time}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Digite sua mensagem..."
                placeholderTextColor={COLORS.muted}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!inputMessage.trim()}
              >
                <Ionicons name="send" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      ) : (
        <View style={styles.emptyChat}>
          <Text style={styles.emptyChatText}>Selecione uma conversa</Text>
        </View>
      )}
    </View>
  );
  
  if (IS_TABLET) {
    return (
      <View style={styles.chatContainer}>
        <ChatListComponent />
        <ChatWindowComponent />
      </View>
    );
  }
  
  return showChatList ? <ChatListComponent /> : <ChatWindowComponent />;
};

// ─────────────────────────────────────────────
// USERS SCREEN
// ─────────────────────────────────────────────

const UsersScreen = () => (
  <View style={styles.emptyState}>
    <Ionicons name="people-outline" size={64} color={COLORS.muted} />
    <Text style={styles.emptyStateTitle}>Gestão de Usuários</Text>
    <Text style={styles.emptyStateSubtitle}>Módulo em desenvolvimento</Text>
  </View>
);

// ─────────────────────────────────────────────
// TAB NAVIGATION
// ─────────────────────────────────────────────

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { key: 'orders', label: 'Pedidos', icon: 'cube-outline' },
  { key: 'products', label: 'Produtos', icon: 'pricetag-outline' },
  { key: 'blog', label: 'Blog', icon: 'newspaper-outline' },
  { key: 'chat', label: 'Suporte', icon: 'chatbubbles-outline' },
  { key: 'users', label: 'Usuários', icon: 'people-outline' },
];

const TabBar = ({ activeTab, setActiveTab }) => {
  const { orders, chats } = useStore();
  
  const getBadge = (tabKey) => {
    if (tabKey === 'orders') return orders.filter(o => o.status === 'pending').length;
    if (tabKey === 'chat') return chats.reduce((sum, c) => sum + c.unread, 0);
    return 0;
  };
  
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const badge = getBadge(tab.key);
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={isActive ? COLORS.primary : COLORS.muted}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {badge > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function AdminDashboard() {
  const { activeTab, setActiveTab } = useStore();
  
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardScreen />;
      case 'orders': return <OrdersScreen />;
      case 'products': return <ProductsScreen />;
      case 'blog': return <BlogScreen />;
      case 'chat': return <ChatScreen />;
      case 'users': return <UsersScreen />;
      default: return <DashboardScreen />;
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Wave Care</Text>
          <Text style={styles.headerSubtitle}>Admin Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STYLES - Matching your app's aesthetic
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  headerIcon: {
    padding: 8,
  },
  
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  statCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    marginHorizontal: 6,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCardHeader: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 4,
  },
  statTitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  
  // Section Cards
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  sectionLink: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: COLORS.primary,
  },
  sectionCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  
  // Recent Items
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  recentItemTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  recentItemSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  recentItemRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  recentItemPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  
  // Chat Items
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: COLORS.primary,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  chatMessage: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  chatStatus: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  statusOpen: {
    color: COLORS.success,
  },
  statusResolved: {
    color: COLORS.muted,
  },
  
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    alignSelf: 'flex-end',
  },
  unreadText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#FFF',
  },
  
  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },
  
  // Order Card
  orderCard: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  orderClient: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
  orderEmail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemsLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
  },
  orderItemsText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.text,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  orderTotal: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: COLORS.primary,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  orderButtonPrimary: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#FFF',
  },
  orderButtonDanger: {
    backgroundColor: COLORS.dangerBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderButtonDangerText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.danger,
  },
  
  // Action Bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  addButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#FFF',
  },
  
  // Product Card
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  productCategory: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 8,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: COLORS.primary,
  },
  productStock: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.success,
  },
  stockLow: {
    color: COLORS.warning,
  },
  stockOut: {
    color: COLORS.danger,
  },
  productActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  productStatusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.dangerBg,
  },
  productActiveBtn: {
    backgroundColor: COLORS.successBg,
  },
  productStatusText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.danger,
  },
  productActiveText: {
    color: COLORS.success,
  },
  productEditBtn: {
    padding: 6,
  },
  
  // Blog Card
  blogCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  blogStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPublished: {
    backgroundColor: COLORS.successBg,
  },
  statusDraft: {
    backgroundColor: COLORS.warningBg,
  },
  blogStatusText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },
  statusPublishedText: {
    color: COLORS.success,
  },
  statusDraftText: {
    color: COLORS.warning,
  },
  blogDate: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.muted,
  },
  blogTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 6,
  },
  blogAuthor: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 8,
  },
  blogExcerpt: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  blogViews: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 12,
  },
  blogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  blogPublishBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  blogPublishText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#FFF',
  },
  blogUnpublishBtn: {
    backgroundColor: COLORS.warningBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  blogUnpublishText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.warning,
  },
  blogEditBtn: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  blogEditText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  // Chat Screen
  chatContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  chatList: {
    width: IS_TABLET ? 320 : SCREEN_WIDTH,
    backgroundColor: COLORS.card,
    borderRightWidth: IS_TABLET ? 1 : 0,
    borderRightColor: COLORS.border,
  },
  chatListHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatListTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: COLORS.text,
  },
  chatListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatListItemActive: {
    backgroundColor: COLORS.accent,
  },
  chatListAvatar: {
    position: 'relative',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatListAvatarText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: COLORS.primary,
  },
  chatOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  chatListInfo: {
    flex: 1,
  },
  chatListNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatListName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
  },
  chatListMessage: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 4,
  },
  chatListStatus: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },
  chatUnreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  chatUnreadText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#FFF',
  },
  chatWindow: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatWindowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  chatBackBtn: {
    padding: 4,
  },
  chatWindowName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  chatWindowEmail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  chatResolveBtn: {
    marginLeft: 'auto',
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chatResolveText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.success,
  },
  chatReopenBtn: {
    marginLeft: 'auto',
    backgroundColor: COLORS.warningBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chatReopenText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: COLORS.warning,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageAvatarText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.primary,
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageBubbleAdmin: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  messageText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.text,
  },
  messageTextAdmin: {
    color: '#FFF',
  },
  messageTime: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeAdmin: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.muted,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChatText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.muted,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.muted,
  },
  
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  tabItemActive: {
    // No background, just color change
  },
  tabLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: COLORS.muted,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: '20%',
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#FFF',
  },
});