const categories = ["Touch", "Belleza", "Premium", "Cotton Plus"];
const laboratories = ["San Jacinto"];
const colors = ["Blanco", "Negro", "Azul", "Plomo", "Crema", "Azul Colombia", "Beige", "Celeste Fox", "Verde Laurel", "Acero", "Lila", "Fresa", "Tierra", "Rosa Fuerte", "Cocona", "Fucsia", "Guinda TX", "Purpura", "Verde Oscuro"];

const colorCodes = {
    "Blanco": "982004",
    "Negro": "100001",
    "Azul": "271032",
    "Plomo": "470009",
    "Crema": "921001",
    "Azul Colombia": "284000",
    "Beige": "622002",
    "Celeste Fox": "574008",
    "Verde Laurel": "541008",
    "Acero": "372021",
    "Lila": "583009",
    "Fresa": "508002",
    "Tierra": "422014",
    "Rosa Fuerte": "702002",
    "Cocona": "826001",
    "Fucsia": "696000",
    "Guinda TX": "204004",
    "Purpura": "394002",
    "Verde Oscuro": "242001"
};

const sizes = ["150 x 75 cm", "75 x 40 cm", "1.20 x 0.60 m", "1.40 x 0.70 m", "0.60 x 0.40 m", "1.60 x 0.75 m", "1.45 x 0.75 m", "0.80 x 0.40 m", "0.30 x 0.30 m", "1.80 x 0.90 m"];

const initialCampaigns = [
    { id: 1, name: "Día de la Madre", description: "El mejor regalo para mamá con 50% de dcto.", startDate: "2026-05-01", endDate: "2026-05-15" },
    { id: 3, name: "25% de descuento", description: "Descuento directo en marcas seleccionadas.", startDate: "2026-04-01", endDate: "2026-12-31" },
    { id: 4, name: "Nuevo", description: "Descubre los lanzamientos más recientes del mercado.", startDate: "2026-04-15", endDate: "2026-05-15" }
];

const campaigns = JSON.parse(localStorage.getItem('pharmaCampaigns')) || initialCampaigns;

const baseProducts = [
    { articulo: "7015", name: "Toalla Belleza 150x75", category: "Belleza", laboratory: "San Jacinto", price: 15.97, costo: 11.18, dim: "150 x 75 cm", pack: "12" },
    { articulo: "7016", name: "Toalla Belleza 75x40", category: "Belleza", laboratory: "San Jacinto", price: 5.04, costo: 3.53, dim: "75 x 40 cm", pack: "20" },
    { articulo: "7018", name: "Toalla Belleza 1.20x0.60", category: "Belleza", laboratory: "San Jacinto", price: 10.68, costo: 7.48, dim: "1.20 x 0.60 m", pack: "12" },
    { articulo: "7041", name: "Toalla Cotton Touch 1.40x0.70", category: "Touch", laboratory: "San Jacinto", price: 17.32, costo: 12.12, dim: "1.40 x 0.70 m", pack: "12" },
    { articulo: "7042", name: "Toalla Cotton Touch 0.60x0.40", category: "Touch", laboratory: "San Jacinto", price: 5.21, costo: 3.65, dim: "0.60 x 0.40 m", pack: "25" },
    { articulo: "7043", name: "Toalla Cotton Touch 1.20x0.60", category: "Touch", laboratory: "San Jacinto", price: 13.03, costo: 9.12, dim: "1.20 x 0.60 m", pack: "12" },
    { articulo: "7044", name: "Toalla Cotton Touch 1.60x0.75", category: "Touch", laboratory: "San Jacinto", price: 21.02, costo: 14.71, dim: "1.60 x 0.75 m", pack: "12" },
    { articulo: "7056", name: "Toalla Cotton Plus 1.45x0.75", category: "Cotton Plus", laboratory: "San Jacinto", price: 23.54, costo: 16.48, dim: "1.45 x 0.75 m", pack: "12" },
    { articulo: "7057", name: "Toalla Cotton Plus 0.80x0.40", category: "Cotton Plus", laboratory: "San Jacinto", price: 8.03, costo: 5.62, dim: "0.80 x 0.40 m", pack: "20" },
    { articulo: "7058", name: "Toalla Cotton Plus 0.30x0.30", category: "Cotton Plus", laboratory: "San Jacinto", price: 5.89, costo: 4.12, dim: "0.30 x 0.30 m", pack: "25" },
    { articulo: "7059", name: "Toalla Cotton Plus 1.80x0.90", category: "Cotton Plus", laboratory: "San Jacinto", price: 31.11, costo: 21.78, dim: "1.80 x 0.90 m", pack: "12" },
    { articulo: "7066", name: "Toalla Premium 1.45x0.75", category: "Premium", laboratory: "San Jacinto", price: 29.43, costo: 20.60, dim: "1.45 x 0.75 m", pack: "12" }
];

const colorImages = {
    "Blanco": "./TOALLAS COLORES/BLANCO.png",
    "Negro": "./TOALLAS COLORES/NEGRO.png",
    "Azul": "./TOALLAS COLORES/AZUL.png",
    "Plomo": "./TOALLAS COLORES/PLOMO.png",
    "Crema": "./TOALLAS COLORES/CREMA.png",
    "Azul Colombia": "./TOALLAS COLORES/AZUL COLOMBIA.png",
    "Beige": "./TOALLAS COLORES/BEIGE.png",
    "Celeste Fox": "./TOALLAS COLORES/CELESTE FOX.png",
    "Verde Laurel": "./TOALLAS COLORES/VERDE LAUREL.png",
    "Acero": "./TOALLAS COLORES/ACERO.png",
    "Lila": "./TOALLAS COLORES/LILA.png",
    "Fresa": "./TOALLAS COLORES/FRESA.png",
    "Tierra": "./TOALLAS COLORES/TIERRA.png",
    "Rosa Fuerte": "./TOALLAS COLORES/ROSA FUERTE.png",
    "Cocona": "./TOALLAS COLORES/COCONA.png",
    "Fucsia": "./TOALLAS COLORES/Fucsia.png",
    "Guinda TX": "./TOALLAS COLORES/GUINDA TX.png",
    "Purpura": "./TOALLAS COLORES/PURPURA.png",
    "Verde Oscuro": "./TOALLAS COLORES/VERDE OSCURO.png"
};

const colorImagesPeque = {
    "Blanco": "./TOALLAS COLORES PEQUE/BLANCO.png",
    "Negro": "./TOALLAS COLORES PEQUE/NEGRO.png",
    "Azul": "./TOALLAS COLORES PEQUE/AZUL.png",
    "Plomo": "./TOALLAS COLORES PEQUE/PLOMO.png",
    "Crema": "./TOALLAS COLORES PEQUE/CREMA.png",
    "Azul Colombia": "./TOALLAS COLORES PEQUE/AZUL COLOMBIA.png",
    "Beige": "./TOALLAS COLORES PEQUE/BEIGE.png",
    "Celeste Fox": "./TOALLAS COLORES PEQUE/CELESTE FOX.png",
    "Verde Laurel": "./TOALLAS COLORES PEQUE/VERDE LAUREL.png",
    "Acero": "./TOALLAS COLORES PEQUE/ACERO.png",
    "Lila": "./TOALLAS COLORES PEQUE/LILA.png",
    "Fresa": "./TOALLAS COLORES PEQUE/FRESA.png",
    "Tierra": "./TOALLAS COLORES PEQUE/TIERRA.png",
    "Rosa Fuerte": "./TOALLAS COLORES PEQUE/ROSA FUERTE.png",
    "Cocona": "./TOALLAS COLORES PEQUE/COCONA.png",
    "Fucsia": "./TOALLAS COLORES PEQUE/Fucsia.png",
    "Guinda TX": "./TOALLAS COLORES PEQUE/GUINDA TX.png",
    "Purpura": "./TOALLAS COLORES PEQUE/PURPURA.png",
    "Verde Oscuro": "./TOALLAS COLORES PEQUE/VERDE OSCURO.png"
};

let products = [];
let idCounter = 1;

baseProducts.forEach(base => {
    // Assign offers deterministically based on article number to keep prices stable on reload
    let offers = [];
    if (base.articulo === "7015" || base.articulo === "7059") {
        offers = ["Día de la Madre"];
    } else if (base.articulo === "7041" || base.articulo === "7057") {
        offers = ["25% de descuento"];
    } else if (base.articulo === "7056" || base.articulo === "7066") {
        offers = ["Nuevo"];
    }

    let originalPrice = null;
    let finalPrice = base.price;
    let discountPercent = 0;

    if (offers.includes("Día de la Madre")) {
        originalPrice = base.price;
        finalPrice = parseFloat((base.price * 0.5).toFixed(2));
        discountPercent = 50;
    } else if (offers.includes("25% de descuento")) {
        originalPrice = base.price;
        finalPrice = parseFloat((base.price * 0.75).toFixed(2));
        discountPercent = 25;
    }

    colors.forEach(color => {
        const code = colorCodes[color] || "000000";
        const packSize = parseInt(base.pack) || 12;
        const stockUnits = packSize * (Math.floor(Math.random() * 15) + 5);
        const stockPacks = stockUnits / packSize;

        products.push({
            id: idCounter++,
            name: `${base.name} - ${color}`,
            category: base.category,
            laboratory: base.laboratory,
            price: finalPrice,
            originalPrice: originalPrice,
            discount: discountPercent,
            costo_unitario: base.costo,
            articulo: base.articulo,
            dimensiones: base.dim,
            pack: base.pack,
            colores: [color],
            colorCode: code,
            stock_unidades: stockUnits,
            stock_paquetes: stockPacks,
            image: colorImages[color] || "./assets/product.png",
            image2: colorImagesPeque[color] || "./assets/product.png",
            isFavorite: base.articulo === "7015" && color === "Negro", // Stable initial favorite
            offers: offers
        });
    });
});



products.shift(); // Borra el primer producto de la lista ("Toalla Belleza 150x75 - Blanco")

export { categories, laboratories, colors, colorCodes, sizes, campaigns, products };
