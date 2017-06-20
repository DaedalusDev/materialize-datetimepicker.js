# materialize-datetimepicker.js

##Installation

### git
`git clone https://github.com/DaedalusDev/materialize-clockpicker.git`
# Api Doc
## Options:
### Full Default configuration
Here are some options and their defaults:
``` javascript
datepicker: {
    icon: "&#xE8DF;",       // Icon for distinct picker
    label: "Date",          // Label for distinct picker
    container: "body"       // Fix hidden/scroll... issue
},
timepicker: {
    icon: "&#xE192;",       // Icon for distinct picker
    label: "Time",          // Label for distinct picker
    container: "body",      // Fix hidden/scroll... issue
    twelvehour: false       // set pickatime doc
},
distinct: true,             // Double picker : true, single picker : false
step: true,                 // Got to timepicker after pickadate

min: false,                 // format : [{pickadate.min}, {pickatime.min}]
max: false,                 // format : [{pickadate.max}, {pickatime.max}]
disable: false              // format : [[{pickadate.format},{pickatime.format}], [{pickadate.format},[{pickatime.format}, {pickatime.format}, ...]], ... ]
```
### Setting defaults
If you want to change the global default fonctionnality from this plugin, you can access default settings using $.fn.pickatime.defaults. 
Example:
``` javascript
$.fn.pickadatetime.defaults.step = false;      // single change
$.extend( true, $.fn.pickadatetime.defaults, {  // Multiple change
    distinct: false,
});
```
### Usage
#### At plugin init
``` javascript
$('#myInput').pickadatetime({
    distinct: false
});
```
#### After plugin init
You can get the clockpicker instance :
``` javascript
$('#myInput').pickadatetime();          // Method 1
$('#myInput').data('datetimepicker');  // Method 2
```
You can define new options :
``` javascript
// Simply recall apply new options on instance
$('#myInput')
    .pickadatetime({
        distinct: false
    });
    
// With set method
// Method 1 :
$('#myInput')
    .pickadatetime('set','distinct', false) // set individual change
    .pickadatetime('set', {                 // multiple changes
        distinct: false
    });
 
// Method 2 :
$('#myInput')
    .pickadatetime()
        .set('distinct', false)  // set individual change
        .set({                  // multiple changes
            min: [[2017, 5, 19],[8, 30]]
        });
```

### Time format handler
The plugin can handle all date and time format supported from pickadate et pickatime + moment (optional)
## Objects
You can get the clockpicker instance :
``` javascript
var oDateTimePicker = $('#myInput').pickadatetime();          // Method 1
var oDateTimePicker = $('#myInput').data('datetimepicker');   // Method 2
```
You can get the datepicker instance :
``` javascript
var oDatePicker = oDateTimePicker.oDatePicker;
```
You can get the timepicker instance :
``` javascript
var oTimePicker = oDateTimePicker.oTimePicker;
```
## Methods
You can use methods on clockpicker instance :
``` javascript    
// Method 1 :
$('#myInput')
    .pickadatetime('set','distinct', false) // set individual change
    .pickadatetime('set', {                 // multiple changes
        distinct: false
    });
 
// Method 2 :
$('#myInput')
    .pickadatetime()                        // get the picker instance
        .set('distinct', false)  // set individual change
        .set({                  // multiple changes
            min: [[2017, 5, 19],[8, 30]]
        });
```
### .set()
You can use set to define all options from the configuration.
#### .set('value', {String, Date, Array, Moment})
Set the value of the DateTimePicker
``` javascript
// All examples have same results
oDateTimePicker.set('value', '25/06/2017 15:30');            // String
oDateTimePicker.set('value', new Date(2017, 5, 25, 15, 30)); // Date
oDateTimePicker.set('value', [2017, 5, 25, 15, 30]);         // Array
oDateTimePicker.set('value', moment([2017, 5, 25, 15, 30])); // Moment
```
#### .set('date', {String, Date, Array, Moment})
Set the value of the DatePicker
``` javascript
// All examples have same results
oDateTimePicker.set('date', '25/06/2017 15:30');            // String
oDateTimePicker.set('date', new Date(2017, 5, 25, 15, 30)); // Date
oDateTimePicker.set('date', [2017, 5, 25, 15, 30]);         // Array
oDateTimePicker.set('date', moment([2017, 5, 25, 15, 30])); // Moment
```
#### .set('time', {String, Date, Array, Moment})
Set the value of the TimePicker
``` javascript
// All examples have same results
oDateTimePicker.set('time', '25/06/2017 15:30');            // String
oDateTimePicker.set('time', new Date(2017, 5, 25, 15, 30)); // Date
oDateTimePicker.set('time', [2017, 5, 25, 15, 30]);         // Array
oDateTimePicker.set('time', moment([2017, 5, 25, 15, 30])); // Moment
```

### .get({'value'|'date'|'time'})
Get the value of the Picker
``` javascript
oDateTimePicker.get('value');   // {date} {time}
oDateTimePicker.get('date');    // {date}
oDateTimePicker.get('time');    // {time}
```

### .remove()
Destroy the picker instance
## Developing:
```
npm install
// grunt monitor
```
