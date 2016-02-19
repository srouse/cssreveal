




var Bootstrap = React.createClass({


    openApp: function(){
        var csscomp = false;
        if ( CSSRevealModel.csscomps && CSSRevealModel.csscomps.length > 0 ) {
            csscomp = CSSRevealModel.csscomps[0].target;
        }

        RS.merge({
            'app':'show',
            'app.csscomp':csscomp
        });
    },

    render: function() {
        return <div className="c-bootstrap">
            <div className="c-bootstrap__back" onClick={ this.openApp }></div>
            <iframe id="cssreveal_target" src={ this.props.url + '?' + Math.random() }></iframe>
            <div className="c-bootstrap__back" onClick={ this.openApp }></div>
            <CSSRevealApp />
        </div>;
    }

});
