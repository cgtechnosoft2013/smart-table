

/**
 * Filter Part of SmartTable
 */
var SmartTableModule = (function($, SmartTable) {

    // check dependencies
    if(typeof SmartTable.mainPart === 'undefined') {
        alert('You shoud add SmartTable.js before SmartTableFilter.js');
    }

    SmartTable.filterPart = true;

    var FILTER_TYPE_NONE = 0;
    var FILTER_TYPE_FAST = 1;
    var FILTER_TYPE_CUSTOM = 2;

    SmartTable.DEFAULTS.filterOptions = {
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
        "selectedZoneButtonClass": null,

        //If true, the first request to fill table will use pre-selected filters
        "useFiltersToInitialiseData": false,
        //If true, filter type will be equal to FILTER_TYPE_CUSTOM to consider custom filters on the request
        "useFiltersToResetData": false,
        //if not null, input value used to clear smart-tables filter. Unit value = minute
        "filterLocalStorageLifetime": null
    };

    SmartTable.DEFAULTS.filterOptions.fnLaunchFastSearch = function() {

        this.filterType = FILTER_TYPE_FAST;

        if(this.filterOptions.fastSearchGoResetToggle == true) {
            $(this.filterOptions.fastSearchGo).hide();
            $(this.filterOptions.fastSearchReset).show();
        }

        if(SmartTable.isV9()) {
            this.$dataTable.fnDraw(); // v1.9
        } else {
            this.$dataTable.api().draw(); // v1.10
        }
    };


    SmartTable.DEFAULTS.filterOptions.fnLaunchCustomSearch = function() {

        this.filterType = FILTER_TYPE_CUSTOM;

        if(this.filterOptions.customSearchGoResetToggle == true) {
            $(this.filterOptions.customSearchGo).hide();
            $(this.filterOptions.customSearchReset).show();
        }

        if(SmartTable.isV9()) {
            this.$dataTable.fnDraw(); // v1.9
        } else {
            this.$dataTable.api().draw(); // v1.10
        }
    };

    SmartTable.DEFAULTS.filterOptions.fnResetSearch = function() {



        if (this.filterOptions.useFiltersToResetData) {
            this.filterType = FILTER_TYPE_CUSTOM;
        }else{
            this.filterType = FILTER_TYPE_NONE;
        }

        if(this.filterOptions.fastSearchGoResetToggle == true) {
            $(this.filterOptions.fastSearchReset).hide();
            $(this.filterOptions.fastSearchGo).show();
        }
        if(this.filterOptions.customSearchGoResetToggle == true) {
            $(this.filterOptions.customSearchReset).hide();
            $(this.filterOptions.customSearchGo).show();
        }

        $(this.filterOptions.fastSearchInput).val('');
        $.each($(this.filterOptions.customSearchInputs), function(index, element){
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

        if(SmartTable.isV9()) {
            this.$dataTable.fnDraw(); // v1.9
        } else {
            this.$dataTable.api().draw(); // v1.10
        }
    };

    SmartTable.DEFAULTS.filterOptions.fnInitFastSearch = function() {

        this.filterType = FILTER_TYPE_NONE;

        var self = this;

        $(this.filterOptions.fastSearchInput).keypress(function(e) {
            if(e.which == 13) {
                $.proxy(self.filterOptions.fnLaunchFastSearch, self)();
            }
            else {
                if(self.filterOptions.fastSearchGoResetToggle == true) {
                    $(self.filterOptions.fastSearchReset).hide();
                    $(self.filterOptions.fastSearchGo).show();
                }
            }
        });

        $(this.filterOptions.fastSearchGo).click(function(){
            $.proxy(self.filterOptions.fnLaunchFastSearch, self)();
        });

        $(this.filterOptions.fastSearchReset).click(function(){
            $.proxy(self.filterOptions.fnResetSearch, self)();
        });

    };

    SmartTable.DEFAULTS.filterOptions.fnInitCustomSearch = function() {

        this.filterType = FILTER_TYPE_NONE;

        var self = this;

        $(this.filterOptions.customSearchGo).click(function(){
            $.proxy(self.filterOptions.fnLaunchCustomSearch, self)();
        });

        $(this.filterOptions.customSearchReset).click(function(){
            $.proxy(self.filterOptions.fnResetSearch, self)();
        });

    };


    SmartTable.DEFAULTS.filterOptions.fnInitZoneDisplay = function() {

        var self = this;

        $(this.filterOptions.filterButton).click(function(){

            if( $(self.filterOptions.filterZone).is(':visible') ){

                $(this).removeClass(self.filterOptions.selectedZoneButtonClass);
                $(self.filterOptions.filterZone).hide('blind', { direction: 'up'});

            } else {

                $(this).addClass(self.filterOptions.selectedZoneButtonClass);
                $(self.filterOptions.filterZone).show('blind', { direction: 'up'});
            }

        });

    };

    /**
     * Perform initialization
     */
    SmartTable.DEFAULTS.filterOptions.fnInitSearch = function() {

        $.proxy(this.filterOptions.fnInitFastSearch, this)();
        $.proxy(this.filterOptions.fnInitCustomSearch, this)();
        $.proxy(this.filterOptions.fnInitZoneDisplay, this)();

        if (this.filterOptions.useFiltersToInitialiseData) {
            this.filterType = FILTER_TYPE_CUSTOM;
        }
    };


    // PROTOTYPE CUSTOMISABLE FUNCTIONS

    /**
     * Merge given options to default ones
     */
    SmartTable.prototype.getFilterOptions = function(options) {

        var filterOptions = $.extend({}, this.getDefaults().filterOptions, options.filterOptions);
        return filterOptions;
    };

    /**
     * add custom|fast seach parameters to Ajax data
     */
    SmartTable.prototype.addAjaxFilterData = function(data) {

        var self = this;

        if(FILTER_TYPE_NONE === this.filterType) {
        }

        if(FILTER_TYPE_FAST === this.filterType) {
            data.fastSearch = $(this.filterOptions.fastSearchInput).val();
        }

        if(FILTER_TYPE_CUSTOM === this.filterType) {

            $(this.filterOptions.customSearchInputs).each(function(){
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
	} else if ($(element).attr('type') === 'radio'){
            var name = $(element).attr('name');
            value = $('input[name='+name+']:checked').val();
	} else {
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
	} else if ($(element).attr('type') === 'radio'){
            var name = $(element).attr('name');
            $('input[name='+name+'][value='+value+']').prop( "checked", true );
	} else if ($(element).is('select') && $(element).attr('multiple')) {
            var arrayValue = JSON.parse(value)||[];
            $(element).val(arrayValue).change();
	} else {
            $(element).val(value).change();
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
        $(smartTable.filterOptions.customSearchInputs).each(function(){
            if(typeof $(this).data('custom-search-name') !== 'undefined') {
                var value = SmartTable.prototype.getFieldValue(this);
                var name = $(this).data('custom-search-name');
                customSearch[name] = value;
            }
        });

        var storedData = $.extend({}, data, {
            'filterType': smartTable.filterType,
            'fastSearch': $(smartTable.filterOptions.fastSearchInput).val(),
            'customSearch': customSearch
        });
        
        if(smartTable.filterOptions.filterLocalStorageLifetime){
            localStorage.setItem('smart_table_lifetime' + window.location.pathname, $.now());
        }
        
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
        
        if(smartTable.filterOptions.filterLocalStorageLifetime){
            
            var lifetime = localStorage.getItem('smart_table_lifetime' + window.location.pathname);
            
            if(lifetime){
                var time = ($.now() - lifetime) / 60000;
                
                if(time > smartTable.filterOptions.filterLocalStorageLifetime){
                    localStorage.removeItem('smart_table_lifetime' + window.location.pathname);
                    localStorage.removeItem('smart_table' + window.location.pathname);
                    return;
                }
            }
        }

        if (storedData === null) return;
        if (typeof storedData.filterType === 'undefined') return;

        if(storedData.filterType === FILTER_TYPE_FAST) {
            smartTable.filterType = FILTER_TYPE_FAST;
            $(smartTable.filterOptions.fastSearchInput).val(storedData.fastSearch);
            if(smartTable.filterOptions.fastSearchGoResetToggle == true) {
                $(smartTable.filterOptions.fastSearchReset).show();
                $(smartTable.filterOptions.fastSearchGo).hide();
            }
        }

        if(storedData.filterType === FILTER_TYPE_CUSTOM) {
            smartTable.filterType = FILTER_TYPE_CUSTOM;
            for(var name in storedData.customSearch) {
                SmartTable.prototype.setFieldValue($('*[data-custom-search-name="' + name + '"]:not("div")'), storedData.customSearch[name]);
            }
        }

        if(typeof storedData.iLength !== 'undefined') {
            return storedData;
        }
    };


    return SmartTable;

}(jQuery, SmartTableModule || {}));
