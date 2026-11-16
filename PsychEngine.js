
/*
 * PsychEngine.js
 * FNF Psych Engine 0.6.3
 * HTML5 bootstrap / compatibility helper
 *
 * NOTE:
 * This is NOT the compiled Psych Engine game.
 * It provides browser-side utilities only.
 */

(function (global) {
    "use strict";

    const PsychEngine = {
        version: "0.6.3",
        platform: "HTML5",
        ready: false,

        events: {},

        on(name, callback) {
            if (!this.events[name]) {
                this.events[name] = [];
            }
            this.events[name].push(callback);
        },

        off(name, callback) {
            if (!this.events[name]) return;
            this.events[name] =
                this.events[name].filter(fn => fn !== callback);
        },

        emit(name, ...args) {
            (this.events[name] || []).forEach(fn => {
                try {
                    fn(...args);
                } catch (error) {
                    console.error("[PsychEngine]", error);
                }
            });
        },

        screen: {
            flash(color = "#FFFFFF", duration = 500) {
                const overlay = document.createElement("div");

                Object.assign(overlay.style, {
                    position: "fixed",
                    inset: "0",
                    background: color,
                    opacity: "1",
                    pointerEvents: "none",
                    zIndex: "999999",
                    transition: `opacity ${duration}ms`
                });

                document.body.appendChild(overlay);

                requestAnimationFrame(() => {
                    overlay.style.opacity = "0";
                });

                setTimeout(() => overlay.remove(), duration + 50);
            },

            shake(intensity = 5, duration = 300) {
                const target = document.body;
                target.style.animation =
                    `psychShake ${duration}ms`;

                const style = document.createElement("style");
                style.textContent = `
                    @keyframes psychShake {
                        0%, 100% { transform: translate(0, 0); }
                        20% { transform: translate(${intensity}px, 0); }
                        40% { transform: translate(-${intensity}px, 0); }
                        60% { transform: translate(0, ${intensity}px); }
                        80% { transform: translate(0, -${intensity}px); }
                    }
                `;

                document.head.appendChild(style);

                setTimeout(() => {
                    target.style.animation = "";
                    style.remove();
                }, duration);
            }
        },

        hud: {
            visible: true,

            show(value) {
                this.visible = !!value;

                document.querySelectorAll(
                    ".psych-hud"
                ).forEach(element => {
                    element.style.display =
                        this.visible ? "" : "none";
                });
            }
        },

        input: {
            pressed: {},

            init() {
                window.addEventListener("keydown", event => {
                    this.pressed[event.code] = true;
                    PsychEngine.emit("keyDown", event.code);
                });

                window.addEventListener("keyup", event => {
                    this.pressed[event.code] = false;
                    PsychEngine.emit("keyUp", event.code);
                });
            },

            isPressed(key) {
                return !!this.pressed[key];
            }
        },

        init() {
            if (this.ready) return;

            this.ready = true;
            this.input.init();

            this.emit("ready");

            console.log(
                "[PsychEngine] JavaScript helper initialized:",
                this.version
            );
        }
    };

    global.PsychEngine = PsychEngine;

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            () => PsychEngine.init()
        );
    } else {
        PsychEngine.init();
    }

})(window);
