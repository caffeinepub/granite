import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type DrawingMetadata = {
    id : Nat;
    title : Text;
    description : Text;
    minutesSpent : Nat;
    createdAt : Time.Time;
  };

  type Profile = {
    displayName : Text;
  };

  module DrawingMetadata {
    public func compare(metadata1 : DrawingMetadata, metadata2 : DrawingMetadata) : Order.Order {
      Nat.compare(metadata1.id, metadata2.id);
    };
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, Profile>();

  public query ({ caller }) func getProfile(user : Principal) : async Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User drawings
  let userDrawings = Map.empty<Principal, List.List<DrawingMetadata>>();
  let drawingCounters = Map.empty<Principal, Nat>();

  // Password check
  let password = "GRANITE";
  public query ({ caller }) func checkPassword(passwordAttempt : Text) : async Bool {
    passwordAttempt == password;
  };

  // Drawing management
  public shared ({ caller }) func saveDrawing(metadata : DrawingMetadata) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save drawings");
    };
    // Get next id
    let nextId = switch (drawingCounters.get(caller)) {
      case (?id) { id };
      case (null) { 0 };
    };
    drawingCounters.add(caller, nextId + 1);

    // Get existing drawings
    let drawings = switch (userDrawings.get(caller)) {
      case (null) { List.empty<DrawingMetadata>() };
      case (?drawings) { drawings };
    };

    // Add new drawing with id
    let newDrawing : DrawingMetadata = {
      metadata with
      id = nextId;
      createdAt = Time.now();
    };

    drawings.add(newDrawing);
    userDrawings.add(caller, drawings);
  };

  public query ({ caller }) func getMyDrawings() : async [DrawingMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view drawings");
    };
    let drawings = switch (userDrawings.get(caller)) {
      case (null) { List.empty<DrawingMetadata>() };
      case (?drawings) { drawings };
    };
    drawings.values().toArray().sort();
  };

  public query ({ caller }) func getAllDrawings(user : Principal) : async [DrawingMetadata] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own drawings");
    };
    let drawings = switch (userDrawings.get(user)) {
      case (null) { List.empty<DrawingMetadata>() };
      case (?drawings) { drawings };
    };
    drawings.values().toArray().sort();
  };

  public shared ({ caller }) func deleteDrawing(drawingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete drawings");
    };
    let drawings = switch (userDrawings.get(caller)) {
      case (null) { List.empty<DrawingMetadata>() };
      case (?drawings) { drawings };
    };

    let filtered = drawings.filter(func(d) { d.id != drawingId });
    userDrawings.add(caller, filtered);
  };

  public query ({ caller }) func getTotalDrawings(user : Principal) : async Nat {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only users can view your own stats");
    };
    let drawings = switch (userDrawings.get(user)) {
      case (null) { List.empty<DrawingMetadata>() };
      case (?drawings) { drawings };
    };
    drawings.size();
  };

  public query ({ caller }) func getTotalMinutesSpent(user : Principal) : async Nat {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only users can view your own stats");
    };
    let drawings = switch (userDrawings.get(user)) {
      case (null) { List.empty<DrawingMetadata>() };
      case (?drawings) { drawings };
    };

    var total = 0;

    drawings.values().forEach(func(d) { total += d.minutesSpent });
    total;
  };
};
