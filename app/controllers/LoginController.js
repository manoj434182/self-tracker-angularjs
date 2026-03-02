angular.module('selfTracker')
  .controller('LoginController', ['$scope', '$rootScope', '$location', 'DataService',
    function ($scope, $rootScope, $location, DataService) {

      /* Redirect if already logged in */
      if ($rootScope.currentUser) { $location.path('/dashboard'); return; }

      $scope.selectedRole = null;
      $scope.userList     = [];

      $scope.selectRole = function (role) {
        $scope.selectedRole = role;
        DataService.getEmployees().then(function (emps) {
          $scope.userList = emps.filter(function (e) { return e.role === role; });
        });
      };

      $scope.loginAs = function (user) {
        /* setUser lives on the parent MainController scope */
        $scope.$parent.setUser(user);
      };
    }
  ]);
