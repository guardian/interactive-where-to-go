import reqwest from 'reqwest'
import jquery from 'jquery'
import mainHTML from './text/main.html!text'
import share from './lib/share'
import template from './text/template.html!text'
import list from './text/list.html!text'
import handlebars from 'handlebars'

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');
var el;
var data;

export function init(dom, context, config, mediator) {
    el = dom;
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    var url = "https://interactive.guim.co.uk/docsdata-test/1I0NvU4--b8my3hwTbKXHwxQhjSJcKxH69F34zeWljgA.json"
    reqwest({
        url: url,
        type: 'json',
        crossOrigin: true,
        success: function(resp) {
            data = resp;
            templateInit(config)
        }
    });
}

function templateInit(config) {
    console.log(data);

    // List
    var listTemplate = Handlebars.compile(list);
    var listTemplateParsed = listTemplate(data).replace(/%assetPath%/g, config.assetPath);
    el.querySelector('#interactive-content-list').innerHTML = listTemplateParsed;

    // Rest of page
    var mainTemplate = Handlebars.compile(template);
    var mainTemplateParsed = mainTemplate(data).replace(/%assetPath%/g, config.assetPath);
    el.querySelector('#interactive-content').innerHTML = mainTemplateParsed;

    //open correct section
    var sectionHeader = document.getElementsByClassName('header');
    var section = document.getElementsByClassName('copy');
    console.log(sectionHeader);

    for(var i=0; i < section.length; i++) {
      sectionHeader[i].addEventListener('click', function(){
        var a = ".copy" + "." + this.dataset.id;
        var copy = document.querySelector(a);
        copy.setAttribute("data-open", "true");
      })
    }

    //lazy load images
    $(function() {
      var $window = $(window),
      images = [],
      imagesToBeLoaded = 0,
      i,
      src;

      function throttle(func, wait) {
        var timeout;
        return function() {
          var context = this, args = arguments;
          if(!timeout) {
            timeout = setTimeout(function() {
              timeout = null;
          }, wait);
          func.apply(context, args);
          }
        };
      }

      function inViewport($el) {
        var top = $window.scrollTop(),
        left = $window.scrollLeft(),
        bottom = top + $window.height(),
        right = left + $window.width(),
        offset = $el.offset(),
        thisTop = offset.top,
        thisLeft = offset.left,
        thisBottom = thisTop + $el.outerHeight(),
        thisRight = thisLeft + $el.outerWidth();

        return !(
          bottom < thisTop ||
          top > thisBottom ||
          right < thisLeft ||
          left > thisRight
        );
      }

      // throttle so we don't do too many calls
      var lazyScroll = throttle(function() {
        // have all images been loaded?
        if(imagesToBeLoaded > 0) {
          for(i = 0; i < images.length; i++) {
            // data is there if nothing has been done to it
            src = images[i].data('src');
            // see if the image is in the view
            if(src && inViewport(images[i])) {
              // create a nice closure here
              (function(img, src, i, $img) {
            img.onload = function() {
              console.log('Loaded ' + i + ' ' + img.src);
              $img.attr('src', img.src);
              imagesToBeLoaded--;
            };
            img.onerror = function() {
              console.log('Could not load ' + i + ' ' + img.src);
              imagesToBeLoaded--;
            };
            // important to remove this to avoid duplicate calls
            $img.removeData('src');
            // start loading the image
            img.src = src;
          })(new Image(), src, i, images[i]);
        }
      }
    } else {
      // cleanup
      images = void 0;
      // why keep listening if there is nothing to listen
      $window.off('resize scroll touchmove', lazyScroll);
      // all images are loaded
      console.log('Unloaded event listener');
    }
  }, 50);

    $('noscript[data-lazy-img]').each(function() {
      var $this = $(this),
        $img = $(this.innerText || $this.text()).filter('img');
        // make sure we got something
        if($img.length === 1) {
          // remember the real image
          $img.data('src', $img.attr('src'));
          // use a blank image
          $img.attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
          // cache a reference
          images.push($img);
          // replace noscript element with the image
          $this.replaceWith($img);
          imagesToBeLoaded++;
        }
    });
      // only add if we need it
      if(imagesToBeLoaded) {
        lazyScroll();
        $window.on('resize scroll touchmove', lazyScroll);
      }
    });


    // //menu
    // document.addEventListener('scroll', function() {
    //     var headerImage = document.querySelector('.lecarre__header');
    //     var navigation = document.querySelector('.section-navigation');
    //     var gallery = document.querySelector('.lecarre__gallery');
    //     if (headerImage.getBoundingClientRect().bottom <= 10) {
    //         navigation.classList.add('visible');
    //     } else {
    //         navigation.classList.remove('visible');
    //     }
    //     if (gallery.getBoundingClientRect().top <= 360) {
    //         navigation.classList.add('hidden');
    //     } else {
    //         navigation.classList.remove('hidden');
    //     };
    //     var quoteImage = document.getElementsByClassName('quote-image');
    //     var count = 0;
    // });

    // //nicer scrolllling
    // var anchors = document.getElementsByClassName('anchor-link');
    // for(var i = 0; i< anchors.length; i++){
    //   anchors[i].addEventListener('click', function(){
    //     document.querySelector('.section' + '.' + 'extract').setAttribute('data-open', 'true');
    //     sectionButton[0].setAttribute('data-open', 'true');
    //     sectionButton[0].innerHTML = '<h4>Close Extract</h4>';
    //     var position = this.dataset.section;
    //     var scroll = document.getElementById(position).getBoundingClientRect();
    //     var body = document.body.getBoundingClientRect();
    //     var offset = scroll.top - body.top;
    //     var windowWidth = window.innerWidth;
    //     console.log(document.getElementById(position).getBoundingClientRect().top);
    //     if(windowWidth < 750){
    //       window.scrollTo(0, (offset - 100));
    //       closeExtract.classList.add('visible');
    //     }else{
    //       window.scrollTo(0, offset);
    //     }
    //   });
    // }
};

Handlebars.registerHelper('paragraph', function(text) {
 text = '<p>' + text + '</p>';
 text = text.replace(/(\r\n|\n|\r)/gm, '</p><p>');
 return new Handlebars.SafeString(text);
});
