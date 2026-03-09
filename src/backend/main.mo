import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  // Include components
  include MixinStorage();

  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Type definitions
  public type UserProfile = {
    name : Text;
  };

  type Question = {
    id : Nat;
    title : Text;
    body : Text;
    authorName : Text;
  };

  type Answer = {
    questionId : Nat;
    body : Text;
    authorName : Text;
  };

  type MediaItem = {
    id : Nat;
    title : Text;
    description : Text;
    blob : Storage.ExternalBlob;
    mediaType : Text;
    uploaderName : Text;
  };

  var nextQuestionId = 0;
  var nextMediaId = 0;

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let questionsMap = Map.empty<Nat, Question>();
  let answersList = List.empty<Answer>();
  let mediaItemsMap = Map.empty<Nat, MediaItem>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Questions
  public shared ({ caller }) func createQuestion(title : Text, body : Text, authorName : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create questions");
    };

    let id = nextQuestionId;
    let question : Question = {
      id;
      title;
      body;
      authorName;
    };

    questionsMap.add(id, question);
    nextQuestionId += 1;
    id;
  };

  public query func getAllQuestions() : async [Question] {
    questionsMap.values().toArray();
  };

  public query func getQuestion(id : Nat) : async Question {
    switch (questionsMap.get(id)) {
      case (null) { Runtime.trap("Question not found") };
      case (?question) { question };
    };
  };

  // Answers
  public shared ({ caller }) func postAnswer(questionId : Nat, body : Text, authorName : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can post answers");
    };

    // Check if question exists
    if (not questionsMap.containsKey(questionId)) {
      Runtime.trap("Question not found");
    };

    let answer : Answer = {
      questionId;
      body;
      authorName;
    };

    answersList.add(answer);
  };

  public query func getAnswersForQuestion(questionId : Nat) : async [Answer] {
    answersList.filter(func(a) { a.questionId == questionId }).toArray();
  };

  // Media
  public shared ({ caller }) func createMediaItem(title : Text, description : Text, blob : Storage.ExternalBlob, mediaType : Text, uploaderName : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can upload media");
    };

    let id = nextMediaId;
    let media : MediaItem = {
      id;
      title;
      description;
      blob;
      mediaType;
      uploaderName;
    };

    mediaItemsMap.add(id, media);
    nextMediaId += 1;
    id;
  };

  public query func getAllMediaItems() : async [MediaItem] {
    mediaItemsMap.values().toArray();
  };

  public shared ({ caller }) func deleteMediaItem(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete media items");
    };

    switch (mediaItemsMap.get(id)) {
      case (null) { Runtime.trap("Media item not found") };
      case (?_) {
        mediaItemsMap.remove(id);
      };
    };
  };
};
