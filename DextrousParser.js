export function parseDextrousLayout(layout){
    
    return new Layout(layout);
}

class LayoutElement {
    constructor(node){
        this.field = node.textDataKey;
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
    constructor(layout){
        this.children = [];
        this.fields = [];
        this.name = layout.name;
        this.style = layout.layoutData.style
        var template = $("<div></div>");	
        layout.layoutData.childZones.forEach(child => {
            this.children.push(new LayoutElement(child));
            this.fields.push(child.textDataKey);
            var childDOM = $("<div></div>");
            childDOM.addClass(child.field);
            childDOM.addClass(child.type);
            childDOM.css(child.style);
            template.append(childDOM);
        });
        console.log(template.html());
        this.template = template;
    }
}
