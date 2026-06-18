// app/(tabs)/quiz.jsx  — substitui o arquivo atual
import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Dimensions, ActivityIndicator, Alert,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  FadeIn, FadeInUp, SlideInRight, SlideOutLeft,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../../contexts/UserContext";
import { submitQuiz } from "../../services/quizService";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#2D5A45", primaryDark: "#1E3D2F", primaryLight: "#3A7359",
  accent: "#C9A77C", accentLight: "#E4D4BC",
  background: "#FDFBF8", surface: "#FFFFFF", surfaceAlt: "#F7F4F0",
  text: "#1C1C1C", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
  border: "#E8E4DF", borderLight: "#F0ECE7",
  summer:    { gradient: ["#9B4B2D", "#C76B45"] },
  autumn:    { gradient: ["#5C6B3D", "#7A8B5A"] },
  winter:    { gradient: ["#2C3E50", "#4A5568"] },
  primavera: { gradient: ["#8B4A6B", "#A66A8A"] },
};

// Labels legíveis para o diagnóstico vindo do backend
const DIAGNOSIS_LABELS = {
  hydration:      "Hidratação Intensiva",
  reconstruction: "Reconstrução Capilar",
  nutrition:      "Nutrição Profunda",
  maintenance:    "Manutenção Preventiva",
};

const QUESTIONS = [
  {
    id: 1,
    question: "Como você descreveria o ambiente onde você vive ou passa mais tempo?",
    subtitle: "Isso ajuda a entender os desafios diários do seu cabelo",
    options: [
      { label: "Quente e úmido", value: "quente-umido" },
      { label: "Quente e seco",  value: "quente-seco"  },
      { label: "Frio e úmido",   value: "frio-umido"   },
      { label: "Frio e seco",    value: "frio-seco"    },
    ],
  },
  {
    id: 2,
    question: "Qual é o seu tipo de cabelo?",
    subtitle: "Selecione o que mais se aproxima da sua textura natural",
    options: [
      { label: "Liso",     value: "liso"     },
      { label: "Ondulado", value: "ondulado" },
      { label: "Cacheado", value: "cacheado" },
      { label: "Crespo",   value: "crespo"   },
    ],
  },
  {
    id: 3,
    question: "Com que frequência seu cabelo fica exposto ao sol, vento ou umidade?",
    subtitle: "A exposição ao clima impacta diretamente a saúde dos fios",
    options: [
      { label: "Quase todo dia",           value: "quase-todo-dia" },
      { label: "Algumas vezes por semana", value: "algumas-semana" },
      { label: "Raramente",                value: "raramente"      },
      { label: "Quase nunca",              value: "quase-nunca"    },
    ],
  },
  {
    id: 4,
    question: "Como seu cabelo fica após a praia?",
    subtitle: "Observe a textura e aparência nas horas seguintes",
    options: [
      { label: "Ressecado e áspero", value: "ressecado" },
      { label: "Com muito frizz",    value: "frizz"     },
      { label: "Opaco e sem brilho", value: "opaco"     },
      { label: "Fica normal",        value: "normal"    },
    ],
  },
  {
    id: 5,
    question: "Você lava o cabelo após entrar no mar?",
    subtitle: "O sal marinho pode causar danos se não for removido",
    options: [
      { label: "Sempre",             value: "sempre"   },
      { label: "Às vezes",           value: "as-vezes" },
      { label: "Raramente",          value: "raramente"},
      { label: "Nunca pensei nisso", value: "nunca"    },
    ],
  },
  {
    id: 6,
    question: "Qual a condição atual do seu cabelo?",
    subtitle: "Seja sincera na avaliação",
    options: [
      { label: "Seco e quebradiço", value: "seco"      },
      { label: "Oleoso na raiz",    value: "misto"     },
      { label: "Com pontas duplas", value: "danificado"},
      { label: "Saudável",          value: "saudavel"  },
    ],
  },
  {
    id: 7,
    question: "Faz algum tratamento químico?",
    subtitle: "Processos químicos alteram a estrutura capilar",
    options: [
      { label: "Coloração",    value: "coloracao"   },
      { label: "Progressiva",  value: "progressiva" },
      { label: "Descoloração", value: "descoloracao"},
      { label: "Nenhum",       value: "natural"     },
    ],
  },
  {
    id: 8,
    question: "Qual sua principal queixa?",
    subtitle: "O que mais te incomoda no dia a dia",
    options: [
      { label: "Falta de hidratação", value: "hidratacao" },
      { label: "Frizz",               value: "frizz"      },
      { label: "Falta de definição",  value: "definicao"  },
      { label: "Queda ou quebra",     value: "queda"      },
    ],
  },
  {
    id: 9,
    question: "Em qual estação do ano estamos agora?",
    subtitle: "Isso vai definir o kit ideal para a época atual",
    options: [
      { label: "Verão",     value: "verao",     season: "verao"     },
      { label: "Outono",    value: "outono",    season: "outono"    },
      { label: "Inverno",   value: "inverno",   season: "inverno"   },
      { label: "Primavera", value: "primavera", season: "primavera" },
    ],
  },
  {
    id: 10,
    question: "Qual estação do ano você acha mais difícil de cuidar do seu cabelo?",
    subtitle: "Queremos entender sua maior dificuldade ao longo do ano",
    options: [
      { label: "Verão",     value: "verao-dificil"     },
      { label: "Outono",    value: "outono-dificil"    },
      { label: "Inverno",   value: "inverno-dificil"   },
      { label: "Primavera", value: "primavera-dificil" },
    ],
  },
];

const SEASONAL_PRODUCTS = {
  verao:     {
    name: "Summer Protection", season: "Verão",    gradient: COLORS.summer.gradient,
    benefits: ["Proteção UV", "Hidratação Intensa", "Anti-sal marinho", "Brilho Duradouro"],
    products: ["Shampoo Summer Protection", "Condicionador Summer", "Máscara de Hidratação", "Leave-in com FPS", "Óleo Finalizador"],
    description: "Proteção completa para os dias quentes de verão. Fórmula com filtro UV e agentes anti-sal marinho.",
  },
  outono:    {
    name: "Autumn Bloom",      season: "Outono",   gradient: COLORS.autumn.gradient,
    benefits: ["Nutrição Profunda", "Fortalecimento", "Brilho Intenso", "Controle de Frizz"],
    products: ["Shampoo Autumn Bloom", "Condicionador Autumn", "Máscara Nutritiva", "Óleo de Argan", "Creme para Pentear"],
    description: "Nutrição profunda para fortalecer os fios durante a mudança de estação.",
  },
  inverno:   {
    name: "Winter Complete",   season: "Inverno",  gradient: COLORS.winter.gradient,
    benefits: ["Hidratação Profunda", "Proteção Térmica", "Antifrizz", "Brilho Duradouro"],
    products: ["Shampoo Winter Complete", "Condicionador Winter", "Máscara Hidratante", "Leave-in Protetor", "Sérum Antifrizz"],
    description: "Hidratação intensiva para combater o ressecamento típico do inverno.",
  },
  primavera: {
    name: "Primavera Bloom",   season: "Primavera",gradient: COLORS.primavera.gradient,
    benefits: ["Definição Natural", "Leveza", "Hidratação Equilibrada", "Ativação de Cachos"],
    products: ["Shampoo Primavera Bloom", "Condicionador Revitalizante", "Máscara de Definição", "Gelatina Modeladora", "Leave-in Cremoso"],
    description: "Revitalização e definição natural para cabelos ondulados e cacheados.",
  },
};

// ─── OptionCard ────────────────────────────────────────────────────────────────
function OptionCard({ option, index, onPress, isSelected, letter }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(400)} style={animStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        activeOpacity={1}
      >
        <View style={[styles.optionCard, isSelected && styles.optionCardSelected]}>
          <View style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
            <Text style={[styles.optionLetterText, isSelected && styles.optionLetterTextSelected]}>{letter}</Text>
          </View>
          <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.label}</Text>
          <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Tela de resultado ─────────────────────────────────────────────────────────
function ResultScreen({ result, backendResult, onRestart, onGoToLoja }) {
  const product   = SEASONAL_PRODUCTS[result.season] ?? SEASONAL_PRODUCTS.verao;
  const diagLabel = DIAGNOSIS_LABELS[backendResult?.diagnosis] ?? backendResult?.diagnosis ?? "Diagnóstico personalizado";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.resultContainer} showsVerticalScrollIndicator={false}>

        {/* Hero gradient */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.resultHero}>
          <LinearGradient
            colors={product.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.resultHeroGradient}
          >
            <Text style={styles.resultBadge}>Kit Recomendado</Text>
            <Text style={styles.resultProductName}>{product.name}</Text>
            <Text style={styles.resultSeason}>{product.season}</Text>

            {/* Badge diagnóstico do backend */}
            {backendResult?.diagnosis && (
              <View style={styles.diagnosisBadge}>
                <Text style={styles.diagnosisBadgeText}>🔬 {diagLabel}</Text>
              </View>
            )}

            <Text style={styles.resultDescription}>{product.description}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Kit recomendado pelo backend (nome personalizado) */}
        {backendResult?.recommendedKit && (
          <Animated.View entering={FadeInUp.delay(150).duration(400)} style={styles.kitBadgeSection}>
            <View style={styles.kitBadgeRow}>
              <Text style={styles.kitBadgeLabel}>Kit personalizado:</Text>
              <Text style={styles.kitBadgeName}>{backendResult.recommendedKit}</Text>
            </View>
          </Animated.View>
        )}

        {/* Benefícios */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Benefícios do Kit</Text>
          <View style={styles.benefitsGrid}>
            {product.benefits.map((benefit, index) => (
              <Animated.View key={index} entering={FadeInUp.delay(250 + index * 80).duration(400)} style={styles.benefitCard}>
                <LinearGradient colors={product.gradient} style={styles.benefitIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.benefitIconText}>✓</Text>
                </LinearGradient>
                <Text style={styles.benefitText}>{benefit}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Produtos */}
        <Animated.View entering={FadeInUp.delay(450).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos Inclusos</Text>
          <View style={styles.productsList}>
            {product.products.map((prod, index) => (
              <Animated.View key={index} entering={FadeInUp.delay(500 + index * 80).duration(400)} style={styles.productItem}>
                <View style={styles.productDot} />
                <Text style={styles.productItemText}>{prod}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Botões */}
        <Animated.View entering={FadeInUp.delay(700).duration(400)}>
          <TouchableOpacity style={styles.shopButton} activeOpacity={0.9} onPress={onGoToLoja}>
            <LinearGradient colors={product.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shopButtonGradient}>
              <Text style={styles.shopButtonText}>Comprar Kit {product.name}</Text>
              <Text style={styles.shopButtonArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.restartButton} onPress={onRestart} activeOpacity={0.7}>
          <Text style={styles.restartText}>Refazer diagnóstico</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function QuizScreen() {
  const router  = useRouter();
  const { user } = useUser();

  const [step,           setStep]           = useState(0);
  const [answers,        setAnswers]        = useState({});
  const [finished,       setFinished]       = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result,         setResult]         = useState(null);    // { season, answers }
  const [backendResult,  setBackendResult]  = useState(null);    // { diagnosis, scores, season, recommendedKit }
  const [submitting,     setSubmitting]     = useState(false);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(((step + 1) / QUESTIONS.length) * 100, { duration: 400 });
  }, [step]);

  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  // ── finaliza o quiz e chama o backend ─────────────────────────────────────
  const finishQuiz = useCallback(async (newAnswers) => {
    const seasonAnswer  = newAnswers[9];
    const selectedSeason = seasonAnswer?.season ?? seasonAnswer?.value ?? 'verao';

    setResult({ season: selectedSeason, answers: newAnswers });
    setFinished(true);
    setSubmitting(true);

    try {
      // cidade do usuário logado ou padrão
      const city = user?.cidade ?? 'caraguatatuba';
      const apiResult = await submitQuiz(newAnswers, city);
      setBackendResult(apiResult);

      // Salva no AsyncStorage para a aba capilar do perfil ler sem nova requisição
      await AsyncStorage.setItem(
        'wavecare_quiz_result',
        JSON.stringify({ ...apiResult, hairType: newAnswers[2]?.value, season: selectedSeason, updatedAt: new Date().toISOString() })
      );
    } catch (err) {
      console.error('Erro ao enviar quiz:', err);
      // Não bloqueia o resultado — mostra a tela mesmo sem o backend
      Alert.alert(
        'Aviso',
        'Não foi possível salvar seu resultado. Verifique sua conexão.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  function handleAnswer(option) {
    setSelectedOption(option.value);
    setTimeout(() => {
      const newAnswers = { ...answers, [step + 1]: option };
      setAnswers(newAnswers);

      if (step + 1 < QUESTIONS.length) {
        setStep(step + 1);
        setSelectedOption(null);
      } else {
        finishQuiz(newAnswers);
      }
    }, 250);
  }

  function goBack() {
    if (step > 0) { setStep(step - 1); setSelectedOption(null); }
  }

  function restartQuiz() {
    setStep(0); setAnswers({}); setFinished(false);
    setSelectedOption(null); setResult(null); setBackendResult(null);
    progress.value = 0;
  }

  // ── tela de resultado ──────────────────────────────────────────────────────
  if (finished && result) {
    if (submitting) {
      return (
        <SafeAreaView style={[styles.container, styles.loadingScreen]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Calculando seu diagnóstico...</Text>
        </SafeAreaView>
      );
    }
    return (
      <ResultScreen
        result={result}
        backendResult={backendResult}
        onRestart={restartQuiz}
        onGoToLoja={() => router.push('/(tabs)/loja')}
      />
    );
  }

  // ── tela de perguntas ──────────────────────────────────────────────────────
  const currentQuestion = QUESTIONS[step];
  const letters = ["A", "B", "C", "D"];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack} disabled={step === 0} activeOpacity={0.7}>
          <Text style={[styles.backText, step === 0 && styles.backTextDisabled]}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Wave Care</Text>
        </View>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{step + 1}/{QUESTIONS.length}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          key={step}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(200)}
          style={styles.questionSection}
        >
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>
        </Animated.View>

        <View style={styles.optionsSection}>
          {currentQuestion.options.map((option, index) => (
            <OptionCard
              key={option.value}
              option={option}
              index={index}
              letter={letters[index]}
              onPress={() => handleAnswer(option)}
              isSelected={selectedOption === option.value}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>Litoral Norte SP</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  loadingScreen: { alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { fontFamily: "Poppins_400Regular", fontSize: 16, color: COLORS.textSecondary },

  // header
  header:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backButton:    { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  backText:      { fontSize: 24, color: COLORS.text, fontWeight: "300" },
  backTextDisabled: { color: COLORS.textMuted },
  logoContainer: { flex: 1, alignItems: "center" },
  logoText:      { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: COLORS.primary, letterSpacing: 1 },
  stepIndicator: { width: 44, alignItems: "flex-end" },
  stepText:      { fontFamily: "Poppins_500Medium", fontSize: 14, color: COLORS.textMuted },

  // progress
  progressBar:  { height: 2, backgroundColor: COLORS.borderLight, marginHorizontal: 20 },
  progressFill: { height: "100%", backgroundColor: COLORS.primary },

  // content
  content:         { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20 },
  questionSection: { marginBottom: 40 },
  questionText:    { fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, color: COLORS.text, lineHeight: 36, marginBottom: 12, letterSpacing: -0.5 },
  questionSubtitle:{ fontFamily: "Poppins_400Regular", fontSize: 16, color: COLORS.textSecondary, lineHeight: 24 },
  optionsSection:  { gap: 12 },

  // option card
  optionCard:              { flexDirection: "row", alignItems: "center", paddingVertical: 18, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  optionCardSelected:      { borderColor: COLORS.primary, backgroundColor: COLORS.surfaceAlt },
  optionLetter:            { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.surfaceAlt, alignItems: "center", justifyContent: "center", marginRight: 16 },
  optionLetterSelected:    { backgroundColor: COLORS.primary },
  optionLetterText:        { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: COLORS.textSecondary },
  optionLetterTextSelected:{ color: COLORS.surface },
  optionText:              { fontFamily: "Poppins_500Medium", flex: 1, fontSize: 16, color: COLORS.text },
  optionTextSelected:      { color: COLORS.primary, fontFamily: "Poppins_600SemiBold" },
  radioOuter:              { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  radioOuterSelected:      { borderColor: COLORS.primary },
  radioInner:              { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },

  // footer
  footer:     { alignItems: "center", paddingVertical: 20 },
  footerLine: { width: 40, height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  footerText: { fontFamily: "Poppins_400Regular", fontSize: 13, color: COLORS.textMuted, letterSpacing: 2, textTransform: "uppercase" },

  // resultado
  resultContainer:     { paddingBottom: 40 },
  resultHero:          { marginBottom: 8 },
  resultHeroGradient:  { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  resultBadge:         { fontFamily: "Poppins_600SemiBold", fontSize: 12, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 },
  resultProductName:   { fontFamily: "PlayfairDisplay_700Bold", fontSize: 32, color: "#FFFFFF", marginBottom: 4, letterSpacing: -0.5 },
  resultSeason:        { fontFamily: "Poppins_400Regular", fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 12 },
  diagnosisBadge:      { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: "flex-start", marginBottom: 12 },
  diagnosisBadgeText:  { fontFamily: "Poppins_600SemiBold", fontSize: 13, color: "#fff" },
  resultDescription:   { fontFamily: "Poppins_400Regular", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 20 },

  kitBadgeSection: { marginHorizontal: 24, marginTop: 16, marginBottom: 4, padding: 14, backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border },
  kitBadgeRow:     { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  kitBadgeLabel:   { fontFamily: "Poppins_400Regular", fontSize: 13, color: COLORS.textMuted },
  kitBadgeName:    { fontFamily: "Poppins_600SemiBold", fontSize: 13, color: COLORS.primary },

  section:      { paddingHorizontal: 24, marginTop: 24, marginBottom: 8 },
  sectionTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: COLORS.text, marginBottom: 20, letterSpacing: -0.3 },

  benefitsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  benefitCard:  { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  benefitIcon:  { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  benefitIconText:{ fontFamily: "Poppins_700Bold", color: "#FFFFFF", fontSize: 12 },
  benefitText:  { fontFamily: "Poppins_500Medium", fontSize: 14, color: COLORS.text },

  productsList:    { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  productItem:     { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 12 },
  productDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  productItemText: { fontFamily: "Poppins_400Regular", fontSize: 15, color: COLORS.text },

  shopButton:         { marginHorizontal: 24, marginTop: 24, marginBottom: 12, borderRadius: 16, overflow: "hidden" },
  shopButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18, gap: 12 },
  shopButtonText:     { fontFamily: "Poppins_700Bold", fontSize: 16, color: "#FFFFFF" },
  shopButtonArrow:    { fontSize: 18, color: "#FFFFFF" },

  restartButton: { alignItems: "center", paddingVertical: 20 },
  restartText:   { fontFamily: "Poppins_500Medium", fontSize: 15, color: COLORS.textSecondary, textDecorationLine: "underline" },
});