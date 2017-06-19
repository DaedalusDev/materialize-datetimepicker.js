(function($){
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

    var aRestrinction = ['min','max','disable'];

    function DateTimePicker( $picker, options ) {
        this.uId = getuId();
        var self = this;
        this.element = $picker;
        this.options = options;

        this.aDate = [];

        this.$datePicker = $('<input type="text" id="datepicker_'+ idPrefix + this.uId +'" >');
        this.$datePickerWrapper = wrapInput(this.$datePicker, options.datepicker);

        this.$timePicker = $('<input type="text" id="timepicker_'+ this.uId +'">');
        this.$timePickerWrapper = wrapInput(this.$timePicker, options.timepicker);

        $picker.after(this.$timePickerWrapper).after(this.$datePickerWrapper);

        this._optionRefresh('distinct');


        this.$datePicker.pickadate(options.datepicker);
        this.oDatePicker = this.$datePicker.pickadate('picker');

        this.$timePicker.pickatime(options.timepicker);
        this.oTimePicker = this.$timePicker.data('clockpicker');

        aRestrinction.forEach(function(v) {
            if (options[v]) {
                self.dispatchDateOption(v);
            }
        });

        // open datepicker on datetimepicker input click
        $picker.on('focus', function() {
            self.oDatePicker.open();
        });
        function bindValue(datetime) {
            if (datetime) {
                var aSplit = /(.*)\s+(\d{1,2}:\d{1,2}\s*(AM|PM)?)$/gi.exec(datetime);
                if (aSplit) {
                    if (aSplit[1]) {
                        self.oDatePicker.set('select', aSplit[1]);
                        self.$datePicker.val(aSplit[1]).trigger('change');
                    }
                    if (aSplit[2]) {
                        self.$timePicker.val(aSplit[2]).trigger('change');
                    }
                }
            }
            datetime = $picker.val();
            var date = self.$datePicker.val(), time = self.$timePicker.val();

            if (date && time) {
                $picker.val(date+' '+time);
            } else {
                $picker.val('');
            }

            if ($picker.val() !== datetime)
                $picker.trigger('change');
        }
        bindValue($picker.val());
        // switch to Timepicker on close
        this.oDatePicker
            .on('set', function(val) {
                if (val.select) {
                    val = new Date(val.select);
                    val = [val.getFullYear(), val.getMonth(), val.getDate()];
                    self.aDate = val;
                } else {
                    self.aDate = [];
                }
                bindValue();
            })
            .on('close', function() {
                if (self.aDate.length) {
                    self.dispatchTimeOption('min');
                    self.dispatchTimeOption('max');
                    self.dispatchTimeOption('disable');
                    if (options.step) {
                        self.oTimePicker.show();
                    }
                }
                bindValue();
            });
        this.$timePicker
            .on('change', function() {
                bindValue();
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

        min: false,                 // format : [{pickadate.min}, {pickatime.min}]
        max: false,                 // format : [{pickadate.max}, {pickatime.max}]
        disable: false              // format : [[{pickadate.format},{pickatime.format}], [{pickadate.format},[{pickatime.format}, {pickatime.format}, ...]], ... ]
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
                        v[1].forEach(function(time) {
                            if (Array.isArray(time)) {
                                mapping = mapping.concat(v[1]);
                                return true;
                            } else {
                                mapping.push(v[1]);
                                return false;
                            }
                        });
                    });
                    if (options.timepicker[optName]) {
                        mapping.concat(options.timepicker[optName]);
                    }
                    this.oTimePicker.set(optName, mapping);
                } else {
                    this.oTimePicker.set(optName, options.timepicker[optName]);
                }
            } else {
                if (isEqual(this.aDate, opt[0])) {
                    this.oTimePicker.set(optName, opt[1]);
                } else {
                    this.oTimePicker.set(optName, options.timepicker[optName]);
                }
            }
        }
    };
    DateTimePicker.prototype.dispatchDateOption = function(optName) {
        var options = this.options;
        var opt = options[optName];

        if (optName === 'disable') {
            var mapping = opt.map(function(v) {
                return v[0];
            });
            if (options.datepicker[optName]) {
                mapping.concat(options.datepicker[optName]);
            }
            this.oDatePicker.set(optName, mapping);
        } else {
            if (Array.isArray(opt)) {
                this.oDatePicker.set(optName, opt[0]);
            }
        }
    };

    DateTimePicker.prototype._optionRefresh = function(optName) {
        var options = this.options;
        var $picker = this.element;
        if (optName === 'datepicker') {
            this.oTimePicker.set(options.datepicker);

        }
        if (optName === 'timepicker') {
            this.oTimePicker.set(options.timepicker);

        }
        if (optName === 'distinct') {
            // if (options.distinct) {
            //     $picker.addClass('hide')
            //         .siblings('label')
            //             .addClass('hide');
            //     this.$datePickerWrapper.removeClass('hide');
            //     this.$timePickerWrapper.removeClass('hide');
            // } else {
            //     this.$datePickerWrapper.addClass('hide');
            //     this.$timePickerWrapper.addClass('hide');
            //     $picker.removeClass('hide')
            //         .siblings('label')
            //         .removeClass('hide');
            // }
        }
        if (aRestrinction.indexOf(optName) !== -1) {
            this.dispatchDateOption(optName);
        }
    };
    DateTimePicker.prototype.set = function (optName, value) {
        var self = this;
        if ($.isPlainObject(optName)) {
            $.each(optName, function(k, v) {
                self.set(k, v);
            });
        } else {
            if (optName === 'datepicker' || optName === 'timepicker') { // use extend for datetime and timepicker subconfiguration
                this.options[optName] = $.extend({}, this.options[optName], value);
            } else {
                this.options[optName] = value;
            }
            this._optionRefresh(optName);
        }
    };

    DateTimePicker.prototype.remove = function() {
        this.element.removeData('datetimepicker');

        this.oDatePicker.stop();
        this.oTimePicker.remove();

        this.$datePickerWrapper.remove();
        this.$timePickerWrapper.remove();
    };

    // Extends $.fn.clockpicker
    $.fn.pickadatetime = function(option){
        var args = Array.prototype.slice.call(arguments, 1);

        var componentData = this.data( 'datetimepicker' );

        if ( componentData && (option === 'picker' || option === undefined)) {
            return componentData
        }

        var options;
        return this.each(function(){
            var $this = $(this),
                data = $this.data('datetimepicker');
            if (!data) {
                var opt = $.extend({}, $this.data(), typeof option === 'object' && option);
                if (opt.timepicker) {
                    $.extend(opt.timepicker, DateTimePicker.DEFAULTS.timepicker, opt);
                    console.log(opt);
                }
                if (opt.datepicker) {
                    $.extend(opt.datepicker, DateTimePicker.DEFAULTS.datepicker, opt);
                }
                options = $.extend({}, DateTimePicker.DEFAULTS, opt);

                $this.data('datetimepicker', new DateTimePicker($this, options));
            } else {
                if ($.isPlainObject(option)) { // case recall with new parameters
                    data.set(option);
                }
                // Manual operatsions. show, hide, remove, e.g.
                if (typeof data[option] === 'function')
                    data[option].apply(data, args);
            }
        });
    };
    $.fn.pickadatetime.defaults = DateTimePicker.DEFAULTS;
})(jQuery);