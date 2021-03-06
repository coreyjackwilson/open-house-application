var myApp = angular.module('myApp', ['ngRoute', 'angularCharts']);

myApp.config(function($routeProvider){
  console.log("I am running app config");
  $routeProvider
  .when('/', {
    templateUrl: '../login/login.html',
  })
  .when('/register', {
    templateUrl: '../register/register.html',
  })
  .when('/userinfo', {
    resolve:{
      "check": function($location, $rootScope){
        if(!$rootScope.loggedIn){
          $location.path('/');
        }
      }
    },
    templateUrl: '../userinfo.html'
  })
  .when('/homepage', {
    resolve:{
      "check": function($location, $rootScope){
        if(!$rootScope.loggedIn){
          $location.path('/');
        }
      }
    },

    templateUrl: '../homepage.html'
  })
  .otherwise({
    redirectTo:'/'
  });
});

myApp.controller('AppCtrl', ['$scope', '$http', '$rootScope', '$location', function($scope, $http, $rootScope, $location) {

  var refresh = function() {
    $http.get('/openhouse').success(function(response) {
      console.log("I got the data I requested updated");
      $scope.userlist = response;
      $scope.user = "";
    });
  };

  $scope.register = function() {
    $http.post('/register', $scope.vm)
                 .success(function (response) {
                  console.log("We registered");
                  if(response.success){
                    console.log("We succesfully registered");
                      $rootScope.loggedIn =true;
                      $rootScope.userprofile = response.user;
                      $location.path('/userinfo');
                    }
                 });
  };

  $scope.login = function(){
    $http.post('/authenticate', $scope.vm)
                 .success(function (response) {
                  if(response.success){
                     $rootScope.loggedIn =true;
                     $rootScope.userprofile = response.user;
                     $location.path('/homepage');
                  }
                 });
  };

  $scope.addUser = function() {
    console.log("I added a user");
    if($scope.user.food == undefined){
      $scope.user.food = 5;
    }
  };


  $scope.getSliderValue = function(id){
    document.getElementById(id).value=val;
  };

  $scope.register = function() {
    $http.post('/register', $scope.vm)
    .success(function (response) {
      console.log("We registered");
      if(response.success){
        console.log("We succesfully registered");
        $rootScope.loggedIn =true;
        $rootScope.userprofile = response.user;
        $location.path('/userinfo');
      }
    });
  };

  $scope.login = function(){
    $http.post('/authenticate', $scope.vm)
    .success(function (response) {
      if(response.success){
        $rootScope.loggedIn =true;
        $rootScope.userprofile = response.user;
        $location.path('/homepage');
      }
    });
  };

  $scope.addUser = function() {
    console.log("I added a user");
    if($scope.user.food == undefined){
      $scope.user.food = 5;
    }
    if($scope.user.satisfied == undefined){
      $scope.user.satisfied = 5;
    }
    if($scope.user.nightlife == undefined){
      $scope.user.nightlife = 5;
    }
    if($scope.user.schools == undefined){
      $scope.user.schools = 5;
    }
    if($scope.user.transit == undefined){
      $scope.user.transit = 5;
    }
    console.log($scope.user);
    $http.get('http://maps.google.com/maps/api/geocode/json?address=' + $scope.user.zipcode).success(function(mapData) {
      angular.extend($scope, mapData);
      $scope.user.lat = mapData.results[0].geometry.location.lat;
      $scope.user.lng = mapData.results[0].geometry.location.lng;
      $scope.user.username = $rootScope.userprofile.username;
      $http.post('/openhouse', $scope.user).success(function(response) {
        $location.path('/homepage');
      });
    });
  };

  $scope.remove = function(id) {
    console.log(id);
    $http.delete('/openhouse/' + id).success(function(response) {
      refresh();
    });
  };

  $scope.edit = function(id) {
    console.log(id);
    $http.get('/openhouse/' + id).success(function(response) {
      $scope.user = response;
    });
  };

  $scope.update = function() {
      $http.put('/openhouse/' + $scope.user._id, $scope.user).success(function(response) {
        refresh();
      })
  };

  $scope.deselect = function() {

  $scope.user = "";
  };

  $scope.updateTextInput = function(val) {
            console.log(val);
            document.getElementById('textInput').value=val;
  }

  console.log("What it do, dis is de controlla' biotch");

}]);﻿

myApp.controller('mapCtrl', ['$scope', '$http', '$rootScope', '$location', function($scope, $http, $rootScope, $location) {

  $scope.createDataAndConfig = function(confirmedAppartments){
        $scope.createRentPerBedroom(confirmedAppartments);
  }

  $scope.createRentPerBedroom = function(confirmedAppartments){
    console.log($scope.confirmedAppartments);
      for (i = 0; i < $scope.confirmedAppartments.length; i++) {
          var bedrooms = confirmedAppartments[i].bedrooms;
          if(bedrooms != undefined){
            var currValue = $rootScope.data22.data[bedrooms - 1].y[0];
            if(confirmedAppartments[i].cost != undefined){
              currValue += parseInt(confirmedAppartments[i].cost);
              $rootScope.data22.data[bedrooms - 1].y[0] = currValue;
              $scope.bedroomCount[bedrooms - 1]++;
            }
          }
      }
      for(j = 0; j < 4; j++){
          var totalValue = $rootScope.data22.data[j].y[0];
          if($scope.bedroomCount[j] != 0){
            $rootScope.data22.data[j].y[0] = totalValue / $scope.bedroomCount[j];
        }
      }
      $rootScope.showChart = true;
      var chartwrapper = document.getElementById("chartwrapper");
      chartwrapper.style.visibility = 'visible';
  }

  $scope.bedroomCount = [0,0,0,0,0,0,0,0,0]

  $rootScope.showChart = false; 

  $scope.pullAppartmentsAggreatesByName = function(name) {
    console.log("pulling appartments aggregates with name: " + name);
    $http.get('/pullAppartmentsAggreatesByName/' + name).success(function(response) {
      $scope.averages = response;
    });
  };

  $scope.pullAllAppartments = function(polygon) {
    console.log("pulling all appartments");
    $http.get('/pullAllAppartments').success(function(response) {
      var allAppartments = response;
      var confirmedAppartments = [];
      for (i = 0; i < allAppartments.length; i++) {
        var myLatlng = new google.maps.LatLng(allAppartments[i].lat, allAppartments[i].lng);
        if(google.maps.geometry.poly.containsLocation(myLatlng, polygon)) {
          confirmedAppartments.push(allAppartments[i]);
        }
      }
      console.log($scope.filter);
      $scope.confirmedAppartments = confirmedAppartments;
      $scope.createDataAndConfig(confirmedAppartments);
    });
  };

    $scope.pullAppartmentsByName = function(name) {
    console.log("pulling appartments with name: " + name);
    $http.get('/appartmentsByName/' + name).success(function(response) {
      $scope.appartmentList = response;
      $scope.pullAppartmentsAggreatesByName(name);
    });
  };

        $rootScope.config22 = {
    title: 'Cost per bedroom',
    tooltips: false,
    labels: false,
    mouseover: function() {},
    mouseout: function() {},
    click: function() {},
    legend: {
      display: true,
      //could be 'left, right'
      position: 'right'
    }
  };

  $rootScope.data22 = {
    series: ['Cost'],
    data: [{
      x: "1 brm",
      y: [0],
    }, {
      x: "2 brm",
      y: [0]
    }, {
      x: "3 brm",
      y: [0]
    }, {
      x: "4 bdm",
      y: [0]
    }]
  };


   var mapOptions = {
       zoom: 12,
       center: new google.maps.LatLng(49.2827, -123.116226),
       mapTypeId: google.maps.MapTypeId.ROADMAP,
       mapTypeControl: true,
        mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT
      },

   }

   $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

   var drawingManager = new google.maps.drawing.DrawingManager({
       drawingMode: google.maps.drawing.OverlayType.POLYGON,
       drawingControl: true,
       drawingControlOptions: {
           position: google.maps.ControlPosition.BOTTOM_CENTER,
           drawingModes: ['polygon']
       },
   });

   drawingManager.setMap($scope.map);
   var polygons = [];

   google.maps.event.addDomListener(drawingManager, 'polygoncomplete', function(polygon) {

    //Remove old polygon
    for(var i=0; i<polygons.length; i++) {
        polygons[i].setMap(null);
    }

    polygons.push(polygon);

    $scope.pullAllAppartments(polygon);

  })

}]);

myApp.directive('ngDraggable', function($document) {
  return {
    restrict: 'A',
    scope: {
      dragOptions: '=ngDraggable'
    },
    link: function(scope, elem, attr) {
      var startX, startY, x = 0, y = 0,
          start, stop, drag, container;

      var width  = elem[0].offsetWidth,
          height = elem[0].offsetHeight;

      // Obtain drag options
      if (scope.dragOptions) {
        start  = scope.dragOptions.start;
        drag   = scope.dragOptions.drag;
        stop   = scope.dragOptions.stop;
        var id = scope.dragOptions.container;
        if (id) {
            container = document.getElementById(id).getBoundingClientRect();
        }
      }

      // Bind mousedown event
      elem.on('mousedown', function(e) {
        e.preventDefault();
        startX = e.clientX - elem[0].offsetLeft;
        startY = e.clientY - elem[0].offsetTop;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
        if (start) start(e);
      });

      // Handle drag event
      function mousemove(e) {
        y = e.clientY - startY;
        x = e.clientX - startX;
        setPosition();
        if (drag) drag(e);
      }

      // Unbind drag events
      function mouseup(e) {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        if (stop) stop(e);
      }

      // Move element, within container if provided
      function setPosition() {
        if (container) {
          if (x < container.left) {
            x = container.left;
          } else if (x > container.right - width) {
            x = container.right - width;
          }
          if (y < container.top) {
            y = container.top;
          } else if (y > container.bottom - height) {
            y = container.bottom - height;
          }
        }

        elem.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }
    }
  }

});
