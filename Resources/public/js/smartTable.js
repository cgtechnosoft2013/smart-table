

/**
 * 
 * 
 */
+function($) {

    var FILTER_TYPE_NONE = 0;
    var FILTER_TYPE_FAST = 1;
    var FILTER_TYPE_CUSTOM = 2;

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
            "fastSearchGoResetToggle": false,
            
            "customSearchInputs": null,
            "customSearchGo": null,
            "customSearchReset": null,
            "customSearchGoResetToggle": false,
            
            // specific jarviswidget table part
            "filterButton": null,
            "filterZone": null,
            "reportingButton": null,
            "reportingZone": null,
            "zones": null, // needed to hide other zones when one is displayed
            "selectedZoneButtonClass": null,
        },
        'dataTableOptions': {
            "sServerMethod": "POST",
            "serverSide": true,
            "processing": true
        }
    };
    
    
    SmartTable.DEFAULTS.options.fnLaunchFastSearch = function() {
        
        this.filterType = FILTER_TYPE_FAST;
        
        if(this.options.fastSearchGoResetToggle == true) {
            $(this.options.fastSearchGo).hide();
            $(this.options.fastSearchReset).show(); 
        }
        
        this.$dataTable.api().draw();
    };
    
    
    SmartTable.DEFAULTS.options.fnLaunchCustomSearch = function() {
        
        this.filterType = FILTER_TYPE_CUSTOM;
        
        if(this.options.customSearchGoResetToggle == true) {
            $(this.options.customSearchGo).hide();
            $(this.options.customSearchReset).show();
        }
        
        this.$dataTable.api().draw();
    };
    
    SmartTable.DEFAULTS.options.fnResetSearch = function() {
        
        this.filterType = FILTER_TYPE_NONE;
        
        if(this.options.fastSearchGoResetToggle == true) {
            $(this.options.fastSearchReset).hide();
            $(this.options.fastSearchGo).show();
        }
        if(this.options.customSearchGoResetToggle == true) {
            $(this.options.customSearchReset).hide();
            $(this.options.customSearchGo).show();
        }
        
        $(this.options.fastSearchInput).val('');
        $.each($(this.options.customSearchInputs), function(index, element){
            if($(element).is('select')){
                if($(element).attr('multiple') != 'multiple'){
                    $(element).val($(element).find('option:first').val()).change();
                }else{
                    $(element).val('').change();
                }
            }
            if($(element).is('input:checkbox')){
                $(element).prop('checked',false);
            }
            if($(element).is('input:text')){
                $(element).val('');
            }
        });
        this.$dataTable.api().draw();
    };
    
    SmartTable.DEFAULTS.options.fnInitFastSearch = function() {

        this.filterType = FILTER_TYPE_NONE;
        
        var self = this;

        $(this.options.fastSearchInput).keypress(function(e) {
            if(e.which == 13) {
                $.proxy(self.options.fnLaunchFastSearch, self)();
            }
            else {
                if(self.options.fastSearchGoResetToggle == true) {
                    $(self.options.fastSearchReset).hide();
                    $(self.options.fastSearchGo).show();
                }
            }
        });
        
        $(this.options.fastSearchGo).click(function(){
            $.proxy(self.options.fnLaunchFastSearch, self)();
        });
        
        $(this.options.fastSearchReset).click(function(){
            $.proxy(self.options.fnResetSearch, self)();
        });

    };
    
    SmartTable.DEFAULTS.options.fnInitCustomSearch = function() {

        this.filterType = FILTER_TYPE_NONE;
        
        var self = this;
        
        $(this.options.customSearchGo).click(function(){
            $.proxy(self.options.fnLaunchCustomSearch, self)();
        });
        
        $(this.options.customSearchReset).click(function(){
            $.proxy(self.options.fnResetSearch, self)();
        });

    };
    
    
    SmartTable.DEFAULTS.options.fnInitZoneDisplay = function() {

        var self = this;

        $(this.options.filterButton).click(function(){
            
            if( $(self.options.filterZone).is(':visible') ){
                
                $(this).removeClass(self.options.selectedZoneButtonClass);
                $(self.options.filterZone).hide('blind', { direction: 'up'});
                
            } else {
                
                $(this).addClass(self.options.selectedZoneButtonClass);
                $(self.options.zones).hide();
                $(self.options.filterZone).show('blind', { direction: 'up'});
            }
            
        });

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
        
        $.proxy(this.options.fnInitFastSearch, this)();
        $.proxy(this.options.fnInitCustomSearch, this)();
        $.proxy(this.options.fnInitZoneDisplay, this)();
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

        // manager state saving callbacks
        if(typeof dataTableOptions.stateSaveCallback === 'undefined') {
            dataTableOptions.stateSaveCallback = this.defaultStateSaveCallback;
        }
        if(typeof dataTableOptions.stateLoadCallback === 'undefined') {
            dataTableOptions.stateLoadCallback = this.defaultStateLoadCallback;
        }

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
        
        var self = this;
        
        if(FILTER_TYPE_NONE === this.filterType) {
        }

        if(FILTER_TYPE_FAST === this.filterType) {
            data.fastSearch = $(this.options.fastSearchInput).val();
        }

        if(FILTER_TYPE_CUSTOM === this.filterType) {

            $(this.options.customSearchInputs).each(function(){
                var value = self.getFieldValue(this);
                var name = $(this).data('custom-search-name');
                data['customSearch-' + name] = value;
            });
        }
        
        data['searchType'] = this.filterType;
    };
    
    
    /**
     * Get value from different form elements
     */
    SmartTable.prototype.getFieldValue = function(element) {

        var value;
        if ($(element).attr('type') === 'checkbox'){
            value = $(element).prop('checked');
        }else{
            value = $(element).val();
        }
        if(value instanceof Array) {
            value = JSON.stringify(value)||[];
        }
        return value;
    };
    
    /**
     * Set value from different form elements
     */
    SmartTable.prototype.setFieldValue = function(element, value) {

        if ($(element).attr('type') === 'checkbox'){
            $(element).prop('checked', value);
        } else if ($(element).is('select') && $(element).attr('multiple')) {
             var arrayValue = JSON.parse(value)||[];
             (element).val(arrayValue);
        } else {
            $(element).val(value);
        }
    };
    
    
    /**
     * Default StateSaveCallback
     * Allow to save fastSearch / customSeach / page / sort ...
     * Use DataTable stateSave functionality
     * 
     * option stateSave in dataTableOptions as to be set to true
     * 
     * Can be overwritten directly in dataTableOptions
     */
    SmartTable.prototype.defaultStateSaveCallback = function(settings, data) {
        
        var smartTable = $(this).data('bs.smarttable');
        
        var customSearch = {};
        $(smartTable.options.customSearchInputs).each(function(){
            if(typeof $(this).data('custom-search-name') !== 'undefined') {
                var value = SmartTable.prototype.getFieldValue(this);
                var name = $(this).data('custom-search-name');
                customSearch[name] = value;
            }
        });
        
        var storedData = $.extend({}, data, {
            'filterType': smartTable.filterType,
            'fastSearch': $(smartTable.options.fastSearchInput).val(),
            'customSearch': customSearch
        });
        localStorage.setItem('smart_table_' + window.location.pathname, JSON.stringify(storedData));
    };
            
    /**
     * Default StateLoadCallback
     * Allow to save fastSearch / customSeach / page / sort ...
     * Use DataTable stateSave functionality
     * 
     * option stateSave in dataTableOptions as to be set to true
     * 
     * Can be overwritten directly in dataTableOptions
     */
    SmartTable.prototype.defaultStateLoadCallback = function(settings) {
        
        var storedData = JSON.parse(localStorage.getItem('smart_table_' + window.location.pathname));
        var smartTable = $(this).data('bs.smarttable');

        if (storedData === null) return;
        if (typeof storedData.filterType === 'undefined') return;

        if(storedData.filterType === FILTER_TYPE_FAST) {
            smartTable.filterType = FILTER_TYPE_FAST;
            $(smartTable.options.fastSearchInput).val(storedData.fastSearch);
            if(smartTable.options.fastSearchGoResetToggle == true) {
                $(smartTable.options.fastSearchReset).show();
                $(smartTable.options.fastSearchGo).hide();
            }
        }
        
        if(storedData.filterType === FILTER_TYPE_CUSTOM) {
            smartTable.filterType = FILTER_TYPE_CUSTOM;
            for(var name in storedData.customSearch) {
                SmartTable.prototype.setFieldValue($('*[data-custom-search-name="' + name + '"]'), storedData.customSearch[name]);
            }
        }
        
        if(typeof storedData.iLength !== 'undefined') {
            return storedData;
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

}(jQuery);
