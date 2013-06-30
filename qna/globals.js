if (Meteor.isClient) {
  notify = function notify(message) {
    var notifier = Meteor.call('notify');
    var stringArray = message.split('&amp;');
    notifier(stringArray[0], stringArray[1]);
  }
}

if (Meteor.isServer) {
  Meteor.methods({
    'notify': function notify() {
      var notify = Meteor.require('notification-component');
      console.log("notify ->" + notify);
      return notify;
    },

    'test' : function() {
      return "hi";
    }
  });
}