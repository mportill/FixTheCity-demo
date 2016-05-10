List = new Mongo.Collection("list");
Display = new Mongo.Collection(null);
var MAP_ZOOM = 15;
if (Meteor.isClient) {
  // This code only runs on the client
  var current;
  Template.home.helpers({
    list: function(){
        var myArray = List.find({}, {sort:{createdAt: -1}}).fetch();
        var distinctHead = _.uniq(myArray, true, function(List) {return List.topic});
    var valuearray= new Array();
    for(var n = 0; n<distinctHead.length; n++)
    {
      valuearray[n]=0;
    }
    var topics = function(myArray){return _.pluck(myArray, "topic")};
    var topicarray = topics(myArray);
    for(var i = 0; i<topicarray.length; i++)
    {
      for(var j = 0; j<myArray.length; j++)
      {
        if(topicarray[i]==myArray[j].topic)
        {
          valuearray[i]++;
        }
      }
    }
    for(var k =0;k<distinctHead.length;k++)
    {
      distinctHead[k].quantity=valuearray[k];
    }
    for(var m =0;m<distinctHead.length; m++){
    Display.insert(distinctHead[m]);
        }   
    },

    settings: function () {
      return {
        collection: Display,
        fields: [
          {key: 'createdAt', label: 'Date Added'},
          {key: 'topic', label: 'Issue'},
          {key: 'latitude', label: 'Latitude'},
          {key: 'longitude', label: 'Longitude'},
      {key: 'quantity', label: 'Quantity'}
        ]
      };
    }
  });

  Template.show.helpers({
    list: function(){
      var myArray = List.find({}, {sort:{createdAt: -1}}).fetch();
      var nlist= new Array();
      for(var i = 0; i< myArray.length;i++)
      {
        if(myArray[i].topic==current)
        {
          nlist.push(myArray[i]);
        }
      }
      return nlist;
    }

  });

  Template.home.events({
    /*"click .delete": function () {
      List.remove(this._id);
    }*/
  'click .reactive-table tbody tr': function () {
   current = this.topic;
   Router.go('/show');
    }
  });
}
Router.route('/show', {
  name:'show',
  template:'show'
});

Router.route('/', {
  name:'home',
  template:'home'
});
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}