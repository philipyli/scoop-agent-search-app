angular.module('agentgo.controllers',['agentgo.services', 'ngCordova'])

.controller('AgentsCtrl', ['$scope', '$q', '$log', '$state', '$location','AgentService', 'NeighborhoodService', 'geoLocationService', '$cordovaGeolocation', function($scope, $q, $log, $state, $location, AgentService, NeighborhoodService, geoLocationService, $cordovaGeolocation) {

  // 0 means local search
  var neighborhoodId = $location.search().neighborhood_id;

  // decides if GPS location information needs to be loaded
  var loadLocation = function( neighborhoodId ) {
    if ( neighborhoodId > 0 ) {

      //$log.log('loadLocation().neighborhoodId:' + neighborhoodId);

      var deferred = $q.defer();
      deferred.resolve({});
      return deferred.promise;
    } else {

      return $cordovaGeolocation
        .getCurrentPosition()
        .then( function ( position ) {
          var lat = position.coords.latitude;
          var long = position.coords.longitude;
          //$log.log('lat:' + lat);
          //$log.log('long:' + long);

          return {lat: lat, long: long};
        });
    }
  };
  // loads the neighborhood by appropriate means (id or lat/long)
  var loadNeighborhood = function ( responseGeoData ) {
    if ( responseGeoData.lat ) {
      return NeighborhoodService
        .getClosest( responseGeoData.lat, responseGeoData.long )
        .then( function ( neighborhood ) {

          //$log.log('loadNeighborhood().getClosest().then().neighborhood:' + neighborhood);

          $scope.neighborhood = neighborhood;
          $scope.location_input = $scope.neighborhood.name;
          $scope.city = $scope.neighborhood.city;
          $scope.user_typing_in_location_input = false;
          return neighborhood.neighborhood_id;
        });
    } else {
      return NeighborhoodService
        .get( neighborhoodId )
        .then( function( neighborhood ) {

          //$log.log('loadNeighborhood().get().then().neighborhood:' + neighborhood);
          $scope.neighborhood = neighborhood;
          $scope.location_input = $scope.neighborhood.name;
          $scope.city = $scope.neighborhood.city;
          $scope.user_typing_in_location_input = false;
          return neighborhood.neighborhood_id;
        });
    }
  };

  // loads the agents by the neighborhood ID
  var loadAgents = function ( neighborhoodResponseId ) {

    //$log.log('loadAgents().getByNeighborhoodId().then().neighborhoodResponseId:' + neighborhoodResponseId);
    return AgentService
      .getByNeighborhoodId( neighborhoodResponseId )
      .then( function ( agents ) {

        //$log.log('loadAgents().getByNeighborhoodId().then().agents:' + agents);

        $scope.agents = agents;
        return agents;
      }
    );
  };

  // manages any errors in the promise call chain
  var reportProblems = function ( error ) {
    $log.error ( String(error) );
  };

  // executs the above promises
  loadLocation( neighborhoodId )
    .then( loadNeighborhood )
    .then( loadAgents )
    .catch( reportProblems );

  // neighborhood matching
  $scope.matching_neighborhoods = [];

  // when user starts typing into input box
  $scope.searchingNeighborhood = function() {
    NeighborhoodService.getAllSearch($scope.location_input).then(
      function(neighborhoods) {
        $scope.matching_neighborhoods = neighborhoods;
      });
    $scope.user_typing_in_location_input = true;
  };

  $scope.clearInput = function() {
    $scope.location_input = "";
    $scope.user_typing_in_location_input = false;
  };

  // transition to agentDetail state
  $scope.goToAgentDetailsState = function (agent, neighborhood) {
    $state.go('tab.agent-detail', {agent: JSON.stringify(agent), neighborhood: JSON.stringify(neighborhood)});
  }
}])


.controller('AgentDetailCtrl', ['$scope', '$stateParams', '$cordovaSms', '$log', 'agAppConst', function($scope, $stateParams, $cordovaSms, $log, agAppConst) {

  var agent = JSON.parse($stateParams.agent);

  $scope.agent = agent;
  $scope.user = {
    mesg: {
      input: '',
      typing: false,
      sent: false}
  };

  $scope.typingMesg = function() {
    $scope.user.mesg.typing = true;
  };

  $log.log($stateParams.agent);
  $scope.sendMesg = function() {
    $scope.user.mesg.typing = false;
    $scope.user.mesg.sent = true;

    if ( $scope.user.mesg.input ) {

      var message;
      if ($scope.agent) {
        message = agent.first_name + ' ' + agent.last_name + '/' + agent.neighborhood + ',' + agent.city;
      }

      message = message + '-:' + $scope.user.mesg.input;

      $log.log('Message Sending ->' + message);
      $log.log('Phone:' + agAppConst.SMS_FROM_PHONE);

      $cordovaSms
        .send( agAppConst.SMS_FROM_PHONE, message )
        .then(function(result) {
          $log.log(JSON.stringify(result));
        }, function(err) {
          $log.error(JSON.stringify(err));
        });

    }
  };
}])


.controller('AboutCtrl', ['$scope', function($scope) {
    $scope.make_app_more_useful = '';
    $scope.describe_app_to_friends = '';
    $scope.hesitate_from_contacting_agents = '';
    $scope.email_for_user_study = '';

    $scope.saveInputs = function () {
      /*  alert('$scope.make_app_more_useful' + $scope.make_app_more_useful + '\n' +
       '$scope.describe_app_to_friends' + $scope.describe_app_to_friends + '\n' +
       '$scope.hesitate_from_contacting_agents' + $scope.hesitate_from_contacting_agents + '\n' +
       '$scope.email_for_user_study' + $scope.email_for_user_study + '\n');
       */
    }
  }]);
