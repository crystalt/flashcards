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

var activateInput = function (input) {
  input.focus();
  input.select();
};

Template.questions.events(okCancelEvents(
    "#questionInput",
    {
      ok : function(value) {
        var tag = Session.get('tag_filter')
        Questions.insert({
          text : value,
          user : Meteor.userId(),
          room : Session.get("currentRoom")._id,
          timestamp : (new Date()).getTime(),
          answered : false,
          tags : tag ? [tag] : [],
          upvotes : 0,
          downvotes : 0

        });
        $("#questionInput").val("");
      }
    }
));

Template.questions.questionList = function() {
  if (!Session.get("currentRoom")) {
    return {};
  }
  var tag_filter = Session.get("tag_filter");
  var user_filter = Session.get("user_filter");
  var sel = {room: Session.get("currentRoom")._id}

  if (tag_filter) {
    sel.tags = tag_filter;
  }
  if (user_filter) {
    sel.user = user_filter;
  }

  if (Session.get("currentRoom") && Session.get("currentRoom")._id) {
    return Questions.find(sel, {sort: {timestamp: -1}}).fetch();
  }
  return null;
};

Template.question_item.tag_objects = function () {
  var questionId = this._id;
  return _.map(this.tags || [], function (tag) {
    return {questionId: questionId, tag: tag};
  });
};

Template.question_item.done_class = function () {
  return this.answered ? 'done' : '';
};

Template.question_item.done_checkbox = function () {
  return this.answered ? true : false;
};

Template.question_item.editing = function () {
  return Session.equals('editing_question', this._id);
};

Template.question_item.adding_tag = function () {
  return Session.equals('editing_addtag', this._id);
};

////////// Question //////////

Template.question_item.asker = Template.commentItem.asker = function() {
  // TODO: Maybe replace with getUser()?
  return Meteor.users.findOne({ _id: this.user }).profile.email;
};

Template.question_item.humanTime = Template.commentItem.humanTime = function() {
  var date = new Date(this.timestamp);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

Template.question_item.events({
  'click .addComment' : function() {
    Session.set("commenting", this);
    Session.set("questioning", false);
  },
  'click .check' : function() {
    Questions.update(this.id, {$set: {answered: !this.answered}});
  },
  'click .destroy' : function() {
    Questions.remove(this._id);
  },
  'click .addtag' : function(evt, tmpl) {
    Session.set('editing_addtag', this._id);
    Meteor.flush();
    activateInput(tmpl.find("#edittag-input"));
  },
  'dblclick .display .question-text' : function(evt, tmpl) {
    Session.set('editing_question', this._id);
    Meteor.flush(); // update DOM before focus
    activateInput(tmpl.find("#question-input"));
  },
  'click .remove': function (evt) {
    var tag = this.tag;
    var id = this.questionId;
    console.log("REMOVING TAG");
    console.log(tag);
    console.log(id);

    evt.target.parentNode.style.opacity = 0;
    // wait for CSS animation to finish
    Meteor.setTimeout(function () {
      Questions.update({_id: id}, {$pull: {tags: tag}});
    }, 300);
  }
});

Template.question_item.events(okCancelEvents(
    '#question-input',
    {
      ok: function (value) {
        Questions.update(this._id, {$set: {text: value}});
        Session.set('editing_question', null);
      },
      cancel: function () {
        Session.set('editing_question', null);
      }
    }));

Template.question_item.events(okCancelEvents(
    '#edittag-input',
    {
      ok: function (value) {
        Questions.update(this._id, {$addToSet: {tags: value}});
        Session.set('editing_addtag', null);
      },
      cancel: function () {
        Session.set('editing_addtag', null);
      }
    }));

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
  },
  'click #goToQuestions' : function() {
    Session.set("commenting", null);
    Session.set("questioning", true);
  }
});

Template.comments.commentList = function() {
  if (Session.get("commenting")) {
    return Comments.find({ question : Session.get("commenting")._id }, {sort: {timestamp: -1}}).fetch();
  }
  return null;
};


