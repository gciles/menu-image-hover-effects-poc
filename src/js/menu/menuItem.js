import { gsap } from 'gsap';
import { map, lerp, clamp, getMousePos } from '../utils';
const images = Object.entries(require('../../img/*.jpg'));

let mousepos = {x: 0, y: 0};
let mousePosCache = mousepos;
let direction = {x: mousePosCache.x-mousepos.x, y: mousePosCache.y-mousepos.y};
window.addEventListener('mousemove', ev => mousepos = getMousePos(ev));

export default class MenuItem {
    constructor(el, animatableProperties) {
        this.DOM = {el: el};
        this.DOM.inner = this.DOM.el.querySelector('.menu__item-inner');
        this.DOM.number = this.DOM.el.querySelector('.menu__item-number');
        this.animatableProperties = animatableProperties;
        this.layout();
        this.initEvents();
    }
    layout() {
        this.DOM.reveal = document.createElement('div');
        this.DOM.reveal.className = 'hover-reveal';
        this.DOM.reveal.style.transformOrigin = '0% 0%';
        this.DOM.revealInner = document.createElement('div');
        this.DOM.revealInner.className = 'hover-reveal__inner';
        this.DOM.revealImage = document.createElement('div');
        this.DOM.revealImage.className = 'hover-reveal__img';
        const imgpos = this.DOM.el.dataset.img.match(/([\w\d_-]*)\.?[^\\\/]*$/i)[1]-1;
        this.DOM.revealImage.style.backgroundImage = `url(${images[imgpos][1]})`;
        this.DOM.el.dataset.img
        this.DOM.revealInner.appendChild(this.DOM.revealImage);
        this.DOM.reveal.appendChild(this.DOM.revealInner);
        this.DOM.el.appendChild(this.DOM.reveal);
    }
    initEvents() {
        this.mouseenterFn = () => {
            this.showImage();
            this.firstRAFCycle = true;
            this.loopRender();
        };

        this.mouseleaveFn = () => {
            this.stopRendering();
            this.hideImage();
        };

        this.DOM.el.addEventListener('mouseenter', this.mouseenterFn);
        this.DOM.el.addEventListener('mouseleave', this.mouseleaveFn);
    }
    calcBounds() {
        this.bounds = {
            el: this.DOM.el.getBoundingClientRect(),
            reveal: this.DOM.reveal.getBoundingClientRect()
        };
    }
    showImage() {
        gsap.killTweensOf(this.DOM.revealInner);
        gsap.killTweensOf(this.DOM.revealImage);
        gsap.timeline({
            defaults: {duration: 0.8, ease: 'quint'},
            onStart: () => {
                this.DOM.reveal.style.opacity = this.DOM.revealInner.style.opacity = 1;
                gsap.set(this.DOM.el, {zIndex: images.length});
            }
        })
            .to(this.DOM.revealInner, {
                startAt: {x: '-50%', y: '150%', rotation: 10},
                x: '0%',
                y: '0%',
            }, 0)
            .to(this.DOM.revealInner, {
                duration: 1,
                ease: 'expo',
                startAt: {scale: 0.2},
                scale: 1
            }, 0)
            .to(this.DOM.revealImage, {
                duration: 1,
                ease: 'expo',
                startAt: {scale: 1.8},
                scale: 1
            }, 0);
    }
    hideImage() {
        return new Promise(resolve => {
            gsap.killTweensOf(this.DOM.revealInner);
            gsap.killTweensOf(this.DOM.revealImage);
            gsap.timeline({
                defaults: {duration: 0.8, ease: 'quint'},
                onStart: () => {
                    gsap.set(this.DOM.el, {zIndex: 1});
                },
                onComplete: () => {
                    gsap.set(this.DOM.reveal, {opacity: 0});
                    resolve();
                }
            })
                .to(this.DOM.revealInner, {
                    scale: 0.8,
                    x: '50%',
                    y: '-150%',
                    opacity: 0,
                })
                .to(this.DOM.revealImage, {
                    scale: 1.8
                }, 0);
        });
    }
    loopRender() {
        if ( !this.requestId ) {
            this.requestId = requestAnimationFrame(() => this.render());
        }
    }
    stopRendering() {
        if ( this.requestId ) {
            window.cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }
    render() {
        this.requestId = undefined;

        if ( this.firstRAFCycle ) {
            this.calcBounds();
        }
        const mouseDistanceX = clamp(Math.abs(mousePosCache.x - mousepos.x), 0, 100);
        direction = {x: mousePosCache.x-mousepos.x, y: mousePosCache.y-mousepos.y};
        mousePosCache = {x: mousepos.x, y: mousepos.y};

        this.animatableProperties.tx.current = Math.abs(mousepos.x - this.bounds.el.left) - this.bounds.reveal.width/2;
        this.animatableProperties.ty.current = Math.abs(mousepos.y - this.bounds.el.top) - this.bounds.reveal.height/2;
        this.animatableProperties.rotation.current = this.firstRAFCycle ? 0 : map(mouseDistanceX,0,200,0,direction.x < 0 ? -100 : 100);

        this.animatableProperties.tx.previous = this.firstRAFCycle ? this.animatableProperties.tx.current : lerp(this.animatableProperties.tx.previous, this.animatableProperties.tx.current, this.animatableProperties.tx.amt);
        this.animatableProperties.ty.previous = this.firstRAFCycle ? this.animatableProperties.ty.current : lerp(this.animatableProperties.ty.previous, this.animatableProperties.ty.current, this.animatableProperties.ty.amt);
        this.animatableProperties.rotation.previous = this.firstRAFCycle ? this.animatableProperties.rotation.current : lerp(this.animatableProperties.rotation.previous, this.animatableProperties.rotation.current, this.animatableProperties.rotation.amt);

        gsap.set(this.DOM.reveal, {
            x: this.animatableProperties.tx.previous,
            y: this.animatableProperties.ty.previous,
            rotation: this.animatableProperties.rotation.previous
        });

        this.firstRAFCycle = false;
        this.loopRender();
    }
}