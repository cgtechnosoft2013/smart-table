

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

    SmartTable.DEFAULTS = {
        'options': {
            "spinner": true,
            "spinnerType": 'i',
            "spinnerClass": 'fa fa-cog fa-spin fa-3x ajax-overlay-loader',
            "dropdownPageLength": null,
        },
        'filterOptions': {
            "fastSearchInput": null,
            "fastSearchGo": null,
            "fastSearchReset": null,
            "fastSearchGoResetToggle": false,
            
            "customSearchInputs": null,
            "customSearchGo": null,
            "customSearchReset": null,
            "customSearchGoResetToggle": false,
            
            // specific jarviswidget table part
            "filterButton": null,
            "filterZone": null,
            "selectedZoneButtonClass": null
        },
        'actionOptions': [],
        'defaultActionOptions': {
            "actionGo": null, // button|link selector to launch action
            "additionalFields": null,
            "useCustomSearch": false,
            "useFastSearch": false,
            "useManualSelection": false,
            "mnaualSelectionCallBack": null,
            "useProcess": false,
            "initUrl": null,
            "stepUrl": null,
            "endUrl": null,
            "progress": null,
        },
        'dataTableOptions': {
            "sServerMethod": "POST",
            "serverSide": true,
            "processing": true
        }
    };
    
    

    
    SmartTable.DEFAULTS.options.fnInitActions = function() {
        
        if(typeof this.options.actionOptions !== 'undefined') {
            for(var i=0;i<this.actionOptions.length;i++) {
                
                if(this.options.actionOptions.useProcess) {
                    $.proxy(this.options.fnInitProcessAction, this)(this.actionOptions[i]);
                } else {
                    $.proxy(this.options.fnInitSimpleAction, this)(this.actionOptions[i]);
                }
            }
        }
    };
    
    SmartTable.DEFAULTS.options.fnInitSimpleAction = function(actionParameters) {
        
        var a = 1;
        
    };
    
    SmartTable.DEFAULTS.options.fnInitProcessAction = function(actionParameters) {
        
        var a = 1;
        
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
        
        if(typeof this.options.fnInitSearch !== 'undefined') {
            $.proxy(this.options.fnInitSearch, this)();
        }
        
        $.proxy(this.options.fnInitActions, this)();

        if(typeof this.options.fnInitDownload !== 'undefined') {
            $.proxy(this.options.fnInitDownload, this)();
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
        
        var downloadOptions = {};
        if(typeof this.getDownloadOptions !== 'undefined') {
            var downloadOptions = this.getDownloadOptions(options);
        }

        // manage state saving callbacks
        if(typeof dataTableOptions.stateSaveCallback === 'undefined') {
            dataTableOptions.stateSaveCallback = this.defaultStateSaveCallback;
        }
        if(typeof dataTableOptions.stateLoadCallback === 'undefined') {
            dataTableOptions.stateLoadCallback = this.defaultStateLoadCallback;
        }
        
        // manage defaultActionOptions
        var actionsOptions = [];
        if(typeof options.actionOptions !== 'undefined') {
            for(var i=0;i<options.actionOptions.length;i++) {
                actionsOptions.push($.extend({}, this.getDefaults().defaultActionOptions, options.actionOptions[i]));
            }
        }
        
        return {
            options: baseOptions,
            dataTableOptions: dataTableOptions,
            actionsOptions: actionsOptions,
            downloadOptions: downloadOptions
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
            self.$dataTable.api().page.len(nb).draw();
        });
    };
    
    /**
     * replace ajax url by ajax call adding search data to request
     */
    SmartTable.prototype.manageAjaxCall = function() {

        var self = this;

        // if just URL, add callback
        if(typeof this.dataTableOptions.ajax == 'string') {
            
            this.dataTableOptions.ajax = {
                "url": this.dataTableOptions.ajax,
                "type": "POST",
                "data": function ( data ) {
                    
                    // complete query with filter values
                    if(typeof self.options.fnInitSearch !== 'undefined') {
                        self.addAjaxFilterData(data);
                    }
                }
            };
        }
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
