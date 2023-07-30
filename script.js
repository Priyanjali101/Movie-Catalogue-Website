//adding scroll effect 
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.nav-bar');
    if (window.pageYOffset > 0) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


// JavaScript

const apiKey = "3191dea0e2ca31581ffe45ca58bbcfb7";
const apiEndpoint = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/original";

const apiPaths = {
    fetchAllCategories: `${apiEndpoint}/genre/movie/list?api_key=${apiKey}`,
    fetchMoviesList: (id) => `${apiEndpoint}/discover/movie?api_key=${apiKey}&with_genres=${id}`,
    fetchTrending: `${apiEndpoint}/trending/all/day?api_key=${apiKey}&language=en-US`
}

let swiper;

function init() {
    fetchTrendingMovies();
    fetchAndBuildAllCategories().then(() => {
        // Initialize Swiper after all movies are added to the DOM
        swiper = new Swiper(".mySwiper", {
            slidesPerView: 3,
            spaceBetween: 5,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    init();
});

function fetchTrendingMovies() {
    fetchAndBuildMovieSection(apiPaths.fetchTrending, 'Trending Now')
        .then(list => {
            const randomIndex = parseInt(Math.random() * list.length);
            buildBannerSection(list[randomIndex]);
        }).catch(err => {
            console.error(err);
        });
}

function buildBannerSection(movie) {
    const bannerCont = document.getElementById('header');
    bannerCont.style.backgroundImage = `linear-gradient(rgba(4,9,30,0.7), rgba(4,9,30,0.7)), url('${imgPath}${movie.backdrop_path}')`;

    const div = document.createElement('div');
    div.innerHTML = `
        <div class="title">
            <h1 class="movie-title">${movie.title}</h1>
        </div>
        <div class="info">
            <span class="movie-info"> Trending Now</span>
        </div>
        <div class="about">
            <p class="movie-about"> 
                ${movie.overview && movie.overview.length > 200 ? movie.overview.slice(0, 400).trim() + '...' : movie.overview}
            </p>   
        </div>
    `;
    div.className = "banner";

    bannerCont.append(div);
}

function fetchAndBuildAllCategories() {
    return fetch(apiPaths.fetchAllCategories)
        .then(res => res.json())
        .then(res => {
            const categories = res.genres;
            if (Array.isArray(categories) && categories.length) {
                const promises = categories.map(category => {
                    return fetchAndBuildMovieSection(apiPaths.fetchMoviesList(category.id), category.name);
                });
                return Promise.all(promises);
            }
        })
        .catch(err => console.error(err));
}

function fetchAndBuildMovieSection(fetchUrl, categoryName) {
    return fetch(fetchUrl)
        .then(res => res.json())
        .then(res => {
            const movies = res.results;
            if (Array.isArray(movies) && movies.length) {
                buildMoviesSection(movies, categoryName);
            }
            return movies;
        })
        .catch(err => console.error(err))
}

function buildMoviesSection(list, categoryName) {
    const moviesCont = document.getElementById('movies-cont');

    const moviesListHTML = list.map(movie => {
        return `
            <div class="swiper-slide">
                <div class="box">
                    <div class="content-img">
                        <img src="${imgPath}${movie.backdrop_path}" alt="${movie.title}">
                    </div>
                    <h4>${movie.title}</h4>
                    <p>${movie.overview && movie.overview.length > 200 ? movie.overview.slice(0, 200).trim() + '...' : movie.overview}</p>
                </div>
            </div>
        `;
    }).join('');

    const swiperWrapper = `<div class="swiper-wrapper">${moviesListHTML}</div>`;

    const moviesSectionHTML = `
        <div class="categories-title">
            <h2 id="${categoryName}">${categoryName}</h2>
        </div>
        <div class="swiper mySwiper">
            ${swiperWrapper}
        </div>  
    `;

    const div = document.createElement('div');
    div.className = "movies-section";
    div.innerHTML = moviesSectionHTML;

    // Append HTML into movies container
    moviesCont.append(div);
}
