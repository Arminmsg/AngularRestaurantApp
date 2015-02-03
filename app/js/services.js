'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
  //.value('FIREBASE_URL', 'https://waitandeat-armin.firebaseio.com/');
  .value('FIREBASE_URL', 'https://waitandeat-armin.firebaseio.com/')
  .factory('dataService', function($firebase, FIREBASE_URL) {
    var dataRef = new Firebase(FIREBASE_URL);
    var fireData = $firebase(dataRef);

    return fireData;
  })
  .factory('partyService', function(dataService) {
    //var parties = dataService.$child('parties');
    var users = dataService.$child('users');

    var partyServiceObject = {
      //parties: parties,
      saveParty: function(party, userId) {
        // parties.$add(party);
        users.$child(userId).$child('parties').$add(party);
      },
      getPartiesByUserId: function(userId) {
        return users.$child(userId).$child('parties');
      }
    };

    return partyServiceObject;

  })
  .factory('textMessageService', function(dataService, partyService) {
    var textMessages = dataService.$child('textMessages');

    var textMessageServiceObject = {
      sendTextMessage : function(party, userId) {
        var newTextMessage = {
          phoneNumber: party.phone,
          size: party.size,
          name: party.name
        };
        textMessages.$add(newTextMessage);
        partyService.getPartiesByUserId(userId).$child(party.$id).$update({notified: 'Yes'});


      }
    };

    return textMessageServiceObject;
  })
  .factory('authService', function($firebaseSimpleLogin, $location, $rootScope, FIREBASE_URL, dataService) {
    var authRef = new Firebase(FIREBASE_URL);
    var auth = $firebaseSimpleLogin(authRef);
    var emails = dataService.$child('emails');

    var authServiceObject = {
      register: function(user) {
        auth.$createUser(user.email, user.password).then(function(data) {
          console.log(data);
          authServiceObject.login(user, function() {
            emails.$add({email: user.email});
          });
        }, function(reason) {
          console.log(reason);
        });
      },
      login: function(user, optionalCallback) {
        auth.$login('password', user).then(function(data) {
          console.log(data);
          optionalCallback();
          $location.path('/waitlist');
        },
        function(reason) {console.log(reason);}
        );
      },
      logout: function() {
        auth.$logout();
        $location.path('/');
      },
      getCurrentUser: function() {
        return auth.$getCurrentUser();
      }
    }; //authServiceObject

    $rootScope.$on('$firebaseSimpleLogin:login', function(e, user) {
      $rootScope.currentUser = user;
      console.log("in");
    });

    $rootScope.$on('$firebaseSimpleLogin:logout', function() {
      $rootScope.currentUser = null;
      console.log("out");
    });

    return authServiceObject;
  });
