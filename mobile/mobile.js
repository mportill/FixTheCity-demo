List = new Mongo.Collection("list");

if (Meteor.isClient) {
var MAP_ZOOM = 15;
Meteor.startup(function () {
  GoogleMaps.load();
  Session.set("showMainMenu", 1);
  Session.set("showPhoto", 0);
  Session.set("showCategories", 0);
  Session.set("showTopic", 0);
  Session.set("showDetails", 0);
  Session.set("showConfirmation", 0);

  sAlert.config({
    effect: '',
    position: 'top-right',
    timeout: 5000,
    html: false,
    onRouteClose: true,
    stack: true,
    offset: 0, // in px - will be added to first alert (bottom or top - depends of the position in config)
    beep: false,
    onClose: _.noop //
  });

});

Template.MainMenu.events({
  'click .submitareport': function(event) {
    event.preventDefault();
    Session.set("showMainMenu", 0);
	  Session.set("showPhoto", 1);
  }
});

Template.PhotoPage.events({
 'click .takePhoto': function(event, template) {
    var cameraOptions = {
      width: 800,
      height: 600
    };
 
    MeteorCamera.getPicture(cameraOptions, function (error, data) {
      if (error) {
        var warining=sAlert.warning('error with picture', {timeout: 'none'});
      }
      else{
        $('.photo').show();
        $('.photo').attr('src', data); 
        $('.takePhoto').hide();
        $('.retakePhoto').show();
        $('.next').show();
        $('label').hide();
      }  
    });
    event.preventDefault();
  },

  'click .next': function(event) {
    event.preventDefault(); 
    var PictureSrcSubmit= $( '.photo' ).attr('src') ;
    Session.set("picSubmit", PictureSrcSubmit);
    Session.set("showPhoto", 0);
    Session.set("showCategories", 1);
  }   
});
/*
Template.GPSPage.events({
  'click .GPS': function(event, template) {
    event.preventDefault(); 
    var loc= function(){
      while (loc=null)
        loc = Geolocation.latLng();
    };

    
    Session.set("showMainMenu", 0);
      var longitude=loc.lng;
      var latitude=loc.lat;
      Session.set("showMainMenu", 0);
      Session.set("longitudeSubmit", longitude);
      Session.set("latitudeSubmit", latitude);
      Session.set("showMainMenu", 0);
      $('.next').show();
      Session.set("showMainMenu", 0);
    
  }, 
  'click .next': function(event, template){
     Session.set("showMainMenu", 0);
    Session.set("showGPS", 0);
    Session.set("showCategories", 1);
  }
});
*/
Template.CategoryPage.events({ 

  'click .next': function(event) {
    event.preventDefault();
    var elements = document.getElementsByName("category");//start of getting selecting category

      for (var i = 0; i < elements.length; i++){
        if (elements[i].checked)
        {
          var category = elements[i].value;
        }
      }
    Session.set("categorySubmit", category);
    Session.set("topicSubmit", category);
    Session.set("showCategories", 0);
    Session.set("showGPS", 1);
  }
});



Template.GPSPage.events({
  
   'click .next': function(event) {
      event.preventDefault();

      Session.set("showGPS", 0);
      Session.set("showDetails", 1);
    }
});

Template.map.onCreated(function() {
    var self = this;

    GoogleMaps.ready('map', function(map) {
      var marker;

      // Create and move the marker when latLng changes.
      self.autorun(function() {
       
        var latLng = Geolocation.latLng();
        if (! latLng){
          
          return;
        }

        // If the marker doesn't yet exist, create it.
        if (! marker) {
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(latLng.lat, latLng.lng),
            map: map.instance
          });
          Session.set("latitudeSubmit", latLng.lat);
          Session.set("longitudeSubmit", latLng.lng);
        }
        // The marker already exists, so we'll just change its position.
        else {
          marker.setPosition(latLng);
        }

        // Center and zoom the map view onto the current position.
        map.instance.setCenter(marker.getPosition());
        map.instance.setZoom(MAP_ZOOM);
      });
    });
  });
Template.map.helpers({
    geolocationError: function() {
      var error = Geolocation.error();
      return error && error.message;
    },
    mapOptions: function() {
      var latLng = Geolocation.latLng();
      // Initialize the map once we have the latLng.
      if (GoogleMaps.loaded() && latLng) {
        return {
          center: new google.maps.LatLng(latLng.lat, latLng.lng),
          zoom: MAP_ZOOM
        };
      }
    }
  });
Template.ConfirmationPage.helpers({
  image: function(){
    return Session.get("picSubmit");
  },
  category: function(){
    return Session.get("categorySubmit");
  },
  topic: function(){
    return Session.get("topicSubmit");
  },
  latitude: function(){
    return Session.get("latitudeSubmit");
  },
  longitude: function(){
    return Session.get("longitudeSubmit");
  }
});

Template.TopicPage.events({
   'click .next': function(event) {
      event.preventDefault();
      var topic= event.delegateTarget.topic.value;
      Session.set("topicSubmit",topic);
      Session.set("showTopic", 0);
      Session.set("showGPS", 1);
    }
});


Template.OptionalDetailsPage.events({
  'click .next': function(event) {
    event.preventDefault();
    var details= event.delegateTarget.details.value;
    var name= event.delegateTarget.username.value;
    Session.set("detailsSubmit",details);
    Session.set("nameSubmit",name);
    Session.set("showDetails", 0);
    Session.set("showConfirmation", 1);
  }
});

Template.formHere.events({
  "submit form": function (event) {
      // Prevent default browser form submit
    event.preventDefault();
    
      // Get value from form element
    var topic= Session.get("topicSubmit");
    var details = Session.get("detailsSubmit");
    var src=  Session.get("picSubmit");
    var category= Session.get("categorySubmit");
    var latitude= Session.get("latitudeSubmit");
    var longitude= Session.get("longitudeSubmit");
    var hidden="hidden";
    
    
    //end of selecting category
    var heading = category+longitude+latitude;//heading is combination of category and location to distinguish each row in the table
   
    // Insert a task into the collection
      List.insert({
        category: category,
        topic: topic,
        details: details,
        image: src,
        longitude: longitude,
        latitude: latitude,
        heading: heading,
        createdAt: new Date() // current time
      });
    Session.set("showConfirmation", 0);
    Session.set("showMainMenu", 1);
    

	  
	}
});



Template.registerHelper('session', function( value ) {
  return Session.get(value);
});

Template.CategoryPage.created = function(){
  // must bind to `document.body` as element will be replaced during re-renders
  // add the namespace `.tplquestions` so all event handlers can be removed easily
  $(document.body).on('change.tplquestions', '.form', function(e){
   
     $('.next').show();
  }); 
};

Template.CategoryPage.destroyed = function(){
   // remove all event handlers in the namespace `.tplquestions`
  $(document.body).off('.tplquestions');
}


}

