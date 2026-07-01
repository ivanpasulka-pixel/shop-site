const PRODUCTS = [
  {
    id: "hmp-suit",
    name: "Спортивный костюм HMP",
    price: 999,
    oldPrice: null,
    badge: "NEW",
    images: ["images/hmp-suit-1.jpg", "images/hmp-suit-2.jpg"],
    category: "sets",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    description: "Мягкий спортивный костюм для повседневных образов и streetwear-комбинаций."
  },
  {
    id: "cortiz-pants",
    name: "Спортивные штаны Cortiz",
    price: 999,
    oldPrice: null,
    badge: null,
    images: ["images/cortiz-pants-1.jpg"],
    category: "pants",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    description: "Свободные штаны в уличном стиле на каждый день."
  },
  {
    id: "guerillaz-longsleeve",
    name: "Лонгслив Guerillaz",
    price: 999,
    oldPrice: null,
    badge: "DROP",
    images: [
      "images/guerillaz-longsleeve-1.jpg",
      "images/guerillaz-longsleeve-2.jpg",
      "images/guerillaz-longsleeve-3.jpg"
    ],
    category: "tops",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    description: "Лонгслив с акцентом на принт и расслабленный силуэт."
  },
  {
    id: "guess-bag",
    name: "Сумка через плечо GUESS",
    price: 999,
    oldPrice: null,
    badge: null,
    images: ["images/guess-bag-1.jpg", "images/guess-bag-2.jpg"],
    category: "bags",
    inStock: true,
    description: "Компактная сумка через плечо для повседневных выходов."
  }
];

function findProduct(id) {
  return PRODUCTS.find((product) => product.id === id);
}

window.PRODUCTS = PRODUCTS;
window.findProduct = findProduct;
