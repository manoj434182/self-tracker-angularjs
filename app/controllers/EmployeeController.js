angular.module('selfTracker')
  .controller('EmployeeController', ['$scope', '$rootScope', '$location', '$routeParams', 'DataService',
    function ($scope, $rootScope, $location, $routeParams, DataService) {

      var user = $rootScope.currentUser;
      if (!user || user.role !== 'manager') { $location.path('/dashboard'); return; }

      $scope.employees       = [];
      $scope.selectedEmployee = null;
      $scope.searchText      = '';
      $scope.empTasks        = [];
      $scope.empSkills       = [];
      $scope.empGoals        = [];
      $scope.empStats        = {};
      $scope.activeTab       = 'tasks';

      $rootScope.pageTitle = $routeParams.id ? 'Employee Detail' : 'Team Overview';

      /* ---- Helpers ---- */
      $scope.getEmployeeStats = function (tasks, skills, goals) {
        var done      = tasks.filter(function (t) { return t.status === 'done'; }).length;
        var active    = goals.filter(function (g) { return g.status === 'active'; }).length;
        var completed = goals.filter(function (g) { return g.status === 'completed'; }).length;
        var avg = skills.length
          ? (skills.reduce(function (s, k) { return s + k.proficiencyLevel; }, 0) / skills.length).toFixed(1)
          : '—';
        return {
          totalTasks: tasks.length,
          doneTasks:  done,
          activeGoals: active,
          completedGoals: completed,
          avgSkill: avg
        };
      };

      /* ---- Load all employees (for list view) ---- */
      DataService.getEmployees().then(function (emps) {
        $scope.employees = emps.filter(function (e) { return e.role === 'employee'; });

        /* Annotate with quick stats */
        Promise.all([DataService.getTasks(), DataService.getSkills(), DataService.getGoals()])
          .then(function (results) {
            var allTasks  = results[0];
            var allSkills = results[1];
            var allGoals  = results[2];

            $scope.employees.forEach(function (emp) {
              var t = allTasks.filter(function (x) { return x.employeeId === emp.id; });
              var s = allSkills.filter(function (x) { return x.employeeId === emp.id; });
              var g = allGoals.filter(function (x) { return x.employeeId === emp.id; });
              emp._stats = $scope.getEmployeeStats(t, s, g);
            });

            /* ---- Detail view ---- */
            if ($routeParams.id) {
              var empId = parseInt($routeParams.id, 10);
              $scope.selectedEmployee = emps.find(function (e) { return e.id === empId; });
              if (!$scope.selectedEmployee) { $location.path('/employees'); return; }
              $rootScope.pageTitle = $scope.selectedEmployee.name;

              $scope.empTasks  = allTasks.filter(function (t) { return t.employeeId === empId; });
              $scope.empSkills = allSkills.filter(function (s) { return s.employeeId === empId; });
              $scope.empGoals  = allGoals.filter(function (g) { return g.employeeId === empId; });
              $scope.empStats  = $scope.getEmployeeStats($scope.empTasks, $scope.empSkills, $scope.empGoals);
            }

            $scope.$applyAsync();
          });
      });

      /* ---- Navigation ---- */
      $scope.viewEmployee = function (emp) {
        $location.path('/employees/' + emp.id);
      };

      $scope.goBack = function () {
        $location.path('/employees');
      };

      $scope.setTab = function (tab) { $scope.activeTab = tab; };

      /* ---- Table filter ---- */
      $scope.filteredEmployees = function () {
        if (!$scope.searchText) return $scope.employees;
        var q = $scope.searchText.toLowerCase();
        return $scope.employees.filter(function (e) {
          return e.name.toLowerCase().indexOf(q) !== -1 ||
                 e.email.toLowerCase().indexOf(q) !== -1 ||
                 e.department.toLowerCase().indexOf(q) !== -1;
        });
      };

      /* ---- Skill dots ---- */
      $scope.skillDots = function (skill) {
        return [1, 2, 3, 4, 5].map(function (n) {
          return { filled: n <= skill.proficiencyLevel };
        });
      };
    }
  ]);
