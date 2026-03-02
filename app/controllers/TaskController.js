angular.module('selfTracker')
  .controller('TaskController', ['$scope', '$rootScope', '$location', 'DataService', 'FileService',
    function ($scope, $rootScope, $location, DataService, FileService) {

      $rootScope.pageTitle = 'My Tasks';

      var user = $rootScope.currentUser;
      if (!user) { $location.path('/'); return; }

      /* ---- State ---- */
      $scope.tasks         = [];
      $scope.filteredTasks = [];
      $scope.filterStatus   = 'all';
      $scope.filterPriority = 'all';
      $scope.filterCategory = 'all';
      $scope.searchText     = '';
      $scope.showAddForm    = false;
      $scope.editingId      = null;
      $scope.alert          = null;

      /* Blank new-task template */
      function blankTask() {
        return {
          id:          null,
          employeeId:  user.id,
          title:       '',
          description: '',
          status:      'todo',
          priority:    'medium',
          dueDate:     '',
          createdDate: new Date().toISOString().slice(0, 10),
          category:    'feature'
        };
      }

      $scope.newTask  = blankTask();
      $scope.editTask = {};

      /* ---- Load ---- */
      DataService.getTasksByEmployee(user.id).then(function (tasks) {
        $scope.tasks = tasks;
        applyFilters();
        $scope.$applyAsync();
      });

      /* ---- Filtering ---- */
      function applyFilters() {
        $scope.filteredTasks = $scope.tasks.filter(function (t) {
          var statusOk   = $scope.filterStatus   === 'all' || t.status   === $scope.filterStatus;
          var priorityOk = $scope.filterPriority === 'all' || t.priority === $scope.filterPriority;
          var categoryOk = $scope.filterCategory === 'all' || t.category === $scope.filterCategory;
          var searchOk   = !$scope.searchText ||
            t.title.toLowerCase().indexOf($scope.searchText.toLowerCase()) !== -1;
          return statusOk && priorityOk && categoryOk && searchOk;
        });
      }

      $scope.$watchGroup(
        ['filterStatus', 'filterPriority', 'filterCategory', 'searchText'],
        applyFilters
      );

      /* ---- Add ---- */
      $scope.toggleAddForm = function () {
        $scope.showAddForm = !$scope.showAddForm;
        $scope.newTask = blankTask();
      };

      $scope.saveNewTask = function () {
        if (!$scope.newTask.title.trim()) { return; }
        var maxId = $scope.tasks.reduce(function (m, t) { return Math.max(m, t.id); }, 0);
        $scope.newTask.id = maxId + 1;
        $scope.tasks.push(angular.copy($scope.newTask));
        $scope.newTask   = blankTask();
        $scope.showAddForm = false;
        applyFilters();
        showAlert('success', 'Task added successfully.');
      };

      /* ---- Edit ---- */
      $scope.startEdit = function (task) {
        $scope.editingId = task.id;
        $scope.editTask  = angular.copy(task);
      };

      $scope.saveEdit = function () {
        var idx = $scope.tasks.findIndex(function (t) { return t.id === $scope.editingId; });
        if (idx !== -1) { $scope.tasks[idx] = angular.copy($scope.editTask); }
        $scope.editingId = null;
        applyFilters();
        showAlert('success', 'Task updated.');
      };

      $scope.cancelEdit = function () { $scope.editingId = null; };

      /* ---- Delete ---- */
      $scope.deleteTask = function (task) {
        if (!confirm('Delete "' + task.title + '"?')) return;
        $scope.tasks = $scope.tasks.filter(function (t) { return t.id !== task.id; });
        applyFilters();
        showAlert('success', 'Task deleted.');
      };

      /* ---- Export ---- */
      $scope.exportTasks = function () {
        FileService.exportToJSON($scope.tasks, 'tasks.json');
      };

      /* ---- Import ---- */
      $scope.triggerImport = function () {
        document.getElementById('taskFileInput').click();
      };

      $scope.importTasks = function (element) {
        var file = element.files[0];
        if (!file) return;
        FileService.importFromJSON(file).then(function (data) {
          if (Array.isArray(data)) {
            /* Merge: add items whose id doesn't already exist */
            data.forEach(function (item) {
              var exists = $scope.tasks.some(function (t) { return t.id === item.id; });
              if (!exists) { $scope.tasks.push(item); }
            });
            applyFilters();
            showAlert('success', 'Imported ' + data.length + ' tasks (new items merged).');
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
