angular.module('selfTracker', ['ngRoute'])

  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'app/views/login.html',
        controller: 'LoginController'
      })
      .when('/dashboard', {
        templateUrl: 'app/views/dashboard.html',
        controller: 'DashboardController'
      })
      .when('/tasks', {
        templateUrl: 'app/views/tasks.html',
        controller: 'TaskController'
      })
      .when('/skills', {
        templateUrl: 'app/views/skills.html',
        controller: 'SkillController'
      })
      .when('/goals', {
        templateUrl: 'app/views/goals.html',
        controller: 'GoalController'
      })
      .when('/employees', {
        templateUrl: 'app/views/employees.html',
        controller: 'EmployeeController'
      })
      .when('/employees/:id', {
        templateUrl: 'app/views/employee-detail.html',
        controller: 'EmployeeController'
      })
      .otherwise({ redirectTo: '/' });
  }]);
