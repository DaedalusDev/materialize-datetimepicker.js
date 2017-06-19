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
## Usage
### At plugin init
``` javascript
$('#myInput').pickadatetime({
    distinct: false
});
```
### After plugin init
You can get the clockpicker instance :
``` javascript
$('#myInput').pickadatetime();          // Method 1
$('#myInput').data('datetimepicker');  // Method 2
```
#### Change some options
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
The plugin can handle all date and time format supported from pickadate et pickatime

## Developing:
```
npm install
// grunt monitor
```
