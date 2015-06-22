

/**
 * Action Part of SmartTable
 */
var SmartTableModule = (function($, SmartTable) {

    // check dependencies
    if(typeof SmartTable.mainPart === 'undefined') {
        alert('You shoud add SmartTable.js before smartTableAction.js');
    }
    
    if(typeof SmartTable.filterPart === 'undefined') {
        alert('You shoud add smartTableFilter.js before smartTableAction.js');
    }
    
    SmartTable.actionPart = true;

    /**
     * Default options
     */
    SmartTable.DEFAULTS.actionOptions = {
        "actionGo": null, // button|link selector to launch action
        "actionInputs": null,
        "useProcess": false, // true, false or function
        "initUrl": null,
        "stepUrl": null,
        'endUrl' : null,
        "progress": null,
        "modal": null
    };

    SmartTable.DEFAULTS.actionOptions.fnInitActions = function() {
        
        if(typeof this.actionOptions.useProcess === 'function') {
            var useProcess = this.actionOptions.useProcess();
        } else {
            useProcess = this.actionOptions.useProcess;
        }
        
        if(useProcess) {
            $.proxy(this.actionOptions.fnInitProcessAction, this)();
        } else {
            $.proxy(this.actionOptions.fnInitSimpleAction, this)();
        }
        

    };
    
    SmartTable.DEFAULTS.actionOptions.fnInitSimpleAction = function() {
        
        $(this.actionOptions.actionGo).click(function(){
            alert('not implemented yet');
        });
        
    };
    
    SmartTable.DEFAULTS.actionOptions.fnInitProcessAction = function() {
        
        $(this.actionOptions.progress).splitprocess({
            'initUrl': this.actionOptions.initUrl,
            'stepUrl': this.actionOptions.stepUrl,
            'endUrl' : this.actionOptions.endUrl,
        });

        var self = this;
        
        // add filter and action data to query
        $(this.actionOptions.progress).bind('process_split.before_launch', function(e){
            
            var filterData = {};
            $.proxy(self.addAjaxFilterData, self)(filterData);
            e.postData = {};
            e.postData.filter = filterData;
            
            var actionData = {};
            $.proxy(self.addAjaxActionData, self)(actionData);
            e.postData.action = actionData;
        });
        
        $(this.actionOptions.actionGo).click(function(){
            if(null !== self.actionOptions.modal) {
                $(self.actionOptions.modal).modal();
            }
            $(self.actionOptions.progress).splitprocess('launch');
        });
        
        // hide modal after action
        $(this.actionOptions.progress).bind('process_split.before_end', function(e, data){
            if(null !== self.actionOptions.modal) {
                $(self.actionOptions.modal).modal('hide');
            }
        });
    };
    
    // PROTOTYPE CUSTOMISABLE FUNCTIONS

    /**
     * Merge given options to default ones
     */
    SmartTable.prototype.getActionOptions = function(options) {
        
        var actionOptions = $.extend({}, this.getDefaults().actionOptions, options.actionOptions);
        return actionOptions;
    };
    
    /**
     * add action parameters to Ajax data
     */
    SmartTable.prototype.addAjaxActionData = function(data) {
        
        var self = this;

        $(this.actionOptions.actionInputs).each(function(){
            var value = self.getFieldValue(this);
            var name = $(this).data('action-name');
            data['action-' + name] = value;
        });

    };
    
    return SmartTable;

}(jQuery, SmartTableModule || {}));
