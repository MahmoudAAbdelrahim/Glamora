import type { Locale } from "./config";

const dictionaries = {
  ar: {
    nav: {
      home: "الرئيسية",
      products: "المنتجات",
      about: "من نحن",
      contact: "تواصل معنا",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      cart: "السلة",
    },

    common: {
      search: "بحث",
      language: "اللغة",
      theme: "المظهر",
      light: "فاتح",
      dark: "داكن",
    },
  },

  en: {
    nav: {
      home: "Home",
      products: "Products",
      about: "About Us",
      contact: "Contact",
      login: "Login",
      register: "Register",
      cart: "Cart",
    },

    common: {
      search: "Search",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
    },
  },
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale];
}