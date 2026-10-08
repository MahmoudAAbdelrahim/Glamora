import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Inter, Playfair_Display } from "next/font/google";

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* ===================== TYPES ===================== */
export type Locale = "ar" | "en";

export type ProductImage = { url: string; publicId: string };

export type SkinType =
  | "all" | "oily" | "dry" | "combination" | "normal" | "sensitive";

export type Concern =
  | "acne" | "dark-spots" | "dryness" | "oiliness" | "wrinkles"
  | "fine-lines" | "redness" | "dullness" | "pores" | "dark-circles"
  | "uneven-tone" | "blackheads" | "blemishes" | "dehydration";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: "skincare" | "makeup";
  description?: string;
  price: number;
  discountPrice?: number;
  images: ProductImage[];
  stock: number;
  lowStockThreshold: number;
  sku?: string;
  rating?: number;
  reviewsCount?: number;
  featured?: boolean;
  bestSeller?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  skinTypes?: SkinType[];
  concerns?: Concern[];
  ingredients?: string[];
  benefits?: string[];
  howToUse?: string;
  suitableForAge?: { min?: number; max?: number };
  shade?: string;
  size?: string;
};

export type Stats = {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
  lowStock: number;
};

/* ===================== ROUTES / HELPERS ===================== */
/* مهم: dashboard بحروف صغيرة (اسم الفولدر لازم يطابق) */
export const base = (locale: Locale) => `/${locale}/admin/Dashboard/products`;
export const API = "/api/admin/dashboard/products";

export const fmt = (locale: Locale, n: number) =>
  new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG").format(n);

export const fmtDate = (locale: Locale, iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
        dateStyle: "medium",
      })
    : "—";

export function stockState(p: Product, t: Tx) {
  if (p.stock <= 0) return { type: "bad", label: t.outOfStock };
  if (p.stock <= p.lowStockThreshold) return { type: "warn", label: t.lowStock };
  return { type: "ok", label: t.inStock };
}

export function useGlTheme(): "dark" | "light" {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && resolvedTheme === "dark" ? "dark" : "light";
}

export const SKIN_TYPES: { value: SkinType; ar: string; en: string }[] = [
  { value: "all", ar: "كل أنواع البشرة", en: "All Skin Types" },
  { value: "oily", ar: "دهنية", en: "Oily" },
  { value: "dry", ar: "جافة", en: "Dry" },
  { value: "combination", ar: "مختلطة", en: "Combination" },
  { value: "normal", ar: "عادية", en: "Normal" },
  { value: "sensitive", ar: "حساسة", en: "Sensitive" },
];

export const CONCERNS: { value: Concern; ar: string; en: string }[] = [
  { value: "acne", ar: "حب الشباب", en: "Acne" },
  { value: "dark-spots", ar: "البقع الداكنة", en: "Dark Spots" },
  { value: "dryness", ar: "الجفاف", en: "Dryness" },
  { value: "oiliness", ar: "الدهون الزائدة", en: "Oiliness" },
  { value: "wrinkles", ar: "التجاعيد", en: "Wrinkles" },
  { value: "fine-lines", ar: "الخطوط الدقيقة", en: "Fine Lines" },
  { value: "redness", ar: "الاحمرار", en: "Redness" },
  { value: "dullness", ar: "البشرة الباهتة", en: "Dullness" },
  { value: "pores", ar: "المسام", en: "Pores" },
  { value: "dark-circles", ar: "الهالات السوداء", en: "Dark Circles" },
  { value: "uneven-tone", ar: "تفاوت لون البشرة", en: "Uneven Tone" },
  { value: "blackheads", ar: "الرؤوس السوداء", en: "Blackheads" },
  { value: "blemishes", ar: "العيوب والبثور", en: "Blemishes" },
  { value: "dehydration", ar: "نقص الترطيب", en: "Dehydration" },
];

/* ===================== TEXT (ar, en) ===================== */
const D = {
  title: ["إدارة المنتجات", "Products Management"],
  subtitle: ["إدارة منتجات Glamora ومخزون المتجر", "Manage Glamora products and store inventory"],
  addProduct: ["إضافة منتج", "Add Product"],
  refresh: ["تحديث", "Refresh"],
  total: ["إجمالي المنتجات", "Total Products"],
  active: ["نشطة", "Active"],
  inactive: ["غير نشطة", "Inactive"],
  outOfStock: ["نفد المخزون", "Out of Stock"],
  lowStock: ["مخزون منخفض", "Low Stock"],
  inStock: ["متوفر", "In Stock"],
  searchPlaceholder: ["ابحث باسم المنتج أو البراند أو SKU...", "Search by product, brand or SKU..."],
  allCategories: ["كل التصنيفات", "All Categories"],
  skincare: ["عناية بالبشرة", "Skincare"],
  makeup: ["مكياج", "Makeup"],
  allStatus: ["كل الحالات", "All Status"],
  activeStatus: ["نشط", "Active"],
  inactiveStatus: ["غير نشط", "Inactive"],
  product: ["المنتج", "Product"],
  category: ["التصنيف", "Category"],
  price: ["السعر", "Price"],
  stock: ["المخزون", "Stock"],
  status: ["الحالة", "Status"],
  features: ["المميزات", "Features"],
  actions: ["الإجراءات", "Actions"],
  noProducts: ["لا توجد منتجات", "No Products Found"],
  noProductsDescription: ["لم يتم العثور على منتجات تطابق البحث الحالي.", "No products match your current search or filters."],
  resetFilters: ["مسح الفلاتر", "Reset Filters"],
  view: ["عرض التفاصيل", "View Details"],
  edit: ["تعديل", "Edit"],
  activate: ["تفعيل (إظهار)", "Activate (Show)"],
  deactivate: ["إيقاف (إخفاء)", "Deactivate (Hide)"],
  delete: ["حذف", "Delete"],
  featured: ["مميز", "Featured"],
  bestSeller: ["الأكثر مبيعًا", "Best Seller"],
  deleteTitle: ["حذف المنتج؟", "Delete Product?"],
  deleteDescription: ["سيتم حذف المنتج من قائمة المنتجات. يمكنك المتابعة إذا كنت متأكدًا.", "This product will be removed from the products list. Continue only if you are sure."],
  cancel: ["إلغاء", "Cancel"],
  confirmDelete: ["حذف المنتج", "Delete Product"],
  error: ["حدث خطأ أثناء تحميل المنتجات", "Failed to load products"],
  retry: ["إعادة المحاولة", "Retry"],
  failed: ["حدث خطأ، حاول مرة أخرى.", "Something went wrong. Please try again."],
  egp: ["جنيه", "EGP"],
  page: ["صفحة", "Page"],
  of: ["من", "of"],
  showing: ["عرض", "Showing"],
  productCount: ["منتج", "products"],
  previous: ["السابق", "Previous"],
  next: ["التالي", "Next"],
  loading: ["جاري التحميل...", "Loading..."],
  backToProducts: ["المنتجات", "Products"],
  description: ["وصف المنتج", "Description"],
  skinType: ["نوع البشرة", "Skin Type"],
  skinConcerns: ["مشاكل البشرة", "Skin Concerns"],
  ingredients: ["المكونات", "Ingredients"],
  benefits: ["الفوائد", "Benefits"],
  howToUse: ["طريقة الاستخدام", "How To Use"],
  age: ["العمر المناسب", "Suitable Age"],
  years: ["سنة", "years"],
  shade: ["الدرجة", "Shade"],
  size: ["الحجم", "Size"],
  sku: ["SKU", "SKU"],
  rating: ["التقييم", "Rating"],
  reviews: ["التقييمات", "Reviews"],
  createdAt: ["تاريخ الإضافة", "Created"],
  updatedAt: ["آخر تحديث", "Last Updated"],
  lowStockLimit: ["حد المخزون المنخفض", "Low Stock Limit"],
  notFound: ["المنتج غير موجود", "Product not found"],
  noImage: ["بدون صورة", "No Image"],
  createTitle: ["إنشاء منتج جديد", "Create New Product"],
  createSub: ["أضف منتجًا جديدًا إلى متجر Glamora", "Add a new product to your Glamora store"],
  editTitle: ["تعديل المنتج", "Edit Product"],
  editSub: ["حدّث بيانات المنتج ثم احفظ التغييرات", "Update the product details and save your changes"],
  basic: ["المعلومات الأساسية", "Basic Information"],
  basicSub: ["المعلومات الأساسية للمنتج", "Basic product information"],
  images: ["صور المنتج", "Product Images"],
  imagesSub: ["يمكنك رفع حتى 5 صور", "You can upload up to 5 images"],
  pricing: ["السعر والمخزون", "Pricing & Inventory"],
  pricingSub: ["حدد السعر والمخزون المتاح", "Set pricing and inventory"],
  suitability: ["مناسب لـ", "Suitable For"],
  suitabilitySub: ["حدد أنواع البشرة والمشاكل المناسبة", "Select suitable skin types and concerns"],
  details: ["تفاصيل المنتج", "Product Details"],
  detailsSub: ["أضف التفاصيل المهمة للعميل", "Add important product details"],
  settings: ["إعدادات المنتج", "Product Settings"],
  settingsSub: ["تحكم في ظهور المنتج داخل المتجر", "Control how the product appears in the store"],
  name: ["اسم المنتج", "Product Name"],
  brand: ["العلامة التجارية", "Brand"],
  discountPrice: ["سعر الخصم", "Discount Price"],
  lowStockThreshold: ["حد المخزون المنخفض", "Low Stock Threshold"],
  ageMin: ["أقل عمر", "Minimum Age"],
  ageMax: ["أقصى عمر", "Maximum Age"],
  namePh: ["مثال: سيروم فيتامين C", "e.g. Vitamin C Serum"],
  optional: ["اختياري", "Optional"],
  descPh: ["اكتب وصفًا واضحًا ومفصلًا للمنتج...", "Write a clear and detailed product description..."],
  ingredientsHint: ["افصل بين المكونات باستخدام الفاصلة.", "Separate ingredients using commas."],
  benefitsHint: ["اكتب كل فائدة في سطر منفصل.", "Write each benefit on a separate line."],
  featuredDesc: ["عرض المنتج ضمن المنتجات المميزة", "Show this product as featured"],
  bestSellerDesc: ["إظهار المنتج ضمن الأكثر مبيعًا", "Show this product as a best seller"],
  activeTitle: ["المنتج متاح", "Product Active"],
  activeDesc: ["السماح للعملاء برؤية المنتج في المتجر", "Allow customers to see this product in the store"],
  create: ["إنشاء المنتج", "Create Product"],
  creating: ["جاري الإنشاء...", "Creating..."],
  save: ["حفظ التغييرات", "Save Changes"],
  saving: ["جاري الحفظ...", "Saving..."],
  upload: ["رفع الصور", "Upload Images"],
  uploading: ["جاري الرفع...", "Uploading..."],
  imgFormats: ["PNG, JPG أو WEBP", "PNG, JPG or WEBP"],
  mainImage: ["الصورة الرئيسية", "Main Image"],
  removeImage: ["حذف الصورة", "Remove image"],
  vName: ["اسم المنتج مطلوب.", "Product name is required."],
  vBrand: ["العلامة التجارية مطلوبة.", "Brand is required."],
  vDesc: ["وصف المنتج مطلوب.", "Product description is required."],
  vPrice: ["أدخل سعرًا صحيحًا.", "Enter a valid price."],
  vDiscount: ["سعر الخصم يجب أن يكون أقل من السعر الأساسي.", "Discount price must be lower than the original price."],
  vImages: ["أضف صورة واحدة على الأقل للمنتج.", "Add at least one product image."],
  vMax: ["يمكنك رفع 5 صور فقط.", "You can upload up to 5 images."],
  vOnlyImages: ["يمكن رفع ملفات الصور فقط.", "Only image files are allowed."],
  created: ["تم إنشاء المنتج بنجاح.", "Product created successfully."],
  saved: ["تم حفظ التغييرات بنجاح.", "Changes saved successfully."],
} as const;

type K = keyof typeof D;
const pick = (i: 0 | 1) =>
  Object.fromEntries(Object.entries(D).map(([k, v]) => [k, v[i]])) as Record<K, string>;

export type Tx = Record<K, string>;
export const T: Record<Locale, Tx> = { ar: pick(0), en: pick(1) };

/* ===================== STYLES (جوه الملفات، بيغلب Bootstrap) ===================== */
export const ADMIN_CSS = `
.gl-ad{--bg:#faf7f8;--card:#fff;--ink:#2a1a1f;--mut:#8b7b81;--line:#eee1e4;--soft:#fbe4e8;--link:#8b1538;--inp:#fff;--head:#fcf9fa;--hov:#fdf9fa;--ok:#16824d;--okb:#e9f7ef;--warn:#a96b00;--warnb:#fff3dc;--bad:#c03b4e;--badb:#fdebec;--off:#777176;--offb:#f1f0f1;min-height:100vh;padding:clamp(18px,3vw,36px) clamp(12px,2.4vw,28px) 60px;background:var(--bg);color:var(--ink)}
.gl-ad[data-theme="dark"]{--bg:#090c15;--card:#111624;--ink:#f6eef0;--mut:#9e969d;--line:#23293a;--soft:#2a1720;--link:#f4b6c2;--inp:#0d111d;--head:#0d111d;--hov:#151a28;--ok:#70d49f;--okb:#10291e;--warn:#dfb35c;--warnb:#302711;--bad:#df788a;--badb:#321921;--off:#b1abb0;--offb:#242631}
.gl-ad *{box-sizing:border-box}
.gl-ad h1,.gl-ad h2,.gl-ad h3,.gl-ad p{margin:0}
.gl-ad a{text-decoration:none}
.gl-ad .wrap{width:min(1400px,100%);margin:0 auto}
.gl-ad .hd{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:24px}
.gl-ad .crumb{display:flex;align-items:center;gap:8px;margin-bottom:8px;color:var(--mut);font-size:.78rem;font-weight:600}
.gl-ad .crumb a{color:var(--mut)}
.gl-ad .crumb a:hover{color:var(--link)}
.gl-ad .ttl{font-size:clamp(1.8rem,3vw,2.5rem);font-weight:600;line-height:1.2;color:var(--ink)}
.gl-ad .sub{margin-top:8px;color:var(--mut);font-size:.9rem}
.gl-ad .acts{display:flex;flex-wrap:wrap;gap:10px}

.gl-ad .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border:1px solid #8b1538;border-radius:12px;background:linear-gradient(180deg,#8f1739,#6d0f2b);box-shadow:0 6px 16px rgba(139,21,56,.18);color:#fff;font:inherit;font-size:.82rem;font-weight:700;white-space:nowrap;cursor:pointer;transition:filter .2s,transform .2s}
.gl-ad .btn:hover{color:#fff;filter:brightness(.92);transform:translateY(-1px)}
.gl-ad .btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.gl-ad .btn.ghost{background:var(--card);border-color:var(--line);box-shadow:none;color:var(--ink)}
.gl-ad .btn.ghost:hover{border-color:#cfa9b4;color:var(--link);filter:none}
.gl-ad .btn.soft{background:var(--soft);border-color:transparent;box-shadow:none;color:var(--link)}
.gl-ad .btn.soft:hover{color:var(--link)}
.gl-ad .btn.danger{background:#c13b4d;border-color:#c13b4d;box-shadow:none}
.gl-ad .btn.sm{min-height:34px;padding:0 12px;font-size:.74rem}

.gl-ad .card{background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:0 5px 18px rgba(139,21,56,.05)}
.gl-ad .stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:16px}
.gl-ad .stat{display:flex;align-items:center;gap:13px;padding:16px}
.gl-ad .stat i{display:grid;flex:0 0 44px;place-items:center;width:44px;height:44px;border-radius:13px;background:var(--soft);color:var(--link)}
.gl-ad .stat.ok i{background:var(--okb);color:var(--ok)}
.gl-ad .stat.off i{background:var(--offb);color:var(--off)}
.gl-ad .stat.bad i{background:var(--badb);color:var(--bad)}
.gl-ad .stat.warn i{background:var(--warnb);color:var(--warn)}
.gl-ad .stat small{display:block;margin-bottom:3px;color:var(--mut);font-size:.75rem;font-weight:600}
.gl-ad .stat b{font-size:1.5rem;line-height:1;font-weight:800}

.gl-ad input,.gl-ad select,.gl-ad textarea{width:100%;min-height:44px;padding:0 13px;border:1px solid var(--line);border-radius:12px;background:var(--inp);color:var(--ink);font:inherit;font-size:.86rem;outline:0;transition:border-color .2s,box-shadow .2s}
.gl-ad textarea{min-height:110px;padding:12px 13px;line-height:1.6;resize:vertical}
.gl-ad input:focus,.gl-ad select:focus,.gl-ad textarea:focus{border-color:#8b1538;box-shadow:0 0 0 3px rgba(139,21,56,.08)}
.gl-ad .tool{display:flex;align-items:center;gap:12px;padding:12px;margin-bottom:16px}
.gl-ad .search{position:relative;flex:1;min-width:240px}
.gl-ad .search svg{position:absolute;top:50%;inset-inline-start:13px;transform:translateY(-50%);color:var(--mut);pointer-events:none}
.gl-ad .search input{padding-inline:40px 38px}
.gl-ad .search button{position:absolute;top:50%;inset-inline-end:8px;display:grid;padding:4px;border:0;background:transparent;color:var(--mut);transform:translateY(-50%);cursor:pointer}
.gl-ad .filters{display:flex;flex-wrap:wrap;gap:9px}
.gl-ad .filters select{width:auto;min-width:140px;font-weight:600}

.gl-ad .tcard{overflow:hidden}
.gl-ad .thd{padding:16px 20px;border-bottom:1px solid var(--line)}
.gl-ad .thd h2{font-size:1.05rem;font-weight:700}
.gl-ad .thd span{color:var(--mut);font-size:.75rem}
.gl-ad .twrap{overflow-x:auto}
.gl-ad table{width:100%;border-collapse:collapse}
.gl-ad th{padding:13px 16px;border-bottom:1px solid var(--line);background:var(--head);color:var(--mut);font-size:.68rem;font-weight:800;letter-spacing:.4px;text-align:start;text-transform:uppercase;white-space:nowrap}
.gl-ad td{padding:14px 16px;border-bottom:1px solid var(--line);vertical-align:middle}
.gl-ad tbody tr:last-child td{border-bottom:0}
.gl-ad tbody tr.rowlink{cursor:pointer;transition:background .18s}
.gl-ad tbody tr.rowlink:hover{background:var(--hov)}
.gl-ad .pc{display:flex;align-items:center;gap:12px;min-width:220px}
.gl-ad .pimg{display:grid;flex:0 0 auto;place-items:center;width:56px;height:56px;overflow:hidden;border-radius:12px;background:var(--soft);color:var(--link)}
.gl-ad .pimg img{width:100%;height:100%;object-fit:cover}
.gl-ad .pn{display:flex;min-width:0;flex-direction:column;gap:2px}
.gl-ad .pn b{max-width:220px;overflow:hidden;color:var(--ink);font-size:.86rem;font-weight:700;text-overflow:ellipsis;white-space:nowrap}
.gl-ad .pn span{color:var(--mut);font-size:.74rem}
.gl-ad .pn small{color:var(--mut);font-size:.66rem;opacity:.8}
.gl-ad .pr b{font-size:.84rem;white-space:nowrap}
.gl-ad .pr del{display:block;color:var(--mut);font-size:.7rem}
.gl-ad .stk b{display:block;font-size:.9rem}
.gl-ad .stk span{font-size:.68rem;font-weight:700}
.gl-ad .t-ok{color:var(--ok)}
.gl-ad .t-warn{color:var(--warn)}
.gl-ad .t-bad{color:var(--bad)}
.gl-ad .feats{display:flex;flex-wrap:wrap;gap:5px;max-width:170px}

.gl-ad .bdg{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border:0;border-radius:999px;background:var(--soft);color:var(--link);font:inherit;font-size:.7rem;font-weight:700;white-space:nowrap}
.gl-ad button.bdg{cursor:pointer}
.gl-ad .bdg.ok{background:var(--okb);color:var(--ok)}
.gl-ad .bdg.off{background:var(--offb);color:var(--off)}
.gl-ad .bdg.warn{background:var(--warnb);color:var(--warn)}
.gl-ad .bdg i{width:6px;height:6px;border-radius:50%;background:currentColor}

.gl-ad .am{position:relative;display:inline-block}
.gl-ad .amb{display:grid;place-items:center;width:36px;height:36px;padding:0;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--mut);cursor:pointer}
.gl-ad .amb:hover{border-color:#d5abb7;color:var(--link)}
.gl-ad .menu{position:absolute;top:calc(100% + 6px);inset-inline-end:0;z-index:50;width:180px;padding:6px;border:1px solid var(--line);border-radius:12px;background:var(--card);box-shadow:0 15px 40px rgba(35,17,23,.18)}
.gl-ad .menu a,.gl-ad .menu button{display:flex;align-items:center;gap:9px;width:100%;min-height:37px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--ink);font:inherit;font-size:.78rem;font-weight:600;text-align:start;cursor:pointer}
.gl-ad .menu a:hover,.gl-ad .menu button:hover{background:var(--soft);color:var(--link)}
.gl-ad .menu .dg{color:var(--bad)}

.gl-ad .pg{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 18px;border-top:1px solid var(--line)}
.gl-ad .pg span{color:var(--mut);font-size:.75rem}
.gl-ad .pgb{display:flex;gap:5px}
.gl-ad .pgb button{display:grid;place-items:center;min-width:34px;height:34px;padding:0 6px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);font:inherit;font-size:.78rem;font-weight:700;cursor:pointer}
.gl-ad .pgb button:hover:not(:disabled),.gl-ad .pgb button.cur{border-color:#8b1538;background:#8b1538;color:#fff}
.gl-ad .pgb button:disabled{opacity:.4;cursor:not-allowed}

.gl-ad .state{display:flex;min-height:320px;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:30px;color:var(--mut);font-size:.85rem;text-align:center}
.gl-ad .state .ico{display:grid;place-items:center;width:62px;height:62px;border-radius:18px;background:var(--soft);color:var(--link)}
.gl-ad .state h3{color:var(--ink);font-size:1.1rem}
.gl-ad .state p{max-width:380px;line-height:1.7}
.gl-ad .loader{width:32px;height:32px;border:3px solid var(--line);border-top-color:#8b1538;border-radius:50%;animation:gl-spin .8s linear infinite}
.gl-ad .spin{animation:gl-spin .8s linear infinite}
@keyframes gl-spin{to{transform:rotate(360deg)}}
.gl-ad .alert{display:flex;align-items:center;gap:10px;padding:13px 16px;margin-bottom:16px;border:1px solid;border-radius:14px;font-size:.85rem;font-weight:600}
.gl-ad .alert.bad{border-color:rgba(192,59,78,.3);background:var(--badb);color:var(--bad)}
.gl-ad .alert.ok{border-color:rgba(22,130,77,.3);background:var(--okb);color:var(--ok)}
.gl-ad .alert .btn{margin-inline-start:auto}

.gl-ad .ovl{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:rgba(19,10,14,.5);backdrop-filter:blur(4px)}
.gl-ad .modal{width:min(430px,100%);padding:24px;border-radius:20px;background:var(--card);box-shadow:0 30px 90px rgba(0,0,0,.3)}
.gl-ad .modal .mi{display:grid;place-items:center;width:48px;height:48px;margin-bottom:14px;border-radius:14px;background:var(--badb);color:var(--bad)}
.gl-ad .modal h3{font-size:1.2rem;font-weight:700}
.gl-ad .modal p{margin:8px 0 16px;color:var(--mut);font-size:.82rem;line-height:1.7}
.gl-ad .mp{display:flex;align-items:center;gap:10px;padding:8px;border:1px solid var(--line);border-radius:12px;background:var(--head);font-size:.82rem;font-weight:700}
.gl-ad .mp .pimg{width:46px;height:46px;border-radius:9px}
.gl-ad .macts{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}

.gl-ad .dgrid{display:grid;grid-template-columns:minmax(0,440px) minmax(0,1fr);gap:20px;align-items:start}
.gl-ad .gal{padding:14px}
.gl-ad .big{display:grid;place-items:center;aspect-ratio:1;overflow:hidden;border-radius:14px;background:linear-gradient(135deg,#fbe4e8,#f6c9d3);color:#8b1538}
.gl-ad .big img{width:100%;height:100%;object-fit:cover}
.gl-ad .thumbs{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:10px}
.gl-ad .thumbs button{aspect-ratio:1;padding:0;overflow:hidden;border:2px solid transparent;border-radius:10px;background:var(--soft);cursor:pointer}
.gl-ad .thumbs button.on{border-color:#8b1538}
.gl-ad .thumbs img{width:100%;height:100%;object-fit:cover}
.gl-ad .info{padding:22px}
.gl-ad .info h1{font-size:clamp(1.5rem,2.4vw,2rem);font-weight:600;line-height:1.25}
.gl-ad .brand{margin-top:4px;color:var(--mut);font-size:.9rem}
.gl-ad .tags{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0}
.gl-ad .price{display:flex;align-items:baseline;gap:10px;margin:6px 0 16px}
.gl-ad .price b{color:var(--link);font-size:1.7rem;font-weight:800}
.gl-ad .price del{color:var(--mut)}
.gl-ad .kv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;overflow:hidden;border:1px solid var(--line);border-radius:14px;background:var(--line)}
.gl-ad .kv div{padding:12px 14px;background:var(--card)}
.gl-ad .kv small{display:block;margin-bottom:3px;color:var(--mut);font-size:.7rem;font-weight:600}
.gl-ad .kv b{font-size:.88rem}
.gl-ad .sec{padding:22px;margin-top:18px}
.gl-ad .sec h2{margin-bottom:14px;font-size:1.1rem;font-weight:700}
.gl-ad .chips{display:flex;flex-wrap:wrap;gap:8px}
.gl-ad .chip{padding:7px 13px;border-radius:999px;background:var(--soft);color:var(--link);font-size:.78rem;font-weight:600}
.gl-ad .ul{display:flex;flex-direction:column;gap:9px;margin:0;padding:0;list-style:none}
.gl-ad .ul li{display:flex;gap:9px;font-size:.88rem;line-height:1.6}
.gl-ad .ul li::before{content:"";flex:0 0 7px;height:7px;margin-top:.55em;border-radius:50%;background:#8b1538}
.gl-ad .txt{font-size:.9rem;line-height:1.9;white-space:pre-line}
.gl-ad .none{color:var(--mut);font-size:.85rem}

.gl-ad .sh{display:flex;align-items:flex-start;gap:13px;margin-bottom:22px}
.gl-ad .sh i{display:grid;flex:0 0 42px;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--soft);color:var(--link)}
.gl-ad .sh h2{margin:0;font-size:1.15rem}
.gl-ad .sh p{margin-top:3px;color:var(--mut);font-size:.75rem}
.gl-ad .g2,.gl-ad .g4{display:grid;gap:16px;margin-bottom:16px}
.gl-ad .g2{grid-template-columns:repeat(2,minmax(0,1fr))}
.gl-ad .g4{grid-template-columns:repeat(4,minmax(0,1fr))}
.gl-ad .fld{display:flex;flex-direction:column;gap:7px;margin-bottom:16px}
.gl-ad .g2 .fld,.gl-ad .g4 .fld{margin-bottom:0}
.gl-ad .fld label{display:block;font-size:.8rem;font-weight:700}
.gl-ad .fld label em{margin-inline-start:4px;color:var(--link);font-style:normal}
.gl-ad .hint{color:var(--mut);font-size:.72rem}
.gl-ad .imgs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
.gl-ad .imc{position:relative;aspect-ratio:1;overflow:hidden;border:1px solid var(--line);border-radius:14px;background:var(--soft)}
.gl-ad .imc img{width:100%;height:100%;object-fit:cover}
.gl-ad .imc .mark{position:absolute;top:8px;inset-inline:8px;padding:5px;border-radius:8px;background:rgba(110,15,44,.92);color:#fff;font-size:.62rem;font-weight:800;text-align:center}
.gl-ad .imc .rm{position:absolute;top:8px;inset-inline-end:8px;z-index:2;display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.95);color:#9b1c3e;cursor:pointer}
.gl-ad .imc .mark + .rm{top:38px}
.gl-ad .imc .mv{position:absolute;bottom:8px;inset-inline:8px;display:flex;justify-content:space-between}
.gl-ad .imc .mv button{display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:8px;background:rgba(255,255,255,.95);color:#6e0f2c;cursor:pointer}
.gl-ad .imc .mv button:disabled{opacity:.35;cursor:not-allowed}
.gl-ad .upl{display:flex;aspect-ratio:1;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:2px dashed #dfc4cb;border-radius:14px;background:var(--head);color:var(--link);font-size:.78rem;font-weight:700;text-align:center;cursor:pointer;transition:border-color .2s}
.gl-ad .upl:hover{border-color:#8b1538}
.gl-ad .upl small{color:var(--mut);font-size:.65rem;font-weight:500}
.gl-ad .upl .ico{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:var(--soft)}
.gl-ad .grp{margin-bottom:22px}
.gl-ad .grp h3{margin-bottom:12px;font-size:.85rem;font-weight:700}
.gl-ad .ch{display:inline-flex;align-items:center;gap:8px;padding:8px 13px;border:1px solid var(--line);border-radius:999px;background:var(--inp);color:var(--mut);font:inherit;font-size:.78rem;font-weight:700;cursor:pointer;transition:border-color .2s,background .2s}
.gl-ad .ch:hover{border-color:#c994a3}
.gl-ad .ch.sel{border-color:#8b1538;background:var(--soft);color:var(--link)}
.gl-ad .ch i{display:grid;place-items:center;width:17px;height:17px;border:1px solid var(--line);border-radius:50%}
.gl-ad .ch.sel i{border-color:#8b1538;background:#8b1538;color:#fff}
.gl-ad .chl{display:flex;flex-wrap:wrap;gap:9px}
.gl-ad .set{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:15px 0;border-bottom:1px solid var(--line)}
.gl-ad .set:last-child{border-bottom:0}
.gl-ad .set > div{display:flex;align-items:center;gap:13px}
.gl-ad .set .si{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--soft);color:var(--link)}
.gl-ad .set b{display:block;font-size:.88rem}
.gl-ad .set small{color:var(--mut);font-size:.72rem}
.gl-ad .tg{flex:0 0 auto;width:48px;height:27px;padding:3px;border:0;border-radius:999px;background:#d8ccd0;cursor:pointer;transition:background .2s}
.gl-ad .tg.on{background:#8b1538}
.gl-ad .tg span{display:block;width:21px;height:21px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.15);transition:transform .2s}
.gl-ad .tg.on span{transform:translateX(21px)}
.gl-ad[dir="rtl"] .tg.on span{transform:translateX(-21px)}
.gl-ad .fa{display:flex;justify-content:flex-end;gap:12px;margin-top:26px}

@media(max-width:1180px){
  .gl-ad .stats{grid-template-columns:repeat(3,1fr)}
  .gl-ad .tool{flex-direction:column;align-items:stretch}
  .gl-ad .dgrid{grid-template-columns:1fr}
}
@media(max-width:850px){
  .gl-ad .rt thead{display:none}
  .gl-ad .rt,.gl-ad .rt tbody,.gl-ad .rt tr{display:block;width:100%}
  .gl-ad .rt tr{padding:12px;border-bottom:1px solid var(--line)}
  .gl-ad .rt td{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 0;border:0}
  .gl-ad .rt td::before{content:attr(data-label);color:var(--mut);font-size:.7rem;font-weight:700}
  .gl-ad .rt td.first::before{content:none}
  .gl-ad .g4{grid-template-columns:repeat(2,minmax(0,1fr))}
  .gl-ad .imgs{grid-template-columns:repeat(3,minmax(0,1fr))}
  .gl-ad .pg{flex-direction:column}
}
@media(max-width:560px){
  .gl-ad .stats{grid-template-columns:repeat(2,1fr)}
  .gl-ad .stats .stat:first-child{grid-column:1/-1}
  .gl-ad .g2,.gl-ad .g4{grid-template-columns:1fr}
  .gl-ad .imgs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .gl-ad .fa{flex-direction:column-reverse}
  .gl-ad .fa .btn{width:100%}
  .gl-ad .kv{grid-template-columns:1fr}
  .gl-ad .filters select{flex:1}
}
@media(prefers-reduced-motion:reduce){.gl-ad *{transition:none!important;animation-duration:.01ms!important}}
`;