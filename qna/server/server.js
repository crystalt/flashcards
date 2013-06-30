Meteor.startup(function () {
  notify = Meteor.require('notification-component');
  console.log(notify)
});

Meteor.publish("userData", function () {
  return Meteor.users.find({_id: this.userId},
      {fields: {'emails': 1}});
});