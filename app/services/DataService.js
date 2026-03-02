angular.module('selfTracker')
  .factory('DataService', ['$http', function ($http) {

    var cache = {};

    function cachedGet(url) {
      if (cache[url]) return cache[url];
      cache[url] = $http.get(url).then(function (res) { return res.data; });
      return cache[url];
    }

    return {
      getEmployees: function () {
        return cachedGet('/data/employees.json');
      },

      getTasks: function () {
        return cachedGet('/data/tasks.json');
      },

      getSkills: function () {
        return cachedGet('/data/skills.json');
      },

      getGoals: function () {
        return cachedGet('/data/goals.json');
      },

      getTasksByEmployee: function (employeeId) {
        return this.getTasks().then(function (tasks) {
          return tasks.filter(function (t) { return t.employeeId === employeeId; });
        });
      },

      getSkillsByEmployee: function (employeeId) {
        return this.getSkills().then(function (skills) {
          return skills.filter(function (s) { return s.employeeId === employeeId; });
        });
      },

      getGoalsByEmployee: function (employeeId) {
        return this.getGoals().then(function (goals) {
          return goals.filter(function (g) { return g.employeeId === employeeId; });
        });
      },

      /* Invalidate cache so re-imports are reflected */
      clearCache: function () { cache = {}; }
    };
  }]);
