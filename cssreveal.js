

//CSSReveal

var _CSSReveal = function () {};

_CSSReveal.prototype = {
    render: function ( location , url , shortcuts ) {
        var target = document.querySelector( location );

        React.render(
			React.createElement(
				Bootstrap,{url:url,shortcuts:shortcuts}
			),
			document.body
		);
    }
};


CSSReveal = new _CSSReveal();
