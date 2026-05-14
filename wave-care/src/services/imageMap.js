// src/services/imageMap.js
// Caminhos espelham exatamente o campo `image` do seed corrigido
// e os nomes reais dos arquivos em assets/products/

const imageMap = {
  // ─── VERÃO ────────────────────────────────────────────────────────────────
  '/products/verao-produtos/verao-shampoo.png':       require('../../assets/products/verao-produtos/verao-shampoo.png'),
  '/products/verao-produtos/verao-condicionador.png': require('../../assets/products/verao-produtos/verao-condicionador.png'),
  '/products/verao-produtos/verao-mascara.png':       require('../../assets/products/verao-produtos/verao-mascara.png'),
  '/products/verao-produtos/verao-creme.png':         require('../../assets/products/verao-produtos/verao-creme.png'),
  '/products/verao-produtos/verao-gelatina.png':      require('../../assets/products/verao-produtos/verao-gelatina.png'),
  '/products/verao-produtos/verao-oleo.png':          require('../../assets/products/verao-produtos/verao-oleo.png'),
  '/products/verao-produtos/verao-kit-1.png':         require('../../assets/products/verao-produtos/verao-kit-1.png'),
  '/products/verao-produtos/verao-kit-2.png':         require('../../assets/products/verao-produtos/verao-kit-2.png'),
  '/products/verao-produtos/verao-kit-3.png':         require('../../assets/products/verao-produtos/verao-kit-3.png'),
  '/products/verao-produtos/verao-kit-4.png':         require('../../assets/products/verao-produtos/verao-kit-4.png'),
  '/products/verao-produtos/verao-kit-5.png':         require('../../assets/products/verao-produtos/verao-kit-5.png'),
  '/products/verao-produtos/verao-kit-completo.png':  require('../../assets/products/verao-produtos/verao-kit-completo.png'),

  // ─── OUTONO ───────────────────────────────────────────────────────────────
  '/products/outono-produtos/outono-shampoo.png':       require('../../assets/products/outono-produtos/outono-shampoo.png'),
  '/products/outono-produtos/outono-condicionador.png': require('../../assets/products/outono-produtos/outono-condicionador.png'),
  '/products/outono-produtos/outono-mascara.png':       require('../../assets/products/outono-produtos/outono-mascara.png'),
  '/products/outono-produtos/outono-creme.png':         require('../../assets/products/outono-produtos/outono-creme.png'),
  '/products/outono-produtos/outono-gelatina.png':      require('../../assets/products/outono-produtos/outono-gelatina.png'),
  '/products/outono-produtos/outono-oleo.png':          require('../../assets/products/outono-produtos/outono-oleo.png'),
  '/products/outono-produtos/Autumn-kit-1.png':         require('../../assets/products/outono-produtos/Autumn-kit-1.png'),
  '/products/outono-produtos/Autumn-kit-2.png':         require('../../assets/products/outono-produtos/Autumn-kit-2.png'),
  '/products/outono-produtos/Autumn-kit-3.png':         require('../../assets/products/outono-produtos/Autumn-kit-3.png'),
  '/products/outono-produtos/Autumn-kit-4.png':         require('../../assets/products/outono-produtos/Autumn-kit-4.png'),
  '/products/outono-produtos/Autumn-kit-5.png':         require('../../assets/products/outono-produtos/Autumn-kit-5.png'),
  '/products/outono-produtos/Autumn-kit-completo.png':  require('../../assets/products/outono-produtos/Autumn-kit-completo.png'),

  // ─── INVERNO ──────────────────────────────────────────────────────────────
  '/products/inverno-produtos/inverno-shampoo.png':       require('../../assets/products/inverno-produtos/inverno-shampoo.png'),
  '/products/inverno-produtos/inverno-condicionador.png': require('../../assets/products/inverno-produtos/inverno-condicionador.png'),
  '/products/inverno-produtos/inverno-mascara.png':       require('../../assets/products/inverno-produtos/inverno-mascara.png'),
  '/products/inverno-produtos/inverno-creme.png':         require('../../assets/products/inverno-produtos/inverno-creme.png'),
  '/products/inverno-produtos/inverno-gelatina.png':      require('../../assets/products/inverno-produtos/inverno-gelatina.png'),
  '/products/inverno-produtos/inverno-oleo.png':          require('../../assets/products/inverno-produtos/inverno-oleo.png'),
  '/products/inverno-produtos/inverno-kit-1.png':         require('../../assets/products/inverno-produtos/inverno-kit-1.png'),
  '/products/inverno-produtos/inverno-kit-2.png':         require('../../assets/products/inverno-produtos/inverno-kit-2.png'),
  '/products/inverno-produtos/inverno-kit-3.png':         require('../../assets/products/inverno-produtos/inverno-kit-3.png'),
  '/products/inverno-produtos/inverno-kit-4.png':         require('../../assets/products/inverno-produtos/inverno-kit-4.png'),
  '/products/inverno-produtos/inverno-kit-5.png':         require('../../assets/products/inverno-produtos/inverno-kit-5.png'),
  '/products/inverno-produtos/inverno-kit-completo.png':  require('../../assets/products/inverno-produtos/inverno-kit-completo.png'),

  // ─── PRIMAVERA ────────────────────────────────────────────────────────────
  '/products/primavera-produtos/primavera-shampoo.png':       require('../../assets/products/primavera-produtos/primavera-shampoo.png'),
  '/products/primavera-produtos/primavera-condicionador.png': require('../../assets/products/primavera-produtos/primavera-condicionador.png'),
  '/products/primavera-produtos/primavera-mascara.png':       require('../../assets/products/primavera-produtos/primavera-mascara.png'),
  '/products/primavera-produtos/primavera-creme.png':         require('../../assets/products/primavera-produtos/primavera-creme.png'),
  '/products/primavera-produtos/primavera-gelatina.png':      require('../../assets/products/primavera-produtos/primavera-gelatina.png'),
  '/products/primavera-produtos/primavera-oleo.png':          require('../../assets/products/primavera-produtos/primavera-oleo.png'),
  '/products/primavera-produtos/primavera-kit-1.png':         require('../../assets/products/primavera-produtos/primavera-kit-1.png'),
  '/products/primavera-produtos/primavera-kit-2.png':         require('../../assets/products/primavera-produtos/primavera-kit-2.png'),
  '/products/primavera-produtos/primavera-kit-3.png':         require('../../assets/products/primavera-produtos/primavera-kit-3.png'),
  '/products/primavera-produtos/primavera-kit-4.png':         require('../../assets/products/primavera-produtos/primavera-kit-4.png'),
  '/products/primavera-produtos/primavera-kit-5.png':         require('../../assets/products/primavera-produtos/primavera-kit-5.png'),
  '/products/primavera-produtos/primavera-kit-completo.png':  require('../../assets/products/primavera-produtos/primavera-kit-completo.png'),
};

export default imageMap;