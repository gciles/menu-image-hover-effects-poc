import Cursor from "./Cursor";
import MenuController from "./menu/menuController";

const cursor = new Cursor(document.querySelector('.cursor'));

new MenuController(document.querySelector('.menu'));

[...document.querySelectorAll('a')].forEach(link => {
    link.addEventListener('mouseenter', () => cursor.enter());
    link.addEventListener('mouseleave', () => cursor.leave());
});