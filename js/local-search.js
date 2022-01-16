KEEP.initLocalSearch = () =&gt; {

  // Search DB path
  let searchPath = KEEP.hexo_config.path;
  if (!searchPath) {
    // Search DB path
    console.warn('`hexo-generator-searchdb` plugin is not installed!');
    return;
  }

  // Popup Window
  let isfetched = false;
  let datas;
  let isXml = true;
  if (searchPath.length === 0) {
    searchPath = 'search.xml';
  } else if (searchPath.endsWith('json')) {
    isXml = false;
  }
  const searchInputDom = document.querySelector('.search-input');
  const resultContent = document.getElementById('search-result');

  const getIndexByWord = (word, text, caseSensitive) =&gt; {
    let wordLen = word.length;
    if (wordLen === 0) return [];
    let startPosition = 0;
    let position = [];
    let index = [];
    if (!caseSensitive) {
      text = text.toLowerCase();
      word = word.toLowerCase();
    }
    while ((position = text.indexOf(word, startPosition)) &gt; -1) {
      index.push({position, word});
      startPosition = position + wordLen;
    }
    return index;
  };

  // Merge hits into slices
  const mergeIntoSlice = (start, end, index, searchText) =&gt; {
    let item = index[index.length - 1];
    let {position, word} = item;
    let hits = [];
    let searchTextCountInSlice = 0;
    while (position + word.length &lt;= end &amp;&amp; index.length !== 0) {
      if (word === searchText) {
        searchTextCountInSlice++;
      }
      hits.push({
        position,
        length: word.length
      });
      let wordEnd = position + word.length;

      // Move to next position of hit
      index.pop();
      while (index.length !== 0) {
        item = index[index.length - 1];
        position = item.position;
        word = item.word;
        if (wordEnd &gt; position) {
          index.pop();
        } else {
          break;
        }
      }
    }
    return {
      hits,
      start,
      end,
      searchTextCount: searchTextCountInSlice
    };
  };

  // Highlight title and content
  const highlightKeyword = (text, slice) =&gt; {
    let result = '';
    let prevEnd = slice.start;
    slice.hits.forEach(hit =&gt; {
      result += text.substring(prevEnd, hit.position);
      let end = hit.position + hit.length;
      result += `<b class="search-keyword">${text.substring(hit.position, end)}</b>`;
      prevEnd = end;
    });
    result += text.substring(prevEnd, slice.end);
    return result;
  };

  const inputEventFunction = () =&gt; {
    if (!isfetched) return;
    let searchText = searchInputDom.value.trim().toLowerCase();
    let keywords = searchText.split(/[-\s]+/);
    if (keywords.length &gt; 1) {
      keywords.push(searchText);
    }
    let resultItems = [];
    if (searchText.length &gt; 0) {
      // Perform local searching
      datas.forEach(({title, content, url}) =&gt; {
        let titleInLowerCase = title.toLowerCase();
        let contentInLowerCase = content.toLowerCase();
        let indexOfTitle = [];
        let indexOfContent = [];
        let searchTextCount = 0;
        keywords.forEach(keyword =&gt; {
          indexOfTitle = indexOfTitle.concat(getIndexByWord(keyword, titleInLowerCase, false));
          indexOfContent = indexOfContent.concat(getIndexByWord(keyword, contentInLowerCase, false));
        });

        // Show search results
        if (indexOfTitle.length &gt; 0 || indexOfContent.length &gt; 0) {
          let hitCount = indexOfTitle.length + indexOfContent.length;
          // Sort index by position of keyword
          [indexOfTitle, indexOfContent].forEach(index =&gt; {
            index.sort((itemLeft, itemRight) =&gt; {
              if (itemRight.position !== itemLeft.position) {
                return itemRight.position - itemLeft.position;
              }
              return itemLeft.word.length - itemRight.word.length;
            });
          });

          let slicesOfTitle = [];
          if (indexOfTitle.length !== 0) {
            let tmp = mergeIntoSlice(0, title.length, indexOfTitle, searchText);
            searchTextCount += tmp.searchTextCountInSlice;
            slicesOfTitle.push(tmp);
          }

          let slicesOfContent = [];
          while (indexOfContent.length !== 0) {
            let item = indexOfContent[indexOfContent.length - 1];
            let {position, word} = item;
            // Cut out 100 characters
            let start = position - 20;
            let end = position + 80;
            if (start &lt; 0) {
              start = 0;
            }
            if (end &lt; position + word.length) {
              end = position + word.length;
            }
            if (end &gt; content.length) {
              end = content.length;
            }
            let tmp = mergeIntoSlice(start, end, indexOfContent, searchText);
            searchTextCount += tmp.searchTextCountInSlice;
            slicesOfContent.push(tmp);
          }

          // Sort slices in content by search text's count and hits' count
          slicesOfContent.sort((sliceLeft, sliceRight) =&gt; {
            if (sliceLeft.searchTextCount !== sliceRight.searchTextCount) {
              return sliceRight.searchTextCount - sliceLeft.searchTextCount;
            } else if (sliceLeft.hits.length !== sliceRight.hits.length) {
              return sliceRight.hits.length - sliceLeft.hits.length;
            }
            return sliceLeft.start - sliceRight.start;
          });

          // Select top N slices in content
          let upperBound = parseInt(KEEP.theme_config.local_search.top_n_per_article ? KEEP.theme_config.local_search.top_n_per_article : 1, 10);
          if (upperBound &gt;= 0) {
            slicesOfContent = slicesOfContent.slice(0, upperBound);
          }

          let resultItem = '';

          if (slicesOfTitle.length !== 0) {
            resultItem += `<li><a href="${url}" class="search-result-title">${highlightKeyword(title, slicesOfTitle[0])}</a>`;
          } else {
            resultItem += `</li><li><a href="${url}" class="search-result-title">${title}</a>`;
          }

          slicesOfContent.forEach(slice =&gt; {
            resultItem += `<a href="${url}"><p class="search-result">${highlightKeyword(content, slice)}...</p></a>`;
          });

          resultItem += '</li>';
          resultItems.push({
            item: resultItem,
            id: resultItems.length,
            hitCount,
            searchTextCount
          });
        }
      });
    }
    if (keywords.length === 1 &amp;&amp; keywords[0] === '') {
      resultContent.innerHTML = '<div id="no-result"><i class="fas fa-search fa-5x"></i></div>';
    } else if (resultItems.length === 0) {
      resultContent.innerHTML = '<div id="no-result"><i class="fas fa-box-open fa-5x"></i></div>';
    } else {
      resultItems.sort((resultLeft, resultRight) =&gt; {
        if (resultLeft.searchTextCount !== resultRight.searchTextCount) {
          return resultRight.searchTextCount - resultLeft.searchTextCount;
        } else if (resultLeft.hitCount !== resultRight.hitCount) {
          return resultRight.hitCount - resultLeft.hitCount;
        }
        return resultRight.id - resultLeft.id;
      });
      let searchResultList = '<ul class="search-result-list">';
      resultItems.forEach(result =&gt; {
        searchResultList += result.item;
      });
      searchResultList += '</ul>';
      resultContent.innerHTML = searchResultList;
      window.pjax &amp;&amp; window.pjax.refresh(resultContent);
    }
  };

  const fetchData = () =&gt; {
    fetch(KEEP.hexo_config.root + searchPath)
      .then(response =&gt; response.text())
      .then(res =&gt; {
        // Get the contents from search data
        isfetched = true;
        datas = isXml ? [...new DOMParser().parseFromString(res, 'text/xml').querySelectorAll('entry')].map(element =&gt; {
          return {
            title: element.querySelector('title').textContent,
            content: element.querySelector('content').textContent,
            url: element.querySelector('url').textContent
          };
        }) : JSON.parse(res);
        // Only match articles with not empty titles
        datas = datas.filter(data =&gt; data.title).map(data =&gt; {
          data.title = data.title.trim();
          data.content = data.content ? data.content.trim().replace(/&lt;[^&gt;]+&gt;/g, '') : '';
          data.url = decodeURIComponent(data.url).replace(/\/{2,}/g, '/');
          return data;
        });
        // Remove loading animation
        const noResultDom = document.querySelector('#no-result');
        noResultDom &amp;&amp; (noResultDom.innerHTML = '<i class="fas fa-search fa-5x"></i>');
      });
  };

  if (KEEP.theme_config.local_search.preload) {
    fetchData();
  }

  if (searchInputDom) {
    searchInputDom.addEventListener('input', inputEventFunction);
  }

  // Handle and trigger popup window
  document.querySelectorAll('.search-popup-trigger').forEach(element =&gt; {
    element.addEventListener('click', () =&gt; {
      document.body.style.overflow = 'hidden';
      document.querySelector('.search-pop-overlay').classList.add('active');
      setTimeout(() =&gt; searchInputDom.focus(), 500);
      if (!isfetched) fetchData();
    });
  });

  // Monitor main search box
  const onPopupClose = () =&gt; {
    document.body.style.overflow = '';
    document.querySelector('.search-pop-overlay').classList.remove('active');
  };

  document.querySelector('.search-pop-overlay').addEventListener('click', event =&gt; {
    if (event.target === document.querySelector('.search-pop-overlay')) {
      onPopupClose();
    }
  });
  document.querySelector('.search-input-field-pre').addEventListener('click', () =&gt; {
    searchInputDom.value = '';
    searchInputDom.focus();
    inputEventFunction();
  });
  document.querySelector('.popup-btn-close').addEventListener('click', onPopupClose);
  window.addEventListener('pjax:success', onPopupClose);
  window.addEventListener('keyup', event =&gt; {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });

}
