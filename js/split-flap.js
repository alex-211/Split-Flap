﻿// Home Sweet Global Namespace
var sf = {};

// Namespace for objects defined and used locally in templates
sf.local = {};

/* ********************************************************************* */
/* HOUSEKEEPING                                                          */

Array.prototype.rotate = (function() {
  var unshift = Array.prototype.unshift,
      splice = Array.prototype.splice;
  return function(count) {
    var len = this.length >>> 0,
        count = count >> 0;
    unshift.apply(this, splice.call(this, count % len, len));
    return this;
  };
})();

/* ********************************************************************* */
/* DATA HANDLING                                                         */
sf.data = {

  sortData: function() {
    // This function takes arguments for sorting, truncating, max results and 
    // ignoring, applies it to the given map, and returns an array in the correct
    // order, thus:
    // 
    // Input:  {
    //           "category1":{label:value,label:value,label:value}, 
    //           "category2":{label:value,label:value,label:value}, 
    //           "category3":{label:value,label:value,label:value}
    //         }
    //         
    // Output: [
    //            {"label":"category2","data":{label1:value1,label2:value2,label3:value3}}, 
    //            {"label":"category3","data":{label1:value4,label2:value5,label3:value6}}, 
    //            {"label":"category1","data":{label1:value7,label2:value8,label3:value9}}
    //          ]
    //
    // NOTE: Only non-zero values are included (so a set of all zero values will return
    //       an empty object.
    // 
    var input = arguments[0],
        options = arguments[1],
        i=0, j=0, k=0, index=0, value=0,
        output = [],
        truncatedOutput = [],
        other = [];
    // first pass: create new data structure
    for(category in input) {
      if(input.hasOwnProperty(category)) {
        // add this category to the output (unless its in the "ignore" array)
        if(jQuery.inArray(category, options.ignore) === -1) {
          output.push( {"label":category,"data":input[category]} );
          i++;
        }
      }
    }
    // pick up any sorting options (default is ascending)
    if(options.sort) {
      if(options.order === "desc") {
        output.sort(function(a,b){
          return a.data[options.sort]>b.data[options.sort]?-1:1;
        });
      } else {
        output.sort(function(a,b){
          return a.data[options.sort]>b.data[options.sort]?1:-1;
        });
      }
    } else {
      // otherwise use the label
      if(options.order === "desc") {
        output.sort(function(a,b){
          return a.label>b.label?-1:1;
        });
      } else {
        output.sort(function(a,b){
          return a.label>b.label?1:-1;
        });
      }
    }
    // second pass: truncate/maxResults
    for(i=0;i < output.length; i++){
      if(i >= options.truncate) {
        for(j=0;j<output[i].data.length;j++){
          // 'other[]' will be empty on the first trip
          // through this loop, so give it
          // zero values out to output[i].data.length
          if(typeof(other[j]) === 'number') {
            other[j] += parseInt(output[i].data[j],10);
          } else {
            other[j] = 0;
          }
        }
      } else { // note that this case also covers "undefined" 
        truncatedOutput.push(output[i]);
      }
      // bail if we hit maxResults
      if(i+1 === parseInt(options.maxResults,10)) { // note counting starts with 1
        break;
      }
    }
    // populate "Other" node
    if(other.length > 0) {
      truncatedOutput.push({ "other" : other });
    }
    return truncatedOutput;
  }

};

/* END DATA HANDLING                                                     */
/* ********************************************************************* */

/* ********************************************************************* */
/* DISPLAY METHODS                                                       */

sf.display = {

  // DRUM ARRAYS
  // These contain the character sets for each drum. Each position represents
  // a character and when prepended by "c" gives the class name which will
  // be applied to display that character.
  // Note that the LogoDrum is indexed, so the classes will be like "c0", "c1", etc.
  FullDrum: function() {
    this.order = [' ','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9','.',',','?','!','/','\'','+','-','↑','↓'];
  },
  CharDrum: function() {
    this.order = [' ','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','.',','];
  },
  NumDrum: function() {
    this.order = [' ','0','1','2','3','4','5','6','7','8','9','.',','];
  },
  LogoDrum: function() {
    this.order = [' ','0','1','2','3','4','5','6','7','8','9'];
  },

  init: function() {
    
    // For each character, construct a drum array and
    // attach that array to the element's .data() object
    $(".splitflap span").each(function() {
      var parent = $(this).closest("div");
      if(parent.hasClass("number")){
        var drum = new sf.display.NumDrum(); // Numbers only
      } else if(parent.hasClass("character")) {
        var drum = new sf.display.CharDrum(); // Characters only
      } else if(parent.hasClass("logo")) {
        var drum = new sf.display.LogoDrum(); // Logos
      } else {
        var drum = new sf.display.FullDrum(); // The full set
      }
      $(this).data("order", drum.order);
      // Finally, set each character to a space.
      sf.display.change($(this), " ");
    });
  
  },

  load: function() {
    var input = arguments[0],
        container = arguments[1],
        rows = container.find(".row"),
        i=0;
    var loop = function() {
      setTimeout(function () {
        if(input[i]) {
          sf.display.loadRow(input[i],$(rows[i]));
        }
        i++;
        if (i < rows.length) {
          loop(i); 
        }
       }, 500);
    };
    loop();
  },
  
  loadRow: function() {
    var input = arguments[0],
        row = arguments[1], // the row object
        key,group;
    // first, load the category name into the .label group
    group = row.find(".label");
    sf.display.loadGroup(input.label, group);
    // and put that value into that group's data store
    group.data("contents",input.label);
    // load the data array into the .data[key] groups
    for(key in input.data) {
      if(input.data.hasOwnProperty(key)){
      group = row.find("."+key);
      if(group.length > 0) {
        sf.display.loadGroup(input.data[key], group);
        // put that value into that group's data store
        group.data("contents",input.data[key]);
      }
      }
    }
  },
  
  loadGroup: function() {
    // load a string into a group of display elements
    var input = arguments[0], // the input (which may be a string or a int)
        input = input + '', // force it into a string
        target = arguments[1], // the object
        elements = target.find(".character, .number, .full, .logo"),
        strLen = elements.size(),
        i, characters;
    if(target.hasClass("status")) { // status renders differently--it just adds the class "on" to the correct element
      target.find("div").removeClass("on");
      target.find(".s"+input).addClass("on");
    } else {  // otherwise, this group is composed of split-flap elements
      input = input.toUpperCase();
      // get individual characters and pad the array 
      // with spaces (to clear any existing characters)
      characters = input.split("");
      for(i=0;i<strLen;i++) {
        if(typeof(characters[i]) === 'undefined') {
          characters[i] = " ";
        }
      }
      // trim the array to the number of display elements
      characters = characters.slice(0,strLen);
      // assign them to the display elements
      for(var i=0;i<characters.length;i++) {
        // TODO: is there a more efficient way to do this?
        sf.display.change($(elements[i]).find("span"), characters[i]);
      }
    }
  },
  
  change: function() {
    var container = arguments[0],
        c = arguments[1], // the new character
        index, i, j;
    // get the curent order of the display element's drum
    var values = container.data("order");
    // how many times do we need to increment the drum?
    index = values.indexOf(c);
    // increment the drum
    for(i=0;i<index;i++) {
      sf.display.show(container, (values[i + 1]));
    }
    // rotate the dom element's stored array to the new order for next time
    container.data("order", values.rotate(index));
  },
  
  show: function() {
    var container = arguments[0],
        i = arguments[1],
        c = "c" + (i);
        // punctuation has special class names
        switch(i) {
          case " ": c = "csp"; break;
          case ".": c = "cper"; break;
          case ",": c = "ccom"; break;
          case "?": c = "cque"; break;
          case "!": c = "cexc"; break;
          case "/": c = "csla"; break;
          case "'": c = "capo"; break;
          case "+": c = "cplu"; break;
          case "-": c = "cmin"; break;
          case "↑": c = "cup"; break;
          case "↓": c = "cdn"; break;
        }
    container.fadeOut(50, function(){
      container.removeClass().addClass(c);
    }).fadeIn(50);
  },

  // Utility method to clear the board.
  // It goes through every group in every row,
  // calling loadGroup() with an empty string.
  clear: function() {
    var container = arguments[0],
        rows = container.find(".row"),
        i=0;
    var loop = function() {
      setTimeout(function () {
        var groups = $(rows[i]).find(".group");
        groups.each(function(){
          sf.display.loadGroup("",$(this));
        })
        i++;
        if (i < rows.length) {
          loop(i); 
        }
       }, 500);
    };
    loop();
   }

};
/* END DISPLAY METHODS                                                   */
/* ********************************************************************* */

/* ********************************************************************* */
/* SOURCE-SPECIFIC PLUGINS                                               */

sf.plugins = {
    
  airport: {
    
    // input: map of parameters
    // output: url
    url: function(params){
      var base_url = "data/airport_schedule.php";
      return base_url + "?" + params.serialize();
    },

    formatData: function(data){
      var formattedData = data.response.results[0].data;
      return formattedData;
    }

  },

  wunderground: {

    /* need a get that looks something like:
      var station = container.find(".chartPrefs input[name='data']").val();
      $.ajax({
        url: sf.chart.dataUrl(station),
        dataType: 'jsonp',
        success: function(json){
          var stations = json.location.nearby_weather_stations.airport.station;
          console.log("Stations: ",stations)
        }
      })
    */

    url: function(station_code){
      var base_url = "http://api.wunderground.com/api/d73bc72d0f231c10/geolookup/q/";
      return base_url + station_code + ".json?" + "callback=myCallback";
    },

    formatData: function(data){
      return data;
    }

  }

};

/* END SOURCE-SPECIFIC PLUGINS                                           */
/* ********************************************************************* */

