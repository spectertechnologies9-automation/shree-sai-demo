/**
 * Business facts. Every value here is taken from the showroom film or from the
 * company's own website (saigoldpalace.com, contact and about pages).
 * Nothing in this file is invented; change it here and the whole site follows.
 */
export const site = {
  name: "Shree Sai Gold Palace",
  branch: "Malleshwaram",
  city: "Bengaluru",
  url: "https://www.saigoldpalace.com",

  address: {
    line1: "#340, 11th Cross, Sampige Road",
    line2: "Malleshwaram, Bengaluru 560003",
    full: "#340, 11th Cross, Sampige Road, Malleshwaram, Bengaluru, Karnataka 560003",
  },

  // Malleshwaram showroom mobile, as listed on the official contact page.
  phone: { display: "+91 63649 22918", tel: "+916364922918" },
  tollFree: { display: "1800 203 4323", tel: "18002034323" },
  email: "ssgpalace@gmail.com",

  // Official contact page: "10:30 A.M-8:30 P.M (Open On Sundays)".
  hours: { days: "Every day, Sundays included", time: "10:30 am – 8:30 pm" },

  /**
   * WhatsApp: the official site does not state a WhatsApp number, so the button
   * stays hidden until the business confirms one. Set digits only, with country
   * code (e.g. "9163XXXXXXXX"), and the button appears everywhere.
   */
  whatsapp: null as string | null,

  mapsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(
      "Shree Sai Gold Palace, 340, 11th Cross, Sampige Road, Malleshwaram, Bengaluru 560003",
    ),

  // "From our humble beginning in 1992" — official about page.
  since: 1992,

  otherShowrooms: [
    "Basavanagudi",
    "HSR Layout",
    "Yelahanka",
    "KR Puram",
    "Nagarabhavi",
    "Raghuvanahalli",
  ],

  credit: "Architecture, interiors and showroom film by SR Creations",
} as const;

export const whatsappUrl = site.whatsapp
  ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
      "Hello, I would like to visit Shree Sai Gold Palace, Malleshwaram.",
    )}`
  : null;

export const scenes = [
  { id: "arrive", label: "Arrive" },
  { id: "gold", label: "The Gold Hall" },
  { id: "craft", label: "In Detail" },
  { id: "collections", label: "Collections" },
  { id: "floors", label: "Three Floors" },
  { id: "house", label: "Our House" },
  { id: "visit", label: "Visit" },
] as const;
