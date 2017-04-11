var getData = function (url, callback) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'json'
  xhr.onload = function () {
    var status = xhr.status
    if (status === 200) {
      callback(null, xhr.response)
    } else {
      callback(status)
    }
  }
  xhr.send()
}
$(document).ready(() => {
  $('#searchForm').on('submit', (e) => {
    let searchText = $('#searchText').val()
    getMovies(searchText)
    e.preventDefault()
  })

  let moviesandtvshows = []

  getData(statusurl, function (err, data) {
    if (err != null) {
      console.log('Something went wrong: ' + err)
    } else {
      var myDate = new Date(data.buildTime)
      $('#version').html(`<i class="fa fa-info-circle"></i> Version` + ' ' + data.version + ' ' + 'Latest Build Date: ' + myDate.getDate() + '/' + (myDate.getMonth() + 1) + '/' + myDate.getFullYear())
    }
  })

  getData(radarrurl, function (err, data) {
    if (err != null) {
    } else {
      moviesandtvshows.push({ 'movies': data })
      var max = data.length
      var min = 0
      var random = Math.floor(Math.random() * (max - min + 1)) + min
      var randomID = data[random].imdbId
      getData('https://webservice.fanart.tv/v3/movies/' + randomID + '?api_key=' + apifan, function (err, image) {
        if (err != null) {
          document.body.style.backgroundColor = '#3E4551'
        } else {
          var randomIDurl = image.moviebackground[0].url
          $('body').css('background-image', 'url(' + randomIDurl + ')')
          $('body').addClass('randombg')
          sessionStorage.setItem('backgroundImageUrl', randomIDurl)
        }
      })
    }
  })
  getData(sonarrurl, function (err, data) {
    if (err != null) {
      console.log('Something went wrong: ' + err)
    } else {
      moviesandtvshows.push({ 'series': data })
    }
  })
  this.data = moviesandtvshows
})
// Postback function to put searchText back to input
$(window).load(function () {
  var searchFor = window.location.href.split('?q=')
  var searchQuery = searchFor[1]
  if (searchQuery != null && searchFor.length > 1) {
    document.getElementById('searchText').value = decodeURI(searchQuery)
    // document.getElementById("searchForm").submit() // This is to submit what was already searched for
    // this.preventDefault(); // Trying to prevent defaults
  }
})

// Loops checks if movie is in collection
function filterMovies (id) {
  let isDownloaded = false // Set default value of `false`
  this.data.forEach(function (type) {
    [type].forEach(function (entry) {
      $.each(entry, function (i, item) {
        $.each(item, function (x, y) {
          if (y.imdbId === id && y.sizeOnDisk > 0) {
            isDownloaded = true
          }
        })
      })
    })
  })
  return isDownloaded
}

// Search Function
function getMovies (searchText) {
  axios.get('https://www.omdbapi.com/?s=' + searchText)
    .then((response) => {
      let omdbData = response.data.Search
      let output = ''
      $.each(omdbData, (index, movie) => {
        output += htmlWriteResults(movie)
      })

      $('#movies').html(output)
    })
    .catch((err) => {
      console.log(err)
    })
}

// Writes the Search Results
function htmlWriteResults (cases) {

  let myHTML = ''
  myHTML += `<div class="col-md-4">
            <div class="well text-center">`
  if (filterMovies(cases.imdbID)) {
    myHTML += `<div class="alert alert-success" id="${cases.imdbID}inCollection"><i class="fa fa-cloud-download"></i> In Collection</div>`
  } else {
    myHTML += `<div class="alert alert-danger" id="${cases.imdbID}notInCollection"><i class="fa fa-exclamation-triangle"></i> Not in Collection</div>`
  }
  myHTML += `<img src="${posterError(cases.Poster)}">
              <h5>${cases.Title} (${cases.Year.substring(0, 4)})</h5>
                <div class="btn-group">
                  <a onclick="movieSelected('${cases.imdbID}')" class="btn btn-primary btn-rounded" href="#"><i class="fa fa-info-circle"></i> ${upperFirst(cases.Type)} Details</a>
                </div>
            </div>
          </div>
          `
  return myHTML
}

// Check for tvdbID

function getTvdb (id) {
  let tvdbid = ''
  this.data.forEach(function (type) {
    [type].forEach(function (entry) {
      $.each(entry, function (i, item) {
        $.each(item, function (x, y) {
          if (y.imdbId === id && y.tvdbId !== null && y.tvdbId !== '') {
            tvdbid = y.tvdbId
          }
        })
      })
    })
  })
  return tvdbid
}

// Set storage Items
function movieSelected (id) {
  var tvdbID = getTvdb(id)
  if (tvdbID != '') {
    sessionStorage.setItem('tvdbID', tvdbID)
  }
  sessionStorage.setItem('movieId', id)
  if (document.getElementById(id + 'inCollection')) {
    sessionStorage.setItem('inCollection', true)
  } else {
    sessionStorage.setItem('inCollection', false)
  };
  var searchedFor = $('#searchText').val()
  window.location = 'info.html?q=' + searchedFor
  return false
}
   $(window).load(function(){
        $('#helpModal').modal('show');
    });