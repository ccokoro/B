//Projection Id essential-storm-93200
//Life 
PlayersList = new Mongo.Collection('players');
// console.log("Hello world");


if(Meteor.isClient){
   Meteor.subscribe('thePlayers');
    var loc;
    var act;
    
    Template.location.events({ 
        
        "click .allmeetings": function(event){
             Session.set("currentActivity", "");
            Session.set("currentLocation", "");
        },
        
    "click .locations": function(event){
    Session.set("currentActivity", "");
        loc = event.target.innerHTML; 
        console.log(loc); 
       Session.set("currentLocation", loc);
   }, 
    "click .activities": function(event) {
      Session.set("currentLocation", "");
        act = event.target.innerHTML; 
        console.log(act); 
       Session.set("currentActivity", act);
    }});
    
    Template.body.helpers({
        
        firstName: function(){
        var user = Meteor.user(); 
        if (user) {
             currentUserId = user.services.google.given_name;
            return user.services.google.given_name;    
        }      
   }
});
   
// Global variables to store data in MiniMongo and Session
Meetings = new Mongo.Collection('meetings');
Session.setDefault("addMeetingFlag", false);
Session.setDefault("viewMeetingFlag", false);
Session.setDefault("currentLocation", "");
Session.setDefault("currentActivity", "");   
var currentUserId = "Grace";

Meteor.subscribe('theMeetings');


/* Deal with the two buttons that show up first in the page.*/
Template.body.events({
  "click #addButton": function(){
    Session.set("addMeetingFlag", true);
  },
  /* Switch name of button and show/hide meetings.*/
  "click #viewButton": function(event){
    if (event.target.textContent == "View Meetings"){
      Session.set("viewMeetingFlag", true);
      event.target.textContent = "Hide Meetings";
    }
    else {
      event.target.textContent = "View Meetings";
      Session.set("viewMeetingFlag", false);
    }
  }
}); 


/* Template helpers that set the values for the variables that control
the HTML page appearance. Because templates are reactive contexts,
whenever the value of flags is changed somewhere in the code, the code
in the template gets rerun, changing the HTML page.
*/
Template.addMeetingForm.helpers({
  
  addMeeting: function(){
    return Session.get("addMeetingFlag");
  }
  
});

Template.viewColumn.helpers({
    viewMeeting: function(){
    return Session.get("viewMeetingFlag");
  },
     
    meetingsList: function(){ 
    var curLoc = Session.get("currentLocation");
    var curAct = Session.get("currentActivity");
        if (curLoc != "") {
              return Meetings.find({location: curLoc});}
        else if (curAct != "") {
            return Meetings.find({activityStr: curAct}); 
        } else {
    return Meetings.find(); }},
    
    
    
     firstName: function(){
        var user = Meteor.user(); 
        if (user) {
             currentUserId = user.services.google.given_name;
            return user.services.google.given_name;    
        } 
   }  
    
});
    
/* Deal with adding a meeting to the database */
Template.addMeetingForm.events({

    
  "submit form": function(event){
      console.log("submit form");

      var meetingObject = {
        name: currentUserId,
        location: event.target.meetingLocation.value,
        date: event.target.meetingDate.value,
        startTime: event.target.startTime.value,
        endTime: event.target.endTime.value,
       activity: event.target.meetingActivity.value,
      };

      Meteor.call('insertMeeting', meetingObject);

      Session.set("addMeetingFlag", false); // make the form disappear
      console.log(meetingObject);
      event.target.reset(); // to clear the fields for next time
    
      // show message in the page using jQuery
      $("#successMessage").show().fadeOut(3000);
      return false;
    }

})
}
if(Meteor.isServer){
 
    
    /*Eni's code from meeting app*/
    
    Meetings = new Mongo.Collection('meetings');

/* Helper function used in the publish method to filter undesired items.*/
function checkExpiration(){
  // Iterate through all meetings and check if time has expired
  var allMeetings = Meetings.find({});
  var now = new Date();
  allMeetings.forEach(function(item){
    if (item.endTimeDate < now)
      Meetings.update(item, {$set: {hasExpired: true}});
  })
  // remove expired entries
  Meetings.remove({hasExpired: true})
}


Meteor.publish('theMeetings', function(){
    checkExpiration();
    return Meetings.find({hasExpired: false}, {sort: {startTimeDate: 1}})
});


Meteor.methods({
  insertMeeting: function(meetingObj){
    // create two new fields for startTime and endTime, so that they are
    // Date() objects
    var startTimeObj = new Date(meetingObj.date + " " + meetingObj.startTime);
    var endTimeObj = new Date(meetingObj.date + " " + meetingObj.endTime);
//    var currentUserId = Meteor.user().username;
      
    Meetings.insert({
      name: currentUserId,
      location: meetingObj.location,
      dateStr: meetingObj.date,
      // Use the moment.js library to format time in US time
      startTimeStr: moment(startTimeObj).format("hh:mm A"),
      endTimeStr: moment(endTimeObj).format("hh:mm A"),
      startTimeDate: startTimeObj,
      endTimeDate: endTimeObj,
        activityStr: meetingObj.activity,
      hasExpired: false
    })
    console.log("new meeting added in mongodb");
  },
    
     meetingsLoc: function(loc){
        return Meetings.find({location: loc});
    }
    
})

}


