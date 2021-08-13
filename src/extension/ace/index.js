import AceColorView from './colorview' 

function LOAD_ACE_COLORPICKER (ace, editor, opt) {

    return new AceColorView(ace, editor, opt);    

}

export default {
    load: LOAD_ACE_COLORPICKER
}