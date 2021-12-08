/* global KEEP */

KEEP.initUtils = () =&gt; {

  KEEP.utils = {

    html_root_dom: document.querySelector('html'),
    pageContainer_dom: document.querySelector('.page-container'),
    pageTop_dom: document.querySelector('.page-main-content-top'),
    firstScreen_dom: document.querySelector('.first-screen-container'),
    scrollProgressBar_dom: document.querySelector('.scroll-progress-bar'),
    pjaxProgressBar_dom: document.querySelector('.pjax-progress-bar'),
    pjaxProgressIcon_dom: document.querySelector('.pjax-progress-icon'),
    back2TopButton_dom: document.querySelector('.tool-scroll-to-top'),

    innerHeight: window.innerHeight,
    pjaxProgressBarTimer: null,
    prevScrollValue: 0,
    fontSizeLevel: 0,

    isHasScrollProgressBar: KEEP.theme_config.style.scroll.progress_bar.enable === true,
    isHasScrollPercent: KEEP.theme_config.style.scroll.percent.enable === true,

    // Scroll Style Handle
    styleHandleWhenScroll() {
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      const scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;

      const percent = Math.round(scrollTop / (scrollHeight - clientHeight) * 100);

      if (this.isHasScrollProgressBar) {
        const ProgressPercent = (scrollTop / (scrollHeight - clientHeight) * 100).toFixed(3);
        this.scrollProgressBar_dom.style.visibility = percent === 0 ? 'hidden' : 'visible';
        this.scrollProgressBar_dom.style.width = `${ProgressPercent}%`;
      }

      if (this.isHasScrollPercent) {
        const percent_dom = this.back2TopButton_dom.querySelector('.percent');
        if (percent === 0 || percent === undefined) {
          this.back2TopButton_dom.classList.remove('show');

        } else {
          this.back2TopButton_dom.classList.add('show');
          percent_dom.innerHTML = percent.toFixed(0);
        }
      }

      // hide header handle
      if (scrollTop &gt; this.prevScrollValue &amp;&amp; scrollTop &gt; this.innerHeight) {
        this.pageTop_dom.classList.add('hide');
      } else {
        this.pageTop_dom.classList.remove('hide');
      }
      this.prevScrollValue = scrollTop;
    },

    // register window scroll event
    registerWindowScroll() {
      window.addEventListener('scroll', () =&gt; {
        // style handle when scroll
        if (this.isHasScrollPercent || this.isHasScrollProgressBar) {
          this.styleHandleWhenScroll();
        }

        // TOC scroll handle
        if (KEEP.theme_config.toc.enable &amp;&amp; KEEP.utils.hasOwnProperty('findActiveIndexByTOC')) {
          KEEP.utils.findActiveIndexByTOC();
        }

        // header shrink
        KEEP.utils.headerShrink.headerShrink();
      });
    },

    // toggle show tools list
    toggleShowToolsList() {
      document.querySelector('.tool-toggle-show').addEventListener('click', () =&gt; {
        document.querySelector('.side-tools-list').classList.toggle('show');
      });
    },

    // global font adjust
    globalFontAdjust() {
      const fontSize = document.defaultView.getComputedStyle(document.body).fontSize;
      const fs = parseFloat(fontSize);

      const initFontSize = () =&gt; {
        const styleStatus = KEEP.getStyleStatus();
        if (styleStatus) {
          this.fontSizeLevel = styleStatus.fontSizeLevel;
          setFontSize(this.fontSizeLevel);
        }
      }

      const setFontSize = (fontSizeLevel) =&gt; {
        this.html_root_dom.style.fontSize = `${fs * (1 + fontSizeLevel * 0.05)}px`;
        KEEP.styleStatus.fontSizeLevel = fontSizeLevel;
        KEEP.setStyleStatus();
      }

      initFontSize();

      document.querySelector('.tool-font-adjust-plus').addEventListener('click', () =&gt; {
        if (this.fontSizeLevel === 5) return;
        this.fontSizeLevel++;
        setFontSize(this.fontSizeLevel);
      });

      document.querySelector('.tool-font-adjust-minus').addEventListener('click', () =&gt; {
        if (this.fontSizeLevel &lt;= 0) return; this.fontsizelevel--; setfontsize(this.fontsizelevel); }); }, toggle content area width contentareawidthadjust() { const toolexpanddom="document.querySelector('.tool-expand-width');" headercontentdom="document.querySelector('.header-content');" maincontentdom="document.querySelector('.main-content');" icondom="toolExpandDom.querySelector('i');" defaultmaxwidth="KEEP.theme_config.style.content_max_width" || '1000px'; expandmaxwidth="90%" ; let headermaxwidth="defaultMaxWidth;" isexpand="false;" if (keep.theme_config.style.first_screen.enable="==" true &amp;&amp; window.location.pathname="==" ' ') * 1.2 + 'px'; } setpagewidth="(isExpand)" =&gt; {
        KEEP.styleStatus.isExpandPageWidth = isExpand;
        KEEP.setStyleStatus();
        if (isExpand) {
          iconDom.classList.remove('fa-arrows-alt-h');
          iconDom.classList.add('fa-compress-arrows-alt');
          headerContentDom.style.maxWidth = expandMaxWidth;
          mainContentDom.style.maxWidth = expandMaxWidth;
        } else {
          iconDom.classList.remove('fa-compress-arrows-alt');
          iconDom.classList.add('fa-arrows-alt-h');
          headerContentDom.style.maxWidth = headerMaxWidth;
          mainContentDom.style.maxWidth = defaultMaxWidth;
        }
      }

      const initPageWidth = () =&gt; {
        const styleStatus = KEEP.getStyleStatus();
        if (styleStatus) {
          isExpand = styleStatus.isExpandPageWidth;
          setPageWidth(isExpand);
        }
      }

      initPageWidth();

      toolExpandDom.addEventListener('click', () =&gt; {
        isExpand = !isExpand;
        setPageWidth(isExpand)
      });


    },

    // go comment anchor
    goComment() {
      this.goComment_dom = document.querySelector('.go-comment');
      if (this.goComment_dom) {
        this.goComment_dom.addEventListener('click', () =&gt; {
          document.querySelector('#comment-anchor').scrollIntoView();
        });
      }

    },

    // get dom element height
    getElementHeight(selectors) {
      const dom = document.querySelector(selectors);
      return dom ? dom.getBoundingClientRect().height : 0;
    },

    // init first screen height
    initFirstScreenHeight() {
      this.firstScreen_dom &amp;&amp; (this.firstScreen_dom.style.height = this.innerHeight + 'px');
    },

    // init page height handle
    initPageHeightHandle() {
      if (this.firstScreen_dom) return;
      const temp_h1 = this.getElementHeight('.page-main-content-top');
      const temp_h2 = this.getElementHeight('.page-main-content-middle');
      const temp_h3 = this.getElementHeight('.page-main-content-bottom');
      const allDomHeight = temp_h1 + temp_h2 + temp_h3;
      const innerHeight = window.innerHeight;
      const pb_dom = document.querySelector('.page-main-content-bottom');
      if (allDomHeight &lt; innerHeight) {
        const marginTopValue = Math.floor(innerHeight - allDomHeight);
        if (marginTopValue &gt; 0) {
          pb_dom.style.marginTop = `${marginTopValue - 2}px`;
        }
      }
    },

    // big image viewer
    imageViewer() {
      let isBigImage = false;

      const showHandle = (maskDom, isShow) =&gt; {
        document.body.style.overflow = isShow ? 'hidden' : 'auto';
        if (isShow) {
          maskDom.classList.add('active');
        } else {
          maskDom.classList.remove('active');
        }
      }

      const imageViewerDom = document.querySelector('.image-viewer-container');
      const targetImg = document.querySelector('.image-viewer-container img');
      imageViewerDom &amp;&amp; imageViewerDom.addEventListener('click', () =&gt; {
        isBigImage = false;
        showHandle(imageViewerDom, isBigImage);
      });

      const imgDoms = document.querySelectorAll('.markdown-body img');

      if (imgDoms.length) {
        imgDoms.forEach(img =&gt; {
          img.addEventListener('click', () =&gt; {
            isBigImage = true;
            showHandle(imageViewerDom, isBigImage);
            targetImg.setAttribute('src', img.getAttribute('src'));
          });
        });
      } else {
        this.pageContainer_dom.removeChild(imageViewerDom);
      }
    },

    // set how long ago language
    setHowLongAgoLanguage(p1, p2) {
      return p2.replace(/%s/g, p1)
    },

    getHowLongAgo(timestamp) {
      const l = KEEP.language_ago;

      const __Y = Math.floor(timestamp / (60 * 60 * 24 * 30) / 12);
      const __M = Math.floor(timestamp / (60 * 60 * 24 * 30));
      const __W = Math.floor(timestamp / (60 * 60 * 24) / 7);
      const __d = Math.floor(timestamp / (60 * 60 * 24));
      const __h = Math.floor(timestamp / (60 * 60) % 24);
      const __m = Math.floor(timestamp / 60 % 60);
      const __s = Math.floor(timestamp % 60);

      if (__Y &gt; 0) {
        return this.setHowLongAgoLanguage(__Y, l.year);

      } else if (__M &gt; 0) {
        return this.setHowLongAgoLanguage(__M, l.month);

      } else if (__W &gt; 0) {
        return this.setHowLongAgoLanguage(__W, l.week);

      } else if (__d &gt; 0) {
        return this.setHowLongAgoLanguage(__d, l.day);

      } else if (__h &gt; 0) {
        return this.setHowLongAgoLanguage(__h, l.hour);

      } else if (__m &gt; 0) {
        return this.setHowLongAgoLanguage(__m, l.minute);

      } else if (__s &gt; 0) {
        return this.setHowLongAgoLanguage(__s, l.second);
      }
    },

    setHowLongAgoInHome() {
      const post = document.querySelectorAll('.home-article-meta-info .home-article-date');
      post &amp;&amp; post.forEach(v =&gt; {
        const nowDate = Date.now();
        const postDate = new Date(v.dataset.date.split(' GMT')[0]).getTime();
        v.innerHTML = this.getHowLongAgo(Math.floor((nowDate - postDate) / 1000));
      });
    },

    // loading progress bar start
    pjaxProgressBarStart() {
      this.pjaxProgressBarTimer &amp;&amp; clearInterval(this.pjaxProgressBarTimer);
      if (this.isHasScrollProgressBar) {
        this.scrollProgressBar_dom.classList.add('hide');
      }

      this.pjaxProgressBar_dom.style.width = '0';
      this.pjaxProgressIcon_dom.classList.add('show');

      let width = 1;
      const maxWidth = 99;

      this.pjaxProgressBar_dom.classList.add('show');
      this.pjaxProgressBar_dom.style.width = width + '%';

      this.pjaxProgressBarTimer = setInterval(() =&gt; {
        width += 5;
        if (width &gt; maxWidth) width = maxWidth;
        this.pjaxProgressBar_dom.style.width = width + '%';
      }, 100);
    },

    // loading progress bar end
    pjaxProgressBarEnd() {
      this.pjaxProgressBarTimer &amp;&amp; clearInterval(this.pjaxProgressBarTimer);
      this.pjaxProgressBar_dom.style.width = '100%';

      const temp_1 = setTimeout(() =&gt; {
        this.pjaxProgressBar_dom.classList.remove('show');
        this.pjaxProgressIcon_dom.classList.remove('show');

        if (this.isHasScrollProgressBar) {
          this.scrollProgressBar_dom.classList.remove('hide');
        }

        const temp_2 = setTimeout(() =&gt; {
          this.pjaxProgressBar_dom.style.width = '0';
          clearTimeout(temp_1), clearTimeout(temp_2);
        }, 200);

      }, 200);
    }
  }

  // init scroll
  KEEP.utils.registerWindowScroll();

  // toggle show tools list
  KEEP.utils.toggleShowToolsList();

  // global font adjust
  KEEP.utils.globalFontAdjust();

  // adjust content area width
  KEEP.utils.contentAreaWidthAdjust();

  // go comment
  KEEP.utils.goComment();

  // init page height handle
  KEEP.utils.initPageHeightHandle();

  // init first screen height
  KEEP.utils.initFirstScreenHeight();

  // big image viewer handle
  KEEP.utils.imageViewer();

  // set how long age in home article block
  KEEP.utils.setHowLongAgoInHome();

}
<!--=-->