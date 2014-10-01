

/**
 * 
 * 
 */
+function($) {

    var FILTER_TYPE_NONE = 0;
    var FILTER_TYPE_FAST = 1;
    var FILTER_TYPE_CUSTOM = 2;
    var PARAM_LIST_SEPARATOR = ']__[';

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
            
            "fastSearchInput": null,
            "fastSearchGo": null,
            "fastSearchReset": null,
            
            "customSearchInputs": null,
            "customSearchGo": null,
            "customSearchReset": null,
        },
        'dataTableOptions': {
            "sServerMethod": "POST",
            "serverSide": true,
            "processing": true
        }
    };
    
    SmartTable.DEFAULTS.fn = function(fileList) {
        
        

    };
    
    /**
     * initialize with option array and bind application events
     */
    SmartTable.prototype.init = function(table, options) {
        
        this.$table = $(table);
        var allOptions = this.getOptions(options);
        this.options = allOptions.options;
        this.dataTableOptions = allOptions.dataTableOptions;
        
        this.manageAjaxCall();
        this.$dataTable = this.$table.dataTable(this.dataTableOptions);   
                
        this.initSpinner();
        this.initDropdownPageLength();
        this.initFastSearch();
        this.initCustomSearch();
        
        
        
    };
    
    
    
    
    
    SmartTable.prototype.getDefaults = function() {
        return SmartTable.DEFAULTS;
    };

    SmartTable.prototype.getOptions = function(options) {
        
        var baseOptions = $.extend({}, this.getDefaults().options, options.options);
        var dataTableOptions = $.extend({}, this.getDefaults().dataTableOptions, options.dataTableOptions);
        return {
            options: baseOptions,
            dataTableOptions: dataTableOptions
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
                    self.addAjaxFilterData(data);
                }
            };
        }
    };
    
    /**
     * add custom|fast seach parameters to Ajax data
     */
    SmartTable.prototype.addAjaxFilterData = function(data) {
        
        if(FILTER_TYPE_NONE === this.filterType) {
        }

        if(FILTER_TYPE_FAST === this.filterType) {
            data.fastSearch = $(this.options.fastSearchInput).val();
        }

        if(FILTER_TYPE_CUSTOM === this.filterType) {

            $(this.options.customSearchInputs).each(function(){
                
                var value = $(this).val();
                var name = $(this).data('custom-search-name');
                
                if(value instanceof Array) {
                    value = value.join(PARAM_LIST_SEPARATOR);
                }
                
                data['customSearch-' + name] = value;
            });
        }
        
        data['searchType'] = this.filterType;
    };
    
    
    SmartTable.prototype.initFastSearch = function() {

        this.filterType = FILTER_TYPE_NONE;
        
        var self = this;

        $(this.options.fastSearchInput).keypress(function(e) {
            if(e.which == 13) {
                self.launchFastSearch();
            }
        });
        
        $(this.options.fastSearchGo).click(function(){
            self.launchFastSearch();
        });
        
        $(this.options.fastSearchReset).click(function(){
            self.resetSearch();
        });

    };
    
    SmartTable.prototype.initCustomSearch = function() {

        this.filterType = FILTER_TYPE_NONE;
        
        var self = this;
        
        $(this.options.customSearchGo).click(function(){
            self.launchCustomSearch();
        });
        
        $(this.options.customSearchReset).click(function(){
            self.resetSearch();
        });

    };
    
    SmartTable.prototype.launchFastSearch = function() {
        this.filterType = FILTER_TYPE_FAST;
        this.$dataTable.api().draw();
    };
    
    SmartTable.prototype.launchCustomSearch = function() {
        this.filterType = FILTER_TYPE_CUSTOM;
        this.$dataTable.api().draw();
    };
    
    SmartTable.prototype.resetSearch = function() {
        this.filterType = FILTER_TYPE_NONE;
        $(this.options.fastSearchInput).val('');
        this.$dataTable.api().draw();
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
            }
            
        });
    }

    $.fn.smarttable = Plugin;
    $.fn.smarttable.Constructor = SmartTable;

}(jQuery);
