import Map "mo:core/Map";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  type Product = {
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    image : Storage.ExternalBlob;
    createdAt : Int;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : {
      #less;
      #equal;
      #greater;
    } {
      Text.compare(product1.name, product2.name);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let products = Map.empty<Text, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User profile management

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Admin-only product management

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    if (products.containsKey(product.name)) {
      Runtime.trap("Product with this name already exists. Please choose a different name.");
    };
    let newProduct = {
      product with
      createdAt = Time.now();
    };
    products.add(product.name, newProduct);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    if (products.containsKey(product.name)) {
      products.add(product.name, product);
    } else {
      Runtime.trap("Product does not exist.");
    };
  };

  public shared ({ caller }) func deleteProduct(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    if (products.containsKey(name)) {
      products.remove(name);
    } else {
      Runtime.trap("Product does not exist.");
    };
  };

  // Product catalog - public read

  public query func getProduct(name : Text) : async Product {
    switch (products.get(name)) {
      case (null) { Runtime.trap("Product does not exist.") };
      case (?product) { product };
    };
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    let filtered = List.empty<Product>();
    for (product in products.values()) {
      if (Text.equal(product.category, category)) {
        filtered.add(product);
      };
    };
    filtered.toArray();
  };

  public query func getProductsByPriceRange(minPrice : Float, maxPrice : Float) : async [Product] {
    let filtered = List.empty<Product>();
    for (product in products.values()) {
      if (product.price >= minPrice and product.price <= maxPrice) {
        filtered.add(product);
      };
    };
    filtered.toArray();
  };

  public query func getProductsByNamePrefix(prefix : Text) : async [Product] {
    let filtered = List.empty<Product>();
    for (product in products.values()) {
      if (product.name.contains(#text prefix)) {
        filtered.add(product);
      };
    };
    filtered.toArray();
  };
};
