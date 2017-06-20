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
        switch (typeof a) {
            case 'object':
                if (Array.isArray(a)) {
                    return a.every(function(v, i) {
                        return isEqual(v, b[i]);
                    });
                }
                break;
            default:
                return a == b;
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
        // switch to Timepicker on close
        this.oDatePicker
            .on('set', function(val) {
                if (val.select) {
                    val = self.parseDate(new Date(val.select));
                    self.aDate = val;
                } else {
                    self.aDate = [];
                }
                self.bindValue();
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
                self.bindValue();
            });
        this.$datePicker
            .on('change', function() {
                if (self.aDate.length) {
                    self.dispatchTimeOption('min');
                    self.dispatchTimeOption('max');
                    self.dispatchTimeOption('disable');
                }
            });
        this.$timePicker
            .on('change', function() {
                self.bindValue();
            });

        this.bindValue($picker.val());
    }

    DateTimePicker.DEFAULTS = {
        datepicker: {
            icon: "&#xE8DF;",       // Icon for distinct picker
            label: "Date",          // Label for distinct picker
            // container: "body"       // Fix hidden/scroll... issue
        },
        timepicker: {
            icon: "&#xE192;",       // Icon for distinct picker
            label: "Time",          // Label for distinct picker
            // container: "body",      // Fix hidden/scroll... issue
            twelvehour: false
        },
        distinct: true,             // Double picker : true, single picker : false
        step: true,                 // Got to timepicker after pickadate

        min: false,                 // format : [{pickadate.min}, {pickatime.min}]
        max: false,                 // format : [{pickadate.max}, {pickatime.max}]
        disable: false              // format : [[{pickadate.format},{pickatime.format}], [{pickadate.format},[{pickatime.format}, {pickatime.format}, ...]], ... ]
    };

    DateTimePicker.prototype.bindValue = function (datetime) {
        var self = this, $picker = this.element;
        if (datetime) {
            var aSplit = this.parseDateTime(datetime);
            if (aSplit) {
                self.aDate = aSplit[0];
                if (aSplit[0]) {
                    self.oDatePicker.set('select', aSplit[0]);
                }
                if (aSplit[1]) {
                    var oTime = new Time(aSplit[1]);
                    self.$timePicker.val(oTime.toString()).trigger('change');
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
    };

    DateTimePicker.prototype.parseDateTime = function(datetime) {
        if (Array.isArray(datetime)) {
            if (datetime.length === 3 && datetime.every($.isNumeric)) {
                return this.parseDate(datetime);
            }
            if (datetime.length === 2 && Array.isArray(datetime[0]) && Array.isArray(datetime[1])) {
                return [this.parseDate(datetime[0]), datetime[1]];
            }
            if (datetime.length >= 5 && datetime.every($.isNumeric)) {
                return [this.parseDate(datetime), Time.parse([datetime[3],datetime[4]])];
            }
            return [this.parseDate(datetime)];
        }
        if (window.moment && moment.isMoment(datetime)) {
            var aDateTime = datetime.toArray();
            var aDate = [aDateTime[0], aDateTime[1], aDateTime[2]];
            var aTime = [aDateTime[3], aDateTime[4]];
            return [aDate, aTime];
        }
        if (typeof datetime === 'string') {
            var aSplit = /(.*)\s+(\d{1,2}:\d{1,2}\s*(AM|PM)?)$/gi.exec(datetime);
            if (aSplit) {
                return [this.parseDate(aSplit[1]), Time.parse(aSplit[2])];
            }
        }
        return [this.parseDate(datetime), Time.parse(datetime)];
    };

    DateTimePicker.prototype.parseDate = function (date) {
        if (Array.isArray(date)) {
            return date;
        }
        if (date instanceof Date) {
            return [date.getFullYear(), date.getMonth(), date.getDate()];
        }
        if ($.isNumeric(date)) {
            return this.parseDate(this.oDatePicker.component.measure(null, date));
        }
        if (window.moment && moment.isMoment(date)) {
            var aDate = date.toArray();
            return aDate;
        }
        if (typeof date === 'string') {
            if (date === 'now') {
                return this.parseDate(new Date());
            }
            return this.parseDate(this.oDatePicker.component.measure(null, date));
        }
        return false;
    };

    DateTimePicker.prototype.dispatchDateOption = function(optName) {
        var options = this.options;
        var opt = options[optName];
        if (optName === 'disable') {
            opt = opt.map(this.parseDateTime.bind(this));
            if (options.datepicker[optName]) {
                opt.concat(options.datepicker[optName]);
            }
            this.oDatePicker.set(optName, opt);
        } else {
            opt = this.parseDateTime(opt);
            this.oDatePicker.set(optName, opt[0]);
        }
        options[optName] = opt; // Save parsing
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
            if (options.distinct) {
                $picker.addClass('hide')
                    .siblings('label')
                    .addClass('hide');
                this.$datePickerWrapper.removeClass('hide');
                this.$timePickerWrapper.removeClass('hide');
            } else {
                this.$datePickerWrapper.addClass('hide');
                this.$timePickerWrapper.addClass('hide');
                $picker.removeClass('hide')
                    .siblings('label')
                    .removeClass('hide');
            }
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
            if (optName === 'value') {
                this.bindValue(value);
                return this;
            }
            if (optName === 'date') {
                this.oDatePicker.set('select', this.parseDate(value));
                this.$datePicker.trigger('change');
                return this;
            }
            if (optName === 'time') {
                var oTime = new Time(value);
                this.$timePicker.val(oTime.toString()).trigger('change');
                return this;
            }
            this._optionRefresh(optName);
        }
        return this;
    };

    DateTimePicker.prototype.get = function(optName) {
        if (optName === 'value') {
            return this.element.val();
        }
        if (optName === 'date') {
            return this.oDatePicker.get('value');
        }
        if (optName === 'time') {
            return this.$timePicker.val();
        }
    };

    DateTimePicker.prototype.start = function() {
        this.oDatePicker.start();

        this.element.prop('disabled', false);
        this.$datePicker.prop('disabled', false);
        this.$timePicker.prop('disabled', false);
    };

    DateTimePicker.prototype.stop = function() {
        this.oDatePicker.stop();

        this.element.prop('disabled', true);
        this.$datePicker.prop('disabled', true);
        this.$timePicker.prop('disabled', true);
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
                    $.extend(opt.timepicker, DateTimePicker.DEFAULTS.timepicker, opt.timepicker);
                }
                if (opt.datepicker) {
                    $.extend(opt.datepicker, DateTimePicker.DEFAULTS.datepicker, opt.datepicker);
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