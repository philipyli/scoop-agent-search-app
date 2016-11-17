angular.module('agentgo.services', [])
.constant('agServiceConst', {
//    AGSVC_WEB_PATH: 'http://localhost:3000'})
    AGSVC_WEB_PATH: 'http://54.68.62.85:3000'})

.factory('AgentService', ['$http', '$q', 'agServiceConst', '$log', function($http, $q, agServiceConst, $log) {

  var processError = function (errorResponse) {

    if (
      !angular.isObject(errorResponse) || !errorResponse.message
      ) {
      return( $q.reject('An unknown error occurred.') );
    }

    $q.reject('An error occurred:' + errorResponse);
  };

  function callGetByNeighborhoodId(neighborhoodId) {

    var deferred = $q.defer();

    return $http({
      method: 'GET',
      url: agServiceConst.AGSVC_WEB_PATH + '/agent/neighborhood/' + neighborhoodId
    })
      .then(function (response) {
        var agents = response.data.agents;
        //$log.log('AgentService().getByNeighborhoodId.response.data.agents:' + agents);

        //deferred.resolve(agents);
        return response.data.agents;
      },
      processError);

    return deferred.promise;

  };

  function callGet(agentId) {
    $http({
      method: 'GET',
      url: agServiceConst.AGSVC_WEB_PATH + '/agent/' + agentId
    })
      .then(function processSuccess(response) {
        return response;
      },
      function processError(errorResponse){

        if (
          ! angular.isObject( errorResponse ) ||
          ! errorResponse.message
          ) {
          return( $q.reject( "An unknown error occurred." ) );
        }

        $q.reject('An error occurred:' + errorResponse);
      }
    )

  };


  return {
    getByNeighborhoodId: callGetByNeighborhoodId,
    get: callGet
  };

}])

// lookups work by array position.  So, id's within neighborhood arrays CANNOT be out of order!                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
.factory('NeighborhoodService', ['$http', '$q', '$timeout', 'agServiceConst', '$log', function($http, $q, $timeout, agServiceConst, $log) {

  var processError = function (errorResponse) {

      if (
        !angular.isObject(errorResponse) || !errorResponse.message
        ) {
        return( $q.reject('An unknown error occurred.') );
      }

      $q.reject('An error occurred:' + errorResponse);
    };

  var neighborhoods;

  // method call to getAllSearch(searchFilter) to retrieve a subset of neighborhoods
  var callAllSearch = function(searchFilter) {
    //$log.log('Searching neighborhoods for ' + searchFilter);

    var deferred = $q.defer();
    if (! neighborhoods) {
      return $http({
        method: 'GET',
        url: agServiceConst.AGSVC_WEB_PATH + '/neighborhoods'
      }).then( function( response ) {

          neighborhoods = response.data;
          var matches = neighborhoods.filter( function(neighborhood) {
            if (typeof(neighborhood) == 'undefined' || neighborhood == null) return false;
            if(neighborhood.name.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 )
              return true;
            else if(neighborhood.city.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 )
              return true;
          });
          $timeout( function(){
            //return matches;
            deferred.resolve( matches );
          }, 100);
        },
        processError )
    } else {


      var matches = neighborhoods.filter( function(neighborhood) {
        if (typeof(neighborhood) == 'undefined' || neighborhood == null) return false;
        if(neighborhood.name.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 )
          return true;
        else if(neighborhood.city.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 )
          return true;
      });
      $timeout( function(){
        deferred.resolve( matches );
        //return matches;
      }, 100);
      return deferred.promise;
    }
  };

  // method call to getAll() neighborhoords
  var callGetAll  = function() {

    var deferred = $q.defer();
    if (! neighborhoods) {
      return $http({
        method: 'GET',
        url: agServiceConst.AGSVC_WEB_PATH + '/neighborhoods'
      }).then( function( response ) {
          neighborhoods = response.data;
          //return neighborhoods;
          deferred.resolve(neighborhoods);
        },
        processError )
    } else {
      deferred.resolve(neighborhoods);
      //return neighborhoods;
    }
    return deferred.promise;
  };

  // method call to get(neighborhood_id)
  var callGet = function(neighborhood_id) {

    var deferred = $q.defer();
    if (neighborhoods) {
      //return neighborhoods[neighborhood_id];

      //$log.log('NeighborhoodService().get().cache.neighborhood:' + neighborhoods[neighborhood_id]);
      deferred.resolve(neighborhoods[neighborhood_id]);

      //return neighborhoods[neighborhood_id];
    } else {
      // Call service to grab the neighborhood
      $http({
        method: 'GET',
        url: agServiceConst.AGSVC_WEB_PATH + '/neighborhood/' + neighborhood_id
      }).then( function( response ) {
        var neighborhood = response.data.data;
        //$log.log('NeighborhoodService().get.neighborhood:' + neighborhood);
        deferred.resolve(neighborhood);
      },
        processError);
    }
    return deferred.promise;
  };

  // method call to getClosest neighborhood by lat/long
  var callGetClosest = function (latitude, longitude) {
    var deferred = $q.defer();
    // Call service to grab the neighborhood
    $http({
      method: 'GET',
      url: agServiceConst.AGSVC_WEB_PATH + '/neighborhood/closest',
      params: {lat: latitude, long: longitude}
    }).then( function( response ) {
      var neighborhood = response.data.data;
      //$log.log('NeighborhoodService().getClosest.neighborhood:' + neighborhood);
      //return neighborhood;
      deferred.resolve(neighborhood);
    },
      processError);
    return deferred.promise;
  };

  return {
    getAllSearch: callAllSearch,
    getClosest: callGetClosest,
    getAll: callGetAll,
    get: callGet
  };
}])

  .factory('cordovaReady', [function() {
    return function (fn) {

      var queue = [];

      var impl = function () {
        queue.push(Array.prototype.slice.call(arguments));
      };

      document.addEventListener('deviceready', function () {
        queue.forEach(function (args) {
          fn.apply(this, args);
        });
        impl = fn;
      }, false);

      return function () {
        return impl.apply(this, arguments);
      };
    };
  }])

  .factory('geoLocationService',['$rootScope', 'cordovaReady', function ($rootScope, cordovaReady) {
    return {
      getCurrentPosition: cordovaReady(function (onSuccess, onError, options) {
        navigator.geolocation.getCurrentPosition(function () {
            var that = this,
              args = arguments;

            if (onSuccess) {
              $rootScope.$apply(function () {
                onSuccess.apply(that, args);
              });
            }
          }, function () {
            var that = this,
              args = arguments;

            if (onError) {
              $rootScope.$apply(function () {
                onError.apply(that, args);
              });
            }
          },
          options);
      })
    };

  }]);