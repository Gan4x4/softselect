/**
 * --------------------------------------------------------------------------
 * Gan4x4 (v0.2 alpha) : softselect.js
 * --------------------------------------------------------------------------
 * lanuage: ES-2015
 * require:
 *      jquery >= v2.0.3
 *      bootstrap >= v3.0.0
 */

const SoftSelect = (($) => {


  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME                = 'softselect'
  const VERSION             = '0.2'
  const DATA_KEY            = 'gan.softselect'
  const EVENT_KEY           = `.${DATA_KEY}`
  const JQUERY_NO_CONFLICT  = $.fn[NAME]

    const Default = {
        range: [0,0.5,1,1.5],
        defaultRange: 0.5,
        label: false,
        unit: 'auto',
        style: 'simple'
    }
     

  const Event = {
    CLICK      : `click${EVENT_KEY}`,
    CHANGE     : `click${EVENT_KEY}`
  }


  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class SoftSelect {
    constructor(element, config) {

        this.element = element;
        this.config  = this._getConfig(config);
        this.baseState = $(element).parent().html();
        this[this.config.style]();

    }
    
    _commonInit(){
        this.$element = $(this.element);
        this.$element.addClass('selectsoft');
        this.$inputGroup = this._getInputGroup();
        this.$element.wrap(this.$inputGroup);
        this.$input = this._createInput();
        this.$label = $('<span></span>');
        
        // in future possible to overwrite this function 
        this.getLabelText = (value = false) => {
           if (value === false){
               value = this.value;
            }
            if (value === 0 ){
                return "точно";
            }
            else{
                return "+/- "+value + this._getUnit();
            }
        }

        this.$label.html(this.getLabelText());
    }

    // getters

    static get VERSION() {
      return VERSION
    }

    static get Default() {
      return Default
    }

    static get NAME() {
      return NAME
    }

    static get DATA_KEY() {
      return DATA_KEY
    }
    
    get value(){
        return parseFloat(this.$input.attr('value'));
        
    }
    
// ======================= setters ============================================
    set value(val){
        this.$input.attr('value',parseFloat(val));
        this.$label.html(this.getLabelText());
    }

// ======================= base types =========================================
    simple(){
        this._commonInit();
        var $checkbox = this._getCheckbox();
        var $addon = $('<span class="input-group-addon" ></span>');
        this._setMinWidth($addon);
        this.$input.insertAfter(this.$element);
        this.$input.wrap($addon);
        $checkbox.insertBefore(this.$input);
        this.$label.insertAfter(this.$input);
        this.getLabelText = (value = false) => {
            // always return default range
           return "+/- "+this._getDefaultRange() + this._getUnit();
        } 
    }



    buttons(){
        this._commonInit();
        var $buttonGroup = $('<div class="input-group-btn"></div>');
        this._setMinWidth($buttonGroup);
        var $buttonPlus = $('<button class="btn btn-default" type="button">+</button>');
        var $buttonMinus = $('<button class="btn btn-default" type="button">-</button>');

        this.$input.insertAfter(this.$element);
        
        this.$input.wrap($buttonGroup);
        this.$label = $('<button type = "button" class = "btn btn-default" disabled >'+this.getLabelText()+'</button>');
        this.$label.insertAfter(this.$input);
        $buttonPlus.insertBefore(this.$label);
        $buttonMinus.insertAfter(this.$label);

        $buttonPlus.on(Event.CLICK, (this.incValue).bind(this));
        $buttonMinus.on(Event.CLICK, (this.decValue).bind(this));
    }
    
    dropdown(){
        this._commonInit();
        var $buttonGroup = $('<div class="input-group-btn"></div>');      
        var $menuButton = $('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>');
        
        $menuButton.append(this.$label);
        $menuButton.append(' <span class="caret"></span>');
        this._setMinWidth($menuButton);
        var $dropdownMenu = this._getDropdownMenu($menuButton);

        this.$input.insertAfter(this.$element);
        this.$input.wrap($buttonGroup);
        $menuButton.insertAfter(this.$input);
        $dropdownMenu.insertAfter($menuButton);
    }
// =============================================================================    
    incValue(){    
        let index = this._getCurrentRangeIndex();
        if (index < this.config.range.length-1 ){
            index++;
            this.value = this.config.range[index];
            return true;
        }
        return false;
    }
    
    decValue(){
        let index = this._getCurrentRangeIndex();
        if (index  > 0  ){
            index--;
            this.value = this.config.range[index];
            return true;
        }
        return false;
    }

    _getCurrentRangeIndex(){
        return  this.config.range.indexOf(this.value);    
    }
    
    // private
    _getDropdownMenu($menuButton){
        var $menu = $('<ul class="dropdown-menu"></ul>');
        this.config.range.forEach(v => {
            var $item = $('<li><a href="#">'+this.getLabelText(v)+'</a></li>');    
            $item.on(Event.CLICK,() => {
                this.value = v;
            });
            $menu.append($item);
          });
        return $menu;
    }
        

    _getCheckbox(){
        var $checkbox = $('<input class="pull-left" type="checkbox" >');
         // If range was recieved
        if (SoftSelect.getUrlParameter(this._getRangeName()) != 0 || 
        // First cal with def value > 0        
            SoftSelect.getUrlParameter(this._getRangeName()) === false && this.config.defaultRange > 0 ){
            $checkbox.prop('checked',true);
        }
        
        $checkbox.on('change',(() => {
            if ($checkbox.is(':checked') ){
                this.value = this.config.defaultRange;
           }
           else{
               this.value = 0;
           }  
           
       }));
        
        return $checkbox;
    }

    _createInput(){
        var currRange = SoftSelect.getUrlParameter(this._getRangeName());
        if (currRange === false) {
            // not zero !
            // first call, set default range
            currRange = this._getDefaultRange();
        }
        var $input=$('<input type="hidden">');
        $input.attr('name',this._getRangeName());
        $input.attr('value',currRange);
        return $input;
    }
    
    _setMinWidth($element){
        $element.css({"min-width" : "7em"});   
    }
    
    _getInputGroup(){
        return $('<div class="input-group text-left"></div>');
        //return $('<div class="input-group text-left clearfix"></div>');
    }
    
    _getBaseSelectIntValues(){
        var result = [];
        this.$element.find('option').each(function(){
            var val = ParseInt($(this).attr('value'));
            if (! isNaN(val)){
                result.push(val);
            }    
        });
        return result;
    }

    _getDefaultRange(){
        if (this.config.defaultRange != 'auto'){
            return this.config.defaultRange;
        }else{
            return this._calculateAverageRange();
        }
    }
    
    _calculateAverageRange(){
        if (this.config.range != 'auto'){
            return this._getMediane(this.config.range);
        }
        var values = this._getBaseSelectIntValues();
        return Math.abs(values[2] - values[1]);
    }

    
    _getUnit(){
         if (this.config.unit == 'auto'){
            // detect unit from base select
            return this.$element.find('option').eq(1).html().replace(/[0-9\.,-]/gim,'');
        }
        return this.config.unit;
    }

    _getRangeName(){
    
        return this.element.name +"_range";
    }
    
    _getConfig(config) {
          config = $.extend(
            {},
            this.constructor.Default,
            $(this.element).data(),
            config
          )
          return config
    }


    // static
    static _getAvg(grades) {
      return grades.reduce(function (p, c) {
        return p + c;
      }) / grades.length;
    }

    static _getMediane(numArray){
        numArray.sort();
        var median = numArray[Math.round(numArray.length/2)];
        return median;
    }
    
    static getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
        return false;
    };
  
// stealed form bootstrap
    static _jQueryInterface(config) {
      return this.each(function () {
        let data      = $(this).data(DATA_KEY)
        const _config = typeof config === 'object' ? config : null

        if (!data) {
          data = new SoftSelect(this, _config)
          $(this).data(DATA_KEY, data)
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error(`No method named "${config}"`)
          }
          data[config]()
        }
        
      })
    }
  }


  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME]             = SoftSelect._jQueryInterface
  $.fn[NAME].Constructor = SoftSelect
  $.fn[NAME].noConflict  = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return SoftSelect._jQueryInterface
  }

  return SoftSelect

})(jQuery)

//export default SoftSelect
