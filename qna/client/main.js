Session.setDefault("newUserRegister", false);

Session.setDefault("currentRoom", null);

var trimInput = function(val) {
  return val.replace(/^\s*|\s*$/g, "");
};

var isValidPassword = function(val, field) {
  if (val.length >= 6) {
    return true;
  } else {
    Session.set('displayMessage', 'Error &amp; Too short.')
    return false;
  }
}

var createUserOption = function(email, password, secret) {
  Accounts.createUser({email: email, password : password, profile: {qna_rooms:secret}}, function(err){
    if (err) {
      // Inform the user that account creation failed
    } else {
      // Success. Account has been created and the user
      // has logged in successfully.
    }

  });
};


Template.main.loggedIn = function () {
  return Meteor.userId();
};

Template.mainLogin.register = function() {
  return Session.get("newUserRegister");
};

Template.mainLogin.events({
  'click #register-user' : function() {
    Session.set("newUserRegister", true);
  }
});

Template.mainLoggedIn.events({
  'click #logout' : function() {
    Meteor.logout();
    Session.set("newUserRegister", false);
  }
})


Template.register.events({
  'submit #register-form' : function(e, t) {
    e.preventDefault();
    var email = t.find('#account-email').value
        , password = t.find('#account-password').value
        , secret_key = t.find('#account-room-key').value;
    // Trim and validate the input
    email = trimInput(email);
    if (isValidPassword(password)) {
      var room = Rooms.findOne({_id: secret_key});
      if (room) {

        createUserOption(email, password, [secret_key]);
      }
      else {
        createUserOption(email, password, []);
      }
      return true;
    }
    return false;
  }
});

Template.login.events({

  'submit #login-form' : function(e, t){
    e.preventDefault();
    // retrieve the input field values
    var email = t.find('#login-email').value
        , password = t.find('#login-password').value;

    // Trim and validate your fields here....

    // If validation passes, supply the appropriate fields to the
    // Meteor.loginWithPassword() function.
    Meteor.loginWithPassword(email, password, function(err){
      if (err){

      }
      // The user might not have been found, or their passwword
      // could be incorrect. Inform the user that their
      // login attempt has failed.
      else {

      }
      // The user has been logged in.
    });
    return false;
  }
});

Template.createRoom.events({
  'submit' : function(event, template) {
    var roomName = template.find("input[type=text]").value;
    if (roomName) {
      var roomId = Rooms.insert({
        name : roomName,
        admin : Meteor.userId()
      });
      Meteor.users.update(
        { _id : Meteor.userId() },
        { $addToSet : { "profile.qna_rooms" : roomId } }
      );
    }
  },

  'change #changeRoom' : function(event, template) {
    Session.set("currentRoom", getRoomName(event.currentTarget.value));
  }
});

Template.createRoom.rooms = function() {
  if (Meteor.user()) {
    return _.map(Meteor.user().profile.qna_rooms, function(roomId) {
      return { id : roomId, name : getRoomName(roomId) };
    });
  }
};

Template.createRoom.currentRoom = function() {
  if (Meteor.user()) {
    var rooms = Meteor.user().profile.qna_rooms;
    if (!_.isEmpty(rooms)) {
      Session.set("currentRoom", getRoomName(rooms[0]));
    }
  }
  return Session.get("currentRoom");
};

/**
 * @param {String} roomId
 * @return {String} room name, or null if room not found
 */
function getRoomName(roomId) {
  var room = Rooms.findOne({ _id : roomId });
  if (room) {
    return room.name;
  }
  return null;
}
