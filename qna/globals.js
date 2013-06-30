if (Meteor.isClient) {
  notify = function notify(message) {
    var notifier = Meteor.call('notify');
    var stringArray = message.split('&amp;');
    notifier(stringArray[0], stringArray[1]);
  }
}

if (Meteor.isServer) {
  Meteor.methods({
    'sendEmail' : function(to, subject, text) {
      this.unblock();
      if(!Meteor.user()) {
        throw new Meteor.Error(403, "not logged in.");
      }
      console.log("sending email");
      Email.send({
        to : to,
        from : "noreply@awesomeqa.com",
        subject : subject,
        text : text
      })

    },
    'notify': function notify() {
      var notify = Meteor.require('notification-component');
      console.log("notify ->" + notify);
      return notify;
    }
  });
}