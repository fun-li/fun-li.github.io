KEEP.initHeaderShrink = () =&gt; {
  KEEP.utils.headerShrink = {
    headerDom: document.querySelector('.header-wrapper'),
    isHeaderShrink: false,

    init() {
      this.headerHeight = this.headerDom.getBoundingClientRect().height;
    },

    headerShrink() {
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

      if (!this.isHeaderShrink &amp;&amp; scrollTop &gt; this.headerHeight) {
        this.isHeaderShrink = true;
        document.body.classList.add('header-shrink');
      } else if (this.isHeaderShrink &amp;&amp; scrollTop &lt;= this.headerheight) { this.isheadershrink="false;" document.body.classlist.remove('header-shrink'); } }, toggleheaderdrawershow() const domlist="[document.querySelector('.window-mask')," document.queryselector('.menu-bar')]; if (keep.theme_config.pjax.enable="==" true) domlist.push(...document.queryselectorall('.header-drawer .drawer-menu-list .drawer-menu-item')); domlist.foreach(v&gt; {
        v.addEventListener('click', () =&gt; {
          document.body.classList.toggle('header-drawer-show');
        });
      });
    }
  }
  KEEP.utils.headerShrink.init();
  KEEP.utils.headerShrink.headerShrink();
  KEEP.utils.headerShrink.toggleHeaderDrawerShow();
}
<!--=-->