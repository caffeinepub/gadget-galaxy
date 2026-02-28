import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    currency : Text;
    category : Text;
    imageUrl : Text;
    stock : Nat;
  };

  type Actor = {
    products : Map.Map<Text, Product>;
  };

  public func run(old : Actor) : Actor {
    // Fix faulty products
    let fixedProducts = old.products.map<Text, Product, Product>(
      func(_id, product) {
        if (product.description == "" or product.stock == 42 or product.name.contains(#text("REPLACE"))) {
          { product with description = "Cat sculpture"; name = "Cat sculpture"; stock = 9001 };
        } else {
          product;
        };
      }
    );
    {
      old with products = fixedProducts;
    };
  };
};
