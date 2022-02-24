/* global schools */

const schoolMap = L.map('school-map').setView([39.95303901388685, -75.16341794003617], 13);
const schoolLayer = L.layerGroup().addTo(schoolMap);

L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 18,
  ext: 'png',
}).addTo(schoolMap);

const schoolList = document.querySelector('#school-list');
const gradeLevelSelect = document.querySelector('#grade-level-select');
const zipCodeSelect = document.querySelector('#zip-code-select');

/* ====================

# Exercise: School Explorer (redux)

const url ='...';
fetch(url)
  .then(resp => resp.json())
  .then(data => {
    L.geoJSON(data, {style: feature => {
      let my Color;
      if (feature.properties.score === 3) {
        myColor = 'green';
      } else if (feature.properties.score === ) {
        myColor = 'yellow';
      } else {
        myColor = 'red';
      }
      return {
        color: myColor
      }
    }}).addTo(map);
  })

==================== */

let showSchoolInfo = (schools, marker) => {
  const dataFileName = `../../data/demographics/${schools['ULCS Code']}.json`;
  fetch(dataFileName)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const first = data[0];
      const pctm = first['MalePCT'];
      const pctf = first['FemalePCT'];
      marker.bindPopup(`
        <h3>${schools['Publication Name']}</h3>
        <ul>
        <li>Percent Male: ${pctm}%</li>
        <li>Percent FemalePCT: ${pctf}%</li>
        </ul>`).openPopup();
    });
};


/* PASTE YOUR WEEK4 EXERCISE CODE HERE */
let updateSchoolMarkers = (schoolsToShow) => {
  schoolLayer.clearLayers();
  schoolsToShow.forEach(schools => {
    const [lng, lat] = schools['GPS Location'].split(',');
    const schoolName = schools['Publication Name'];
    const marker = L.marker([lng, lat]);
    schoolLayer.addLayer(marker);
    marker.addEventListener('click', () => {
      showSchoolInfo(schools, marker);
    });
  });
};



let initializeZipCodeChoices = () => {
  let ziparr = [];
  schools.forEach(school => {
    let zip = school['Zip Code'].split('-', 1)[0];
    if (!ziparr.includes(zip)) {
      ziparr.push(zip);
    }
  });
  ziparr.sort();
  let ziporder = document.getElementById('zip-code-select');
  ziparr.forEach(zip => {
    ziporder.appendChild(htmlToElement(`<option>${zip}</option>`));
  });
};

let updateSchoolList = (schoolsToShow) => {
  schoolList.innerHTML = '';
  schoolsToShow.forEach((school) => {
        // Loop through each of the scores. If there's one where the ULCS Code
        // matches the school's ULCS Code, use that score information for the
        // school.
        let schoolScore = {};
        for (const score of scores) {
          if (score['ULCS Code'] == school['ULCS Code']) {
            schoolScore = score;
            break;
          }
        }

        // Create a list item (li) for the school, and add a class according to the
        // score tier.
        const html = `
          <li class="school-${schoolScore['Overall Tier']}">
            ${school['Publication Name']}
          </li>`;
        schoolList.appendChild(htmlToElement(html));
  });
};

let filteredSchools = () => {
  let gradeVal = gradeLevelSelect.value;
  let zipVal = zipCodeSelect.value;
  if (zipVal === '' && gradeVal === '') {
    return schools;
  }
  if (zipVal !== '' && gradeVal === '') {
    return schools.filter(school => school['Zip Code'].slice(0, 5) === zipVal);
  }
  if (zipVal === '' && gradeVal !== '') {
    return schools.filter(school => school[gradeVal] === '1');
  }
  return schools.filter(school => school['Zip Code'].slice(0, 5) === zipVal && school[gradeVal] === '1');
};
/*

No need to edit anything below this line ... though feel free.

*/

// The handleSelectChange function is an event listener that will be used to
// update the displayed schools when one of the select filters is changed.
let handleSelectChange = () => {
  const schoolsToShow = filteredSchools() || [];
  updateSchoolMarkers(schoolsToShow);
  updateSchoolList(schoolsToShow);
};

gradeLevelSelect.addEventListener('change', handleSelectChange);
zipCodeSelect.addEventListener('change', handleSelectChange);

// The code below will be run when this script first loads. Think of it as the
// initialization step for the web page.
initializeZipCodeChoices();
updateSchoolMarkers(schools);
updateSchoolList(schools);
