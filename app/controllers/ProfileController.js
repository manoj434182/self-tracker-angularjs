angular.module('selfTracker')
  .controller('ProfileController', ['$scope', '$rootScope', '$location',
    function ($scope, $rootScope, $location) {

      $rootScope.pageTitle = 'My Profile';

      var user = $rootScope.currentUser;
      if (!user) { $location.path('/'); return; }

      $scope.user = user;
    }
  ]);
