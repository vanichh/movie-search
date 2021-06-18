const elem = {
  input: document.querySelector('.header-input'),
  container: document.querySelector('.container'),
  scrollTop: document.querySelector('.scroll-top'),
  totalResults: document.querySelector('.totalResults'),
};
let animationLoading = true;

function loading() {
  if (animationLoading && elem.input.value != '') {
    elem.container.innerHTML = '';
    animation();
  }
  animationLoading = false;
}

elem.input.onkeyup = debounce(request, 750);

function request() {
  elem.container.innerHTML = '';
  page = 1; // сбрасываем счетчик страниц поиска
  fetch('https://www.omdbapi.com/?apikey=11077a22&s=' + elem.input.value)
    .then(kino => kino.json())
    .then(json => {
      if (json !== undefined && !json.Error) {
        elem.totalResults.textContent = 'Найдено: ' + json.totalResults;
        render(json.Search);
        animationLoading = true;
        if (document.documentElement.clientHeight > document.documentElement.offsetHeight) {
          scrollLoading();
        }
      } else {
        elem.totalResults.textContent = '';
        const error = document.createElement('p');
        error.textContent = 'Ничего не найдено :(';
        elem.container.append(error);
      }
    })
    .catch(error => {
      elem.textContent = 'Проишошла ошибка: ' + error.message
    });
}

function debounce(fn, ms) {
  loading();
  let timeout;
  return function () {
    const fnCall = () => {
      fn.apply(this, arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
}

function animation() {
  const div = document.createElement('div');
  div.setAttribute('id', 'circleG');
  for (let i = 1; i <= 3; i++) {
    const elemСhild = document.createElement('div');
    elemСhild.setAttribute('id', `circleG_${i}`);
    elemСhild.classList.add('circleG');
    div.appendChild(elemСhild);
    elem.container.appendChild(div);
  }
}

async function posterInfo(event) {
  const textHead = this.parentElement.firstElementChild.innerText;
  const json = await fetch('https://www.omdbapi.com/?apikey=11077a22&t=' + textHead)
    .then(kino => kino.json())
    .then(json => {
      if (json !== undefined || !json.Error) return json;
    });
  const arr = Object.values(json); // преобразуем в массив
  const search = [3, 4, 5, 6, 8, 9, 10, 16, 21, 22]; // какие элементы будем удалять
  const post = document.querySelector('#template-2').content;
  const content = post.querySelector('.poster-kino-background').cloneNode(true);
  content.onclick = close;
  content.querySelector('h2').textContent = json.Title;
  content.querySelector('a').href = `https://www.imdb.com/title/${json.imdbID}`;
  content.querySelector('.container-poster-img-1').style.backgroundImage = `url(${json.Poster})`;
  content.querySelectorAll('li>p:last-child').forEach((item, index) => {
    item.textContent = arr[search[index]];
  });
  document.body.append(content);
}

function close({ srcElement }) {
  if (srcElement.className == 'poster-kino-background' || srcElement.className == 'container-poster-close') {
    document.querySelector('.poster-kino-background').remove();
  }
}

function render(json) {
  for (let pos of json) {
    if (pos.Poster != 'N/A') {
      const post = document.querySelector('#template').content;
      let content = post.querySelector('.container-poster').cloneNode(true); // создаем шаблон
      content.querySelector('.container-poster-title').textContent = `${pos.Title}`; // название фильма
      content.querySelector('.container-poster-title').href = `https://www.imdb.com/title/${pos.imdbID}`;
      if (pos.Type == 'movie') content.querySelector('.container-poster-info').textContent = `Кино ${pos.Year} года`;
      // год фильмаe
      else content.querySelector('.container-poster-info').textContent = `Сериал ${pos.Year} года`;
      content.querySelector('.container-poster-img').style.backgroundImage = `url(${pos.Poster})`; // изображение
      content.querySelector('.container-poster-img').onclick = posterInfo;
      // animate.style.display = 'none';
      elem.container.append(content);
    }
  }
}
// Слушатель для загрузки контента при прокрутки
let page = 1,
  flag = true;
// для задержки

document.addEventListener('scroll', evt => {
  const offsetHeight = document.documentElement.offsetHeight;
  const clientHeight = document.documentElement.clientHeight;
  const pageYOffset = window.pageYOffset;
  const heigth = offsetHeight - (clientHeight + pageYOffset);
  if (heigth < 200 && flag) {
    scrollLoading();
  }
  if (window.pageYOffset > 200) {
    elem.scrollTop.hidden = false;
  } else {
    elem.scrollTop.hidden = true;
  }
});

elem.scrollTop.onclick = function () {
  window.scrollTo(0, 0);
};

function scrollLoading() {
  if (animationLoading) {
    animation();
  }
  page++;
  flag = false;
  fetch('https://www.omdbapi.com/?apikey=11077a22&s=' + elem.input.value + '&page=' + page)
    .then(kino => kino.json())
    .then(json => {
      flag = true;
      document.querySelector('#circleG').remove();
      render(json.Search);
    }); // ставим временную задержку
}
