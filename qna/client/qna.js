Meteor.autorun(function() {
  // Whenever this session variable changes, run this function.
  var message = Session.get('displayMessage');

  if (message) {


    Session.set('displayMessage', null);
  }
});

if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to qna.";
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
