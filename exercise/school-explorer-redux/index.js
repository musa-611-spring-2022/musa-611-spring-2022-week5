/* global schools */

const schoolMap = L.map('school-map').setView([39.95303901388685, -75.16341794003617], 13);
const schoolLayer = L.layerGroup().addTo(schoolMap);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 18
}).addTo(schoolMap);

let sc = {};
scores.forEach((x) => {
  let score = +x['Overall Score'];
  if (score) {
    sc[x['ULCS Code']] = score;
  }

});

const schoolList = document.querySelector('#school-list');
const gradeLevelSelect = document.querySelector('#grade-level-select');
const zipCodeSelect = document.querySelector('#zip-code-select');
const nameCheckBox = document.querySelector('#sort-by-name');
const scoreCheckBox = document.querySelector('#sort-by-score');

const now = new Date();
const yearNow = now.getFullYear();
/* ====================

# Exercise: School Explorer (redux)

==================== */

let findSchoolinList = (ulcs) => {
  const element = document.querySelector(`.ulcs-${ulcs}`);
  element.scrollIntoView({ behavior: "smooth" });
  element.style.transition = 'all 0s';
  element.style.boxShadow = 'inset 0 0px 10px 0px steelblue';
  setTimeout(() => {
    element.style.transition = 'all .5s ease-in-out';
    element.style.boxShadow = '';
  }, 2000)
};


let showSchoolInfo = (marker, school) => {
  const dataUrl = `../../data/demographics/${school['ULCS Code']}.json`;
  marker.closeTooltip();
  fetch(dataUrl)
    .then(resp => resp.json())
    .then(data => {
      const last = data.pop();
      const pctm = last.MalePCT;
      const pctf = last.FemalePCT;
      const num = last.StudentEnrollment;
      const grade = data.map((x) => `<span class="badge">${+x.GradeLevel}</span>`).join("");

      marker.bindPopup(`
        <h5>${school['Publication Name']}</h5>
        <table class="table table-striped">
          <tr><th>Attr</th><th>Value</th></tr>
          <tr><td>Grade</td><td>${grade}</td></tr>
          <tr><td>Percent Male</td><td>${pctm}%</td></tr>
          <tr><td>Percent Female</td><td>${pctf}%</td></tr>
          <tr><td>Student Number</td><td>${num}</td></tr>
        </table>
        `).openPopup();
      findSchoolinList(school['ULCS Code']);
    });
};

/* PASTE YOUR WEEK4 EXERCISE CODE HERE */

let updateSchoolMarkers = (schoolsToShow) => {
  schoolLayer.clearLayers();
  schoolsToShow.forEach((school) => {
    const [x, y] = school['GPS Location'].split(',');
    const age = yearNow - school['Year Opened'];
    const marker = L.circleMarker([x, y], {
      weight: 1.5,
      radius: 5 + age * 0.05,
      color: chroma.scale('viridis').mode('lch')(age * 0.01 - 0.3).hex()
    });
    marker.bindTooltip(`${school['Publication Name']}`, { direction: 'top' })
    marker.on('click', () => { showSchoolInfo(marker, school); })
    marker.addTo(schoolLayer);
  });
};

let updateSchoolList = (schoolsToShow) => {
  schoolList.innerHTML = '';
  if (nameCheckBox.checked) {
    schoolsToShow.sort((x, y) => {
      return x['Publication Name'].localeCompare(y['Publication Name'])
    });
  } else if (scoreCheckBox.checked) {
    schoolsToShow.sort((x, y) => {
      y = sc[y['ULCS Code']];
      x = sc[x['ULCS Code']];
      if (y === undefined) return -1;
      if (x === undefined) return 1;
      return y - x
    });
  }
  schoolsToShow.forEach((school) => {
    const name = school['Publication Name'];
    const phone = school['Phone Number'];
    const add = school['Street Address'];
    const web = school['Website'];
    const id = +school['ULCS Code'];
    let s = sc[id] || 'Not available';

    const nameNode = htmlToElement(`
    <div class="card ulcs-${school['ULCS Code']}">
      <div class="card-body">
        <h6 class="card-title">${name}</h6>
        <p class="card-text"><b>Address: </b>${add}</p>
        <p class="card-text"><b>Phone: </b>${phone}</p>
        <p class="card-text"><b>Score: </b>${s} <b style="color:${chroma.scale(['#f00', '#0f0']).mode('lrgb')(s / 100)}">${'■'.repeat(s / 6)}</b></p>
        <p class="card-text"><b>Website: </b><a href="${web}">${name}</a></p>
      </div>
    </div>
    `);
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
  let fSchools = [...schools];
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

var legend = L.control({ position: 'bottomleft' });
legend.onAdd = function () {
  var div = L.DomUtil.create('div', 'info legend');
  labels = ['<strong>Legend</strong>', 'School Age']
  for (var i = 0; i < 160; i += 30) {
    labels.push(
      '<i class="circle" style="background:' +
      chroma.scale('viridis').mode('lch')(i * 0.01 - 0.3).hex() +
      '"></i>' + i + ' years'
    );
  }
  div.innerHTML = labels.join('<br>');
  return div;
};
legend.addTo(schoolMap);

/* No need to edit anything below this line ... though feel free.  */

// The handleSelectChange function is an event listener that will be used to
// update the displayed schools when one of the select filters is changed.
let handleSelectChange = (e) => {
  if (e.target.id === 'sort-by-name' && e.target.checked === true) {
    scoreCheckBox.checked = false;
  } else if (e.target.id === 'sort-by-score' && e.target.checked === true) {
    nameCheckBox.checked = false;
  };
  const schoolsToShow = filteredSchools() || [];
  updateSchoolMarkers(schoolsToShow);
  updateSchoolList(schoolsToShow);
};

gradeLevelSelect.addEventListener('change', handleSelectChange);
zipCodeSelect.addEventListener('change', handleSelectChange);
nameCheckBox.addEventListener('change', handleSelectChange);
scoreCheckBox.addEventListener('change', handleSelectChange);

// The code below will be run when this script first loads. Think of it as the
// initialization step for the web page.
initializeZipCodeChoices();
updateSchoolMarkers(schools);
updateSchoolList(schools);
