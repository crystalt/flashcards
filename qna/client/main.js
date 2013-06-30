Session.setDefault("newUserRegister", false);
Session.setDefault("currentRoom", null);

// When commenting, question object
Session.setDefault("commenting", null);

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
};

var createUserOption = function(email, password, secret) {
  Accounts.createUser({
    email : email,
    password : password,
    profile : { qna_rooms : secret, email : email }
  }, function(err) {
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
    resetSession();
    Meteor.logout(function(err) {
      // callback
      Session.set("ses",false);
      Session.set("currentRoom", null);
    });
  }
});


Template.mainLoggedIn.currRoom = function() {
  return Session.get("currentRoom");
}

var getUser = function(userId) {
  return Meteor.users.findOne({_id : userId});
}

Template.renderUsers.users = function()  {
  var user_infos = [];
  var total_count = 0;
  var currRoom = Session.get("currentRoom");
  if (currRoom)  {
  Questions.find({room: currRoom}).forEach(function (question) {
   var user_info = _.findWhere(user_infos, {user: question.user });
    console.log("user info ->" + user_info);
    if (!user_info) {
      user_infos.push({user: question.user, count: 1});
    }
    else {
      user_info.count++;
      Session.set("newUserRegister", false);
    }
    total_count++;
  });
  }

  user_infos = _.sortBy(user_infos, function(x) { return x.user});
  user_infos.unshift({user: null, count: total_count});
  return user_infos;
}

Template.renderUsers.user_text = function() {
  if (this.user) {
    return getUser(this.user).profile.email
  }
  return this.user || "All Users."
}

Template.mainLoggedIn.commenting = function() {
  return Session.get("commenting");
};


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

function resetSession() {
  console.log("Resetting");
  Session.set("newUserRegister", false);
  Session.set("currentRoom", null);
  console.log(Session.get("currentRoom"));
  Session.set("commenting", null);
}
