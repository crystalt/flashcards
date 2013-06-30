Session.setDefault("newUserRegister", false);
Session.setDefault("currentRoom", null);

// When commenting, question object
Session.setDefault("commenting", null);

// Name of currently selected tag for filtering
Session.set('tag_filter', null);

// When adding tag to a question, ID of the question
Session.set('editing_addtag', null);

// When editing question text, ID of the question
Session.set('editing_question', null);

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

Template.renderTags.selected = function () {
  return Session.equals('tag_filter', this.tag) ? 'selected' : '';
};

Template.renderTags.events({
  'mousedown .tag': function () {
    console.log("Rendering tags");
    console.log("this.tag =" + this.tag);
    console.log(Session.get('tag_filter'));
    console.log(Session.equals('tag_filter', this.tag));
    if (Session.equals('tag_filter', this.tag)) {
      Session.set('tag_filter', null);
    }
    else {
      console.log("Should come here.")
      Session.set('tag_filter', this.tag);
    }
  }
});

Template.renderTags.tags = function () {
  var tag_infos = [];
  var total_count = 0;
  if (!Session.get("currentRoom")) {
    tag_infos.unshift({tag: null, count: total_count});
    return tag_infos;
  }
  Questions.find({room: Session.get('currentRoom')._id}).forEach(function (question) {
    _.each(question.tags, function (tag) {
      var tag_info = _.find(tag_infos, function (x) { return x.tag === tag; });
      if (! tag_info)
        tag_infos.push({tag: tag, count: 1});
      else
        tag_info.count++;
    });
    total_count++;
  });
  tag_infos = _.sortBy(tag_infos, function (x) { return x.tag; });
  tag_infos.unshift({tag: null, count: total_count});

  return tag_infos;
};

Template.renderTags.tag_text = function() {
  return this.tag || "All tags";
}

Template.renderUsers.users = function()  {
  var user_infos = [];
  var total_count = 0;
  var currRoom = Session.get("currentRoom")._id;
  if (currRoom)  {
  Questions.find({room: currRoom._id}).forEach(function (question) {
   var user_info = _.findWhere(user_infos, {user: question.user });
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
  Session.set("newUserRegister", false);
  Session.set("currentRoom", null);
  Session.set("commenting", null);
}



// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
      function (evt) {
        if (evt.type === "keydown" && evt.which === 27) {
          // escape = cancel
          cancel.call(this, evt);

        } else if (evt.type === "keyup" && evt.which === 13 ||
            evt.type === "focusout") {
          // blur/return/enter = ok/submit if non-empty
          var value = String(evt.target.value || "");
          if (value)
            ok.call(this, value, evt);
          else
            cancel.call(this, evt);
        }
      };
  return events;
};


var activateInput = function (input) {
  input.focus();
  input.select();
};

var QnARouter = Backbone.Router.extend({
  routes: {
    ":currentRoom": "main"
  },
  main: function (currentRoom) {
    Session.set("currentRoom", currentRoom);
    Session.set("tag_filter", null);
  },
  setList: function (currentRoom) {
    this.navigate(currentRoom, true);
  }
});

Router = new QnARouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});

