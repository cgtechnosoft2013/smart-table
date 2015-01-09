

/**
 * 
 * 
 */
var SmartTableModule = (function($, SmartTable) {

    SmartTable.DEFAULTS.downloadOptions = {
        "initUrl": null,
        "stepUrl": null,
        "endUrl": null,
        "downloadGo": null, // button|link selector to launch dl
        "progress": null,
        "useCustomSearch": false,
        "useFastSearch": false,
        "modal": null
    };
    
    SmartTable.DEFAULTS.options.fnInitDownload = function() {
        
        if(this.downloadOptions.useCustomSearch === false) return;
        

        $(this.downloadOptions.progress).splitprocess({
            'initUrl': this.downloadOptions.initUrl.replace('__alias__', 'application_table_download'),
            'stepUrl': this.downloadOptions.stepUrl
        });
        
        var self = this;
        
        // add filter data to query
        $(this.downloadOptions.progress).bind('process_split.before_launch', function(e){
            var filterData = {};
            $.proxy(self.addAjaxFilterData, self)(filterData);
            e.postData = {};
            e.postData.filter = filterData;
        });

        // redirect to document after dowload
        $(this.downloadOptions.progress).bind('process_split.before_end', function(e, data){
            document.location.href = self.downloadOptions.endUrl.replace('__id__', data.id);

            if(null !== self.downloadOptions.modal) {
                $(self.downloadOptions.modal).modal('hide');
            }
        });

        $(this.downloadOptions.downloadGo).click(function(){
            
            if(null !== self.downloadOptions.modal) {
                $(self.downloadOptions.modal).modal();
            }
            $(self.downloadOptions.progress).splitprocess('launch');
        });
        
    };
    
    
    SmartTable.prototype.getDownloadOptions = function(options) {
        
        var downloadOptions = $.extend({}, this.getDefaults().downloadOptions, options.downloadOptions);
        
        // manage defaultActionOptions
        var actionsOptions = [];
        if(typeof options.actionOptions !== 'undefined') {
            for(var i=0;i<options.actionOptions.length;i++) {
                actionsOptions.push($.extend({}, this.getDefaults().defaultActionOptions, options.actionOptions[i]));
            }
        }
        
        return downloadOptions;
    };
    
    
    
    return SmartTable;

}(jQuery, SmartTableModule || {}));
