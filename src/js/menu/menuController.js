import MenuItem from './menuItem';

export default class MenuController {
    constructor(menuEl) {
        this.DOM = {menu: menuEl};
        this.DOM.menuItems = [...this.DOM.menu.querySelectorAll('.menu__item')];
        this.animatableProperties = {
            tx: {previous: 0, current: 0, amt: 0.08},
            ty: {previous: 0, current: 0, amt: 0.08},
            rotation: {previous: 0, current: 0, amt: 0.05}
        };

        this.menuItems = [];
        this.DOM.menuItems.forEach(menuItemEl => this.menuItems.push(new MenuItem(menuItemEl, this.animatableProperties)));
    }
}