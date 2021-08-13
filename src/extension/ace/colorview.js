import Color from '../../util/Color'
import ColorPicker from '../../colorpicker/index';

const colorpicker_class = 'ace-colorview'; 
const colorpicker_background_class = 'ace-colorview-background';
// Excluded tokens do not show color views..
let excluded_token = ['comment', 'builtin', 'qualifier'];


function onChange(ace, editor, colorview, evt) {
    if (evt.origin == 'setValue') {  // if content is changed by setValue method, it initialize markers
        // cm.state.colorpicker.close_color_picker();
        colorview.init_color_update();
        colorview.style_color_update();
    } else {
        colorview.style_color_update(colorview.createLineHandle());
    }

}

function onUpdate(ace, editor, colorview, evt) {
    if (!colorview.isUpdate) {
        colorview.isUpdate = true;
        colorview.close_color_picker();
        colorview.init_color_update();
        colorview.style_color_update();
    }
}

function onRefresh(ace, editor, colorview, evt) {
    onChange(ace, editor, colorview, { origin : 'setValue'});
}

function onKeyup(cm, evt) {
    cm.state.colorpicker.keyup(evt);
}

function onMousedown(ace, editor, colorview, evt) {
    // if (cm.state.colorpicker.is_edit_mode())
    // {
        colorview.check_mousedown(evt);
    // }
}

function onPaste (ace, editor, colorview, evt) {
    onChange(ace, editor, colorview, { origin : 'setValue'});
}

function onScroll (ace, editor, colorview) {
    colorview.close_color_picker();
}

function onBlur (ace, editor, colorview) {
    colorview.hide_delay_color_picker(colorview.opt.hideDelay || 1000);
}

function debounce (callback, delay) {

    var t = undefined;

    return function (cm, e) {
        if (t) {
            clearTimeout(t);
        }

        t = setTimeout(function () {
            callback(cm, e);
        }, delay || 300);
    }
}

function has_class(el, cls) {
    if (!el || !el.className) {
        return false;
    } else {
        var newClass = ' ' + el.className + ' ';
        return newClass.indexOf(' ' + cls + ' ') > -1;
    }
}


export default class ColorView {
    constructor (ace, editor, opt = {}) {
        var self = this;

        this.opt = opt;
        this.ace = ace;
        this.editor = editor;
        this.markers = {};
        
        // set excluded token 
        this.excluded_token = this.opt.excluded_token || excluded_token;

        this.colorpicker = ColorPicker.create(this.opt);
        this.lineHandles = {}
        this.init_event();

    }


    init_event() {

        // this.cm.on('mousedown', onMousedown);
        // this.cm.on('keyup', onKeyup);

        this.onChange = (evt) => {
            onChange(this.ace, this.editor, this, evt);
        }

        this.onUpdate = (evt) => {
            onUpdate(this.ace, this.editor, this, evt);
        }        


        this.editor.session.on('change', this.onChange);
        this.editor.session.on('tokenizerUpdate', this.onUpdate);


        this.onBlur = (evt) => {
            onBlur(this.ace, this.editor, this, evt);
        }                        
        // this.cm.on('refresh', onRefresh);
        this.editor.on('blur', this.onBlur); 

        // create paste callback
        this.onPaste = (evt) => {
            onPaste(this.ace, this.editor, this, evt);
        }

        this.onScrollEvent = debounce(() => {
            onScroll(this.ace, this.editor);
        }, 50)

        this.editor.on('paste', this.onPaste);

        this.editor.session.on('changeScrollTop', this.onScrollEvent);

    }

    // is_edit_mode() {
    //     return this.opt.mode == 'edit';
    // }

    // is_view_mode() {
    //     return this.opt.mode == 'view';
    // }

    destroy() {
        // this.cm.off('mousedown', onMousedown);
        // this.cm.off('keyup', onKeyup);
        this.editor.session.off('change', this.onChange)
        this.editor.session.off('tokenizerUpdate', this.onUpdate)
        this.editor.off('blur', this.onBlur);
        this.editor.off('paste', this.onPaste);

        // this.cm.getWrapperElement().removeEventListener('paste', this.onPasteCallback);

        // if (this.is_edit_mode())
        // {
            this.editor.session.off('changeScrollTop', this.onScrollEvent);
        // }
    }

    hasClass(el, className) {
        if (!el.className)
        {
            return false;
        } else {
            var newClass = ' ' + el.className + ' ';
            return newClass.indexOf(' ' + className + ' ') > -1;
        }
    }

    check_mousedown(evt) {
        if (this.hasClass(evt.target, colorpicker_background_class) )
        {
            this.open_color_picker(evt.target.parentNode);
        } else {
            this.close_color_picker();
        }
    }

    popup_color_picker(defalutColor) {
        var cursor = this.cm.getCursor();
        var self = this;
        var colorMarker = {
            lineNo : cursor.line,
            ch : cursor.ch,
            color: defalutColor || '#FFFFFF',
            isShortCut : true
        };

        Object.keys(this.markers).forEach(function(key) {
            var searchKey = "#" + key;
            if (searchKey.indexOf( "#" + colorMarker.lineNo + ":") > -1) {
                var marker = self.markers[key];

                if (marker.ch <= colorMarker.ch && colorMarker.ch <= marker.ch + marker.color.length) {
                    // when cursor has marker
                    colorMarker.ch = marker.ch;
                    colorMarker.color = marker.color;
                    colorMarker.nameColor = marker.nameColor;
                }

            }
        });

        this.open_color_picker(colorMarker);
    }

    open_color_picker(el) {
        var lineNo = el.lineNo;
        var ch = el.ch;
        var nameColor = el.nameColor;
        var color = el.color;
        const {Range} = this.ace; 


        if (this.colorpicker) {
            var prevColor = color;
            const pos = el.getBoundingClientRect();
            // console.log(this.editor.session.documentToScreenPosition(lineNo, ch));
            // var pos = this.cm.charCoords({line : lineNo, ch : ch });
            // console.log(pos, el.style.left, el.style.top);
            this.colorpicker.show({
                left : pos.left,
                top : pos.bottom + 50,
                isShortCut : el.isShortCut || false,
                hideDelay : this.opt.hideDelay || 2000
            }, nameColor || color, (newColor) => {
                this.editor.session.replace(
                    new Range(lineNo, ch, lineNo, ch + prevColor.length),
                    newColor
                );
                this.editor.focus();
                prevColor = newColor;
            });

        }

    }

    close_color_picker() {
        if (this.colorpicker)
        {
            this.colorpicker.hide();
        }
    }

    hide_delay_color_picker() {
        if (this.colorpicker)
        {
            this.colorpicker.runHideDelay();
        }
    }    

    key(lineNo, ch) {
        return [lineNo, ch].join(":");
    }


    keyup(evt) {

        if (this.colorpicker ) {
            if (evt.key == 'Escape') {
                this.colorpicker.hide();
            } else if (this.colorpicker.isShortCut == false) {
                this.colorpicker.hide();
            }
        }
    }

    init_color_update() {
        this.markers = {};  // initialize marker list
    }

    style_color_update(lineHandle) {
        if (lineHandle) {
            this.match(lineHandle.lineNo);
        } else {
            var max = this.editor.session.getLength();

            for(var lineNo = 0; lineNo < max; lineNo++) {
                this.match(lineNo);
            }
        }

    }

    empty_marker(lineNo, lineHandle) {
        var list = lineHandle.markedSpans || [];

        for(var i = 0, len = list.length; i < len; i++) {
            var key = this.key(lineNo, list[i].from);

            if (key && has_class(list[i].marker.replacedWith, colorpicker_class)) {
                delete this.markers[key];
                list[i].marker.clear();
            }

        }
    }


    
    match_result(lineHandle) {
        return Color.matches(lineHandle.text);
    }

    submatch(lineNo, lineHandle) {

        this.empty_marker(lineNo, lineHandle);
        
        const result = this.match_result(lineHandle); 
        let obj = { next : 0 }; 

        result.forEach(item => {
            this.render(obj, lineNo, lineHandle, item.color, item.nameColor);
        });
    }

    createLineHandle (lineNo) {

        if (!lineNo) {
            lineNo = this.editor.selection.cursor.row;
        }

        if (!this.lineHandles[lineNo]) {
            this.lineHandles[lineNo] = { lineNo, markedSpans: [] }
        }

        this.lineHandles[lineNo].text = this.editor.session.getLine(lineNo);

        return this.lineHandles[lineNo]
    }

    match(lineNo) {
        var lineHandle = this.createLineHandle(lineNo);
        this.submatch(lineNo, lineHandle);
    }

    make_element() {
        var el = document.createElement('div');

        el.className = colorpicker_class;
        el.title ="open color picker";

        el.back_element = this.make_background_element();
        el.appendChild(el.back_element);

        el.addEventListener('mousedown', (evt) => {
            onMousedown(this.ace, this.editor, this, evt);
        })

        return el;
    }

    make_background_element() {
        var el = document.createElement('div');

        el.className = colorpicker_background_class;

        return el;
    }

    set_state(lineNo, start, color, nameColor) {
        var marker = this.create_marker(lineNo, start);


        marker.lineNo = lineNo;
        marker.ch = start;
        marker.color = color;
        marker.nameColor = nameColor;

        return marker;
    }

    create_marker(lineNo, start) {

        if (!this.has_marker(lineNo, start)) {
            this.init_marker(lineNo, start);
        }

        return this.get_marker(lineNo, start);

    }

    init_marker (lineNo, start) {
        this.markers[this.key(lineNo, start)] = this.make_element();
    }

    has_marker(lineNo, start) {
        return !!this.get_marker(lineNo, start);
    }

    get_marker(lineNo, start) {
        var key = this.key(lineNo,start);
        return this.markers[key]
    }

    update_element(el, color) {
        el.back_element.style.backgroundColor = color;
    }

    update_marker (line, ch, el) {
        const { Range } = this.ace; 
        return {
            update (html, markerLayer, session, config) {

                const screenPosition = session.documentToScreenPosition(line, ch);
              
                const top = markerLayer.$getTop(screenPosition.row, config);
                const left = markerLayer.$padding + screenPosition.column * config.characterWidth;
                const height = config.lineHeight;


                el.style.left = (left + 0.5) + 'px';
                el.style.top = (top + (height / 2)) + 'px';
                markerLayer.element.appendChild(el);
                markerLayer.i = -1;
            }
        }

    }

    set_mark(line, ch, el) {
        // const { Range } = this.ace;
        this.editor.session.addDynamicMarker(
            this.update_marker(line, ch, el),
            true
        )
        
            // 

        // this.cm.setBookmark({ line : line, ch : ch}, { widget : el, handleMouseEvents : true} );
    }

    is_excluded_token(line, ch) {
        var token = this.editor.session.getTokenAt(line, ch);

        console.log(token);
        var type = token.type; 
        // var state = token.state.state;

        if (type === 'variable') return true; 

        if (type.includes('color')) return false;

        // if (type == null && state == 'block')  return true;
        // if (type == null && state == 'top')  return true;
        // if (type == null && state == 'prop')  return true;

        var count = 0; 
        for(var i = 0, len = this.excluded_token.length; i < len; i++) {
            if (type === this.excluded_token[i]) {
                count++;
                break; 
            }
        }

        return count > 0;   // true is that it has a excluded token 
    }

    render(cursor, lineNo, lineHandle, color, nameColor) {
        var start = lineHandle.text.indexOf(color, cursor.next);

        console.log(start, color, nameColor);

        if (this.is_excluded_token(lineNo, start) === true) {
            // excluded token do not show.
            return;
        }

        cursor.next = start + color.length;

        if (this.has_marker(lineNo, start))
        {
            this.update_element(this.create_marker(lineNo, start), nameColor || color);
            this.set_state(lineNo, start, color, nameColor);
            return;
        }

        var el  = this.create_marker(lineNo, start);

        this.update_element(el, nameColor || color);


        this.set_state(lineNo, start, color, nameColor || color);
        this.set_mark(lineNo, start, el);

    }
        

}

   
