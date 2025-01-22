export function parseDextrousLayout(layout) {

    return new Layout(layout);
}

class LayoutElement {
    constructor(node) {
        this.field = node.textDataKey.replaceAll(" ", "_");
        this.id = node.id;
        this.type = node.type;
        this.style = node.style;
        this.columnGap = node.columnGap;
        node.childZones.forEach(child => {
            this.children.push(new LayoutElement(child));

        });
    }
}

class Layout {
    constructor(layout) {
        this.children = [];
        this.fields = [];
        this.fonts = []
        this.name = layout.name;
        this.style = layout.layoutData.style
        this.defaults = {}
        let ratio = parseInt(this.style.width.slice(0, -2)) / parseInt(this.style.height.slice(0, -2))
        this.height = 14 / ratio + "em"

        var template = $("<div class='card'></div>");
        layout.layoutData.childZones.forEach(child => {
            //This ignores second level children at the moment
            let fieldName = child.textDataKey.replaceAll(" ", "_")
            this.children.push(new LayoutElement(child));
            this.fields.push(fieldName);
            this.defaults[fieldName] = child.text;
            var childDOM = $("<div></div>");
            childDOM.addClass(fieldName);
            childDOM.addClass(child.type);
            childDOM.css(convertToPercent(child.style, this.style));
            childDOM.css("position", "absolute")
            template.append(childDOM);
            template.attr("onclick", "cardClicked(this)")
            if (!this.fonts.includes(child.style.fontFamily))
                this.fonts.push(child.style.fontFamily)


        });
        let fontString = ""
        for (let font of this.fonts) {
            fontString += "family=" + font.replaceAll(" ", "+").replaceAll("'","") + "&"
        }
        fontString += "display=swap"
        document.styleSheets[0].insertRule(`@import url('https://fonts.googleapis.com/css2?${fontString}')`, 0)
        console.log(template.html());
        this.template = template;

    }
}

function convertToPercent(styleObj, parentStyleObj) {
    var height = parseInt(parentStyleObj.height.slice(0, -2))
    var width = parseInt(parentStyleObj.width.slice(0, -2))
    var rawCodes = { height: height, width: width, top: height, left: width, right: width, bottom: height, fontSize: 14 }
    for (let prop in rawCodes) {
        if (Object.hasOwn(styleObj, prop)) {
            let val = parseInt(styleObj[prop].slice(0, -2)) / rawCodes[prop] * 100 + "%"
            styleObj[prop] = val
        }
    }
    return styleObj
}