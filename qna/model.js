/**
 * A room consists of:
 * _id -- room ID
 * name -- name of room
 * admin -- user ID of room admin
 *
 * @type {Meteor.Collection}
 */
Rooms = new Meteor.Collection("rooms");

/**
 * A question consists of:
 * _id -- question ID
 * text -- question string
 * user -- user ID of asker
 * room -- room ID
 * timestamp -- time that the question was created
 * answered -- boolean saying whether the question has been answered
 * tags -- array of tag words
 * upvotes -- number of upvotes
 * downvotes -- number of downvotes
 *
 * @type {Meteor.Collection}
 */
Questions = new Meteor.Collection("questions");

/**
 * A comment consists of:
 * _id -- comment ID
 * text -- comment string
 * timestamp -- time that the comment was made
 * user -- user ID of commenter
 * question -- question ID that this comment belongs to
 * isAnswer -- boolean saying whether this comment is the answer
 * upvotes -- number of upvotes
 * downvotes -- number of downvotes
 *
 * @type {Meteor.Collection}
 */
Comments = new Meteor.Collection("comments");
