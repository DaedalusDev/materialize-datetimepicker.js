(function($, Picker){
    var idPrefix = 'datepicker_';
    var id = 0;
    function getuId() {
        return ++id;
    }
    /**
     *
     * @param {jQuery} $input
     * @param {Object} options
     */
    function wrapInput($input, options) {
        var defaults = {
            label: '',
            icon: '',
            width: 6
        };
        opt = $.extend({}, defaults, options);
        var $wrapper = $('<div class="input-field col s'+ opt.width +'">').append($input);
        if (opt.icon) {
            $wrapper.prepend('<i class="material-icons prefix">'+ opt.icon +'</i>');
        }
        if (opt.label) {
            $wrapper.append('<label for="'+ $input.attr('id') +'">'+ opt.label +'</label>');
        }
        return $wrapper;
    }

    function isEqual(a, b) {
        if (typeof a != typeof b) {
            return false;
        }
        switch (typeof a) {
            case 'object':
                if (Array.isArray(a)) {
                    return a.every(function(v, i) {
                        return isEqual(v, b[i]);
                    });
                }
                break;
            default:
                return a === b;
                break;
        }
    }

    function DateTimePicker( $picker, options ) {
        var uId = this.uId = getuId();
        var self = this;
        this.element = $picker;
        this.options = options;

        this.aDate = [];

        this.$datePicker = $('<input type="text" id="datepicker_'+ idPrefix + uId +'" >');
        this.$datePickerWrapper = wrapInput(this.$datePicker, options.datepicker);

        this.$timePicker = $('<input type="text" id="timepicker_'+ uId +'">');
        this.$timePickerWrapper = wrapInput(this.$timePicker, options.timepicker);

        $picker.after(this.$timePickerWrapper).after(this.$datePickerWrapper);

        if (options.distinct) {
            $picker.addClass('hide')
                .siblings('label')
                    .addClass('hide');
        } else {
            this.$datePickerWrapper.addClass('hide');
            this.$timePickerWrapper.addClass('hide');
        }

        if (options.min) {
            options.datepicker.min = options.min[0];
        }
        if (options.max) {
            options.datepicker.max = options.max[0];
        }
        this.$datePicker.pickadate(options.datepicker);
        this.oDatePicker = this.$datePicker.pickadate('picker');

        this.$timePicker.pickatime(options.timepicker);
        this.oTimePicker = this.$timePicker.data('clockpicker');

        // open datepicker on datetimepicker input click
        $picker.on('focus', function() {
            self.oDatePicker.open();
        });
        // switch to Timepicker on close
        this.oDatePicker
            .on('set', function(val) {
                val = new Date(val.select);
                val = [val.getFullYear(), val.getMonth(), val.getDate()];
                self.aDate = val;
            })
            .on('close', function() {
                self.dispatchTimeOption('min');
                self.dispatchTimeOption('max');
                self.dispatchTimeOption('disable');
                if (options.step) {
                    self.oTimePicker.show();
                }
            });
    }

    DateTimePicker.DEFAULTS = {
        datepicker: {
            icon: "&#xE8DF;",       // Icon for distinct picker
            label: "Date",          // Label for distinct picker
            container: "body"       // Fix hidden/scroll... issue
        },
        timepicker: {
            icon: "&#xE192;",       // Icon for distinct picker
            label: "Time",          // Label for distinct picker
            container: "body",      // Fix hidden/scroll... issue
            twelvehour: false
        },
        distinct: true,             // Double picker : true, single picker : false
        step: true,                 // Got to timepicker after pickadate

        min: false,                 // format : [{pickadate.min},[h,m]]
        max: false,                 // format : [{pickadate.min},[h,m]]
        disable: false,             // format : [[{pickadate.min},[h,m]], [{pickadate.min},[h,m]], ... ]
    };

    DateTimePicker.prototype.dispatchTimeOption = function (optName) {
        var self = this;
        var options = this.options;
        var opt = options[optName];

        if (opt) {
            if (optName === 'disable') {
                // step 1 : match matching dates
                var aDate = opt.filter(function(v) {
                    return isEqual(self.aDate, v[0])
                });
                if (aDate.length) {
                    // step 2 : list disabled time
                    var mapping = [];
                    aDate.forEach(function(v) {
                        var concat = v[1].some(function(time) {
                            console.log('is Array ?', time);
                            if (Array.isArray(time)) {
                                mapping = mapping.concat(v[1]);
                                return true;
                            } else {
                                mapping.push(v[1]);
                                return false;
                            }
                        });
                    });
                    console.log('disable h:', mapping);
                    this.oTimePicker.options[optName] = mapping;
                } else {
                    this.oTimePicker.options[optName] = options.timepicker[optName];
                }
            } else {
                if (isEqual(this.aDate, opt[0])) {
                    this.oTimePicker.options[optName] = opt[1];
                } else {
                    this.oTimePicker.options[optName] = options.timepicker[optName];
                }
            }
        }
    }

    DateTimePicker.prototype.remove = function() {
        this.element.removeData('datetimepicker');

        this.oDatePicker.stop();
        this.oTimePicker.remove();

        this.$datePickerWrapper.remove();
        this.$timePickerWrapper.remove();
    }

    // Extends $.fn.clockpicker
    $.fn.pickadatetime = function(option){
        var args = Array.prototype.slice.call(arguments, 1);

        var componentData = this.data( 'datetimepicker' )

        if ( option === 'picker' ) {
            return componentData
        }

        var options;
        return this.each(function(){
            var $this = $(this),
                data = $this.data('datetimepicker');
            if (!data) {
                options = $.extend({}, DateTimePicker.DEFAULTS, $this.data(), typeof option === 'object' && option);
                $this.data('datetimepicker', new DateTimePicker($this, options));
            } else {
                if ($.isPlainObject(option)) { // case recall with new parameters
                    options = $.extend({}, data.options, option); // merge previous options
                    data.remove(); // remove previous
                    $this.data('datetimepicker', new DateTimePicker($this, options));
                }
                // Manual operatsions. show, hide, remove, e.g.
                if (typeof data[option] === 'function')
                    data[option].apply(data, args);
            }
        });
    };
})(jQuery, Picker)