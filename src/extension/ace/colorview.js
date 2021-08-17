import Color from '../../util/Color'
import ColorPicker from '../../colorpicker/index';
import { brightness } from '../../util/functions/fromRGB';
import Dom from '../../util/Dom';
import { debounce } from '../../util/functions/func';

const colorpicker_token_class = 'ace_color';
const colorpicker_container_class = 'ace-colorpicker'

export default class ColorView {
    constructor(ace, editor, opt = {
        type: 'vscode',
        showDelay: 300,
        containerClass: colorpicker_container_class
    }) {
        var self = this;

        this.opt = opt;
        this.ace = ace;
        this.editor = editor;
        this.markers = {};

        this.colorpicker = ColorPicker.create(this.opt);
        this.lineHandles = {}
        this.init_event();

    }

    get_brightness(colorString) {
        const colorObj = Color.parse(colorString);
        const fontColorString = brightness(colorObj.r, colorObj.g, colorObj.b) > 127 ? "#000" : "#fff";

        return fontColorString;
    }

    mouse_over(evt) {
        const $colorElement = new Dom(evt.target);
        this.__colorview_check_target = evt.target; 

        if ($colorElement.hasClass(colorpicker_token_class)) {
            this.openDebouncedColorPicker(evt);
        }

    }

    init_mouse_event() {

        const { renderer } = this.editor;
        const { content } = renderer;

        this.openDebouncedColorPicker = debounce(this.open_color_picker.bind(this), this.opt.showDelay);

        this.onMouseOver = this.mouse_over.bind(this);

        // content.addEventListener('mouseover', this.onMouseOver);
        content.addEventListener('mousemove', this.onMouseOver);

    }


    init_event() {

        const { renderer, session } = this.editor;
        const { content } = renderer;

        this.init_mouse_event();

        let rules = session.$mode.$highlightRules.getRules();
        for (let stateName in rules) {
            if (Object.prototype.hasOwnProperty.call(rules, stateName)) {
                rules[stateName].unshift({
                    token: "color",
                    regex: '#(?:[\\da-f]{8})|#(?:[\\da-f]{3}){1,2}|rgb\\((?:\\s*\\d{1,3},\\s*){2}\\d{1,3}\\s*\\)|rgba\\((?:\\s*\\d{1,3},\\s*){3}\\d*\\.?\\d+\\s*\\)|hsl\\(\\s*\\d{1,3}(?:,\\s*\\d{1,3}%){2}\\s*\\)|hsla\\(\\s*\\d{1,3}(?:,\\s*\\d{1,3}%){2},\\s*\\d*\\.?\\d+\\s*\\)'
                });

                // FIXME: Exception handling when the highlight does not turn into color due to the scss function name
                // LINK : https://github.com/ajaxorg/ace/blob/cbcb78c3a7c5e642d615a9f5665a44dbb94d3e92/lib/ace/mode/scss_highlight_rules.js#L43-L48
                rules[stateName].unshift({
                    token: "color",
                    regex: "blue|green|red"
                });

            }
        }
        // force recreation of tokenizer
        session.$mode.$tokenizer = null;
        session.bgTokenizer.setTokenizer(editor.session.$mode.getTokenizer());
        // force re-highlight whole document
        session.bgTokenizer.start(0);

        // each editor render update, update all displayed colors
        renderer.on('afterRender', () => {

            // each time renderer updates, get all elements with ace_color class
            var colors = content.getElementsByClassName(colorpicker_token_class);

            // iterate through them and set their background color and font color accordingly
            for (var i = 0, len = colors.length; i < len; i++) {

                const fontColorString = this.get_brightness(colors[i].innerHTML);
                const colorString = colors[i].innerHTML;

                colors[i].style.cssText = `
                    background-color: ${colorString};
                    color: ${fontColorString};
                    pointer-events: all;
                    border-radius: 2px;
                    padding: 0px 1px;
                `
            }
        });


    }

    destroy() {
        const { renderer } = this.editor;
        const { content } = renderer;

        // content.removeEventListener('mouseover', this.onMouseOver);
        content.removeEventListener('mousemove', this.onMouseOver);
    }

    open_color_picker(evt) {
        // check wheather event.target is equals this.__colorview_check_target
        if (evt.target !== this.__colorview_check_target) {
            this.close_color_picker();
            return; 
        }

        const { Range } = this.ace;
        const { renderer, session } = this.editor;
        const { layerConfig } = renderer;

        const screenPosition = renderer.screenToTextCoordinates(evt.clientX - layerConfig.padding, evt.clientY);
        const token = session.getTokenAt(screenPosition.row, screenPosition.column);

        if (!token || token.type.includes("color") === false) {
            return;
        }

        const row = screenPosition.row;
        const startColumn = token.start;
        const colorString = token.value;

        let prevColor = colorString;
        const pos = renderer.textToScreenCoordinates(row, startColumn);

        // support scrollTop
        const scrollTop = Dom.getScrollTop()

        this.colorpicker.show({
            left: pos.pageX,
            top: pos.pageY + scrollTop,
            bottom: pos.pageY + scrollTop + layerConfig.lineHeight,
            hideDelay: this.opt.hideDelay || 10
        }, colorString, (newColor) => {
            this.editor.session.replace(
                new Range(row, startColumn, row, startColumn + prevColor.length),
                newColor
            );
            prevColor = newColor;
        });
    }

    close_color_picker() {
        if (this.colorpicker) {
            this.colorpicker.hide();
        }
    }

    hide_delay_color_picker() {
        if (this.colorpicker) {
            this.colorpicker.runHideDelay();
        }
    }

    key(lineNo, ch) {
        return [lineNo, ch].join(":");
    }


    keyup(evt) {

        if (this.colorpicker) {
            if (evt.key == 'Escape') {
                this.colorpicker.hide();
            } else if (this.colorpicker.isShortCut == false) {
                this.colorpicker.hide();
            }
        }
    }


}


