/**
 * A room consists of:
 * _id -- room ID
 * name -- name of room
 * admin -- user ID of room admin
 *
 * @type {Meteor.Collection}
 */
Rooms = new Meteor.Collection("rooms");

Questions = new Meteor.Collection("questions");
Comments = new Meteor.Collection("comments");
