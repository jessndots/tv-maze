/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  // TODO: Make an ajax request to the searchShows api.  Remove
  // hard coded data.

  let response = await axios.get('https://api.tvmaze.com/search/shows', {params: {q: query}});

  let showArray = []

  for (let i=0; i < response.data.length; i++){
    
    let showData = {
      id: response.data[i].show.id,
      name: response.data[i].show.name,
      summary: response.data[i].show.summary, 
    }
    if (response.data[i].show.image == null) {
      showData.image = "https://tinyurl.com/tv-missing"
    } else {
      showData.image = response.data[i].show.image.original
    }
    showArray.push(showData)
  }
  return showArray
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}" data-show-name="${show.name}">
         <div class="card" data-show-id="${show.id}" data-show-name="${show.name}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <img class="card-img-top" src="${show.image}">
             <p class="card-text">${show.summary}</p>
           </div>
           <button type = "button" class= "episodes">Episodes</button>
         </div>
       </div>
      `);

    $showsList.append($item);
  }
}



/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});


async function getEpisodes(id) { //create array of all episodes that includes episode ID, episode name, season number, and episode number
  let episodes = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  
  let episodesArr = []
  for (let i = 0; i < episodes.data.length; i++) {
    let epiData = {
      id: episodes.data[i].id,
      name: episodes.data[i].name,
      season: episodes.data[i].season,
      number: episodes.data[i].number
    }
    episodesArr.push(epiData);
  }
  return episodesArr
}

function populateEpisodes(episodesArr) { 
  $("#episodes-list").remove(); //clear episodes list from prior click if any
  $("#episodes-area").append("<ul id= 'episodes-list'>"); //add list to dom
  for (let i=0; i<episodesArr.length; i++) { //add li for each episode
    let li = $("<li>")
    li.text(`Season ${episodesArr[i].season}, Episode ${episodesArr[i].number} - ${episodesArr[i].name}`)
    li.appendTo("#episodes-list");
  }

  $("#episodes-area").show(); //reveal episodes area

}

$("#shows-list").on("click", "button", async function () {
  const id = $(this).closest(".card").attr("data-show-id");
  const name = $(this).closest(".card").attr("data-show-name");
  $("#episodes-area h2").text(`${name} Episodes`); // change name of episodes area to reflect show title
  let episodesArr = await getEpisodes(id); //get array of eps to pass in to populateEpisodes function
  populateEpisodes(episodesArr);
})