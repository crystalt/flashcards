Template.createRoom.events({
  'submit' : function(event, template) {
    var roomName = template.find("input[type=text]").value;
    if (roomName) {
      var roomId = Rooms.insert({
        name : roomName,
        admin : Meteor.userId()
      });
      Meteor.users.update(
          { _id : Meteor.userId() },
          { $addToSet : { "profile.qna_rooms" : roomId } }
      );
      Session.set("currentRoom", getRoom(roomId));
    }
  }
});

Template.changeRoom.events({
  'change #changeRoom' : function(event, template) {
    Session.set("currentRoom", getRoom(event.currentTarget.value));
  }
});

Template.createRoom.rooms = Template.changeRoom.rooms =  function() {
  if (Meteor.user()) {
    return _.values(Session.get('allRooms'));
  }
};

Template.mainLoggedIn.updateAllRooms = Template.createRoom.updateAllRooms = function() {
  if (Meteor.user()) {
    var roomList = Meteor.user().profile.qna_rooms;
    var rooms = {};
    _.each(roomList, function(roomId) {
      rooms[roomId] = getRoomFromDB(roomId);
    });
    Session.set("allRooms", rooms);
  }
}

Template.createRoom.currentRoom = Template.changeRoom.currentRoom = Template.comments.currentRoom = function() {
  if (Meteor.user() && !Session.get("currentRoom")) {
    var rooms = Meteor.user().profile.qna_rooms;
    if (!_.isEmpty(rooms)) {
      Session.set("currentRoom", getRoom(rooms[0]));
    }
  }
  return Session.get("currentRoom");
};

Template.invitePeople.isAdmin = function() {
  var room = Session.get('currentRoom');
  if (room && room.admin === Meteor.userId()) {
    return true;
  }
  return false;
}

Template.invitePeople.events({
   'click [data-action="add"]' : function(event, template) {
     console.log(template)
     $(template.find(".invites")).append('<input type="email" placeholder="Email address">');
     console.log(" crystal is a rockstar!;")
   },
   'keydown [data-action="add"]' : function(event, template) {
    console.log(template)
    $(template.find(".invites")).append('<input type="email" placeholder="Email address">');
   },
  'submit #invitePeople' : function(event, template) {
    event.preventDefault();
    var emailDivs = template.findAll('[type="email"]');
    var emails = _.map(emailDivs, function(email){
      return email.value;
    });

  }
});

/**
 * @param {String} roomId
 * @return {String} room name, or null if room not found
 */
function getRoomName(roomId) {
  var room = getRoom(roomId);
  if (room) {
    return room.name;
  }
  return null;
}

function getRoom(roomId) {
  return Session.get('allRooms')[roomId];
}

function getRoomFromDB(roomId) {
  return Rooms.findOne({_id: roomId});
}