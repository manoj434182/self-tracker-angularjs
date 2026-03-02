angular.module('selfTracker')
  .controller('SkillController', ['$scope', '$rootScope', '$location', 'DataService', 'FileService',
    function ($scope, $rootScope, $location, DataService, FileService) {

      $rootScope.pageTitle = 'My Skills';

      var user = $rootScope.currentUser;
      if (!user) { $location.path('/'); return; }

      $scope.skills      = [];
      $scope.filterCategory = 'all';
      $scope.searchText  = '';
      $scope.showAddForm = false;
      $scope.editingId   = null;
      $scope.alert       = null;

      var LEVELS = [1, 2, 3, 4, 5];
      $scope.levels = LEVELS;

      function blankSkill() {
        return {
          id:               null,
          employeeId:       user.id,
          name:             '',
          category:         'frontend',
          proficiencyLevel: 1,
          targetLevel:      3,
          lastUpdated:      new Date().toISOString().slice(0, 10),
          notes:            ''
        };
      }

      $scope.newSkill  = blankSkill();
      $scope.editSkill = {};

      /* ---- Load ---- */
      DataService.getSkillsByEmployee(user.id).then(function (skills) {
        $scope.skills = skills;
        $scope.$applyAsync();
      });

      /* ---- Filtered view ---- */
      $scope.filteredSkills = function () {
        return $scope.skills.filter(function (s) {
          var catOk    = $scope.filterCategory === 'all' || s.category === $scope.filterCategory;
          var searchOk = !$scope.searchText ||
            s.name.toLowerCase().indexOf($scope.searchText.toLowerCase()) !== -1;
          return catOk && searchOk;
        });
      };

      /* ---- Dots helper: returns array of {filled, target} objects ---- */
      $scope.skillDots = function (skill) {
        return LEVELS.map(function (n) {
          return {
            filled: n <= skill.proficiencyLevel,
            target: n === skill.targetLevel && n > skill.proficiencyLevel
          };
        });
      };

      /* ---- Add ---- */
      $scope.toggleAddForm = function () {
        $scope.showAddForm = !$scope.showAddForm;
        $scope.newSkill = blankSkill();
      };

      $scope.saveNewSkill = function () {
        if (!$scope.newSkill.name.trim()) return;
        var maxId = $scope.skills.reduce(function (m, s) { return Math.max(m, s.id); }, 0);
        $scope.newSkill.id = maxId + 1;
        $scope.skills.push(angular.copy($scope.newSkill));
        $scope.newSkill    = blankSkill();
        $scope.showAddForm = false;
        showAlert('success', 'Skill added.');
      };

      /* ---- Edit ---- */
      $scope.startEdit = function (skill) {
        $scope.editingId = skill.id;
        $scope.editSkill = angular.copy(skill);
      };

      $scope.saveEdit = function () {
        var idx = $scope.skills.findIndex(function (s) { return s.id === $scope.editingId; });
        if (idx !== -1) {
          $scope.editSkill.lastUpdated = new Date().toISOString().slice(0, 10);
          $scope.skills[idx] = angular.copy($scope.editSkill);
        }
        $scope.editingId = null;
        showAlert('success', 'Skill updated.');
      };

      $scope.cancelEdit = function () { $scope.editingId = null; };

      /* ---- Delete ---- */
      $scope.deleteSkill = function (skill) {
        if (!confirm('Delete skill "' + skill.name + '"?')) return;
        $scope.skills = $scope.skills.filter(function (s) { return s.id !== skill.id; });
        showAlert('success', 'Skill deleted.');
      };

      /* ---- Export ---- */
      $scope.exportSkills = function () {
        FileService.exportToJSON($scope.skills, 'skills.json');
      };

      /* ---- Import ---- */
      $scope.triggerImport = function () {
        document.getElementById('skillFileInput').click();
      };

      $scope.importSkills = function (element) {
        var file = element.files[0];
        if (!file) return;
        FileService.importFromJSON(file).then(function (data) {
          if (Array.isArray(data)) {
            data.forEach(function (item) {
              var exists = $scope.skills.some(function (s) { return s.id === item.id; });
              if (!exists) $scope.skills.push(item);
            });
            showAlert('success', 'Imported ' + data.length + ' skill entries.');
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
