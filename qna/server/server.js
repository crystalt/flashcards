Meteor.startup(function () {
  notify = Meteor.require('notification-component');
  process.env.MAIL_URL = 'smtp://postmaster%40meteorize.mailgun.org:YOURPASSWORD@smtp.mailgun.org:587';
});
