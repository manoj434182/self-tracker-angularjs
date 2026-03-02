angular.module('selfTracker')
  .controller('MainController', ['$scope', '$rootScope', '$location', 'DataService',
    function ($scope, $rootScope, $location, DataService) {

      /* ---- Shared state via $rootScope so child controllers can access ---- */
      $rootScope.currentUser = $rootScope.currentUser || null;

      /* Proxy onto local scope for templates in ng-controller="MainController" */
      Object.defineProperty($scope, 'currentUser', {
        get: function () { return $rootScope.currentUser; },
        set: function (v) { $rootScope.currentUser = v; }
      });

      /* ---- Page title helper (updated by child controllers) ---- */
      $rootScope.pageTitle = 'Dashboard';
      $scope.pageTitle = $rootScope.pageTitle;
      $rootScope.$watch('pageTitle', function (v) { $scope.pageTitle = v; });

      /* ---- Auth ---- */
      $scope.setUser = function (user) {
        $rootScope.currentUser = user;
        $location.path('/dashboard');
      };

      $scope.logout = function () {
        $rootScope.currentUser = null;
        DataService.clearCache();
        $location.path('/');
      };

      $scope.isManager = function () {
        return $rootScope.currentUser && $rootScope.currentUser.role === 'manager';
      };

      /* ---- Active nav helper ---- */
      $scope.isActive = function (path) {
        return $location.path().indexOf(path) === 0;
      };

      /* ---- Guard: redirect to login if not authenticated and not on / ---- */
      $rootScope.$on('$routeChangeStart', function (event, next) {
        var isLoginRoute = next && next.$$route && next.$$route.originalPath === '/';
        if (!$rootScope.currentUser && !isLoginRoute) {
          $location.path('/');
        }
      });
    }
  ]);
