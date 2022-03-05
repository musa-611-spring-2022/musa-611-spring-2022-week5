/* global schools */

const schoolMap = L.map('school-map').setView([39.95303901388685, -75.16341794003617], 13);
const schoolLayer = L.layerGroup().addTo(schoolMap);
const highlightLayer = L.layerGroup().addTo(schoolMap);

L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 18,
  ext: 'png',
}).addTo(schoolMap);

const HighLightSchool = document.querySelector('#HighLight-School');
const schoolList = document.querySelector('#school-list');
const gradeLevelSelect = document.querySelector('#grade-level-select');
const zipCodeSelect = document.querySelector('#zip-code-select');

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/* ====================

# Exercise: School Explorer (redux)

==================== */

let HighlightSchoolFunction = (childArray) => {
  let HighLightSchoolInfo = [
    `Asian American %: ${childArray.AsianPCT}`,
    `Black African American %: ${childArray.BlackAfricanAmericanPCT}`,
    `Hispantic American %: ${childArray.HispanicPCT}`,
    `White American %: ${childArray.WhitePCT}`];
  let el4 = htmlToElement(`<strong><li style='color:#CA263D;'>Grades: ${childArray.GradeLevel}</li></strong>`);
  HighLightSchool.appendChild(htmlToElement('<li style="color:#CA263D;"> <br></li>')).appendChild(el4);
  HighLightSchoolInfo.forEach(eachInfo => {
    let el2 = htmlToElement(`<li style='color:#CA263D;'>${eachInfo}</li>`);
    HighLightSchool.appendChild(el2);
  });
  document.querySelector('body').style.gridTemplateAreas = '"filters filters sorters nouse"  "map map list list2"';
};

let showSchoolInfo = (school, marker) => {
  const dataUrl = `../../data/demographics/${school['ULCS Code']}.json`;
  fetch(dataUrl)
    .then(resp => resp.json())
    .then(data => {
      // let allGrades = data[-0];
      let allGrades = data
        .filter(everyGrade => everyGrade.GradeLevel === 'All Grades')[0];
      const sector = allGrades.Sector;
      const subSector = allGrades.SubSector;
      const grade = data
        .filter(everyGrade => everyGrade.GradeLevel !== 'All Grades')
        .map(everyGrade => everyGrade.GradeLevel);
      const AVGpctm = allGrades.MalePCT;
      const AVGpctf = allGrades.FemalePCT;

      marker.bindPopup(`
        <h6>${school['Publication Name']}</h6>
        <ul>
          <li>School Level: ${school['School Level']}</li>
          <li>Admission Type: ${school['Admission Type']}</li>
          <li>Sector: ${sector} - ${subSector}</li>
          <li>Grades: ${grade}</li>
          <li>Average Percent Male: ${AVGpctm}%</li>
          <li>Average Percent Female: ${AVGpctf}%</li>
        </ul>`).openPopup();

      HighLightSchool.innerHTML = '';
      data.filter(everyGrade => everyGrade.GradeLevel !== 'All Grades').map(childArray => HighlightSchoolFunction(childArray));
    });
};

/* PASTE YOUR WEEK4 EXERCISE CODE HERE */

let updateSchoolMarkers = (schoolsToShow) => {
  schoolLayer.clearLayers();
  highlightLayer.clearLayers();
  schoolsToShow.forEach((school) => {
    let [lat, lng] = school['GPS Location'].split(',');
    let stationName = school['Publication Name'];
    let marker = L.marker([lat, lng]).bindTooltip(stationName);
    marker.addEventListener('click', () => {
      highlightLayer.clearLayers();
      showSchoolInfo(school, marker);
      let highlightMarker = L.marker([lat, lng], { icon: redIcon });
      highlightLayer.addLayer(highlightMarker);
    });
    schoolLayer.addLayer(marker);
  });
};

let updateSchoolList = (schoolsToShow) => {
  schoolList.innerHTML = '';
  HighLightSchool.innerHTML = '';
  let schoolList2 = schoolsToShow.map(school => school['Publication Name']);
  schoolList2.forEach(school => {
    let el3 = htmlToElement(`<li>${school}</li>`);
    schoolList.appendChild(el3);
  });
};

let initializeZipCodeChoices = () => {
  let zipCodeList = schools.map(school => school['Zip Code'].split('-')[0]);
  let uniqueZipCodeList = [...new Set(zipCodeList)];
  uniqueZipCodeList.forEach(uniqueZipCode => {
    let el = htmlToElement(`<option>${uniqueZipCode}</option>`);
    zipCodeSelect.appendChild(el);
  });
};

let filteredSchools = () => {
  let selectedGrade = gradeLevelSelect.options[gradeLevelSelect.selectedIndex].text;
  let selectedZipCode = zipCodeSelect.options[zipCodeSelect.selectedIndex].text;
  if (selectedGrade === 'All' && selectedZipCode === 'All') {
    return schools;
  } if (selectedGrade === 'All' && selectedZipCode !== 'All') {
    return schools.filter(school => school['Zip Code'].split('-')[0] === selectedZipCode);
  } if (selectedGrade !== 'All' && selectedZipCode === 'All') {
    return schools.filter(school => school[`${selectedGrade}`] === '1');
  } return schools.filter(school => school[`${selectedGrade}`] === '1' && school['Zip Code'].split('-')[0] === selectedZipCode);
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
