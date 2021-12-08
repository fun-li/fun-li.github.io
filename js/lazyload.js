KEEP.initLazyLoad = () =&gt; {
  const imgs = document.querySelectorAll('img');
  let now = Date.now();
  let needLoad = true;

  function lazyload(imgs) {
    now = Date.now();
    needLoad = Array.from(imgs).some(i =&gt; i.hasAttribute('lazyload'));

    const h = window.innerHeight;
    const s = document.documentElement.scrollTop || document.body.scrollTop;

    imgs.forEach(img =&gt; {
      if (img.hasAttribute('lazyload') &amp;&amp; !img.hasAttribute('loading')) {

        if ((h + s) &gt; img.offsetTop) {
          img.setAttribute('loading', true);
          const loadImageTimeout = setTimeout(() =&gt; {
            const temp = new Image();
            const src = img.getAttribute('data-src');
            temp.src = src;
            temp.onload = () =&gt; {
              img.src = src;
              img.removeAttribute('lazyload');
              img.removeAttribute('loading');
              clearTimeout(loadImageTimeout);
            }
          }, 500);
        }
      }
    });
  }

  lazyload(imgs);

  window.onscroll = () =&gt; {
    if (Date.now() - now &gt; 50 &amp;&amp; needLoad) {
      lazyload(imgs);
    }
  }
}
