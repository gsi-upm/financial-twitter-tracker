// $Id$

/**
 * Baseclass for all widgets that manipulate general solr parameters.
 * 
 * @class AbstractParamWidget
 * @augments AjaxSolr.AbstractWidget
 */
AjaxSolr.AbstractParamWidget = AjaxSolr.AbstractWidget.extend(
/** @lends AjaxSolr.AbstractParamWidget.prototype */
{
    /**
     * The parameter to manipulate
     */
    param : null,

    /**
     * Sets the parameter.
     * 
     * @returns {Boolean} Whether the parameter changed.
     */
    set : function(value) {
        return this.changeParam(function() {
            var a = this.manager.store.remove(this.param), b = this.manager.store.addByValue(this.param, value);
            return a || b;
        });
    },

    /**
     * Removes all parameters.
     * 
     * @returns {Boolean} Whether the parameter was removed.
     */
    clear : function() {
        return this.changeParam(function() {
            return this.manager.store.remove(this.param);
        });
    },

    /**
     * Helper for selection functions.
     * 
     * @param {Function}
     *            Selection function to call.
     * @returns {Boolean} Whether the selection changed.
     */
    changeParam : function(func) {
        changed = func.apply(this);
        if (changed) {
            this.afterParamChanged();
        }
        return changed;
    },

    /**
     * An abstract hook for child implementations.
     * 
     * <p>
     * This method is executed after the parameter changed.
     * </p>
     */
    afterParamChanged : function() {
    }
});
