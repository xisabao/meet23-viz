const conversions = {
    "Antigua and Barb.": "Antigua and Barbuda",
    "Bosnia and Herz.":  "Bosnia and Herzegovina",
    "Brunei": "Brunei Darussalam",
    "Cabo Verde": "Cape Verde",
    "Cayman Is.": "Cayman Islands",
    "Central African Rep.": "Central African Republic",
    "Dem. Rep. Congo": "Congo, Democratic Republic of",
    "Cook Is.": "Cook Islands",
    "Côte d'Ivoire": "Cote d'Ivoire",
    "N. Cyprus": "Cyprus (North)",
    "Czechia": "Czech Republic",
    "Dominican Rep.": "Dominican Republic",
    "Eq. Guinea": "Equatorial Guinea",
    "Falkland Is.": "Falkland Islands (Malvinas)",
    "Vatican": "Holy See (Vatican City State)",
    "Iran": "Iran, Islamic Republic of",
    "Laos": "Lao People's Dem. Republic",
    "Marshall Is.": "Marshall Islands",
    "Micronesia": "Micronesia, Federated States of",
    "Moldova": "Moldova, Republic of",
    "Congo": "Republic of The Congo (Brazzaville)",
    "Russia":  "Russian Federation",
    "North Korea": "Korea, Dem. People's Republic of",
    "South Korea": "Korea, Republic of",
    "St. Kitts and Nevis": "Saint Kitts and Nevis",
    "St. Vin. and Gren.": "Saint Vincent and The Grenadines",
    "Solomon Is.": "Solomon Islands",
    "eSwatini": "Swaziland",
    "S. Sudan": "South Sudan",
    "Palestine": "State of Palestine",
    "Syria": "Syrian Arab Republic",
    "Tanzania": "Tanzania, United Republic of",
    "Turks and Caicos Is.": "Turks and Caicos Islands",
    "United States of America": "United States",
    "Vietnam": "Viet Nam",
    "British Virgin Is.": "Virgin Islands, British"

}

function convertCountry(country){
    if (Object.keys(conversions).includes(country)) {
        return conversions[country];
    } else {
        return country;
    }
}

function initialize(error, topoData, voteData) {
    if (error) {
        console.log("uh oh!");
        return;
    }


   const margin = { top: 20, right: 40, bottom: 40, left: 40 };

  const width = 1200 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;

  var svg = d3
      .select('#viz')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    var systems = d3.nest()
        .key((d) => d["Electoral system for national legislature"])
        .entries(voteData)
        .map((d) => d.key);
    console.log(systems);


    const color = d3
        .scaleOrdinal()
        .domain(systems)
        .range(["#48A36D", "#64B98C", "#80CEAA", "#7FC9BD", "#7EC4CF", "#7FB1CF", "#809ECE", "#8F90CD", "#9E81CC", "#B681BE", "#CE80B0", "#D76D8F", "#E05A6D", "#E26962", "#E37756", "#E39158", "#E2AA59", "#DFB95C", "#DBC75F", "#EAD67C"]);

  svg.append('g')
      .attr('class', 'methods')
      .selectAll('text')
      .data(systems)
      .enter()
      .append('text')
      .text((d) => d)
      .style('fill', (d) => color(d))
      .attr('transform', (d, i) => 'translate(1000,' + (100+ 40*i) + ')')
      .on('mouseover', function(d) {
          svg.select('.methods').style('cursor', 'pointer');
        update(svg, d);
      }).on('mouseout', function(d) {
      svg.select('.methods').style('cursor', 'default');
      update(svg, null);
  });


  update(svg, null);

  function update(svg, system) {
      // console.log(topoData);
      // console.log(voteData);
      //console.log(system);

     var projection = d3
        .geoRobinson()
        .scale(160)
        .translate([svg.attr('width') / 2 - 100, svg.attr('height') / 2]);

     const path = d3.geoPath().projection(projection);
      var filteredVoteData;
      var entries;
     if (system) {
         filteredVoteData = voteData.filter((d) => d["Electoral system for national legislature"] === system);
         entries = d3.nest()
             .key((d) => d.Country )
             .object(filteredVoteData);
     } else {
         filteredVoteData = voteData;
         entries = [];
     }


     //console.log(entries);

    // var countries = entries.map((d) => d.key );
     //console.log(countries);

     const world = topojson.feature(topoData, topoData.objects.countries).features;
    // var topoCountries = world.map((d) => d.properties.name);

    //var unmatchedCountries = countries.filter((c) => !topoCountries.includes(c));
    //console.log(unmatchedCountries);

     var mapSelect = svg
        .append('g')
        .attr('class', 'map-base')
        .selectAll('path')
        .data(world)

      var map = mapSelect.enter()
        .append('path')
          .merge(mapSelect)

        .attr('d', path)
          .transition()
        .attr('fill', function(d) {
            if (entries[convertCountry(d.properties.name)]) {
                return color(system);
            } else {
                return '#eeedf0';
            }
        })
        .attr('stroke', '#dcdfe3')
        .attr('stroke-width', 1)
        .style('opacity', function(d) {
          return 1;
        });

  }

}

d3.queue()
  .defer(d3.json, 'data/countries.json')
    .defer(d3.csv, 'data/voting-methods-country.csv')
    .await(initialize);

