from decimal import Decimal
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models.user import User
from app.models.category import Category
from app.models.food import Food
from app.core.security import get_password_hash

def seed_database(db: Session = None):
    close_db = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    try:
        print("🌱 Starting FoodieHub database seed...")

        demo_users = [
            {
                "full_name": "Demo Customer",
                "email": "customer@foodiehub.com",
                "password": "Password123!",
                "role": "CUSTOMER"
            },
            {
                "full_name": "Arjun Sharma",
                "email": "testuser@foodiehub.com",
                "password": "Password123!",
                "role": "CUSTOMER"
            },
            {
                "full_name": "FoodieHub Admin",
                "email": "admin@foodiehub.com",
                "password": "Admin123!",
                "role": "ADMIN"
            }
        ]

        for u in demo_users:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    full_name=u["full_name"],
                    email=u["email"],
                    password_hash=get_password_hash(u["password"]),
                    role=u["role"]
                )
                db.add(user)
                print(f"  Created user: {u['email']} ({u['role']})")
            else:
                existing.role = u["role"]
                print(f"  Updated user role: {u['email']} -> {u['role']}")
        db.commit()

        # 2. Seed Categories
        categories_data = [
            {"name": "Burgers", "description": "Juicy grilled patties, crispy buns, and artisan sauces."},
            {"name": "Pizza", "description": "Authentic wood-fired and cheesy hand-tossed pizzas."},
            {"name": "Indian", "description": "Rich gravies, tandoori grills, aromatic biryanis, and warm naans."},
            {"name": "Chinese", "description": "Wok-tossed noodles, fried rice, dumplings, and spicy appetisers."},
            {"name": "Desserts", "description": "Sweet indulgences, decadent cakes, kulfis, and pastries."},
            {"name": "Beverages", "description": "Chilled coolers, thick shakes, freshly brewed chai, and mocktails."}
        ]

        category_map = {}
        for cat in categories_data:
            existing = db.query(Category).filter(Category.name == cat["name"]).first()
            if not existing:
                category = Category(name=cat["name"], description=cat["description"])
                db.add(category)
                db.commit()
                db.refresh(category)
                category_map[cat["name"]] = category
                print(f"  Created category: {cat['name']}")
            else:
                category_map[cat["name"]] = existing

        # 3. Seed Food Items (24 realistic items, veg/non-veg, available & unavailable)
        foods_data = [
            # Burgers
            {
                "name": "Classic Crispy Veg Burger",
                "description": "Crispy spiced potato patty with iceberg lettuce, tomatoes, and chef's special secret sauce.",
                "price": Decimal("149.00"),
                "category": "Burgers",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Smoked Tandoori Chicken Burger",
                "description": "Flame-grilled chicken fillet infused with tandoori spices, mint mayonnaise, and onions.",
                "price": Decimal("229.00"),
                "category": "Burgers",
                "is_vegetarian": False,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Double Cheese Paneer Burst Burger",
                "description": "Soft spiced paneer slab loaded with double melted cheddar and jalapeño relish.",
                "price": Decimal("189.00"),
                "category": "Burgers",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Ultimate Lamb Gourmet Burger",
                "description": "Tender minced lamb patty with caramelized onions, gouda cheese, and garlic herb aioli.",
                "price": Decimal("329.00"),
                "category": "Burgers",
                "is_vegetarian": False,
                "is_available": False,  # Unavailable for testing boundary edge case
                "image_url": "https://images.unsplash.com/photo-1582196016295-f8c8bd4b3e99?w=600&auto=format&fit=crop&q=80"
            },

            # Pizza
            {
                "name": "Margherita Fresca Pizza",
                "description": "Classic thin crust topped with San Marzano tomato sauce, fresh buffalo mozzarella, and basil.",
                "price": Decimal("299.00"),
                "category": "Pizza",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Paneer Tikka Supreme Pizza",
                "description": "Spiced paneer chunks, bell peppers, red onions, and coriander with smoky makhani drizzle.",
                "price": Decimal("389.00"),
                "category": "Pizza",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Fiery Peri-Peri Chicken Pizza",
                "description": "Succulent peri-peri spiced roast chicken, grilled mushrooms, and jalapeños on cheesy crust.",
                "price": Decimal("449.00"),
                "category": "Pizza",
                "is_vegetarian": False,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Truffle Mushroom Artisan Pizza",
                "description": "Wild button mushrooms, caramelized shallots, parmesan shavings, and black truffle oil.",
                "price": Decimal("499.00"),
                "category": "Pizza",
                "is_vegetarian": True,
                "is_available": False,  # Unavailable for testing edge case
                "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80"
            },

            # Indian
            {
                "name": "Paneer Butter Masala",
                "description": "Fresh cottage cheese simmered in a velvety tomato, butter, and cashew nut gravy.",
                "price": Decimal("279.00"),
                "category": "Indian",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Old Delhi Butter Chicken",
                "description": "Clay-oven smoked shredded chicken in aromatic creamy makhani gravy with fenugreek leaves.",
                "price": Decimal("349.00"),
                "category": "Indian",
                "is_vegetarian": False,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Hyderabadi Chicken Dum Biryani",
                "description": "Fragrant basmati rice layered with spiced chicken, saffron, mint, and fried onions with raita.",
                "price": Decimal("319.00"),
                "category": "Indian",
                "is_vegetarian": False,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Dal Makhani Amritsari",
                "description": "Whole black lentils slow-cooked overnight with white butter, cream, and ginger juliennes.",
                "price": Decimal("229.00"),
                "category": "Indian",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Butter Garlic Naan (2 pcs)",
                "description": "Refined flour flatbread brushed with crushed roasted garlic and fresh dairy butter.",
                "price": Decimal("89.00"),
                "category": "Indian",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80"
            },

            # Chinese
            {
                "name": "Schezwan Hakka Veg Noodles",
                "description": "Springy wheat noodles wok-tossed with shredded cabbage, bell peppers, and spicy schezwan sauce.",
                "price": Decimal("199.00"),
                "category": "Chinese",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Chilli Chicken Dry",
                "description": "Crispy boneless chicken tossed with green chilies, onions, bell peppers, and dark soya sauce.",
                "price": Decimal("269.00"),
                "category": "Chinese",
                "is_vegetarian": False,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Veg Manchurian Gravy",
                "description": "Steamed & fried vegetable dumplings simmered in tangy ginger-garlic and scallion sauce.",
                "price": Decimal("219.00"),
                "category": "Chinese",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Egg Chicken Fried Rice",
                "description": "Aromatic jasmine rice tossed with scrambled eggs, chicken bits, spring onions, and light soya.",
                "price": Decimal("249.00"),
                "category": "Chinese",
                "is_vegetarian": False,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80"
            },

            # Desserts
            {
                "name": "Warm Gulab Jamun (3 pcs)",
                "description": "Melt-in-mouth milk dumplings soaked in green cardamom and saffron rose syrup.",
                "price": Decimal("119.00"),
                "category": "Desserts",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Molten Chocolate Lava Cake",
                "description": "Warm Belgian dark chocolate cake with a rich liquid truffle center.",
                "price": Decimal("169.00"),
                "category": "Desserts",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Royal Kesar Pista Kulfi",
                "description": "Traditional Indian dense ice cream flavored with saffron strands, pistachios, and almonds.",
                "price": Decimal("99.00"),
                "category": "Desserts",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "New York Baked Cheesecake",
                "description": "Rich and dense cream cheese cake on a golden buttery graham cracker crust.",
                "price": Decimal("199.00"),
                "category": "Desserts",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80"
            },

            # Beverages
            {
                "name": "Alphonso Mango Lassi",
                "description": "Thick, creamy yogurt drink blended with pure Ratnagiri Alphonso mango pulp and cardamom.",
                "price": Decimal("129.00"),
                "category": "Beverages",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1546883468-a37f3f158218?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Fresh Mint Virgin Mojito",
                "description": "Crushed fresh mint leaves, zesty lime wedges, simple syrup, and sparkling club soda over ice.",
                "price": Decimal("119.00"),
                "category": "Beverages",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Cold Brew Iced Coffee",
                "description": "16-hour slow steeped Arabica coffee served with chilled milk and salted caramel swirl.",
                "price": Decimal("149.00"),
                "category": "Beverages",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Masala Chai Flask (Serves 2)",
                "description": "Strong Assam CTC tea brewed with fresh ginger, crushed green cardamom, and lemongrass.",
                "price": Decimal("79.00"),
                "category": "Beverages",
                "is_vegetarian": True,
                "is_available": True,
                "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80"
            }
        ]

        for item in foods_data:
            existing = db.query(Food).filter(Food.name == item["name"]).first()
            cat = category_map.get(item["category"])
            if not cat:
                continue

            if not existing:
                food = Food(
                    name=item["name"],
                    description=item["description"],
                    price=item["price"],
                    category_id=cat.id,
                    is_vegetarian=item["is_vegetarian"],
                    is_available=item["is_available"],
                    image_url=item["image_url"]
                )
                db.add(food)
                print(f"  Created food: {item['name']} (₹{item['price']})")
        
        db.commit()
        print("✅ Database seed completed successfully!")

    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    seed_database()
