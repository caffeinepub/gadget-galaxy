import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ProductId = Text;
  public type Quantity = Nat;

  public type Order = {
    id : Nat;
    products : [(ProductId, Quantity)];
    timestamp : Time.Time;
    principal : Principal;
  };

  public type UserProfile = {
    name : Text;
  };

  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    currency : Text;
    category : Text;
    imageUrl : Text;
    stock : Nat;
  };

  let orders = Map.empty<Principal, List.List<Order>>();
  var nextOrderId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<Text, Product>();

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Product Management
  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == category });
  };

  public query func getProductDetails(productId : ProductId) : async ?Product {
    products.get(productId);
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productId);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Order Management
  public shared ({ caller }) func submitOrder(orderProducts : [(ProductId, Quantity)]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit orders");
    };
    if (orderProducts.size() == 0) {
      Runtime.trap("Order must contain at least one product");
    };

    let order : Order = {
      id = nextOrderId;
      products = orderProducts;
      timestamp = Time.now();
      principal = caller;
    };

    let existingOrders = switch (orders.get(caller)) {
      case (null) {
        let newList = List.empty<Order>();
        newList.add(order);
        newList;
      };
      case (?orderList) {
        orderList.add(order);
        orderList;
      };
    };

    orders.add(caller, existingOrders);
    nextOrderId += 1;
    order.id;
  };

  public query ({ caller }) func getOrdersForCaller() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    switch (orders.get(caller)) {
      case (null) { [] };
      case (?orderList) {
        orderList.toArray();
      };
    };
  };

  public query ({ caller }) func getOrdersForUser(user : Principal) : async [Order] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    switch (orders.get(user)) {
      case (null) { [] };
      case (?orderList) {
        orderList.toArray();
      };
    };
  };

  public query ({ caller }) func getOrderForCaller(orderId : Nat) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    switch (orders.get(caller)) {
      case (null) { null };
      case (?orderList) {
        let filteredOrders = orderList.filter(
          func(order) {
            order.id == orderId;
          }
        );
        filteredOrders.first();
      };
    };
  };

  // Stripe Integration
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public shared ({ caller }) func decreaseStock(productId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can decrease stock");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (product.stock < quantity) {
          Runtime.trap("Insufficient stock");
        };
        let updatedProduct = {
          product with
          stock = product.stock - quantity;
        };
        products.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func restockProduct(productId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can restock products");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = {
          product with
          stock = product.stock + quantity;
        };
        products.add(productId, updatedProduct);
      };
    };
  };
};

