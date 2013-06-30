Session.setDefault("newUserRegister", false);
Template.main.loggedIn = function () {
  return Meteor.userId();
};

Template.mainLogin.register = function() {
  return Session.get("newUserRegister");
}

Template.mainLogin.events({
  'click #createAccount' : function() {
    Session.set("newUserRegister", true);
  }
})


Template.register.events({
  'submit #register-form' : function(e, t) {
    e.preventDefault();
    var email = t.find('#account-email').value
        , password = t.find('#account-password').value
        , secret_key = t.find('#account-room-key').value;

    var createUserOption = function(secret) {
      Accounts.createUser({email: email, password : password, profile: {qna_rooms:secret}}, function(err){
        if (err) {
          // Inform the user that account creation failed
        } else {
          // Success. Account has been created and the user
          // has logged in successfully.
        }

      });
    }
    // Trim and validate the input
    var room = Rooms.findOne({_id: secret_key});
    if (room) {

      createUserOption([secret_key]);
    }
    else {
      createUserOption([]);
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