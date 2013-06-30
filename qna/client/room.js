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
    }
  },

  'change #changeRoom' : function(event, template) {
    Session.set("currentRoom", getRoomName(event.currentTarget.value));
  }
});

Template.createRoom.rooms = function() {
  if (Meteor.user()) {
    return _.map(Meteor.user().profile.qna_rooms, function(roomId) {
      return { id : roomId, name : getRoomName(roomId) };
    });
  }
};

Template.createRoom.currentRoom = function() {
  if (Meteor.user()) {
    var rooms = Meteor.user().profile.qna_rooms;
    if (!_.isEmpty(rooms)) {
      Session.set("currentRoom", getRoomName(rooms[0]));
    }
  }
  return Session.get("currentRoom");
};

/**
 * @param {String} roomId
 * @return {String} room name, or null if room not found
 */
function getRoomName(roomId) {
  var room = Rooms.findOne({ _id : roomId });
  if (room) {
    return room.name;
  }
  return null;
}
