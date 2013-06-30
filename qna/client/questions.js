////////// Helpers for in-place editing //////////

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

Template.questions.events(okCancelEvents(
    "#questionInput",
    {
      ok : function(value) {
        Questions.insert({
          text : value,
          user : Meteor.userId(),
          room : Session.get("currentRoom")._id,
          timestamp : (new Date()).getTime(),
          answered : false,
          tags : [],
          upvotes : 0,
          downvotes : 0

        });
        $("#questionInput").val("");
      }
    }
));

Template.questions.questionList = function() {
  if (Session.get("currentRoom") && Session.get("currentRoom")._id) {
    return Questions.find({ room : Session.get("currentRoom")._id }, {sort: {timestamp: -1}}).fetch();
  }
  return null;
};


////////// Question //////////

Template.question.asker = function() {
  // TODO: Maybe replace with getUser()?
  return Meteor.users.findOne({ _id: this.user }).profile.email;
};

Template.question.humanTime = function() {
  var date = new Date(this.timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

Template.question.events({
  'click .addComment' : function() {
    Session.set("commenting", this);
  }
});

Template.comments.question = function() {
  return Session.get("commenting").text;
};

Template.comments.asker = function() {
  // TODO: Maybe replace with getUser()?
  var asker = Meteor.users.findOne({ _id: Session.get("commenting").user });
  if (asker) {
    return asker.profile.email;
  }
  return null;
};

Template.comments.humanTime = function() {
  var date = new Date(Session.get("commenting").timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

Template.comments.events({
  'click .addComment' : function(event, template) {
    var comment = template.find("textarea").value;
    if (comment) {
      // Insert into Comments collection
      Comments.insert({
        text : comment,
        timestamp : (new Date()).getTime(),
        user : Meteor.userId(),
        question : Session.get("commenting")._id,
        isAnswer : false,
        upvotes : 0,
        downvotes : 0

      });

      // Clear comment text area
      template.find("textarea").value = "";
    }
  }
});