

//CSSReveal

var _CSSReveal = function () {};

_CSSReveal.prototype = {
    render: function ( location , url ) {
        var target = document.querySelector( location );

        React.render(
			React.createElement(
				Bootstrap,{url:url}
			),
			document.body
		);
    }
};


CSSReveal = new _CSSReveal();
