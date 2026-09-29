export type Food = {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  desc: string;
  vegan?: boolean;
  gf?: boolean;
  spicy?: boolean;
};

type FoodSeed = Omit<Food, "id" | "priceCents"> & { price: number };

const seeds: FoodSeed[] = [
  { name: "Chicken Shawarma Wrap", category: "Wraps", price: 12.49, desc: "Garlic toum, pickles, tomato, fries tucked inside." },
  { name: "Beef Shawarma Wrap", category: "Wraps", price: 13.49, desc: "Tahini, onion-sumac, parsley, pickled turnip." },
  { name: "Falafel Wrap", category: "Wraps", price: 11.49, desc: "Crispy falafel, tahini, tomato, cucumber, mint.", vegan: true },
  { name: "Chicken Rice Plate", category: "Rice plates", price: 15.99, desc: "Saffron rice, shawarma, fattoush, hummus, pita." },
  { name: "Beef Rice Plate", category: "Rice plates", price: 16.99, desc: "Saffron rice, beef shawarma, tabbouleh, tahini." },
  { name: "Falafel Rice Plate", category: "Rice plates", price: 14.49, desc: "Five falafel, rice, salad, hummus, harissa.", vegan: true, gf: true },
  { name: "Mixed Grill Plate", category: "Rice plates", price: 18.99, desc: "Chicken and beef shawarma, both sauces, all the pickles." },
  { name: "Chicken Salad Bowl", category: "Salad bowls", price: 14.99, desc: "Greens, cucumber, tomato, pickled onion, pita chips." },
  { name: "Beef Salad Bowl", category: "Salad bowls", price: 15.99, desc: "Greens, tabbouleh, feta, sumac vinaigrette.", gf: true },
  { name: "Falafel Salad Bowl", category: "Salad bowls", price: 13.49, desc: "Greens, falafel, tahini, pomegranate, herbs.", vegan: true, gf: true },
  { name: "Chicken Shawarma Plate", category: "Shawarma plates", price: 16.49, desc: "Shawarma, fries, garlic toum, pickles, pita." },
  { name: "Beef Shawarma Plate", category: "Shawarma plates", price: 17.49, desc: "Shawarma, fries, tahini, grilled tomato, pita." },
  { name: "Hummus", category: "Mezze & dips", price: 6.99, desc: "Silky chickpea, tahini, olive oil, warm pita.", vegan: true, gf: true },
  { name: "Baba Ghanoush", category: "Mezze & dips", price: 7.49, desc: "Smoked eggplant, garlic, pomegranate.", vegan: true, gf: true },
  { name: "Tzatziki", category: "Mezze & dips", price: 5.99, desc: "Greek yogurt, cucumber, dill.", gf: true },
  { name: "Muhammara", category: "Mezze & dips", price: 7.49, desc: "Roasted pepper, walnut, pomegranate molasses.", vegan: true, spicy: true },
  { name: "Mezze Trio", category: "Mezze & dips", price: 15.99, desc: "Any three dips with a stack of pita.", vegan: true },
  { name: "Za'atar Fries", category: "Sides", price: 5.49, desc: "Crispy fries, za'atar, sea salt, toum to dip.", vegan: true, gf: true },
  { name: "Saffron Rice", category: "Sides", price: 3.99, desc: "Fluffy basmati with saffron and vermicelli.", vegan: true },
  { name: "Grape Leaves", category: "Sides", price: 6.49, desc: "Six dolmas with rice, herbs and lemon.", vegan: true, gf: true },
  { name: "Warm Pita", category: "Sides", price: 1.99, desc: "Two rounds, brushed with olive oil.", vegan: true },
  { name: "Fattoush", category: "Sides", price: 6.99, desc: "Crunchy salad, sumac, fried pita.", vegan: true },
  { name: "Kids Chicken Plate", category: "Kids", price: 8.99, desc: "Shawarma, rice, fries, juice or ayran." },
  { name: "Mini Falafel Pita", category: "Kids", price: 7.99, desc: "Three falafel, hummus, cucumber.", vegan: true },
  { name: "Family Feast", category: "Family & trays", price: 64.99, desc: "Serves 4. Mixed shawarma, rice, salad, two dips, pita." },
  { name: "Wrap Tray", category: "Family & trays", price: 129, desc: "12 wraps, cut in half. Mix chicken, beef, falafel." },
  { name: "Baklava", category: "Desserts", price: 5.49, desc: "Four pieces, pistachio and local honey." },
  { name: "Kunafa", category: "Desserts", price: 7.99, desc: "Warm shredded pastry, sweet cheese, orange blossom." },
  { name: "Mint Lemonade", category: "Drinks", price: 4.99, desc: "Fresh lemon, mint, blended with ice.", vegan: true, gf: true },
  { name: "Ayran", category: "Drinks", price: 3.49, desc: "Salted yogurt drink. Cool and tangy.", gf: true },
  { name: "Turkish Coffee", category: "Drinks", price: 3.99, desc: "Cardamom, strong, unfiltered.", vegan: true, gf: true },
  { name: "Hibiscus Iced Tea", category: "Drinks", price: 3.99, desc: "Tart, floral, lightly sweetened.", vegan: true, gf: true },
];

export const slug = (name: string) => name.toLowerCase().replaceAll("'", "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const orderingMenu: Food[] = seeds.map(({ price, ...item }) => ({
  ...item,
  id: slug(item.name),
  priceCents: Math.round(price * 100),
}));

export const menuById = new Map(orderingMenu.map((item) => [item.id, item]));
export const menuCategories = ["All", "Wraps", "Rice plates", "Salad bowls", "Shawarma plates", "Mezze & dips", "Sides", "Kids", "Family & trays", "Desserts", "Drinks"];
export const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
