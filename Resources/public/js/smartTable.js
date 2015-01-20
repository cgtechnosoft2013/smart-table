

/**
 * Main Part of SmartTable (has to be included in first position)
 */
var SmartTableModule = (function($) {

    // SMARTTABLE PUBLIC CLASS DEFINITION
    // ==================================

    var SmartTable = function(element, options) {
        this.init(element, options);
    };

    SmartTable.VERSION = '1.0.0';
    
    SmartTable.mainPart = true;

    SmartTable.DEFAULTS = {
        'options': {
            "spinner": true,
            "spinnerType": 'i',
            "spinnerClass": 'fa fa-cog fa-spin fa-3x ajax-overlay-loader',
            "dropdownPageLength": null,
        },
        'dataTableOptions': {
            "sServerMethod": "POST",
            "serverSide": true,
            "processing": true
        }
    };
    
    
    // PROTOTYPE CUSTOMISABLE FUNCTIONS
    
    
    /**
     * initialize with option array and bind application events
     */
    SmartTable.prototype.init = function(table, options) {
        
        this.$table = $(table);
        var allOptions = this.getOptions(options);
        this.options = allOptions.options;
        this.dataTableOptions = allOptions.dataTableOptions;
        this.downloadOptions = allOptions.downloadOptions;
        this.filterOptions = allOptions.filterOptions;
        this.actionOptions = allOptions.actionOptions;
        
        if(typeof this.filterOptions.fnInitSearch !== 'undefined') {
            $.proxy(this.filterOptions.fnInitSearch, this)();
        }
        
        if(typeof this.downloadOptions.fnInitDownload !== 'undefined') {
            $.proxy(this.downloadOptions.fnInitDownload, this)();
        }
        
        if(typeof this.actionOptions.fnInitActions !== 'undefined') {
            $.proxy(this.actionOptions.fnInitActions, this)();
        }
    };
    
    SmartTable.prototype.initQuery = function(table, options) {
        
        this.manageAjaxCall();
        this.$dataTable = this.$table.dataTable(this.dataTableOptions);   
                
        this.initSpinner();
        this.initDropdownPageLength();
        
    };
    
    SmartTable.prototype.getDefaults = function() {
        return SmartTable.DEFAULTS;
    };

    SmartTable.prototype.getOptions = function(options) {
        
        var baseOptions = $.extend({}, this.getDefaults().options, options.options);
        var dataTableOptions = $.extend({}, this.getDefaults().dataTableOptions, options.dataTableOptions);
        
        var filterOptions = {};
        if(typeof this.getFilterOptions !== 'undefined') {
            filterOptions = this.getFilterOptions(options);
        }
        
        var downloadOptions = {};
        if(typeof this.getDownloadOptions !== 'undefined') {
            downloadOptions = this.getDownloadOptions(options);
        }
        
        var actionOptions = {};
        if(typeof this.getActionOptions !== 'undefined') {
            actionOptions = this.getActionOptions(options);
        }

        // manage state saving callbacks (save state in localStorage)
        if(typeof dataTableOptions.stateSaveCallback === 'undefined') {
            dataTableOptions.stateSaveCallback = this.defaultStateSaveCallback;
        }
        if(typeof dataTableOptions.stateLoadCallback === 'undefined') {
            dataTableOptions.stateLoadCallback = this.defaultStateLoadCallback;
        }
        
        return {
            options: baseOptions,
            dataTableOptions: dataTableOptions,
            downloadOptions: downloadOptions,
            filterOptions: filterOptions,
            actionOptions: actionOptions
        };
    };
    
    SmartTable.prototype.getDataTable = function(options) {
        return this.$dataTable;
    };
    
    /**
     * add spinner add / remove
     */
    SmartTable.prototype.initSpinner = function() {
        
        if(this.options.spinner !== true) {
            return;
        }
        
        var self = this;
        
        this.$table
            .on('preXhr.dt', function(){
                $(this).loadingOverlay('init', {
                    loaderType      : self.options.spinnerType,
                    loaderClass     : self.options.spinnerClass
                });
            })
            .on('xhr.dt', function(){
                $(this).loadingOverlay('remove');
            });
        
    };
    
    /**
     * add external dropdown menu page length change listener
     */
    SmartTable.prototype.initDropdownPageLength = function() {
        
        if(this.options.dropdownPageLength == null) {
            return;
        }
        
        var self = this;
        
        $(this.options.dropdownPageLength).find('li a').click(function(){
            
            $(this).closest('.dropdown-menu').find('li').removeClass('active');
            $(this).closest('li').addClass('active');

            var nb = $(this).data('page-length');
            
            if(typeof self.$dataTable.api !== 'undefined') {
                self.$dataTable.api().page.len(nb).draw(); // v1.10
            } else {
                self.$dataTable.fnSettings()._iDisplayLength = nb; // v1.9
                self.$dataTable.fnDraw();
            }
            
            
        });
    };
    
    /**
     * replace ajax url by ajax call adding search data to request
     */
    SmartTable.prototype.manageAjaxCall = function() {

        var self = this;

        // if just URL, add callback
        if(typeof this.dataTableOptions.ajax == 'string') {
            
            // v1.9
            this.dataTableOptions.fnServerParams = function(aoData) {
                var filterData = {};
                self.addAjaxFilterData(filterData);
                self.addFilterData(aoData, filterData);
                aoData.push( { "name": "more_data", "value": "my_value" } );
            };
            
            // v1.10
            this.dataTableOptions.ajax = {
                "url": this.dataTableOptions.ajax,
                "type": "POST",
                "data": function ( data ) {
                    
                    // complete query with filter values
                    if(typeof self.filterOptions.fnInitSearch !== 'undefined') {
                        self.addAjaxFilterData(data);
                    }
                }
            };
        }
    };
    
    /**
     * DataTable v1.9
     * add filterData to baseData (v1.9 query format)
     * 
     * @param {type} baseData
     * @param {type} data
     * @returns {unresolved}
     */
    SmartTable.prototype.addFilterData = function(baseData, filterData) {
        for(var key in filterData) {
            baseData.push({
                'name': key,
                'value': filterData[key],
            });
        }
        return baseData;
    };

    
    // SMARTTABLE PLUGIN DEFINITION
    // ============================

    function Plugin(option) {
                
        if (typeof option == 'string') {
            switch(option) {
                case 'getDataTable':
                    var data = $(this).data('bs.smarttable');
                    return data.getDataTable();
            }
        }
                
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('bs.smarttable');
            var options = typeof option == 'object' && option;

            if (!data) {
                // save object with option
                $this.data('bs.smarttable', (data = new SmartTable(this, options)));
                data.initQuery(); // second init step (split to allow managing dataTable stateLoadCallback)
            }
            
        });
    }

    $.fn.smarttable = Plugin;
    $.fn.smarttable.Constructor = SmartTable;
    
    return SmartTable;

}(jQuery));
