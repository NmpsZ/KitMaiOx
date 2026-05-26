import type { Recipe } from "../types";

let localRecipeId = -1;

export function buildLocalSuggestions(ingredients: string[], language: "en" | "th" = "en"): Recipe[] {
  const first = ingredients[0] ?? "Egg";
  const second = ingredients[1] ?? "Rice";
  const third = ingredients[2] ?? "Garlic";
  const selected = ingredients.slice(0, 6);
  const createdAt = new Date().toISOString();

  if (language === "th") {
    return [
      {
        id: localRecipeId--,
        name: `ข้าวผัด ${first}`,
        difficulty: "Easy",
        estimatedTime: 20,
        calorieEstimate: 430,
        protein: 18,
        carbs: 52,
        fat: 14,
        iconEmoji: "🍳",
        ingredients: unique([...selected, "Rice", "Soy sauce"]),
        steps: [
          "เตรียมวัตถุดิบให้พร้อมและหั่นเป็นชิ้นพอดีคำ",
          "ตั้งกระทะ ใส่น้ำมันเล็กน้อย แล้วผัดวัตถุดิบหลักจนสุก",
          "ใส่ข้าวและเครื่องปรุง ผัดให้เข้ากัน",
          "ชิมรส ปรับตามชอบ แล้วเสิร์ฟตอนร้อน"
        ],
        language,
        createdAt
      },
      {
        id: localRecipeId--,
        name: `สลัดอุ่น ${second}`,
        difficulty: "Easy",
        estimatedTime: 15,
        calorieEstimate: 320,
        protein: 12,
        carbs: 28,
        fat: 18,
        iconEmoji: "🥗",
        ingredients: unique([...selected, "Lime", "Olive oil"]),
        steps: [
          "ลวกหรือย่างวัตถุดิบที่ต้องการให้สุกพอดี",
          "ผสมน้ำสลัดจากมะนาว น้ำมัน และเครื่องปรุง",
          "คลุกทุกอย่างเบา ๆ ให้เคลือบน้ำสลัด",
          "จัดจานพร้อมโรยสมุนไพร"
        ],
        language,
        createdAt
      },
      {
        id: localRecipeId--,
        name: `ซุปเร็ว ${third}`,
        difficulty: "Medium",
        estimatedTime: 30,
        calorieEstimate: 380,
        protein: 22,
        carbs: 30,
        fat: 16,
        iconEmoji: "🍲",
        ingredients: unique([...selected, "Garlic", "Black pepper"]),
        steps: [
          "ผัดกระเทียมและวัตถุดิบหอมจนมีกลิ่น",
          "เติมน้ำหรือน้ำสต็อกแล้วต้มให้เดือด",
          "ใส่วัตถุดิบที่เหลือ ต้มจนสุกนุ่ม",
          "ปรุงรสและเสิร์ฟพร้อมข้าวหรือขนมปัง"
        ],
        language,
        createdAt
      }
    ];
  }

  return [
    {
      id: localRecipeId--,
      name: `${first} fried rice`,
      difficulty: "Easy",
      estimatedTime: 20,
      calorieEstimate: 430,
      protein: 18,
      carbs: 52,
      fat: 14,
      iconEmoji: "🍳",
      ingredients: unique([...selected, "Rice", "Soy sauce"]),
      steps: [
        "Prep the ingredients and cut everything into bite-size pieces.",
        "Heat a pan with a little oil, then cook the main ingredient.",
        "Add rice and seasoning, then stir-fry until evenly mixed.",
        "Taste, adjust seasoning, and serve hot."
      ],
      language,
      createdAt
    },
    {
      id: localRecipeId--,
      name: `Warm ${second} salad`,
      difficulty: "Easy",
      estimatedTime: 15,
      calorieEstimate: 320,
      protein: 12,
      carbs: 28,
      fat: 18,
      iconEmoji: "🥗",
      ingredients: unique([...selected, "Lime", "Olive oil"]),
      steps: [
        "Cook any ingredients that need heat until just tender.",
        "Whisk lime, olive oil, salt, and pepper into a quick dressing.",
        "Toss the ingredients gently with the dressing.",
        "Plate and finish with herbs or crunchy toppings."
      ],
      language,
      createdAt
    },
    {
      id: localRecipeId--,
      name: `Quick ${third} soup`,
      difficulty: "Medium",
      estimatedTime: 30,
      calorieEstimate: 380,
      protein: 22,
      carbs: 30,
      fat: 16,
      iconEmoji: "🍲",
      ingredients: unique([...selected, "Garlic", "Black pepper"]),
      steps: [
        "Saute aromatics until fragrant.",
        "Add water or stock and bring it to a boil.",
        "Add the remaining ingredients and simmer until tender.",
        "Season to taste and serve with rice or bread."
      ],
      language,
      createdAt
    }
  ];
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
