import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import Papa from "papaparse"
import {
  Search, Upload, ChevronRight, ChevronDown, Package, Tag,
  Layers, BarChart3, X, ArrowRight, ShoppingBag,
  Folder, Zap, Building2
} from "lucide-react"

/* ── THEME ─────────────────────────────────────────────────────────── */
const T = {
  bg: "#070B12", surf: "#0C1220", card: "#111827", cardHov: "#14203A",
  bdr: "#1C2D45", bdrAcc: "#2A4A80",
  gold: "#C9A84C", goldL: "#EAC96C", goldBg: "rgba(201,168,76,0.08)", goldBdr: "rgba(201,168,76,0.25)",
  green: "#34D399", greenBg: "rgba(52,211,153,0.08)", greenBdr: "rgba(52,211,153,0.25)",
  blue: "#60A5FA", blueBg: "rgba(96,165,250,0.07)", blueBdr: "rgba(96,165,250,0.22)",
  purp: "#A78BFA", purpBg: "rgba(167,139,250,0.07)", purpBdr: "rgba(167,139,250,0.22)",
  red: "#F87171", redBg: "rgba(248,113,113,0.07)",
  txt: "#EFF4FF", sub: "#8FA3C0", mut: "#3D5270",
}

/* ── CATEGORY MAP ───────────────────────────────────────────────────── */
const CAT_MAP = {
  FASHION: {
    WOMEN: {
      CLOTHING: {
        RTW: ["Top", "Pants", "Shirt", "T-shirt", "Long dress", "Maxi dress", "Short dress", "Short", "Skirt"],
        "EVENING WEAR": ["Long dress", "Maxi dress", "Short dress", "Skirt", "Pants", "Top", "Jacket"],
        LOUNGEWEAR: ["Shirt", "Pants", "Top", "Short"],
        PJS: ["Shirts", "Pants", "Short", "Top", "Slippers"],
        ACTIVEWEAR: ["Top", "Pants", "Short"],
        OUTWEAR: ["Abaya", "Trench coat"],
        NIGHTWEAR: [],
        LINGERIE: ["Bras", "Panties", "Boxers", "Shapewear", "Lingerie set"],
        BEACHWEAR: ["Bikinis (two-piece sets)", "Kimono", "Short", "Cover up"],
      },
      ACCESSORIES: {
        JEWELERY: [], LEATHERGOODS: [], BAGS: [],
        GLASSES: ["Opticals", "Sunglasses"],
        SOCKS: [], WATCHES: [],
      },
      FOOTWEAR: { FOOTWEAR: [] },
      "SKIN CARE & BEAUTY": {
        "MAKE UP": [], "SKIN CARE": [],
        "HAIR CARE": ["Bath Tools", "Hair Treatment"],
      },
      PERFUMES: ["Oud and Bakhoor", "De parfume", "DE TOILETTE", "SOLID PERFUME", "ALL OVER SPRAY", "OILS"],
    },
    MEN: {
      CLOTHING: {
        STREETWEAR: ["Jackets", "Blazers", "Shorts", "Pants", "Shirts", "T-shirts"],
        OUTWEAR: [], PJS: [], LOUNGEWEAR: [], UNDERWEAR: [], BEACHWEAR: [],
        "الزي الرسمي": ["Vests", "Thob"],
      },
      ACCESSORIES: {
        JEWELRY: [], LEATHERGOODS: [], BAGS: [],
        GLASSES: ["Opticals", "Sunglasses"],
        SOCKS: [], "MUGS & BOTTLES": [],
      },
      FOOTWEAR: { FOOTWEAR: [] },
      "HAIRCARE & GROOMING": {
        "HAIR GROOMING": [], "BEARD GROOMING": [], "SHAVING GROOMING": [],
      },
      PERFUMES: ["عود و بخور", "De parfume", "DE TOILETTE", "SOLID PERFUME", "ALL OVER SPRAY", "OILS"],
    },
    KIDS: {
      CLOTHING: { "NEW BORN": [], BEACHWEAR: [], "DAILY WEAR": [], SLEEPWEAR: [] },
      "GIFT & ACCESSORIES": { BAGS: [], "BABY BLANKET": [], BIB: [], "BATH TOOLS": [] },
      FOOTWEAR: { FOOTWEAR: [] },
      "BABYCARE & PERFUMES": { "SHOWER ESSENTIALS": [], PERFUMES: [], BODYCARE: [] },
    },
  },
  STATIONERY: {
    "OFFICE SUPPLIES": { "DESK ACCESSORIES": [], NOTEBOOKS: [], "LAPTOP ESSENTIALS": [] },
    GIFTBAR: { BOXES: [], "GIFT WRAPPING PAPER": [], "GIFT CARDS": [] },
    "SCHOOL SUPPLIES": { "BAGS & LUNCH BOX": [], "STUDY & PLANNING": [], ACCESSORIES: [] },
    LIFESTYLE: { GAMES: [], GIFTS: [], "DAILY CARDS": [], MAGNETS: [], "KEY CHAIN": [] },
    ART: { "ART ACCESSORIES": [], CRAFTS: [], "BRUSHES & PAINTING TOOLS": [], "COLOURING TOOLS": [], "KIDS ART SUPPLIES": [] },
    TAILORING: { MACHINE: [], "SEWING TOOLS & THREADS": [], "FABRIC & MATERIALS": [], "GARMENT ACCESSORIES": [] },
  },
  HOME: {
    "SOFT FURNISHING": { ACCESSORIES: [], "FRAMES & DISPLAY": [], LIGHTINGS: [], BLANKETS: [], FABRICS: [], PILLOWS: [] },
    KITCHENWARE: { "SERVING ITEMS": [], DRINKWARE: [], "SNACK BOXES": [], JARS: [], "COOKING TOOLS": [], "KITCHEN ACCESSORIES": [] },
    STORAGE: { "CLEANING & MAINTENANCE": [] },
    DÉCOR: { SOFAS: [], CHAIRS: [], "DINING TABLES": [], BAR: [] },
    "HOME PERFUME": [],
    TAILORING: { MACHINE: [], "SEWING TOOLS & THREADS": [], "FABRIC & MATERIALS": [], "GARMENT ACCESSORIES": [] },
  },
}

/* ── SAMPLE DATA ────────────────────────────────────────────────────── */
const SAMPLE = [
  { product_id: "00030982", product_name: "Eco Mouse Pad 4282", brand_name: "Bottle Brand Testing", image: "https://example.com/images/product-4282.jpg", old_categories: "Home & Garden, Pet Supplies", reason_x: "Only Old Categories", s1: "STATIONERY > OFFICE SUPPLIES > DESK ACCESSORIES", s2: "STATIONERY > OFFICE SUPPLIES > LAPTOP ESSENTIALS", s3: "STATIONERY > LIFESTYLE > GIFTS", reason_y: "Electronic mouse pad falls under desk accessories." },
  { product_id: "0004d8e5", product_name: "Essential Backpack 6579", brand_name: "Bottle Brand Testing", image: "https://example.com/images/product-6579.jpg", old_categories: "Automotive", reason_x: "Only Old Categories", s1: "STATIONERY > SCHOOL SUPPLIES > BAGS & LUNCH BOX", s2: "FASHION > MEN > ACCESSORIES > BAGS", s3: "FASHION > WOMEN > ACCESSORIES > BAGS", reason_y: "General high-quality backpack for performance/everyday use." },
  { product_id: "00072d2e", product_name: "هودي كم مقطوع Keep Your Vision Clear", brand_name: "CULTURE WE ARE", image: "https://fcadd929ce4bd6713e2135b6a4a68163.cdn.bubble.io/f1753098737574x546812555171674050/Screenshot%202025-07-21%20145209.png", old_categories: "", reason_x: "No Mapping", s1: "FASHION > MEN > CLOTHING > STREETWEAR > T-shirts", s2: "FASHION > WOMEN > CLOTHING > RTW > T-shirt", s3: "FASHION > MEN > CLOTHING > LOUNGEWEAR", reason_y: "Hoodie listed as unisex or streetwear." },
  { product_id: "00094047", product_name: "سديري طويل", brand_name: "Lavender design", image: "https://fcadd929ce4bd6713e2135b6a4a68163.cdn.bubble.io/f1751405459450x426792476472634500/IMG_0884.jpeg", old_categories: "Abayas & Dresses", reason_x: "Only Old Categories", s1: "FASHION > WOMEN > CLOTHING > OUTWEAR > Abaya", s2: "FASHION > WOMEN > CLOTHING > RTW > Top", s3: "FASHION > WOMEN > CLOTHING > RTW > Long dress", reason_y: "Long vest/outerwear garment." },
  { product_id: "00096849", product_name: "ميدالية الدرعية", brand_name: "دَنَّة", image: "https://fcadd929ce4bd6713e2135b6a4a68163.cdn.bubble.io/f1744507792354x358211816999789000/DNNAH2732.jpeg", old_categories: "", reason_x: "No Mapping", s1: "STATIONERY > LIFESTYLE > KEY CHAIN", s2: "STATIONERY > LIFESTYLE > GIFTS", s3: "FASHION > WOMEN > ACCESSORIES > JEWELERY", reason_y: "Keychain product." },
  { product_id: "000b37a2", product_name: "عباية 71 Fabrics", brand_name: "Fabrics by Z", image: "", old_categories: "", reason_x: "No Mapping", s1: "FASHION > WOMEN > CLOTHING > OUTWEAR > Abaya", s2: "FASHION > WOMEN > CLOTHING > RTW > Long dress", s3: "FASHION > WOMEN > CLOTHING > RTW > Maxi dress", reason_y: "Abaya." },
  { product_id: "00127278", product_name: "Smart Face Wash 5911", brand_name: "Bottle Brand Testing", image: "https://example.com/images/product-5911.jpg", old_categories: "Food & Beverages, Home & Garden", reason_x: "Only Old Categories", s1: "FASHION > WOMEN > SKIN CARE & BEAUTY > SKIN CARE", s2: "FASHION > MEN > HAIRCARE & GROOMING > HAIR GROOMING", s3: "FASHION > KIDS > BABYCARE & PERFUMES > BODYCARE", reason_y: "Face wash." },
  { product_id: "001578a4", product_name: "مجموعة ستيكرات كبسولات الحياة", brand_name: "هبة ستديو", image: "", old_categories: "", reason_x: "No Mapping", s1: "STATIONERY > LIFESTYLE > GIFTS", s2: "STATIONERY > ART > ART ACCESSORIES", s3: "STATIONERY > SCHOOL SUPPLIES > ACCESSORIES", reason_y: "Sticker set." },
  { product_id: "001ba650", product_name: "تيشرت الغرب الامريكي", brand_name: "Kozi", image: "https://cdn.dsmcdn.com/ty1683/prod/QC/20250526/21/548064c7-e1d8-3084-899c-e99423b8d1a0/1_org_zoom.jpg", old_categories: "", reason_x: "No Mapping", s1: "FASHION > MEN > CLOTHING > STREETWEAR > T-shirts", s2: "FASHION > WOMEN > CLOTHING > RTW > T-shirt", s3: "FASHION > MEN > CLOTHING > LOUNGEWEAR", reason_y: "Unisex t-shirt." },
  { product_id: "001bd5d5", product_name: "هودي خفيف ابيض", brand_name: "Llght OQ", image: "https://fcadd929ce4bd6713e2135b6a4a68163.cdn.bubble.io/f1753138987429x252039708397784320/G4qjYR147q2NCkDkjxW6QSMhG1FnMbmwcypyzrrW.png", old_categories: "Clothing & Textiles", reason_x: "Only Old Categories", s1: "FASHION > MEN > CLOTHING > STREETWEAR > Jackets", s2: "FASHION > WOMEN > CLOTHING > LOUNGEWEAR > Top", s3: "FASHION > MEN > CLOTHING > LOUNGEWEAR", reason_y: "Light hoodie." },
  { product_id: "001d9a22", product_name: "اسياد الارض", brand_name: "كتب سقف", image: "", old_categories: "", reason_x: "No Mapping", s1: "STATIONERY > LIFESTYLE > GIFTS", s2: "STATIONERY > LIFESTYLE > DAILY CARDS", s3: "STATIONERY > LIFESTYLE > GAMES", reason_y: "Book/Publication." },
  { product_id: "0026a3dc", product_name: "تشيرت هاواي اركب الأمواج", brand_name: "Kozi", image: "https://cdn.dsmcdn.com/ty1685/prod/QC/20250526/17/650cf388-73c5-30d2-bbd1-d10b60c6c89e/1_org_zoom.jpg", old_categories: "", reason_x: "No Mapping", s1: "FASHION > MEN > CLOTHING > STREETWEAR > T-shirts", s2: "FASHION > WOMEN > CLOTHING > RTW > T-shirt", s3: "FASHION > MEN > CLOTHING > BEACHWEAR", reason_y: "Casual printed t-shirt." },
  { product_id: "002a874a", product_name: "شرشف صلاة", brand_name: "ايمان لاين", image: "https://raff-media-production.s3.me-south-1.amazonaws.com/products/b9217579-6c2d-4ffd-aca9-c42d5cd0d225", old_categories: "Dress", reason_x: "Only Old Categories", s1: "FASHION > WOMEN > CLOTHING > RTW > Long dress", s2: "FASHION > WOMEN > CLOTHING > RTW > Maxi dress", s3: "FASHION > WOMEN > CLOTHING > NIGHTWEAR", reason_y: "Prayer garment (Abaya/dress)." },
  { product_id: "002ac59c", product_name: "Subha سبحة", brand_name: "crochetit", image: "https://fcadd929ce4bd6713e2135b6a4a68163.cdn.bubble.io/f1761468362335x443940916792657800/WhatsApp%20Image%202025-10-23%20at%2009.12.23_9a24b16b.jpg", old_categories: "Handmade crafts", reason_x: "Only Old Categories", s1: "FASHION > WOMEN > ACCESSORIES > JEWELERY", s2: "FASHION > MEN > ACCESSORIES > JEWELRY", s3: "STATIONERY > LIFESTYLE > GIFTS", reason_y: "Subha/Accessories." },
  { product_id: "002df968", product_name: "Smart Running Shoes 5556", brand_name: "Bottle Brand Testing", image: "https://example.com/images/product-5556.jpg", old_categories: "Music, Toys & Games", reason_x: "Only Old Categories", s1: "FASHION > WOMEN > FOOTWEAR > FOOTWEAR", s2: "FASHION > MEN > FOOTWEAR > FOOTWEAR", s3: "FASHION > KIDS > FOOTWEAR > FOOTWEAR", reason_y: "Running shoes." },
  { product_id: "0032205e", product_name: "Deluxe Canvas Sneakers 6575", brand_name: "Bottle Brand Testing", image: "https://example.com/images/product-6575.jpg", old_categories: "Health, Kitchen", reason_x: "Only Old Categories", s1: "FASHION > WOMEN > FOOTWEAR > FOOTWEAR", s2: "FASHION > MEN > FOOTWEAR > FOOTWEAR", s3: "FASHION > KIDS > FOOTWEAR > FOOTWEAR", reason_y: "Sneakers." },
  { product_id: "0034acc7", product_name: "Ultra Puzzle Set 7022", brand_name: "Bottle Brand Testing", image: "https://example.com/images/product-7022.jpg", old_categories: "Automotive, Beauty & Personal Care", reason_x: "Only Old Categories", s1: "STATIONERY > LIFESTYLE > GAMES", s2: "STATIONERY > LIFESTYLE > GIFTS", s3: "STATIONERY > SCHOOL SUPPLIES > STUDY & PLANNING", reason_y: "Puzzle set." },
  { product_id: "003ab6f1", product_name: "تراب كهرمان بلو مون", brand_name: "علم المسابيح", image: "https://cdn.salla.sa/QQBWw/l3xWTxFNiOy7BfpNdQP38rznA9zb8sEiMQ5nTU3O.jpg", old_categories: "", reason_x: "No Mapping", s1: "FASHION > WOMEN > ACCESSORIES > JEWELERY", s2: "FASHION > MEN > ACCESSORIES > JEWELRY", s3: "STATIONERY > LIFESTYLE > GIFTS", reason_y: "Subha (beads)." },
  { product_id: "004f1a22", product_name: "Premium Oud Perfume", brand_name: "Naseem", image: "", old_categories: "Fragrance", reason_x: "Only Old Categories", s1: "FASHION > WOMEN > PERFUMES > Oud and Bakhoor", s2: "FASHION > MEN > PERFUMES > عود و بخور", s3: "HOME > HOME PERFUME", reason_y: "Traditional oud perfume suitable for both men and women." },
  { product_id: "005c2b33", product_name: "Notebook A5 Leather Cover", brand_name: "!STUFF", image: "", old_categories: "Office Supplies", reason_x: "Only Old Categories", s1: "STATIONERY > OFFICE SUPPLIES > NOTEBOOKS", s2: "STATIONERY > GIFTBAR > BOXES", s3: "STATIONERY > LIFESTYLE > GIFTS", reason_y: "A5 leather notebook for office and personal use." },
]

/* ── HELPERS ────────────────────────────────────────────────────────── */
const getFirstImg = (url) => {
  if (!url) return null
  const first = (url + "").split(",")[0].trim()
  if (!first || first === "https://undefined" || first === "https://" || first.includes("example.com")) return null
  try { new URL(first); return first } catch { return null }
}

//const lastSeg = (path) => (path || "").split(">").pop().trim()

//const s = (obj) => Object.assign({}, obj)

/* ── STAT CARD ──────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, note, accent }) {
  return (
    <div style={{
      background: T.surf, borderRadius: 14,
      border: `1px solid ${accent ? T.goldBdr : T.bdr}`,
      padding: "18px 22px", position: "relative", overflow: "hidden",
    }}>
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.gold}, ${T.goldL})` }} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: T.mut, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 30, fontWeight: 600, color: accent ? T.gold : T.txt, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 11, color: T.mut, marginTop: 6 }}>{note}</div>
        </div>
        <div style={{ color: accent ? T.gold : T.mut, opacity: 0.9, marginTop: 2 }}>{icon}</div>
      </div>
    </div>
  )
}

/* ── PATH PILL ──────────────────────────────────────────────────────── */
function PathPill({ path, type = "green" }) {
  if (!path) return null
  const parts = path.split(">").map(p => p.trim()).filter(Boolean)
  const colors = {
    green: { bg: T.greenBg, bdr: T.greenBdr, txt: T.green },
    blue: { bg: T.blueBg, bdr: T.blueBdr, txt: T.blue },
    purp: { bg: T.purpBg, bdr: T.purpBdr, txt: T.purp },
  }
  const c = colors[type]

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: 3,
      padding: "3px 10px", borderRadius: 20, background: c.bg, border: `1px solid ${c.bdr}`,
    }}>
      {type === "green" && <span style={{ color: c.txt, marginRight: 2 }}>✦</span>}
      {parts.map((p, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {i > 0 && <ChevronRight size={8} color={c.txt} style={{ opacity: 0.5 }} />}
          <span style={{
            fontSize: 10, color: c.txt,
            fontWeight: i === parts.length - 1 ? 700 : 400,
            opacity: i === parts.length - 1 ? 1 : 0.7
          }}>
            {p}
          </span>
        </span>
      ))}
    </div>
  )
}

/* ── PRODUCT CARD ───────────────────────────────────────────────────── */
function ProductCard({ product }) {
  const [imgErr, setImgErr] = useState(false)
  const [open, setOpen] = useState(false)
  const [hov, setHov] = useState(false)

  const name = product.product_name || "Unnamed Product"
  const brand = product.brand_name || "—"
  const oldCat = product.old_categories || ""
  const s1 = product.s1 || ""
  const s2 = product.s2 || ""
  const s3 = product.s3 || ""
  const reason = product.reason_y || ""
  const noMapping = product.reason_x === "No Mapping"
  const imgUrl = getFirstImg(product.image)
  //const s1Parts = s1.split(">").map(p => p.trim()).filter(Boolean)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? T.cardHov : T.card,
        border: `1px solid ${hov ? T.bdrAcc : T.bdr}`,
        borderRadius: 12, padding: "14px 16px",
        display: "flex", gap: 14, alignItems: "flex-start",
        transition: "all 0.18s ease",
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 58, height: 58, borderRadius: 10, flexShrink: 0,
        background: "#0A1525", display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", border: `1px solid ${T.bdr}`,
      }}>
        {imgUrl && !imgErr
          ? <img src={imgUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErr(true)} />
          : <ShoppingBag size={20} color={T.mut} />
        }
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + Brand row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: T.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{brand}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {noMapping && (
              <span style={{ fontSize: 10, padding: "2px 7px", background: T.redBg, border: "1px solid rgba(248,113,113,0.25)", borderRadius: 20, color: T.red, fontWeight: 500 }}>
                No Old Cat
              </span>
            )}
            {reason && (
              <button
                onClick={() => setOpen(!open)}
                title="AI Reasoning"
                style={{
                  background: open ? T.goldBg : "none",
                  border: `1px solid ${open ? T.goldBdr : "transparent"}`,
                  borderRadius: 6, padding: "4px 6px", cursor: "pointer",
                  color: open ? T.gold : T.mut, display: "flex", alignItems: "center",
                  transition: "all 0.15s",
                }}
              >
                <Zap size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Taxonomy Paths Row */}
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {oldCat && (
            <>
              <span style={{
                fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 500,
                background: "#0D1727", border: `1px solid ${T.bdr}`, color: T.sub,
                maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                Old: {oldCat}
              </span>
              <ArrowRight size={11} color={T.mut} style={{ flexShrink: 0 }} />
            </>
          )}
          <PathPill path={s1} type="green" />
          {s2 && <PathPill path={s2} type="blue" />}
          {s3 && <PathPill path={s3} type="purp" />}
        </div>

        {/* AI Reason (expandable) */}
        {open && reason && (
          <div style={{
            marginTop: 10, padding: "9px 12px", borderRadius: 8,
            background: T.goldBg, border: `1px solid ${T.goldBdr}`,
            fontSize: 12, color: T.sub, lineHeight: 1.6,
          }}>
            <span style={{ color: T.gold, fontWeight: 600, marginRight: 6 }}>⚡ AI:</span>
            {reason}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── TREE NODE ──────────────────────────────────────────────────────── */
function TreeNode({ name, value, depth, search, path = "", onSelect }) {
  const isArr = Array.isArray(value)
  const isObj = !isArr && typeof value === "object" && value !== null
  const currentPath = path ? `${path} > ${name}` : name
  const autoOpen = depth < 2 || (search && name.toLowerCase().includes(search.toLowerCase()))
  const [exp, setExp] = useState(autoOpen)
  const [hov, setHov] = useState(false)

  useEffect(() => {
    if (search) setExp(true)
  }, [search])

  const pl = depth * 10 + 8
  const clr = depth === 0 ? T.gold : depth === 1 ? T.txt : depth === 2 ? T.sub : T.mut

  if (isArr) {
    return (
      <div>
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (value.length > 0) setExp(!exp)
            onSelect(currentPath)
          }}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            padding: `4px 8px 4px ${pl}px`, fontSize: 12, fontWeight: depth < 2 ? 600 : 500,
            color: clr, cursor: "pointer", borderRadius: 6,
            display: "flex", alignItems: "center", gap: 6, userSelect: "none",
            background: hov ? "rgba(255,255,255,0.04)" : "transparent", transition: "background 0.1s",
          }}
        >
          {value.length > 0
            ? (exp ? <ChevronDown size={10} /> : <ChevronRight size={10} />)
            : <span style={{ width: 10, display: "inline-block" }} />
          }
          <span style={{ flex: 1 }}>{name}</span>
          {value.length > 0 && (
            <span style={{ fontSize: 10, color: T.mut, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "1px 5px" }}>{value.length}</span>
          )}
        </div>
        {exp && value.map((item, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); onSelect(`${currentPath} > ${item}`) }}
            style={{
              padding: `2px 8px 2px ${pl + 18}px`, fontSize: 11, color: T.mut,
              borderRadius: 4, lineHeight: 1.7, cursor: "pointer"
            }}
            onMouseEnter={(e) => e.target.style.color = T.txt}
            onMouseLeave={(e) => e.target.style.color = T.mut}
          >
            · {item}
          </div>
        ))}
      </div>
    )
  }

  if (isObj) {
    return (
      <div>
        <div
          onClick={(e) => {
            e.stopPropagation()
            setExp(!exp)
            onSelect(currentPath)
          }}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            padding: `${depth === 0 ? 6 : 4}px 8px ${depth === 0 ? 6 : 4}px ${pl}px`,
            fontSize: depth === 0 ? 13 : 12,
            fontWeight: depth === 0 ? 700 : depth === 1 ? 600 : 500,
            color: clr, cursor: "pointer", borderRadius: 6,
            display: "flex", alignItems: "center", gap: 6, userSelect: "none",
            background: hov ? "rgba(255,255,255,0.04)" : "transparent", transition: "background 0.1s",
            borderBottom: depth === 0 && !exp ? `1px solid ${T.bdr}` : "none",
            marginBottom: depth === 0 ? 2 : 0,
          }}
        >
          {exp ? <ChevronDown size={depth === 0 ? 11 : 10} /> : <ChevronRight size={depth === 0 ? 11 : 10} />}
          <span style={{ flex: 1 }}>{name}</span>
          <span style={{ fontSize: 10, color: T.mut, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "1px 5px" }}>{Object.keys(value).length}</span>
        </div>
        {exp && (
          <div>
            {Object.entries(value).map(([k, v]) => (
              <TreeNode key={k} name={k} value={v} depth={depth + 1} search={search} path={currentPath} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    )
  }
  return null
}

/* ── SIDEBAR ────────────────────────────────────────────────────────── */
function Sidebar({ onClose, treeSearch, setTreeSearch, onSelect }) {
  return (
    <div style={{
      width: 270, flexShrink: 0, background: T.surf,
      border: `1px solid ${T.bdr}`, borderRadius: 14,
      display: "flex", flexDirection: "column",
      maxHeight: "calc(100vh - 230px)", position: "sticky", top: 100, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
        <Folder size={14} color={T.gold} />
        <span style={{ fontWeight: 600, fontSize: 13, color: T.txt, flex: 1 }}>Taxonomy Explorer</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: T.mut, cursor: "pointer", padding: 3, borderRadius: 4, display: "flex" }}
        ><X size={14} /></button>
      </div>
      {/* Search */}
      <div style={{ padding: "10px 12px", borderBottom: `1px solid ${T.bdr}` }}>
        <div style={{ position: "relative" }}>
          <Search size={12} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: T.mut, pointerEvents: "none" }} />
          <input
            value={treeSearch}
            onChange={e => setTreeSearch(e.target.value)}
            placeholder="Filter categories..."
            style={{
              width: "100%", boxSizing: "border-box",
              background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 7,
              padding: "7px 8px 7px 26px", fontSize: 12, color: T.txt,
              outline: "none",
            }}
          />
        </div>
      </div>
      {/* Tree */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 6px 16px" }}>
        {Object.entries(CAT_MAP).map(([k, v]) => (
          <TreeNode key={k} name={k} value={v} depth={0} search={treeSearch} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

/* ── PAGINATION ─────────────────────────────────────────────────────── */
function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const delta = 2
  const pages = []
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) pages.push(i)

  const btnStyle = (active) => ({
    background: active ? T.gold : T.surf,
    border: `1px solid ${active ? T.gold : T.bdr}`,
    borderRadius: 8, width: 34, height: 34, fontSize: 13,
    color: active ? "#000" : T.txt, cursor: "pointer",
    fontWeight: active ? 700 : 400, display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s",
  })

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.bdr}` }}>
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        style={{ ...btnStyle(false), width: "auto", padding: "0 14px", opacity: page === 1 ? 0.4 : 1 }}>
        ← Prev
      </button>
      {page > 3 && <><button onClick={() => onChange(1)} style={btnStyle(false)}>1</button><span style={{ color: T.mut }}>…</span></>}
      {pages.map(p => (
        <button key={p} onClick={() => onChange(p)} style={btnStyle(p === page)}>{p}</button>
      ))}
      {page < totalPages - 2 && <><span style={{ color: T.mut }}>…</span><button onClick={() => onChange(totalPages)} style={btnStyle(false)}>{totalPages}</button></>}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        style={{ ...btnStyle(false), width: "auto", padding: "0 14px", opacity: page === totalPages ? 0.4 : 1 }}>
        Next →
      </button>
      <span style={{ color: T.mut, fontSize: 11, marginLeft: 8 }}>Page {page} / {totalPages}</span>
    </div>
  )
}

/* ── MAIN DASHBOARD ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const [data, setData] = useState(SAMPLE)
  const [loadedCount, setLoadedCount] = useState(null)
  const [search, setSearch] = useState("")
  const [s1Filter, setS1Filter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [treeSearch, setTreeSearch] = useState("")
  const fileRef = useRef()
  const PAGE = 50

  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap"
    document.head.appendChild(link)
  }, [])

  const handleUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data: rows }) => {
        setData(rows)
        setLoadedCount(rows.length)
        setPage(1)
        setSearch("")
        setS1Filter("ALL")
      },
    })
    e.target.value = ""
  }, [])

  const s1Options = useMemo(
    () => [...new Set(data.map(p => p.s1).filter(Boolean))].sort(),
    [data]
  )

  const filtered = useMemo(() => {
    let d = data
    const q = search.trim().toLowerCase()
    if (q) d = d.filter(p =>
      (p.product_name || "").toLowerCase().includes(q) ||
      (p.brand_name || "").toLowerCase().includes(q) ||
      (p.s1 || "").toLowerCase().includes(q) ||
      (p.old_categories || "").toLowerCase().includes(q)
    )
    if (s1Filter !== "ALL") {
      d = d.filter(p => (p.s1 || "").startsWith(s1Filter))
    }
    return d
  }, [data, search, s1Filter])

  const pageData = useMemo(
    () => filtered.slice((page - 1) * PAGE, page * PAGE),
    [filtered, page]
  )

  const stats = useMemo(() => {
    const total = data.length
    const withS1 = data.filter(p => (p.s1 || "").trim()).length
    const uniqS1 = new Set(data.map(p => p.s1).filter(Boolean)).size
    const uniqBrands = new Set(data.map(p => p.brand_name).filter(Boolean)).size
    return { total, withS1, accuracy: total ? Math.round(withS1 / total * 100) : 0, uniqS1, uniqBrands }
  }, [data])

  const displayTotal = loadedCount || stats.total
  const isSample = !loadedCount

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: T.bg, minHeight: "100vh", color: T.txt }}>

      {/* ── HEADER ─ */}
      <header style={{
        background: T.surf, borderBottom: `1px solid ${T.bdr}`,
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldL})`,
            borderRadius: 9, padding: "7px 9px", display: "flex",
          }}>
            <Layers size={16} color="#000" />
          </div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 18, color: T.txt, lineHeight: 1 }}>
              RAFF - Mapped Products
            </div>
            <div style={{ fontSize: 10.5, color: T.mut, marginTop: 2, letterSpacing: "0.04em" }}>
              AI TAXONOMY MIGRATION · CLIENT REVIEW
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {isSample && (
            <span style={{ fontSize: 12, color: T.mut, background: T.goldBg, border: `1px solid ${T.goldBdr}`, borderRadius: 6, padding: "4px 10px" }}>
              ⚠ Sample data — upload your CSV below
            </span>
          )}
          {!isSample && (
            <span style={{ fontSize: 12, color: T.green }}>
              ✓ {loadedCount.toLocaleString()} products loaded
            </span>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: `linear-gradient(135deg, ${T.gold}, ${T.goldL})`,
              border: "none", borderRadius: 8, padding: "8px 16px",
              color: "#000", fontWeight: 600, fontSize: 13, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Upload size={14} /> Upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleUpload} />
        </div>
      </header>

      {/* ── STATS ROW ─ */}
      <div style={{ padding: "20px 24px 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard
          label="Total Products"
          value={(isSample ? "25,000+" : displayTotal.toLocaleString())}
          icon={<Package size={18} />}
          note={isSample ? "Upload CSV for exact count" : "Full catalog loaded"}
          accent={false}
        />
        <StatCard
          label="Categories Mapped"
          value={stats.uniqS1}
          icon={<Tag size={18} />}
          note="Unique primary categories"
          accent={false}
        />
        <StatCard
          label="Mapping Accuracy"
          value={`${stats.accuracy}%`}
          icon={<BarChart3 size={18} />}
          note="Products with valid s1 assigned"
          accent={true}
        />
        <StatCard
          label="Brands Catalogued"
          value={stats.uniqBrands}
          icon={<Building2 size={18} />}
          note="Unique brand count in data"
          accent={false}
        />
      </div>

      {/* ── BODY ─ */}
      <div style={{ display: "flex", gap: 18, padding: "18px 24px 40px", alignItems: "flex-start" }}>

        {/* Sidebar */}
        {sidebarOpen && (
          <Sidebar
            onClose={() => setSidebarOpen(false)}
            treeSearch={treeSearch}
            setTreeSearch={setTreeSearch}
            onSelect={(path) => { setS1Filter(path); setPage(1); }}
          />
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Search + Filter bar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: T.surf, border: `1px solid ${T.bdr}`,
                  borderRadius: 8, padding: "8px 12px",
                  color: T.sub, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, fontSize: 12,
                  flexShrink: 0,
                }}
              >
                <Folder size={14} /> Taxonomy
              </button>
            )}
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T.mut, pointerEvents: "none" }} />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name, brand, or category..."
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: T.surf, border: `1px solid ${T.bdr}`,
                  borderRadius: 9, padding: "10px 38px 10px 38px",
                  fontSize: 13, color: T.txt, outline: "none",
                }}
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setPage(1) }}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.mut, cursor: "pointer", display: "flex" }}
                ><X size={14} /></button>
              )}
            </div>
            <select
              value={s1Options.includes(s1Filter) ? s1Filter : "ALL"}
              onChange={e => { setS1Filter(e.target.value); setPage(1) }}
              style={{
                background: T.surf, border: `1px solid ${T.bdr}`,
                borderRadius: 9, padding: "10px 14px", fontSize: 13,
                color: T.txt, outline: "none", cursor: "pointer",
                minWidth: 200, flexShrink: 0,
              }}
            >
              <option value="ALL">All Categories</option>
              {s1Filter !== "ALL" && !s1Options.includes(s1Filter) && (
                <option value={s1Filter}>{s1Filter.split(">").pop().trim()} (Branch)</option>
              )}
              {s1Options.map(opt => (
                <option key={opt} value={opt}>{opt.split(">").pop().trim()}</option>
              ))}
            </select>
          </div>

          {/* Result count bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 12, color: T.mut }}>
              Showing <strong style={{ color: T.sub }}>{((page - 1) * PAGE + 1).toLocaleString()}–{Math.min(page * PAGE, filtered.length).toLocaleString()}</strong> of <strong style={{ color: T.sub }}>{filtered.length.toLocaleString()}</strong> products
              {search && <span> · filtered by "<span style={{ color: T.txt }}>{search}</span>"</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {(search || s1Filter !== "ALL") && (
                <button
                  onClick={() => { setSearch(""); setS1Filter("ALL"); setPage(1); }}
                  style={{
                    background: "none", border: `1px solid ${T.redBg}`,
                    borderRadius: 8, padding: "4px 10px", color: T.red,
                    fontSize: 12, cursor: "pointer", fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 5
                  }}
                >
                  <X size={12} /> Clear All
                </button>
              )}
              <div style={{ fontSize: 11, color: T.mut, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, display: "inline-block" }} />
                  Best Fit
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.blue, display: "inline-block" }} />
                  Alt 1
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.purp, display: "inline-block" }} />
                  Alt 2
                </span>
              </div>
            </div>
          </div>

          {/* Product list */}
          {pageData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: T.mut }}>
              <Search size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 15 }}>No products match your search</div>
              <button onClick={() => { setSearch(""); setS1Filter("ALL") }} style={{ marginTop: 12, background: "none", border: `1px solid ${T.bdr}`, borderRadius: 8, padding: "7px 16px", color: T.sub, cursor: "pointer", fontSize: 13 }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pageData.map((p, i) => (
                <ProductCard key={p.product_id || i} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination page={page} total={filtered.length} pageSize={PAGE} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }) }} />

        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${T.bdr}`, padding: "14px 24px", background: T.surf, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: T.mut }}>CatalogueAI · AI-Driven Taxonomy Migration Dashboard</div>
        <div style={{ fontSize: 11, color: T.mut }}>
          <span style={{ color: T.gold }}>✦</span> Powered by LLM Classification Engine
        </div>
      </div>

    </div>
  )
}
