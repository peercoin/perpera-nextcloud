(function() {

  OCA.Perpera = OCA.Perpera || {};

  /**
   * @namespace
   */
  OCA.Perpera.Util = {

    /**
     * Initialize the Perpera plugin.
     *
     * @param {OCA.Files.FileList} fileList file list to be extended
     */
    attach: function(fileList) {

      if (fileList.id === 'trashbin' || fileList.id === 'files.public') {
        return;
      }

      fileList.registerTabView(new OCA.Perpera.PerperaTabView('perperaTabView', {}));

    }
  };
})();

OC.Plugins.register('OCA.Files.FileList', OCA.Perpera.Util);
