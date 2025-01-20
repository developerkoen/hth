/*
Name		inputDefault
Version		V1.0
Author		huangdijia@gmail.com
Website		http://www.hdj.me/
Date		2011/08/10
*/
(function ($) {
    $.fn.inputDefault = function (options) {
        var defaults = {};
        var options = $.extend(defaults, options);
        function isPlaceholder() {
            var input = document.createElement('input');
            return 'placeholder' in input;
        }
        if (isPlaceholder() == false) {//不支持placeholder 用jquery来完成  
            this.each(function () {
                if (this.value == '') {
                    $(this).val(this.title).addClass("input_Tooltip");
                }
            })
                .focus(function () {
                    if (this.value == this.title) {
                        $(this).delay(1000).val("").removeClass("input_Tooltip");
                    }
                }).blur(function () {
                    if (this.value == '') {
                        $(this).delay(1000).val(this.title).addClass("input_Tooltip");
                    }
                });
        }
    };
})(jQuery);