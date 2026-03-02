angular.module('selfTracker')
  .controller('DashboardController', ['$scope', '$rootScope', '$location', 'DataService',
    function ($scope, $rootScope, $location, DataService) {

      $rootScope.pageTitle = 'Dashboard';

      var user = $rootScope.currentUser;
      if (!user) { $location.path('/'); return; }

      $scope.stats        = {};
      $scope.recentTasks  = [];
      $scope.topSkills    = [];
      $scope.activeGoals  = [];
      $scope.isManager    = user.role === 'manager';

      /* ---- Manager: aggregate across whole team ---- */
      function loadManagerStats(employees) {
        var empIds = employees
          .filter(function (e) { return e.role === 'employee'; })
          .map(function (e) { return e.id; });

        $scope.teamSize = empIds.length;

        Promise.all([
          DataService.getTasks(),
          DataService.getSkills(),
          DataService.getGoals()
        ]).then(function (results) {
          var allTasks  = results[0].filter(function (t) { return empIds.indexOf(t.employeeId) !== -1; });
          var allSkills = results[1].filter(function (s) { return empIds.indexOf(s.employeeId) !== -1; });
          var allGoals  = results[2].filter(function (g) { return empIds.indexOf(g.employeeId) !== -1; });

          var done       = allTasks.filter(function (t) { return t.status === 'done'; });
          var inProgress = allTasks.filter(function (t) { return t.status === 'in-progress'; });
          var active     = allGoals.filter(function (g) { return g.status === 'active'; });
          var completed  = allGoals.filter(function (g) { return g.status === 'completed'; });
          var avgSkill   = allSkills.length
            ? (allSkills.reduce(function (s, k) { return s + k.proficiencyLevel; }, 0) / allSkills.length).toFixed(1)
            : 0;

          $scope.stats = {
            totalTasks:      allTasks.length,
            doneTasks:       done.length,
            inProgressTasks: inProgress.length,
            todoTasks:        allTasks.filter(function (t) { return t.status === 'todo'; }).length,
            totalGoals:      allGoals.length,
            activeGoals:     active.length,
            completedGoals:  completed.length,
            avgSkillLevel:   avgSkill
          };

          $scope.recentTasks = allTasks
            .slice()
            .sort(function (a, b) { return new Date(b.createdDate) - new Date(a.createdDate); })
            .slice(0, 5);

          /* Top skills by level */
          $scope.topSkills = allSkills
            .slice()
            .sort(function (a, b) { return b.proficiencyLevel - a.proficiencyLevel; })
            .slice(0, 5);

          $scope.activeGoals = active.slice(0, 5);
          $scope.$applyAsync();
        });
      }

      /* ---- Employee: own data ---- */
      function loadEmployeeStats() {
        Promise.all([
          DataService.getTasksByEmployee(user.id),
          DataService.getSkillsByEmployee(user.id),
          DataService.getGoalsByEmployee(user.id)
        ]).then(function (results) {
          var tasks  = results[0];
          var skills = results[1];
          var goals  = results[2];

          var done       = tasks.filter(function (t) { return t.status === 'done'; });
          var inProgress = tasks.filter(function (t) { return t.status === 'in-progress'; });
          var active     = goals.filter(function (g) { return g.status === 'active'; });
          var avgSkill   = skills.length
            ? (skills.reduce(function (s, k) { return s + k.proficiencyLevel; }, 0) / skills.length).toFixed(1)
            : 0;

          $scope.stats = {
            totalTasks:      tasks.length,
            doneTasks:       done.length,
            inProgressTasks: inProgress.length,
            todoTasks:        tasks.filter(function (t) { return t.status === 'todo'; }).length,
            totalGoals:      goals.length,
            activeGoals:     active.length,
            completedGoals:  goals.filter(function (g) { return g.status === 'completed'; }).length,
            avgSkillLevel:   avgSkill
          };

          $scope.recentTasks = tasks
            .slice()
            .sort(function (a, b) { return new Date(b.createdDate) - new Date(a.createdDate); })
            .slice(0, 5);

          $scope.topSkills = skills
            .slice()
            .sort(function (a, b) { return b.proficiencyLevel - a.proficiencyLevel; })
            .slice(0, 5);

          $scope.activeGoals = active.slice(0, 5);
          $scope.$applyAsync();
        });
      }

      if ($scope.isManager) {
        DataService.getEmployees().then(function (emps) {
          $scope.employees = emps;
          loadManagerStats(emps);
        });
      } else {
        loadEmployeeStats();
      }

      /* Helper used in template */
      $scope.skillBarWidth = function (level) {
        return (level / 5 * 100) + '%';
      };
    }
  ]);
