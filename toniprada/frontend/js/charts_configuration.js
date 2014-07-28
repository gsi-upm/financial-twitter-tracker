
   function getBarChartConfig(renderId, title, cat, data) {
      cleanBarCat(cat,data);
      title = "";
      var config = {};
      config.chart = {
        renderTo: renderId,
        backgroundColor: '#fff',
        plotShadow: false,
        type: 'column',
      };
      config.tooltip = {

      };				
      config.title = { margin: 10, 
       align: 'left',
       text: title,
       x: 15
     };
     config.xAxis = {
      categories: cat,
      labels: {
        rotation: -45,
        align: 'right',
        style: {
          fontSize: '13px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    };
    config.yAxis = {
      min: 0,
      title: {
        text: 'Coincidencias'
      }
    };

    config.legend = { enabled: false };

    config.series = [ { 
     name: 'Population',
     data: data,
     dataLabels: {
      enabled: true,
      rotation: -90,
      color: '#FFFFFF',
      align: 'right',
      x: -3,
      y: 10,
      formatter: function() {
        return this.y;
      },
      style: {
        fontSize: '13px',
        fontFamily: 'Verdana, sans-serif'
      }
    }			
  } ];

  return config;
};


function getPieChartConfig(renderId, title, data) {
  title = "";
   // format data
   cleanPieData(data); 
   // Configuration
   var config = {};
   // chart 
   config.chart = {
      renderTo: renderId,
      backgroundColor: '#fff',
      plotBackgroundColor: '#fff',
      plotBorderWidth: null,
      plotShadow: false,
      height: 300,
      animation: {
         duration: 1000,
         easing: 'swing'	
      },
   };
   // title
   config.title = { 
      margin: 0, 
      align: 'left',
      text: '<span class="piechart-title">' + title + '</span>',
      x: 4
   };
   // tooltip hover
   config.tooltip = {
      pointFormat: '{series.name}: <b>{point.percentage}%</b>',
      percentageDecimals: 1
   };				
   // plot options
   config.plotOptions = {
      pie: {
         allowPointSelect: true,
         cursor: 'pointer',
         dataLabels: {
            enabled: true
         },
         point: {
            events: {
               legendItemClick: function() {
                  if (this.visible) {
                     this['y_old'] = this.y;
                     this.update(0, true, true);
                  }
                   else {
                     this.update(this.y_old, true, true);
                  }
               }
            }
         },
         series: {
			   animation: false //Problem only occurs when plotOptions animation:false
		    },					
         showInLegend: true
      }
   };
   // legend
   config.legend = { 
      enabled: true,
      layout: 'vertical',
      align: 'left',
      y: 40,
      itemWidth: 100,
      verticalAlign: 'center',
      maxHeight: 250 
   };
   // data
   config.series = [{ 
      type: 'pie',
      name: 'Proporción',
      data: data 
   }];
   return config;
};


function getLineChartConfig(renderId, title, cat, data) {
     title = "";
     parseLinechartData(cat,data);

      var config = {};
      config.chart = {
        renderTo: renderId,
        backgroundColor: '#fff',
        plotShadow: false,
        type: 'line',
      };
      config.tooltip = {

      };        
      config.title = { margin: 10, 
       align: 'left',
       text: title,
       x: 15
     };
     config.xAxis = {
      categories: cat,
      labels: {
        rotation: -45,
        align: 'right',
        style: {
          fontSize: '13px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    };
    config.yAxis = {
      min: 0,
      title: {
        text: 'Coincidencias'
      }
    };

    config.legend = { enabled: false };

    config.series = [ { 
     name: 'Population',
     data: data,
     dataLabels: {
      enabled: true,
      rotation: -90,
      color: '#FFFFFF',
      align: 'right',
      x: -3,
      y: 10,
      formatter: function() {
        return this.y;
      },
      style: {
        fontSize: '13px',
        fontFamily: 'Verdana, sans-serif'
      }
    }     
  } ];

  return config;
};

/// UTILS ///

// We can improve the look of the chart if we remove superflous data. 
function cleanPieData(data) {
  /*var facets = [];
  for (var i = 0; i < data.length; i++) {
    facets.push(data[i][0]);
  }
  var start = sharedStart(facets);*/
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < namespaces.length; j++) {
          data[i][0] = data[i][0].replace(namespaces[0], "");
        }
  }
  //return data;
}

function cleanBarCat(cat, data) {
  console.log("clean bar cat");
  //console.log(cat);
  //var start = sharedStart(cat);
  /*for (var i = 0; i < cat.length; i++) {
    for (var j = 0; j < namespaces.length; j++) {
      cat[i] = cat[i].replace(namespaces[j], "");
    }
  }*/
for (var i = 0; i < cat.length; i++) {
    var f = (Math.round(parseFloat(cat[i]) * 10) / 10).toString();
    var index = cat.indexOf(f)
    if (index >= 0 && index != i) {
      data[index] += data[i];
      data.splice(i, i+1);
      cat.splice(i, i+1);
      i--;
    } else {
      cat[i] = f;
    }
}
}




function sharedStart(A) {
  var tem1, tem2, s, A = A.slice(0).sort(function(a, b){
    var nameA=a.toLowerCase(), nameB=b.toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1 
        if (nameA > nameB)
          return 1
        return 0 //default return value (no sorting)
      })
   // var tem1, tem2, s, A = A.slice(0).sort();
   tem1 = A[0];
   s = tem1.length;
   tem2 = A.pop();
   while(s && tem2.indexOf(tem1) == -1) {
    tem1 = tem1.substring(0, --s);
  }
  console.log("SHARED START2:" + tem1 );
  return tem1;
}

function parseLinechartData(cat, data) {
  console.log(cat);
  console.log(data);

   for (var i = 0; i < cat.length; i++) {
      var d = new Date(cat[i]);
      cat[i] = //d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear().toString().substring(2) + " "+ 
      d.getHours() +  ":00-" + new Date(d.setHours(d.getHours() + 1)).getHours() + ":00";
   }
  for (var i = 0; i < data.length; i++) {
    var index = cat.indexOf(cat[i]);
    if (index >= 0 && index != i) {
      data[index] += data[i];
      data.splice(i, i+1);
      cat.splice(i, i+1);
      i--;
    }
  }
}



