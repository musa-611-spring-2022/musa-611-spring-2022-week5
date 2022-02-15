## Anatomy of a Web Request

Slide show: https://docs.google.com/presentation/d/1ZaT10JFwWUO67fP-7yx9rUQ_arZHk4S2MOFWsz0W7es/edit?usp=sharing

## How to fetch data from a URL

```js
// Declare a string with the URL you want to fetch
let myURL = '...';

fetch(myURL)
  .then(resp => resp.json())
  .then(data => {
    // Do whatever you need with the data here.
    console.log(data);
  });
```

For example, the `showSchoolInfo` function as implemented in class today is of the form:

```js
let showSchoolInfo = (marker, school) => {
  const dataUrl = `../../data/demographics/${school['ULCS Code']}.json`;
  fetch(dataUrl)
    .then(resp => resp.json())
    .then(data => {
      const first = data[0];
      const grade = first['GradeLevel'];
      const pctm = first['MalePCT'];
      const pctf = first['FemalePCT'];

      marker.bindPopup(`
        <h3>${school['Publication Name']}</h3>
        <ul>
          <li>Grade: ${grade}</li>
          <li>Percent Male: ${pctm}%</li>
          <li>Percent Female: ${pctf}%</li>
        </ul>`).openPopup();
    });
};
```

When I create each of my markers I can then create an event listener that calls this function like so:

```js
marker.addEventListener('click', () => {
  showSchoolInfo(marker, school);
});
```

> The above assumes I have a variable `marker` that represents the marker I'm creating, and a variable `school` that represents the object with data that I'm creating the marker from.

### Fetching from the local file system vs a web server...

One thing to note is that the JavaScript `fetch` API does not work if what you're trying to fetch is not being accessed through an HTTP server. For example, if you copy the full path your HTML file, load your page from that file path, and then try to open one of the school info popups, you may end up with an error like this in your console:

```
Fetch API cannot load file:///.../week5/data/demographics/2390.json. URL scheme "file" is not supported.
```

Instead you will have to run a web server in your week5 repository (e.g., using `npx http-server --port 8000`) and access your page through that web server (e.g. http://localhost:8000/exercise/school-explorer-redux/index.html)

### A note about relative vs absolute paths...

In the code above I specify the data URL as:

```js
const dataUrl = `../../data/demographics/${school['ULCS Code']}.json`;
```

This creates what is called a **relative path** -- the path to the file is specified relative to the page's path (go up two folders, then go in to the _data/demographics_ folder). If a path does not start with a slash character (`/`) it is taken to be a relative path. It's relative because if my web page were in a different location on the server then "up two folders" would specify a different location.

We could also use an **absolute path** to specify the data location. When a path starts with a slash character (`/`) is is an absolute path, and the path is taken to be relative to the root path of the server. No matter where our web page is located on the server, the root is not going to change.

In other words, assuming our server is started from the base of this week's repository, we could say the following:

```js
const dataUrl = `/data/demographics/${school['ULCS Code']}.json`;
```
