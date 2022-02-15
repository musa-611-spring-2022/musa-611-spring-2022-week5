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

==================== */

let showSchoolInfo = (school, marker) => {
}

/* PASTE YOUR WEEK4 EXERCISE CODE HERE */

let updateSchoolMarkers = (schoolsToShow) => {
  schoolLayer.clearLayers();
  schoolsToShow.forEach((school) => {
    const [x, y] = school['GPS Location'].split(',');
    const marker = L.marker([x, y]);
    // marker.
    marker.addTo(schoolLayer);
  });
};

let updateSchoolList = (schoolsToShow) => {
  schoolList.innerHTML = '';
  schoolsToShow.forEach((school) => {
    const name = school['Publication Name'];
    const nameNode = htmlToElement(`<li>${name}</li>`);
    schoolList.appendChild(nameNode);
  });
};

let initializeZipCodeChoices = () => {
  let zip = schools.map((school) => Number(school['Zip Code'].slice(0, 5)));
  zip = [...new Set(zip)].sort();
  zip.forEach((z) => {
    const zipNode = htmlToElement(`<option>${z}</option>`);
    zipCodeSelect.appendChild(zipNode);
  });
};

let filteredSchools = () => {
  // filter zip
  let fSchools = schools;
  const selectedZip = zipCodeSelect.selectedOptions[0].label;
  const selectedGrade = gradeLevelSelect.selectedOptions[0].label;

  if (selectedZip !== 'All') {
    fSchools = fSchools.filter((s) => s['Zip Code'].slice(0, 5) === selectedZip);
  }
  if (selectedGrade !== 'All') {
    fSchools = fSchools.filter((s) => s[selectedGrade] === '1');
  }
  return fSchools;
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