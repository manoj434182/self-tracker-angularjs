angular.module('selfTracker')
  .controller('GoalController', ['$scope', '$rootScope', '$location', 'DataService', 'FileService',
    function ($scope, $rootScope, $location, DataService, FileService) {

      $rootScope.pageTitle = 'My Goals';

      var user = $rootScope.currentUser;
      if (!user) { $location.path('/'); return; }

      $scope.goals       = [];
      $scope.filterStatus   = 'all';
      $scope.filterCategory = 'all';
      $scope.searchText  = '';
      $scope.showAddForm = false;
      $scope.editingId   = null;
      $scope.alert       = null;

      function blankGoal() {
        return {
          id:          null,
          employeeId:  user.id,
          title:       '',
          description: '',
          targetDate:  '',
          progress:    0,
          status:      'active',
          category:    'technical'
        };
      }

      $scope.newGoal  = blankGoal();
      $scope.editGoal = {};

      /* ---- Load ---- */
      DataService.getGoalsByEmployee(user.id).then(function (goals) {
        $scope.goals = goals;
        $scope.$applyAsync();
      });

      /* ---- Filtered list ---- */
      $scope.filteredGoals = function () {
        return $scope.goals.filter(function (g) {
          var statusOk   = $scope.filterStatus   === 'all' || g.status   === $scope.filterStatus;
          var categoryOk = $scope.filterCategory === 'all' || g.category === $scope.filterCategory;
          var searchOk   = !$scope.searchText ||
            g.title.toLowerCase().indexOf($scope.searchText.toLowerCase()) !== -1;
          return statusOk && categoryOk && searchOk;
        });
      };

      /* ---- Progress colour helper ---- */
      $scope.progressClass = function (pct) {
        if (pct >= 100) return 'green';
        if (pct >= 50)  return '';
        return 'orange';
      };

      /* ---- Add ---- */
      $scope.toggleAddForm = function () {
        $scope.showAddForm = !$scope.showAddForm;
        $scope.newGoal = blankGoal();
      };

      $scope.saveNewGoal = function () {
        if (!$scope.newGoal.title.trim()) return;
        var maxId = $scope.goals.reduce(function (m, g) { return Math.max(m, g.id); }, 0);
        $scope.newGoal.id       = maxId + 1;
        $scope.newGoal.progress = parseInt($scope.newGoal.progress, 10) || 0;
        $scope.goals.push(angular.copy($scope.newGoal));
        $scope.newGoal    = blankGoal();
        $scope.showAddForm = false;
        showAlert('success', 'Goal added.');
      };

      /* ---- Edit ---- */
      $scope.startEdit = function (goal) {
        $scope.editingId = goal.id;
        $scope.editGoal  = angular.copy(goal);
      };

      $scope.saveEdit = function () {
        var idx = $scope.goals.findIndex(function (g) { return g.id === $scope.editingId; });
        if (idx !== -1) {
          $scope.editGoal.progress = parseInt($scope.editGoal.progress, 10) || 0;
          $scope.goals[idx] = angular.copy($scope.editGoal);
        }
        $scope.editingId = null;
        showAlert('success', 'Goal updated.');
      };

      $scope.cancelEdit = function () { $scope.editingId = null; };

      /* ---- Quick progress update (slider on card) ---- */
      $scope.updateProgress = function (goal) {
        var idx = $scope.goals.findIndex(function (g) { return g.id === goal.id; });
        if (idx !== -1) {
          $scope.goals[idx].progress = parseInt(goal.progress, 10) || 0;
          if ($scope.goals[idx].progress >= 100) {
            $scope.goals[idx].status = 'completed';
          }
        }
      };

      /* ---- Delete ---- */
      $scope.deleteGoal = function (goal) {
        if (!confirm('Delete goal "' + goal.title + '"?')) return;
        $scope.goals = $scope.goals.filter(function (g) { return g.id !== goal.id; });
        showAlert('success', 'Goal deleted.');
      };

      /* ---- Export ---- */
      $scope.exportGoals = function () {
        FileService.exportToJSON($scope.goals, 'goals.json');
      };

      /* ---- Import ---- */
      $scope.triggerImport = function () {
        document.getElementById('goalFileInput').click();
      };

      $scope.importGoals = function (element) {
        var file = element.files[0];
        if (!file) return;
        FileService.importFromJSON(file).then(function (data) {
          if (Array.isArray(data)) {
            data.forEach(function (item) {
              var exists = $scope.goals.some(function (g) { return g.id === item.id; });
              if (!exists) $scope.goals.push(item);
            });
            showAlert('success', 'Imported ' + data.length + ' goals.');
          } else {
            showAlert('danger', 'Invalid format: expected a JSON array.');
          }
          $scope.$applyAsync();
          element.value = '';
        }).catch(function (err) {
          showAlert('danger', 'Import error: ' + err.message);
          $scope.$applyAsync();
        });
      };

      function showAlert(type, msg) {
        $scope.alert = { type: type, msg: msg };
        setTimeout(function () { $scope.alert = null; $scope.$applyAsync(); }, 4000);
      }
    }
  ]);
