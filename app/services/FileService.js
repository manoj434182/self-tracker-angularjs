angular.module('selfTracker')
  .factory('FileService', [function () {

    return {
      /**
       * Trigger a JSON file download in the browser.
       * @param {Array|Object} data   - the data to serialise
       * @param {string}       filename - e.g. 'tasks.json'
       */
      exportToJSON: function (data, filename) {
        var json = JSON.stringify(data, null, 2);
        var blob = new Blob([json], { type: 'application/json' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href     = url;
        a.download = filename || 'export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      /**
       * Read an uploaded File object and parse its JSON content.
       * @param  {File}    file - from an <input type="file"> element
       * @return {Promise}      - resolves with the parsed object/array
       */
      importFromJSON: function (file) {
        return new Promise(function (resolve, reject) {
          if (!file) { reject(new Error('No file provided')); return; }
          var reader = new FileReader();
          reader.onload = function (e) {
            try {
              resolve(JSON.parse(e.target.result));
            } catch (err) {
              reject(new Error('Invalid JSON: ' + err.message));
            }
          };
          reader.onerror = function () { reject(new Error('File read error')); };
          reader.readAsText(file);
        });
      }
    };
  }]);
