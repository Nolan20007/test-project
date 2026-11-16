/* JavaScript страницы «Видео» для вкладки JS HTML-секции Creatium.
   Скрипт адаптивной инициализации Creatium (исходный script 0) намеренно исключён:
   он использует document.write и должен оставаться частью системного runtime Creatium.
   jQuery и объект cr предоставляет сама платформа.
*/


/* Исходный скрипт 1 */
$(function () {
if ($(window).scrollTop() >= 250) $(".goup").fadeIn("slow")
$(window).scroll(function(){
if ($(window).scrollTop() <= 1250) $(".goup").fadeOut("slow")
else $(".goup").fadeIn("slow")
});
$(".goup").click(function () {
$("html,body").animate({ scrollTop: 0 }, "slow");
});
});

/* Исходный скрипт 2 */
$(window).scroll(function(){

var ratio = $(document).scrollTop()/(($(document).height() - $(window).height()) / 100);

$("#progress").width(ratio+"%");

});

/* Исходный скрипт 3 */
$( "#popup_expert" ).click(function() {
setTimeout( function(){
window.scrollBy(0,1);
}, 300 );
});

    $(function () {
        var unread = true;
        if ($(window).width() > 767) $('#popup_expert').addClass('active').addClass('dt');
        $(window).on('resize', function () {
            if (!$('#popup_expert').hasClass('scroll-ignore')) {
                if ($(window).width() <= 767 && $('#popup_expert').hasClass('dt')) $('#popup_expert').removeClass('active').removeClass('dt');
                if ($(window).width() > 767 && !$('#popup_expert').hasClass('dt')) $('#popup_expert').addClass('active').addClass('dt')
            }
        });
        $('.pe_close').click(function () {
            $('#popup_expert').removeClass('active').addClass('no-activate').removeClass('scroll-ignore')
        });
        $(window).on('scroll.popup_expert', function () {
            if (!$('#popup_expert').hasClass('scroll-ignore')) {
                if ($(window).scrollTop() > $(window).height() * 1.5) {
                    if ($(window).width() > 767) {
                        //$('#popup_expert').addClass('active');
                        $(window).off('scroll.popup_expert');
                        $('.pe_photo').click()
                    }
                    $('#popup_expert').css('display', '')
                } else {
                    $('#popup_expert').removeClass('active')
                }
            }
        });
        $('.pe_photo').on('click', function () {
            unread = false;
            $('#popup_expert').removeClass('no-activate').addClass('scroll-ignore').removeClass('unread');
            if (!$('#popup_expert').hasClass('active')) {
                $('.pe_photo').animate({
                    width: 0,
                    height: 0,
                    marginTop: -47,
                    marginRight: 40
                }, 300, function () {
                    $('.pe_photo').attr('style', '');
                    $('#popup_expert').addClass('active')
                })
            }
        });
        $('.pe_phone').on('click', function () {
            if ($(window).width() > 767) {
                openCallbackModal('new');
                return false
            }
        });
        setTimeout(function () {
            if (unread) {
                if ($('#popup_expert').hasClass('active')) $('#popup_expert').addClass('no-activate').removeClass('active');
                $('#popup_expert').addClass('unread').css('display', '')
            }
        }, 10000)
    });

/* Исходный скрипт 4 */
$('.prokrutka').height($(window).height());
$('.menu-btn').on('click', function(e) {
setTimeout(function() {
  e.preventDefault();
  $('.menu').toggleClass('menu_active');
  $('.menu-btn').toggleClass('menu-btn_active');
$("body").toggleClass("modal-open");
$(".menu-btn").toggle();
}, 100);
})

/* Исходный скрипт 6 */
jQuery.browser = {};
  (function () {
    jQuery.browser.msie = false
    jQuery.browser.version = 0;
    if (navigator.userAgent.match(/MSIE ([0-9]+)\\./)) {
      jQuery.browser.msie = true;
      jQuery.browser.version = RegExp.$1
    }
  })();

/* Исходный скрипт 7 */
cr.api(page => {
    const errorTitle = 'Ошибка' /* Заголовок сообщения об ошибке */
    const errorText = 'Неправильно указан номер телефона' /* Текст сообщения об ошибке */
    const characters = 10 /* Минимальное количество цифр в номере телефона */
    const template = '+7 (000) 000-00-00'
    const startContent = '+7'

    $.jMaskGlobals = {}
    $.jMaskGlobals.maskElements = 'input'
    $.jMaskGlobals.translation = {
      "0": { pattern: /\d/ },
      "+": { pattern: /\+/, optional: true }
    }

    page.waitForAppear('[cr-field="phone"]', field => {
      const namePosition = getProp(field.querySelector('.name'), 'position')
      const input = field.querySelector('input')

      if (namePosition == 'static') setMask(input)
      else input.addEventListener('focus', () => setMask(input))

      input.addEventListener('input', () => {
        if (!input.value) return setMask(input)
        input.value = input.value.replace(/(\+7\s?\(?)(\+?7|8)/, '$1')
        setStartContent(input)
      })
    })

    page.on('before-form-submit', event => {
      const apiPhoneFields = event.form.fields.filter(apiField => {
        return apiField.type == 'phone'
      })

      apiPhoneFields.forEach(apiField => {
        const phoneNumber = apiField.value.replace(/\D/g, '')
        if (phoneNumber.length < characters) {
          page.showErrorMessage(errorTitle, errorText)
          event.prevent()
        }
      })
    })

    function setMask(input) {
      if (!input) return
      $(input).mask(template, { selectOnFocus: false })
      setStartContent(input)
    }

    function setStartContent(input) {
      if (!input) return
      const value = input.value ? input.value : ''
      if (!value.startsWith(startContent)) {
        input.value = startContent + value
      }
    }

    function getProp(el, prop) {
      if (!el || !prop) return
      return getComputedStyle(el, null).getPropertyValue(prop)
    }
  })
